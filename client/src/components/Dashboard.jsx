

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios'; 
import PaymentModal from './PaymentModal'; // Import the new PaymentModal

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentApplicationForPayment, setCurrentApplicationForPayment] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true); // Set loading true at the start of fetch
      setError(null); // Clear any previous errors
      try {
        const API_URL = 'https://loan-lens.onrender.com/api/applications'; // Corrected API URL to match your Flask app's /api/applications endpoint

        const token = localStorage.getItem('access_token'); 

        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(API_URL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });
        
        setApplications(response.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
        
        if (err.response) {
          setError(err.response.data.error || 'Failed to fetch applications from server. Please logout and login');
        } else {
          setError(err.message || 'Could not load applications. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); 

  // --- Payment Modal Handlers ---
  const handleOpenPaymentModal = (application) => {
    setCurrentApplicationForPayment(application);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setCurrentApplicationForPayment(null);
    setError(null); // Clear any payment-related errors
  };

  const handlePaymentSubmit = async (applicationId, amount, method) => {
    setIsProcessingPayment(true);
    setError(null); // Clear previous errors
    try {
      const API_URL = `https://loan-lens.onrender.com/api/applications/${applicationId}/payment`; // Corrected API URL for payment
      const token = localStorage.getItem('access_token');

      const response = await axios.post(API_URL, { amount, method }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // In a real app, use a custom message box instead of alert()
        alert('Payment successful!'); 
        // Re-fetch applications to update the list and balances
        await fetchApplications(); 
        handleClosePaymentModal();
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.error || 'Failed to process payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  // --- End Payment Modal Handlers ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
        <div className="text-xl text-gray-700">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 rounded-lg font-inter">
        <div className="text-xl font-semibold">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-inter">
      <div className="container mx-auto py-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          My Loan Applications
        </h2>

        {applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 text-lg">
            No loan applications found. <Link to="/apply" className="text-blue-600 hover:underline">Apply for a loan</Link> now!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {applications.map((app) => {
              // Calculate remaining balance for display
              const totalLoanAmount = app.amount || 0;
              const totalPaid = app.totalPaid || 0;
              const currentRemainingBalance = totalLoanAmount - totalPaid;

              return (
                <div key={app._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm flex flex-col"> {/* Adjusted max-w-sm for better card sizing */}
                  <h3 className="text-xl font-bold text-blue-700 mb-2">Application ID: {app._id.substring(0, 8)}...</h3>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Amount:</span> NGN {app.amount ? app.amount.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Duration:</span> {app.duration} months
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Monthly Income:</span> NGN {app.monthlyIncome ? app.monthlyIncome.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Credit History:</span> {app.creditHistory}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Avg. Mobile Money Balance:</span> NGN {app.mobileMoneyHistory?.averageBalance ? app.mobileMoneyHistory.averageBalance.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-gray-700 mb-4">
                    <span className="font-semibold">Txn. Frequency:</span> {app.mobileMoneyHistory?.transactionFrequency}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-lg font-bold">
                      Risk Score: <span className="text-green-600">{app.riskScore?.toFixed(4) || 'N/A'}</span>
                    </p>
                    {/* Re-added Recommendation display for completeness */}
                    <p className="text-lg font-bold">
                      Recommendation: <span className={`
                        ${app.recommendation === 'approve' ? 'text-green-600' : ''}
                        ${app.recommendation === 'review' ? 'text-yellow-600' : ''}
                        ${app.recommendation === 'reject' ? 'text-red-600' : ''}
                      `}>
                        {app.recommendation || 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted on: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`font-semibold ${
                        app.status === 'approved' ? 'text-green-500' :
                        app.status === 'rejected' ? 'text-red-500' :
                        app.status === 'fully_paid' ? 'text-purple-500' : // New status color
                        app.status === 'partially_paid' ? 'text-orange-500' : // New status color
                        'text-blue-500'
                      }`}>
                        {app.status || 'N/A'}
                      </span>
                    </p>
                    {/* Display Total Paid and Remaining Balance */}
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Total Paid:</span> NGN {totalPaid.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold">
                      <span className="font-semibold">Remaining:</span> <span className={`${currentRemainingBalance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        NGN {currentRemainingBalance.toLocaleString()}
                      </span>
                    </p>

                    {/* Make Payment Button */}
                    <div className="flex flex-col space-y-3 mt-4">
                      <button
                        onClick={() => handleOpenPaymentModal(app)}
                        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentRemainingBalance <= 0 || app.status === 'rejected'} // Disable if fully paid or rejected
                      >
                        Make Payment
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal Render */}
      {showPaymentModal && currentApplicationForPayment && (
        <PaymentModal
          application={currentApplicationForPayment}
          onClose={handleClosePaymentModal}
          onSubmit={handlePaymentSubmit}
          isLoading={isProcessingPayment}
        />
      )}
    </div>
  );
};

export default Dashboard;
