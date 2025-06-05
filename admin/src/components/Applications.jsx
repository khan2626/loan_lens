// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   PieChart, Pie, Cell
// } from 'recharts'; // Recharts components for charts
// // FIX: Corrected import path for StatusUpdateModal
// import StatusUpdateModal from './StatusUpdateModal'; // Assuming StatusUpdateModal is in the same directory as Dashboard

// const Applications = () => {
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showUpdateModal, setShowUpdateModal] = useState(false); // State to control modal visibility
//   const [currentApplicationToUpdate, setCurrentApplicationToUpdate] = useState(null); // Stores the application being updated
//   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // State to show loading inside the modal

//   // Define colors for the pie chart segments
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];
//   const navigate = useNavigate()

//   // Function to fetch applications from the backend API
//   const fetchApplications = async () => {
//     setLoading(true); // Set loading true at the start of fetch
//     setError(null);    // Clear any previous errors
//     try {
//       const API_URL = 'http://localhost:8300/api/my-applications'; // Your Flask API endpoint for user-specific applications
//       const token = localStorage.getItem('access_token'); // Retrieve JWT from local storage

//       if (!token) {
//         setError('Authentication token not found. Please log in.');
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(API_URL, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`, // Attach the JWT for authentication
//         },
//       });
//       setApplications(response.data); // Update state with fetched applications
//     } catch (err) {
//       console.error('Error fetching applications:', err);
//       // Handle different types of errors from Axios
//       if (err.response) {
//         setError(err.response.data.error || 'Failed to fetch applications from server.');
//       } else {
//         setError(err.message || 'Could not load applications. Please check your network.');
//       }
//     } finally {
//       setLoading(false); // Set loading false after fetch completes
//     }
//   };

//   // useEffect hook to fetch data when the component mounts
//   useEffect(() => {
//     fetchApplications();
//   }, []); // Empty dependency array ensures this runs only once on mount

//   // Handler to open the status update modal
//   const handleOpenUpdateModal = (application) => {
//     setCurrentApplicationToUpdate(application); // Store the application data in state
//     setShowUpdateModal(true); // Show the modal
//   };

//   // Handler to close the status update modal
//   const handleCloseUpdateModal = () => {
//     setShowUpdateModal(false); // Hide the modal
//     setCurrentApplicationToUpdate(null); // Clear the stored application data
//     setError(null); // Clear any modal-related errors
//   };

//   // Handler to submit the status update
//   const handleStatusUpdateSubmit = async (applicationId, newStatus, note) => {
//     setIsUpdatingStatus(true); // Set loading state for the modal button
//     try {
//       const API_URL = `http://localhost:8300/api/applications/${applicationId}/status`; // Flask API endpoint
//       const token = localStorage.getItem('access_token');

//       const response = await axios.put(API_URL, { status: newStatus, note: note }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         // If update is successful, re-fetch all applications to get the latest data
//         navigate("/applications")
//         await fetchApplications();
//         handleCloseUpdateModal(); // Close the modal
//       }
//     } catch (err) {
//       console.error('Error updating status:', err);
//       // Display error message from the server or a generic one
//       setError(err.response?.data?.error || 'Failed to update status.');
//     } finally {
//       setIsUpdatingStatus(false); // Reset modal loading state
//     }
//   };

//   // Display loading indicator
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter">
//         <div className="text-xl text-gray-700">Loading applications...</div>
//       </div>
//     );
//   }

//   // Display error message if fetching fails
//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 rounded-lg font-inter">
//         <div className="text-xl font-semibold">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 font-inter">
//       <div className="container mx-auto py-8">
//         <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
//           Loan Applications
//         </h2>

//         {applications.length === 0 ? (
//           // Message if no applications are found
//           <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 text-lg">
//             No loan applications found. <Link to="/apply" className="text-blue-600 hover:underline">Apply for a loan</Link> now!
//           </div>
//         ) : (
//           // Grid to display loan application cards
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
//             {applications.map((app) => {
//               // Prepare feature importance data for charts
//               // Filter out features with value 0 for cleaner charts if desired, or keep them.
//               const featureImportancesData = app.explanation?.feature_importances
//                 ? Object.entries(app.explanation.feature_importances)
//                     .map(([name, value]) => ({
//                       name: name.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()), // Format feature names nicely
//                       value: value,
//                       absoluteValue: Math.abs(value), // For pie chart, use absolute values for proportion
//                     }))
//                     .filter(item => item.absoluteValue > 0.0001) // Optional: filter out very small values
//                 : [];

//               return (
//                 <div key={app._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm flex flex-col">
//                   {/* Application Details */}
//                   <h3 className="text-xl font-bold text-blue-700 mb-2">Application ID: {app._id.substring(0, 8)}...</h3>
//                   <p className="text-gray-700 mb-1">
//                     <span className="font-semibold">Amount:</span> NGN {app.amount ? app.amount.toLocaleString() : 'N/A'}
//                   </p>
//                   <p className="text-gray-700 mb-1">
//                     <span className="font-semibold">Duration:</span> {app.duration} months
//                   </p>
//                   <p className="text-gray-700 mb-1">
//                     <span className="font-semibold">Monthly Income:</span> NGN {app.monthlyIncome ? app.monthlyIncome.toLocaleString() : 'N/A'}
//                   </p>
//                   <p className="text-gray-700 mb-1">
//                     <span className="font-semibold">Credit History:</span> {app.creditHistory}
//                   </p>
//                   <p className="text-gray-700 mb-1">
//                     <span className="font-semibold">Avg. Mobile Money Balance:</span> NGN {app.mobileMoneyHistory?.averageBalance ? app.mobileMoneyHistory.averageBalance.toLocaleString() : 'N/A'}
//                   </p>
//                   <p className="text-gray-700 mb-4">
//                     <span className="font-semibold">Txn. Frequency:</span> {app.mobileMoneyHistory?.transactionFrequency}
//                   </p>

//                   {/* Prediction Results and Status */}
//                   <div className="mt-auto pt-4 border-t border-gray-200"> {/* mt-auto pushes content to bottom */}
//                     <p className="text-lg font-bold">
//                       Risk Score: <span className="text-green-600">{app.riskScore?.toFixed(4) || 'N/A'}</span>
//                     </p>
//                     <p className="text-lg font-bold">
//                       Recommendation: <span className={`
//                         ${app.recommendation === 'approve' ? 'text-green-600' : ''}
//                         ${app.recommendation === 'review' ? 'text-yellow-600' : ''}
//                         ${app.recommendation === 'reject' ? 'text-red-600' : ''}
//                       `}>
//                         {app.recommendation || 'N/A'}
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2">
//                       Submitted on: {new Date(app.created_at).toLocaleDateString()}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       Status: <span className={`font-semibold ${
//                         app.status === 'approved' ? 'text-green-500' :
//                         app.status === 'rejected' ? 'text-red-500' :
//                         'text-blue-500'
//                       }`}>
//                         {app.status || 'N/A'}
//                       </span>
//                     </p>

//                     {/* Feature Importance Charts */}
//                     {featureImportancesData.length > 0 && (
//   <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
//     <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Feature Importance</h4>
    
//     {/* Full-width Bar Chart */}
//     <div className="w-full h-64 mb-4"> {/* Increased height and added margin-bottom */}
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={featureImportancesData.map(item => ({
//             ...item,
//             scaledValue: item.value * 100
//           }))}
//           margin={{ top: 5, right: 20, left: 20, bottom: 60 }} /* Increased bottom margin */
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//           <XAxis 
//             dataKey="name" 
//             angle={-45} 
//             textAnchor="end" 
//             height={60} 
//             interval={0} 
//             tick={{ fontSize: 10 }}
//           />
//           <YAxis 
//             tickFormatter={(value) => value.toFixed(1)}
//             tick={{ fontSize: 10 }}
//           />
//           <Tooltip
//             formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
//             labelFormatter={(label) => `Feature: ${label}`}
//             contentStyle={{ 
//               backgroundColor: '#333', 
//               border: 'none', 
//               borderRadius: '4px', 
//               color: '#fff', 
//               fontSize: '0.8rem' 
//             }}
//           />
//           <Bar 
//             dataKey="scaledValue" 
//             fill="#8884d8" 
//             name="Importance (%)"
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>

//     {/* Centered Pie Chart below */}
//     <div className="w-full h-64"> {/* Same height as bar chart */}
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={featureImportancesData.map(item => ({
//               ...item,
//               scaledAbsoluteValue: Math.abs(item.value) * 100
//             }))}
//             dataKey="scaledAbsoluteValue"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             outerRadius={80}
//             innerRadius={40}
//             fill="#8884d8"
//             label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
//             labelLine={false}
//           >
//             {featureImportancesData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(value, name, props) => {
//               const originalValue = props.payload.value * (props.payload.value > 0 ? 1 : -1);
//               return [`${originalValue.toFixed(2)}%`, name];
//             }}
//             contentStyle={{ 
//               backgroundColor: '#333', 
//               border: 'none', 
//               borderRadius: '4px', 
//               color: '#fff', 
//               fontSize: '0.8rem' 
//             }}
//           />
//           <Legend 
//             layout="horizontal" 
//             verticalAlign="bottom" 
//             height={40}
//             wrapperStyle={{ paddingTop: '20px' }}
//             formatter={(value, entry, index) => (
//               <span style={{ fontSize: '0.7rem', color: '#333' }}>
//                 {value}: {(featureImportancesData[index].value * 100).toFixed(2)}%
//               </span>
//             )}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
    
//     <p className="text-xs text-gray-500 mt-2 text-center">
//       Note: Values scaled by 100 for better visibility. Positive values indicate higher risk factors.
//     </p>
//   </div>
// )}
//                     {/* Update Status Button */}
//                     <button
//                       onClick={() => handleOpenUpdateModal(app)}
//                       className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
//                     >
//                       Update Status
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Status Update Modal (conditionally rendered) */}
//       {showUpdateModal && currentApplicationToUpdate && (
//         <StatusUpdateModal
//           application={currentApplicationToUpdate}
//           onClose={handleCloseUpdateModal}
//           onSubmit={handleStatusUpdateSubmit}
//           isLoading={isUpdatingStatus}
//         />
//       )}
//     </div>
//   );
// };

// export default Applications;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import StatusUpdateModal from './StatusUpdateModal';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentApplicationToUpdate, setCurrentApplicationToUpdate] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = 'http://localhost:8300/api/applications';
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
        setError(err.message || 'Could not load applications. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenUpdateModal = (application) => {
    setCurrentApplicationToUpdate(application);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setCurrentApplicationToUpdate(null);
    setError(null);
  };

  const handleStatusUpdateSubmit = async (applicationId, newStatus, note) => {
    setIsUpdatingStatus(true);
    try {
      const API_URL = `http://localhost:8300/api/applications/${applicationId}/status`;
      const token = localStorage.getItem('access_token');

      const response = await axios.put(API_URL, { status: newStatus, note: note }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        navigate("/applications");
        await fetchApplications();
        handleCloseUpdateModal();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
          Loan Applications
        </h2>

        {applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600 text-lg">
            No loan applications found. <Link to="/apply" className="text-blue-600 hover:underline">Apply for a loan</Link> now!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {applications.map((app) => {
              const featureImportancesData = app.explanation?.feature_importances
                ? Object.entries(app.explanation.feature_importances)
                    .map(([name, value]) => ({
                      name: name.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
                      value: value,
                      absoluteValue: Math.abs(value),
                    }))
                    .filter(item => item.absoluteValue > 0.0001)
                : [];

              return (
                <div key={app._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 w-full max-w-sm flex flex-col">
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

                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <p className="text-lg font-bold">
                      Risk Score: <span className="text-green-600">{app.riskScore?.toFixed(4) || 'N/A'}</span>
                    </p>
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
                        'text-blue-500'
                      }`}>
                        {app.status || 'N/A'}
                      </span>
                    </p>

                    {featureImportancesData.length > 0 && (
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Feature Importance</h4>
                        
                        <div className="w-full h-64 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={featureImportancesData.map(item => ({
                                ...item,
                                scaledValue: item.value * 100
                              }))}
                              margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45} 
                                textAnchor="end" 
                                height={60} 
                                interval={0} 
                                tick={{ fontSize: 10 }}
                              />
                              <YAxis 
                                tickFormatter={(value) => value.toFixed(1)}
                                tick={{ fontSize: 10 }}
                              />
                              <Tooltip
                                formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
                                labelFormatter={(label) => `Feature: ${label}`}
                                contentStyle={{ 
                                  backgroundColor: '#333', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  color: '#fff', 
                                  fontSize: '0.8rem' 
                                }}
                              />
                              <Bar 
                                dataKey="scaledValue" 
                                fill="#8884d8" 
                                name="Importance (%)"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="w-full h-64 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={featureImportancesData.map(item => ({
                                  ...item,
                                  scaledAbsoluteValue: Math.abs(item.value) * 100
                                }))}
                                dataKey="scaledAbsoluteValue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                fill="#8884d8"
                                label={false}
                              >
                                {featureImportancesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name, props) => {
                                  const originalValue = props.payload.value * (props.payload.value > 0 ? 1 : -1);
                                  return [`${originalValue.toFixed(2)}%`, name];
                                }}
                                contentStyle={{ 
                                  backgroundColor: '#333', 
                                  border: 'none', 
                                  borderRadius: '4px', 
                                  color: '#fff', 
                                  fontSize: '0.8rem' 
                                }}
                              />
                              <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                height={60}
                                wrapperStyle={{ 
                                  paddingTop: '10px',
                                  overflow: 'auto',
                                  maxHeight: '60px'
                                }}
                                formatter={(value, entry, index) => (
                                  <span className="text-xs text-gray-700">
                                    {value}: {(featureImportancesData[index].value * 100).toFixed(2)}%
                                  </span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          Note: Values scaled by 100 for better visibility. Positive values indicate higher risk factors.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenUpdateModal(app)}
                      className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUpdateModal && currentApplicationToUpdate && (
        <StatusUpdateModal
          application={currentApplicationToUpdate}
          onClose={handleCloseUpdateModal}
          onSubmit={handleStatusUpdateSubmit}
          isLoading={isUpdatingStatus}
        />
      )}
    </div>
  );
};

export default Applications;