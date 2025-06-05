import React, { useState } from 'react';

const StatusUpdate = ({ application, onClose, onSubmit, isLoading }) => {
  const [newStatus, setNewStatus] = useState(application.status || 'pending');
  const [note, setNote] = useState('');

  const validStatuses = ['pending', 'approved', 'rejected', 'disbursed'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(application._id, newStatus, note);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 font-inter">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Update Status for Application ID: {application._id.substring(0, 8)}...
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              New Status
            </label>
            <select
              id="status"
              name="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none bg-white pr-8"
              disabled={isLoading}
            >
              {validStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows="3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about the status change..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              disabled={isLoading}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md font-semibold text-white transition-all duration-200 ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdate;
