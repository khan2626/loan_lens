import React, { useState, useEffect } from 'react';

const PaymentModal = ({ application, onClose, onSubmit, isLoading }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money'); // Default method
  const [error, setError] = useState(null);

  // Calculate remaining balance
  const totalLoanAmount = application.amount || 0;
  const totalPaid = application.totalPaid || 0;
  const remainingBalance = totalLoanAmount - totalPaid;

  useEffect(() => {
    // Set initial payment amount to remaining balance, or 0 if negative
    setPaymentAmount(Math.max(0, remainingBalance).toFixed(2));
  }, [remainingBalance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }
    if (amount > remainingBalance + 0.01) { // Allow for tiny floating point differences
      setError(`Payment amount cannot exceed remaining balance (NGN ${remainingBalance.toLocaleString()}).`);
      return;
    }

    onSubmit(application._id, amount, paymentMethod);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Make Payment for Application ID: {application._id.substring(0, 8)}...</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 text-gray-700">
          <p><span className="font-semibold">Loan Amount:</span> NGN {totalLoanAmount.toLocaleString()}</p>
          <p><span className="font-semibold">Total Paid:</span> NGN {totalPaid.toLocaleString()}</p>
          <p className="text-lg font-bold"><span className="font-semibold">Remaining Balance:</span> NGN {remainingBalance.toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (NGN)
            </label>
            <input
              type="number"
              id="paymentAmount"
              name="paymentAmount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isLoading || remainingBalance <= 0}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none bg-white pr-8"
              required
              disabled={isLoading || remainingBalance <= 0}
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card Payment</option>
            </select>
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || remainingBalance <= 0 || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingBalance + 0.01}
            >
              {isLoading ? 'Processing...' : 'Submit Payment'}
            </button>
          </div>
        </form>
        {remainingBalance <= 0 && (
          <p className="text-center text-green-600 font-semibold mt-4">This loan has been fully paid!</p>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
