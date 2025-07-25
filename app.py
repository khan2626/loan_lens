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
print("MONGO", MONGO_URI)

load_ml_model_and_explainer(model_path='model.pkl')
print("ML model and SHAP explainer initialized for Flask app.")


@app.route('/api/applications/<application_id>/payment', methods=['POST'])
@jwt_required()
def process_payment(application_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        payment_amount = data.get('amount')
        payment_method = data.get('method')

        if not payment_amount or not payment_method:
            return jsonify({"error": "Payment amount and method are required."}), 400

        try:
            payment_amount = float(payment_amount)
            if payment_amount <= 0:
                return jsonify({"error": "Payment amount must be positive."}), 400
        except ValueError:
            return jsonify({"error": "Invalid payment amount."}), 400

        # Find the application
        application = db.applications.find_one({"_id": ObjectId(application_id)})

        if not application:
            return jsonify({"error": "Application not found."}), 404
        
        # Optional: Check if the current user is authorized to make payment for this application
        # if application.get('user_id') != current_user_id:
        #     return jsonify({"error": "Unauthorized to make payment for this application."}), 403

        loan_amount = application.get('amount', 0)
        total_paid_so_far = application.get('totalPaid', 0)
        
        remaining_balance = loan_amount - total_paid_so_far

        if payment_amount > remaining_balance + 0.01: # Allow for tiny floating point differences
            return jsonify({"error": f"Payment amount (NGN {payment_amount:,.2f}) exceeds remaining balance (NGN {remaining_balance:,.2f})."}), 400
        
        # Update the application
        new_total_paid = total_paid_so_far + payment_amount
        
        # Determine new status
        new_status = application['status'] # Keep current status by default
        if new_total_paid >= loan_amount:
            new_status = 'fully_paid'
        elif new_total_paid > 0 and new_total_paid < loan_amount:
            new_status = 'partially_paid' # Or keep original status if you prefer

        update_result = db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$inc": {"totalPaid": payment_amount},
                "$push": {
                    "payments": {
                        "amount": payment_amount,
                        "method": payment_method,
                        "date": datetime.now().isoformat(),
                        "processedBy": current_user_id # Log who made the payment
                    }
                },
                "$set": {"status": new_status} # Update status
            }
        )

        if update_result.modified_count == 1:
            return jsonify({"message": "Payment processed successfully.", "newStatus": new_status, "newTotalPaid": new_total_paid}), 200
        else:
            return jsonify({"error": "Failed to update application with payment. Application might not exist or no changes were made."}), 500

    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format in request body."}), 400
    except Exception as e:
        print(f"Error processing payment: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500



# --------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------


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
        prediction_result = get_loan_prediction(data)
        print(f"[{time.time() - request_start_time:.2f}s] Prediction logic took {time.time() - prediction_logic_start_time:.2f}s.")

        # --- Fetch Applicant Name from 'users' collection ---
        user_id = get_jwt_identity()
        applicant_name = "Unknown User" # Default value
        try:
            # Assuming user_id from JWT is a string that can be converted to ObjectId
            user_doc = db.users.find_one({"_id": ObjectId(user_id)}, {"name": 1}) # Fetch only username
            if user_doc and 'name' in user_doc:
                applicant_name = user_doc['name']
            else:
                print(f"[{time.time() - request_start_time:.2f}s] User with ID {user_id} not found or no username.")
        except Exception as user_fetch_error:
            print(f"[{time.time() - request_start_time:.2f}s] Error fetching user name for ID {user_id}: {user_fetch_error}")
        # --- End Fetch Applicant Name ---

        # 3. Save Application Data to DB
        db_save_start_time = time.time()
        application_data = {
            **data, # Original input data
            **prediction_result, # Prediction results (riskScore, recommendation, explanation)
            'user_id': user_id, # Store user ID
            'applicantName': applicant_name, # NEW: Add applicant's name
            'status': 'pending', # Initial status for new applications
            'created_at': datetime.now().isoformat(), # Store timestamp in ISO 8601 format
            'totalPaid': 0, # Initialize totalPaid for new applications
            'payments': []
        }
        db.applications.insert_one(application_data)
        print(f"[{time.time() - request_start_time:.2f}s] DB save took {time.time() - db_save_start_time:.2f}s.")

        # 4. Return Prediction Result
        return jsonify(prediction_result), 200

    except RuntimeError as e:
        print(f"[{time.time() - request_start_time:.2f}s] ML Model Loading Error: {e}")
        return jsonify({"error": "ML model not available. Server configuration error."}), 500
    except json.JSONDecodeError:
        print(f"[{time.time() - request_start_time:.2f}s] Invalid JSON format in request body.")
        return jsonify({"error": "Invalid JSON format in request body"}), 400
    except Exception as e:
        print(f"[{time.time() - request_start_time:.2f}s] An unexpected error occurred: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


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