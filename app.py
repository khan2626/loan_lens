from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import os
import json
import subprocess
import bcrypt
from datetime import timedelta
import re
from datetime import datetime
from dotenv import load_dotenv
import time

from prediction_service import load_ml_model_and_explainer, get_loan_prediction


app = Flask(__name__)
CORS(app)
load_dotenv() 
# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.microfinance


load_ml_model_and_explainer(model_path='model.pkl')
print("ML model and SHAP explainer initialized for Flask app.")

@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    request_start_time = time.time()
    try:
        # 1. Validate Input
        data = request.get_json()
        required_fields_top_level = ['amount', 'duration', 'monthlyIncome', 'creditHistory', 'mobileMoneyHistory']
        if not all(field in data for field in required_fields_top_level):
            print(f"[{time.time() - request_start_time:.2f}s] Missing top-level required fields: {data}")
            return jsonify({"error": "Missing top-level required fields"}), 400

        # Validate nested mobileMoneyHistory fields
        mobile_money_data = data.get('mobileMoneyHistory', {})
        required_mobile_money_fields = ['averageBalance', 'transactionFrequency']
        if not all(field in mobile_money_data for field in required_mobile_money_fields):
            print(f"[{time.time() - request_start_time:.2f}s] Missing mobileMoneyHistory fields: {mobile_money_data}")
            return jsonify({"error": "Missing required fields in mobileMoneyHistory"}), 400

        # 2. Get Prediction and Explanation
        prediction_logic_start_time = time.time()
        # Call the dedicated function from your prediction_service module
        prediction_result = get_loan_prediction(data)
        print(f"[{time.time() - request_start_time:.2f}s] Prediction logic took {time.time() - prediction_logic_start_time:.2f}s.")

        # 3. Save Application Data to DB
        db_save_start_time = time.time()
        application_data = {
            **data, # Original input data
            **prediction_result, # Prediction results (riskScore, recommendation, explanation)
            'user_id': get_jwt_identity(), # Get user ID from JWT token
            'status': 'pending', # Initial status for new applications
            'created_at': datetime.now().isoformat() # Store timestamp in ISO 8601 format
        }
        db.applications.insert_one(application_data)
        print(f"[{time.time() - request_start_time:.2f}s] DB save took {time.time() - db_save_start_time:.2f}s.")

        # 4. Return Prediction Result
        return jsonify(prediction_result), 200

    except RuntimeError as e:
        # This error is raised by get_loan_prediction if the model wasn't loaded
        print(f"[{time.time() - request_start_time:.2f}s] ML Model Loading Error: {e}")
        return jsonify({"error": "ML model not available. Server configuration error."}), 500
    except json.JSONDecodeError:
        print(f"[{time.time() - request_start_time:.2f}s] Invalid JSON format in request body.")
        return jsonify({"error": "Invalid JSON format in request body"}), 400
    except Exception as e:
        # Catch any other unexpected errors
        print(f"[{time.time() - request_start_time:.2f}s] An unexpected error occurred: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



# @app.route('/api/predict', methods=['POST'])
# @jwt_required()
# def predict():
#     try:
#         # Validate input
#         data = request.get_json()
#         required_fields = ['amount', 'duration', 'monthlyIncome', 'creditHistory', 'mobileMoneyHistory']
#         if not all(field in data for field in required_fields):
#             return jsonify({"error": "Missing required fields"}), 400

#         # Run predict.py as subprocess with timeout
#         input_str = json.dumps(data)
#         result = subprocess.run(
#             ['python', 'predict.py', input_str],
#             capture_output=True,
#             text=True,
#             timeout=60  # 30 second timeout
#         )

#         if result.returncode != 0:
#             return jsonify({"error": "Prediction failed", "details": result.stderr}), 500

#         result_json = json.loads(result.stdout)

#         # Save application with prediction result to DB
#         application_data = {
#             **data,
#             **result_json,
#             'user_id': get_jwt_identity(),
#             'status': 'pending',
#             'created_at': datetime.now()
#         }
#         db.applications.insert_one(application_data)

#         return jsonify(result_json), 200

#     except subprocess.TimeoutExpired:
#         return jsonify({"error": "Prediction timed out"}), 504
#     except json.JSONDecodeError:
#         return jsonify({"error": "Invalid prediction response"}), 500
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_applications():
    try:
        user_id = ObjectId(get_jwt_identity())
        user_applications = list(db.applications.find({}))
        
        for app in user_applications:
            app['_id'] = str(app['_id'])
            if 'user_id' in app:
                app['user_id'] = str(app['user_id'])
            if "status_history" in app:
                del app["status_history"]
        
                
        return jsonify(user_applications), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/my-applications', methods=['GET'])
@jwt_required()
def get_my_applications():
    try:
        # Get the current user's ID from the JWT token
        user_id = get_jwt_identity()
        
        # Query applications for this specific user
        user_applications = list(db.applications.find({'user_id': user_id}))
        
        # Convert ObjectId to string and remove MongoDB-specific fields
        for app in user_applications:
            app['_id'] = str(app['_id'])
            if 'user_id' in app:
                app['user_id'] = str(app['user_id'])
            if "status_history" in app:
                del app["status_history"]
        
        return jsonify(user_applications), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data or 'name' not in data:
            return jsonify({"error": "Name, email and password are required"}), 400

        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({"error": "Invalid email format"}), 400

        # Check if user exists
        if db.users.find_one({'email': data['email']}):
            return jsonify({"error": "User already exists"}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        # Create user
        user_data = {
            'name': data['name'],
            'email': data['email'],
            'password': hashed_pw,
            'created_at': datetime.now()
        }

        user_id = db.users.insert_one(user_data).inserted_id

        # Generate JWT token
        access_token = create_access_token(identity=str(user_id))
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user_id": str(user_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        user = db.users.find_one({'email': data['email']})
        if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            return jsonify({"error": "Invalid credentials"}), 401

        # Generate JWT token
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            "access_token": access_token,
            "user_id": str(user['_id']),
            "name": user['name']
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<application_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(application_id):
    try:
        # Validate application ID format
        if not ObjectId.is_valid(application_id):
            return jsonify({"error": "Invalid application ID format"}), 400

        data = request.get_json()
        
        # Validate status input
        valid_statuses = ['pending', 'approved', 'rejected', 'disbursed']
        if 'status' not in data or data['status'] not in valid_statuses:
            return jsonify({
                "error": "Valid status is required",
                "valid_statuses": valid_statuses
            }), 400

        # Prepare update data
        update_data = {
            'status': data['status'],
            'updated_at': datetime.now()
        }

        # Add optional note if provided
        if 'note' in data:
            update_data['admin_note'] = data['note']

        # Perform the update
        result = db.applications.update_one(
            {'_id': ObjectId(application_id)},
            {'$set': update_data}
        )

        # Check if application was found and updated
        if result.matched_count == 0:
            return jsonify({"error": "Application not found"}), 404

        # Get the updated application
        updated_app = db.applications.find_one({'_id': ObjectId(application_id)})
        
        # Convert ObjectId fields to strings
        updated_app['_id'] = str(updated_app['_id'])
        if 'user_id' in updated_app:
            updated_app['user_id'] = str(updated_app['user_id'])
        
        # Convert status_history if it exists
        if 'status_history' in updated_app:
            for history_item in updated_app['status_history']:
                if 'application_id' in history_item:
                    history_item['application_id'] = str(history_item['application_id'])
                if 'changed_by' in history_item:
                    history_item['changed_by'] = str(history_item['changed_by'])

        # Log the status change
        db.status_changes.insert_one({
            'application_id': ObjectId(application_id),
            'previous_status': updated_app.get('status_history', [{}])[-1].get('status') if 'status_history' in updated_app else None,
            'new_status': data['status'],
            'changed_by': ObjectId(get_jwt_identity()),
            'changed_at': datetime.now(),
            'note': data.get('note')
        })

        # Update status history
        db.applications.update_one(
            {'_id': ObjectId(application_id)},
            {'$push': {
                'status_history': {
                    'status': data['status'],
                    'changed_at': datetime.now(),
                    'changed_by': ObjectId(get_jwt_identity())
                }
            }}
        )

        return jsonify({
            "message": "Application status updated successfully",
            "application": updated_app
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8300, debug=os.getenv('FLASK_DEBUG', 'True') == 'True')