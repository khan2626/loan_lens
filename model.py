import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import pickle
import os


# --- 1. Generate Sample Data ---
# This data mimics the features expected by your preprocess_input function
# and a target variable (risk_label)
data = {
   'amount': [1000, 5000, 2000, 8000, 3000, 1500, 7000, 2500, 6000, 4000],
   'duration': [6, 12, 6, 24, 12, 6, 18, 6, 24, 12],
   'monthly_income': [1500, 3000, 1800, 5000, 2500, 1600, 4500, 2000, 4000, 3500],
   'credit_history': ['good', 'excellent', 'fair', 'good', 'none', 'fair', 'excellent', 'good', 'none', 'fair'],
   'avg_balance': [500, 2000, 700, 3000, 800, 600, 2500, 900, 100, 1200],
   'txn_frequency': [10, 30, 15, 40, 20, 12, 35, 18, 5, 22],
   'risk_label': [0, 0, 1, 0, 1, 1, 0, 0, 1, 0] # 0 = 'approve', 1 = 'review'
}
df = pd.DataFrame(data)


print("Sample DataFrame created:")
print(df.head())
print("\n")


# --- 2. Preprocess Data for Training ---
# Map credit_history to numerical values, similar to your map_credit_score function
credit_mapping = {'none': 0, 'fair': 1, 'good': 2, 'excellent': 3}
df['credit_history_encoded'] = df['credit_history'].map(credit_mapping)


# Define features (X) and target (y)
features_columns = ['amount', 'duration', 'monthly_income', 'credit_history_encoded', 'avg_balance', 'txn_frequency']
X = df[features_columns]
y = df['risk_label']


# --- 3. Train a Simple Model ---
# Using Logistic Regression as a common classification model
model = LogisticRegression(random_state=42, solver='liblinear') # liblinear for small datasets
model.fit(X, y)


print("Model trained successfully!")
print(f"Model coefficients: {model.coef_}")
print(f"Model intercept: {model.intercept_}")
print("\n")


# --- 4. Save the Trained Model ---
model_filename = 'model.pkl'
with open(model_filename, 'wb') as file:
   pickle.dump(model, file)


print(f"Model saved as '{model_filename}'")
print(f"File size: {os.path.getsize(model_filename)} bytes")
print("\n")


# --- Verification (Optional) ---
# You can load it back to ensure it works
loaded_model = pickle.load(open(model_filename, 'rb'))
print("Model loaded back for verification.")
print(f"Loaded model type: {type(loaded_model)}")


# Test with a sample prediction
sample_features_for_prediction = pd.DataFrame([[5000, 12, 3000, 2, 1500, 25]], columns=features_columns)
prediction_proba = loaded_model.predict_proba(sample_features_for_prediction)[0][1]
print(f"Sample prediction probability (risk score): {prediction_proba:.4f}")
