import pickle
import pandas as pd
import numpy as np
from shap import Explainer # Assuming 'shap' is installed: pip install shap

# --- Global Model and Explainer Instances ---
# These will be loaded once when the module is imported.
_model = None
_explainer = None
_feature_columns = ['amount', 'duration', 'monthly_income', 'credit_history_encoded', 'avg_balance', 'txn_frequency']
_credit_mapping = {'none': 0, 'fair': 1, 'good': 2, 'excellent': 3}


# --- Model Loading Function ---
def load_ml_model_and_explainer(model_path='model.pkl'):
    """
    Loads the pre-trained ML model and initializes the SHAP explainer.
    This function should be called once at application startup.
    """
    global _model, _explainer

    if _model is not None:
        print("ML model and explainer already loaded.")
        return

    try:
        # Load pre-trained model
        _model = pickle.load(open(model_path, 'rb'))
        print(f"ML model loaded successfully from {model_path}")

        # --- Prepare Background Data for SHAP Explainer ---
        # This data needs to be numerically encoded and have the same column structure as training data.
        # Ensure this background data is representative of your training data.
        dummy_background_data_raw = {
            'amount': [1000, 5000, 2000, 8000, 3000, 1500, 7000, 2500, 6000, 4000],
            'duration': [6, 12, 6, 24, 12, 6, 18, 6, 24, 12],
            'monthly_income': [1500, 3000, 1800, 5000, 2500, 1600, 4500, 2000, 4000, 3500],
            'credit_history_encoded': [
                _credit_mapping['good'], _credit_mapping['excellent'], _credit_mapping['fair'],
                _credit_mapping['good'], _credit_mapping['none'], _credit_mapping['fair'],
                _credit_mapping['excellent'], _credit_mapping['good'], _credit_mapping['none'],
                _credit_mapping['fair']
            ],
            'avg_balance': [500, 2000, 700, 3000, 800, 600, 2500, 900, 100, 1200],
            'txn_frequency': [10, 30, 15, 40, 20, 12, 35, 18, 5, 22],
        }
        background_data_for_explainer = pd.DataFrame(dummy_background_data_raw, columns=_feature_columns)

        # Initialize Explainer with the model's predict_proba function and background data
        # Using model.predict_proba for classification problems with SHAP.
        _explainer = Explainer(_model.predict_proba, background_data_for_explainer)
        print("SHAP Explainer initialized successfully.")

    except FileNotFoundError:
        print(f"Error: Model file not found at {model_path}. Please ensure 'model.pkl' exists.")
        _model = None
        _explainer = None
    except Exception as e:
        print(f"Error loading ML model or initializing SHAP Explainer: {e}")
        _model = None
        _explainer = None

# --- Utility Functions ---
def _map_credit_score(history):
    """Map credit history to numerical value using the global mapping."""
    return _credit_mapping.get(history.lower(), 0) # Ensure case-insensitivity


def _preprocess_input(application_data):
    """
    Converts raw application data from request JSON to a pandas DataFrame
    with the exact feature columns and order the model expects.
    """
    # Ensure all expected keys are present, provide defaults if necessary
    mobile_money_history = application_data.get('mobileMoneyHistory', {})
    
    features = {
        'amount': application_data.get('amount'),
        'duration': application_data.get('duration'),
        'monthly_income': application_data.get('monthlyIncome'),
        'credit_history_encoded': _map_credit_score(application_data.get('creditHistory')),
        'avg_balance': mobile_money_history.get('averageBalance'),
        'txn_frequency': mobile_money_history.get('transactionFrequency')
    }
    
    # Convert to DataFrame ensuring correct column order
    return pd.DataFrame([features], columns=_feature_columns)


def _explain_prediction(features):
    """
    Generates SHAP explanation for a single prediction.
    Assumes _explainer is loaded and handles multi-output for predict_proba.
    """
    if _explainer is None:
        return {'base_value': 0.0, 'feature_importances': {}} # Return empty if explainer not loaded

    # SHAP explainer returns an Explanation object.
    # For predict_proba, .values will be (num_samples, num_features, num_classes).
    # We want the values for the first (and only) sample, all features, for class 1 (positive class).
    shap_values_for_instance = _explainer(features)

    # Base value for the positive class (class 1)
    base_value = float(shap_values_for_instance.base_values[0][1])

    # Feature importances for the positive class (class 1)
    # Ensure correct indexing [0] for the single sample, [:, 1] for all features of class 1
    feature_importances_raw = shap_values_for_instance.values[0, :, 1]

    feature_names = features.columns.tolist() # Get feature names from the DataFrame columns
    feature_importances_dict = dict(zip(feature_names, [float(x) for x in feature_importances_raw]))

    return {
        'base_value': base_value,
        'feature_importances': feature_importances_dict
    }


# --- Main Prediction Function (to be called from Flask app) ---
def get_loan_prediction(application_data):
    """
    Processes application data, makes a loan risk prediction,
    and generates SHAP explanations.
    """
    if _model is None:
        # If the model failed to load at startup, raise an error
        raise RuntimeError("ML model is not loaded. Please check server logs for model loading errors.")

    # 1. Preprocess input data
    features = _preprocess_input(application_data)

    # 2. Make prediction
    # model.predict_proba returns probabilities for [class 0, class 1]. We want class 1.
    risk_score = _model.predict_proba(features)[0][1]

    # 3. Determine recommendation
    # Adjust this threshold as per your business logic
    recommendation = 'approved' if risk_score < 0.3 else 'review'
    if risk_score >= 0.7: # Example: add a 'rejected' category for high risk
        recommendation = 'rejected'

    # 4. Generate explanation
    explanation = _explain_prediction(features)

    # 5. Return structured result
    result = {
        'riskScore': float(risk_score),
        'recommendation': recommendation,
        'explanation': explanation
    }
    return result


# --- Test Block (optional - for local testing of this module directly) ---
if __name__ == '__main__':
    # You would typically call load_ml_model_and_explainer() explicitly here for testing
    # Make sure 'model.pkl' exists in the same directory or provide the correct path.
    load_ml_model_and_explainer(model_path='model.pkl')

    # Example application data (mimics your frontend payload)
    sample_application = {
        'amount': 2500,
        'duration': 12,
        'monthlyIncome': 2800,
        'creditHistory': 'good',
        'mobileMoneyHistory': {
            'averageBalance': 600,
            'transactionFrequency': 25
        }
    }

    try:
        prediction_output = get_loan_prediction(sample_application)
        print("Prediction Output:")
        print(json.dumps(prediction_output, indent=2))
    except RuntimeError as e:
        print(f"Error during prediction: {e}")

    print("\n--- Testing a high-risk scenario ---")
    high_risk_application = {
        'amount': 10000,
        'duration': 24,
        'monthlyIncome': 1000,
        'creditHistory': 'none',
        'mobileMoneyHistory': {
            'averageBalance': 50,
            'transactionFrequency': 5
        }
    }
    try:
        prediction_output_high_risk = get_loan_prediction(high_risk_application)
        print("Prediction Output (High Risk):")
        print(json.dumps(prediction_output_high_risk, indent=2))
    except RuntimeError as e:
        print(f"Error during prediction: {e}")