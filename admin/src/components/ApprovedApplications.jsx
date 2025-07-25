import React from 'react';
import { useSelector } from 'react-redux';


const ApprovedApplications = () => {
  // CORRECT PLACE FOR HOOKS: Inside the functional component body
  const { applications } = useSelector(state => state.root);

  // Filter applications here, after getting them from the Redux store
  const approvedApplications = applications.filter(app => app.status === "approved");
  
  return (
    <div className='min-h-screen bg-gray-100 p-4 font-inter'> {/* Added basic styling for context */}
      <div className="container mx-auto py-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
          Approved Loan Applications
        </h2>

        {approvedApplications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 text-lg">
            No Approved Loan Applications Found!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {approvedApplications.map((app, i) => ( // Added parentheses for implicit return
              <div key={app._id || i} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-sm flex flex-col">
                <h3 className="text-xl font-bold text-green-700 mb-2">Application ID: {app._id ? app._id.substring(0, 8) + '...' : 'N/A'}</h3>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Applicant Name:</span> {app.applicantName || 'N/A'}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Amount:</span> NGN {app.amount ? app.amount.toLocaleString() : 'N/A'} {/* Corrected typo: ammount -> amount */}
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

                <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-lg font-bold">
                    Payment: <span className="text-green-600">{app.riskScore?.toFixed(4) || 'N/A'}</span>
                  </p>
                  <p className="text-lg font-bold">
                    Balance: <span className="text-green-600">{app.riskScore?.toFixed(4) || 'N/A'}</span>
                  </p>
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Submitted on: {new Date(app.created_at).toLocaleDateString()}
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

export default ApprovedApplications;
