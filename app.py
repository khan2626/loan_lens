from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import json
import subprocess

app = Flask(__name__)
CORS(app)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client.microfinance
applications = db.applications

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from frontend
        data = request.get_json()

        # Run predict.py as subprocess
        input_str = json.dumps(data)
        result = subprocess.check_output(['python', 'predict.py', input_str])
        result_json = json.loads(result)

        # Save application with prediction result to DB
        applications.insert_one({**data, **result_json})

        return jsonify(result_json), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications', methods=['GET'])
def get_applications():
    # Fetch all applications from MongoDB
    records = list(applications.find({}, {'_id': 0}))  # Exclude internal ID
    return jsonify(records)

if __name__ == '__main__':
    app.run(debug=True)
