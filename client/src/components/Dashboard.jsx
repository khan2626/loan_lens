import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios'; 

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
               const API_URL = 'http://localhost:5000/api/my-applications'; 

       
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
          setError(err.response.data.error || 'Failed to fetch applications from server.');
        } else {
          setError(err.message || 'Could not load applications. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); 
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
            {applications.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 w-full max-w-s">
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
                  {/* <p className="text-lg font-bold">
                    Recommendation: <span className={`
                      ${app.recommendation === 'approve' ? 'text-green-600' : ''}
                      ${app.recommendation === 'review' ? 'text-yellow-600' : ''}
                      ${app.recommendation === 'reject' ? 'text-red-600' : ''}
                    `}>
                      {app.recommendation || 'N/A'}
                    </span>
                  </p> */}
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted on: {new Date(app.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-semibold ${
                      app.status === 'approved' ? 'text-green-500' :
                      app.status === 'rejected' ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {app.status || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
