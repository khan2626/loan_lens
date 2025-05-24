import sys
import json
import pickle
import pandas as pd
from shap import Explainer
import numpy as np


# --- Feature Columns (Must be defined globally and consistently) ---
feature_columns = ['amount', 'duration', 'monthly_income', 'credit_history_encoded', 'avg_balance', 'txn_frequency']


# Load pre-trained model
model = pickle.load(open('model.pkl', 'rb'))


# Define the mapping for credit history (used by map_credit_score and background data)
credit_mapping = {'none': 0, 'fair': 1, 'good': 2, 'excellent': 3}


# --- Prepare Background Data for SHAP Explainer ---
# This data needs to be numerically encoded and have the same column structure as training data.
dummy_background_data_raw = {
   'amount': [1000, 5000, 2000, 8000, 3000, 1500, 7000, 2500, 6000, 4000],
   'duration': [6, 12, 6, 24, 12, 6, 18, 6, 24, 12],
   'monthly_income': [1500, 3000, 1800, 5000, 2500, 1600, 4500, 2000, 4000, 3500],
   'credit_history_encoded': [
       credit_mapping['good'], credit_mapping['excellent'], credit_mapping['fair'],
       credit_mapping['good'], credit_mapping['none'], credit_mapping['fair'],
       credit_mapping['excellent'], credit_mapping['good'], credit_mapping['none'],
       credit_mapping['fair']
   ],
   'avg_balance': [500, 2000, 700, 3000, 800, 600, 2500, 900, 100, 1200],
   'txn_frequency': [10, 30, 15, 40, 20, 12, 35, 18, 5, 22],
}


background_data_for_explainer = pd.DataFrame(dummy_background_data_raw, columns=feature_columns)


# Initialize Explainer with the model's predict_proba function and background data
explainer = Explainer(model.predict_proba, background_data_for_explainer)


# --- Utility Functions ---
def map_credit_score(history):
   """Map credit history to numerical value"""
   return credit_mapping.get(history, 0) # Use the global credit_mapping


def preprocess_input(application_data):
   """Convert application data to features in a DataFrame"""
   features = {
       'amount': application_data['amount'],
       'duration': application_data['duration'],
       'monthly_income': application_data['monthlyIncome'],
       'credit_history_encoded': map_credit_score(application_data['creditHistory']),
       'avg_balance': application_data['mobileMoneyHistory']['averageBalance'],
       'txn_frequency': application_data['mobileMoneyHistory']['transactionFrequency']
   }
   # Ensure the DataFrame has the exact same columns and order as the model expects
   return pd.DataFrame([features], columns=feature_columns)


def explain_prediction(features):
   """Generate SHAP explanation"""
   shap_values = explainer(features)
   return {
       # FIX IS HERE: Access the first row [0] and then the second element [1] for class 1's base value
       'base_value': float(shap_values.base_values[0][1]),
       'feature_importances': dict(zip(
           features.columns,
           # Access SHAP values for the first (and only) sample, all features, for class 1
           [float(x) for x in shap_values.values[0, :, 1]]
       ))
   }


# --- Main Execution Block ---
if __name__ == '__main__':
   # Read application data from command-line argument
   application = json.loads(sys.argv[1])
  
   # Preprocess input and make prediction
   features = preprocess_input(application)
   risk_score = model.predict_proba(features)[0][1] # Probability of the positive class (risk)
  
   # Generate explanation for the prediction
   explanation = explain_prediction(features)
  
   # Structure and print the result as JSON
   result = {
       'riskScore': float(risk_score),
       'recommendation': 'approve' if risk_score < 0.3 else 'review',
       'explanation': explanation
   }
   print(json.dumps(result))
