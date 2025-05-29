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

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.microfinance

@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        # Validate input
        data = request.get_json()
        required_fields = ['amount', 'duration', 'monthlyIncome', 'creditHistory', 'mobileMoneyHistory']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Run predict.py as subprocess with timeout
        input_str = json.dumps(data)
        result = subprocess.run(
            ['python', 'predict.py', input_str],
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )

        if result.returncode != 0:
            return jsonify({"error": "Prediction failed", "details": result.stderr}), 500

        result_json = json.loads(result.stdout)

        # Save application with prediction result to DB
        application_data = {
            **data,
            **result_json,
            'user_id': get_jwt_identity(),
            'status': 'pending',
            'created_at': datetime.now()
        }
        db.applications.insert_one(application_data)

        return jsonify(result_json), 200

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Prediction timed out"}), 504
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid prediction response"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_applications():
    try:
        user_id = ObjectId(get_jwt_identity())
        records = list(db.applications.find({}))
        
        # Convert ObjectId to string and clean up
        for record in records:
            record['_id'] = str(record['_id'])
            if 'password' in record:
                del record['password']
                
        return jsonify(records), 200
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
        updated_app['_id'] = str(updated_app['_id'])

        # Log the status change
        db.status_changes.insert_one({
            'application_id': ObjectId(application_id),
            'previous_status': updated_app.get('status_history', [{}])[-1].get('status') if 'status_history' in updated_app else None,
            'new_status': data['status'],
            'changed_by': ObjectId(get_jwt_identity()),
            'changed_at': datetime.utcnow(),
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
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', 'True') == 'True')