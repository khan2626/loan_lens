import React, { useState } from 'react';
import axios from 'axios'; 

const Apply = () => {
  
  const [formData, setFormData] = useState({
    amount: '',
    duration: '',
    monthlyIncome: '',
    creditHistory: 'none', 
    mobileMoneyHistory: {
      averageBalance: '',
      transactionFrequency: '',
    },
  });

  const [submissionStatus, setSubmissionStatus] = useState(null); 
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle changes for nested mobileMoneyHistory fields
  const handleMobileMoneyChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      mobileMoneyHistory: {
        ...prevData.mobileMoneyHistory,
        [name]: value,
      },
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setSubmissionStatus(null);
    setErrorMessage('');
    setSubmittedData(null);
    setIsSubmitting(true); 

    
    const { amount, duration, monthlyIncome, creditHistory, mobileMoneyHistory } = formData;
    const { averageBalance, transactionFrequency } = mobileMoneyHistory;

    if (
      !amount || !duration || !monthlyIncome || !creditHistory ||
      !averageBalance || !transactionFrequency
    ) {
      setErrorMessage('Please fill in all required fields.');
      setSubmissionStatus('error');
      setIsSubmitting(false); 
      return;
    }

    
    const dataToSend = {
      ...formData,
      amount: Number(amount),
      duration: Number(duration),
      monthlyIncome: Number(monthlyIncome),
      mobileMoneyHistory: {
        averageBalance: Number(averageBalance),
        transactionFrequency: Number(transactionFrequency),
      },
    };

    console.log('Form Data to Send:', JSON.stringify(dataToSend, null, 2));

    try {
      
      const API_URL = 'https://loan-lens.onrender.com/api/predict'; 

      
      const token = localStorage.getItem('access_token'); 

      if (!token) {
        setErrorMessage('Authentication token not found. Please log in.');
        setSubmissionStatus('error');
        setIsSubmitting(false);
        return;
      }

      
      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      
      setSubmittedData(response.data);
      setSubmissionStatus('success');
      setErrorMessage(''); 

     
      setFormData({
        amount: '', duration: '', monthlyIncome: '', creditHistory: 'none',
        mobileMoneyHistory: { averageBalance: '', transactionFrequency: '' },
      });

    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionStatus('error');
      if (err.response) {
        
        setErrorMessage(err.response.data.error || err.response.data.message || 'Something went wrong on the server.');
      } else if (err.request) {
        
        setErrorMessage('No response from server. Please check your network.');
      } else {
        
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Loan Application</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount (NGN)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 50000"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                required
                disabled={isSubmitting} 
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Loan Duration (Months)
              </label>
              <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  required
                  disabled={isSubmitting} 
                />
              </div>
            </div>

            {/* Income and Credit History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income (NGN)
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  required
                  disabled={isSubmitting} 
                />
              </div>
              <div>
                <label htmlFor="creditHistory" className="block text-sm font-medium text-gray-700 mb-1">
                  Credit History
                </label>
                <select
                  id="creditHistory"
                  name="creditHistory"
                  value={formData.creditHistory}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50 appearance-none bg-white pr-8"
                  required
                  disabled={isSubmitting} 
                >
                  <option value="none">None</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
            </div>

            {/* Mobile Money History */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobile Money History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="averageBalance" className="block text-sm font-medium text-gray-700 mb-1">
                    Average Balance (NGN)
                  </label>
                  <input
                    type="number"
                    id="averageBalance"
                    name="averageBalance"
                    value={formData.mobileMoneyHistory.averageBalance}
                    onChange={handleMobileMoneyChange}
                    placeholder="e.g., 1500"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    required
                    disabled={isSubmitting} 
                  />
                </div>
                <div>
                  <label htmlFor="transactionFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Freq.(per month)
                  </label>
                  <input
                    type="number"
                    id="transactionFrequency"
                    name="transactionFrequency"
                    value={formData.mobileMoneyHistory.transactionFrequency}
                    onChange={handleMobileMoneyChange}
                    placeholder="e.g., 10"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    required
                    disabled={isSubmitting} 
                  />
                </div>
              </div>
            </div>

            {/* Submission Status */}
            {submissionStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{errorMessage}</span>
              </div>
            )}
            {submissionStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline ml-2">Application submitted successfully.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition-all duration-300 transform ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' // Enabled state styling
              }`}
              disabled={isSubmitting} 
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'} 
            </button>
          </form>

          {/* Display Submitted Data (for testing) */}
          {submittedData && (
            <div className="mt-8 p-6 bg-gray-700 text-white rounded-lg shadow-inner overflow-x-auto">
              <h3 className="text-xl font-semibold mb-4 text-blue-200">Submitted Data (JSON)</h3>
              <pre className="bg-gray-800 p-4 rounded-md text-sm leading-relaxed">
                <code>{JSON.stringify(submittedData, null, 2)}</code>
              </pre>
            </div>
          )}
          </div>
        </div>
      );
    };

    export default Apply;
