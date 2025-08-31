import React from 'react';
import { useSelector } from 'react-redux';

const ApprovedApplications = () => {
  // CORRECT PLACE FOR HOOKS: Inside the functional component body
  const { applications } = useSelector(state => state.root);

  // Filter applications here, after getting them from the Redux store
  const approvedApplications = applications.filter(app => app.status === "approved" || app.status === "partially_paid" || app.status === "fully_paid");
  
  return (
    <div className='min-h-screen bg-gray-100 p-4 font-inter'>
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
            {approvedApplications.map((app, i) => {
              // Calculate totalPaid and remainingBalance for each application
              const totalLoanAmount = app.amount || 0;
              const totalPaid = app.totalPaid || 0;
              const remainingBalance = totalLoanAmount - totalPaid;

              return (
                <div key={app._id || i} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-sm flex flex-col">
                  <h3 className="text-xl font-bold text-green-700 mb-2">Application ID: {app._id ? app._id.substring(0, 8) + '...' : 'N/A'}</h3>
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Applicant Name:</span> {app.applicantName || 'N/A'}
                  </p>
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

                  <div className="mt-auto pt-4 border-t border-gray-200">
                    {/* Display Total Paid correctly */}
                    <p className="text-lg font-bold">
                      Total Paid: <span className="text-gray-700">NGN {totalPaid.toLocaleString()}</span>
                    </p>
                    {/* Display Balance (Remaining) correctly with conditional styling */}
                    <p className="text-lg font-bold">
                      Balance: 
                      <span className={`${remainingBalance <= 0 ? 'text-green-600' : 'text-red-600'} ml-2`}>
                        NGN {remainingBalance.toLocaleString()}
                      </span>
                    </p>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted on: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: <span className={`font-semibold ${
                        app.status === 'approved' ? 'text-green-500' :
                        app.status === 'rejected' ? 'text-red-500' :
                        app.status === 'fully_paid' ? 'text-purple-500' : // Added status for fully paid
                        app.status === 'partially_paid' ? 'text-orange-500' : // Added status for partially paid
                        'text-blue-500'
                      }`}>
                        {app.status || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedApplications;
