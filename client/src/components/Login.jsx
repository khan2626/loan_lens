// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState(''); // For success or error messages
//   const [messageType, setMessageType] = useState(''); // 'success' or 'error'

//   const navigate = useNavigate(); // Hook for programmatic navigation

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');
//     setMessageType('');

//     const { email, password } = formData;

//     // Client-side validation
//     if (!email || !password) {
//       setMessage('Email and password are required.');
//       setMessageType('error');
//       setLoading(false);
//       return;
//     }

//     try {
//       // --- IMPORTANT: Replace with your actual Flask API URL ---
//       const API_URL = 'http://localhost:5000/api/login'; // Adjust if deployed

//       const response = await axios.post(API_URL, formData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       // Assuming your Flask API returns { access_token: "...", user_id: "...", name: "..." } on success
//       if (response.status === 200) {
//         setMessage('Logged in successfully!');
//         setMessageType('success');
//         localStorage.setItem('access_token', response.data.access_token); // Store the JWT
//         localStorage.setItem('user_id', response.data.user_id); // Store user ID
//         localStorage.setItem('user_name', response.data.name); // Store user name
//         window.dispatchEvent(new Event('storage'));
//         navigate('/dashboard')

//         // Redirect to dashboard after a short delay for message visibility
//         // setTimeout(() => {
//         //   navigate('/dashboard');
//         // }, 1500);
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setMessageType('error');
//       if (err.response) {
//         // Server responded with a status other than 2xx (e.g., 401 Invalid credentials)
//         setMessage(err.response.data.error || err.response.data.message || 'Login failed.');
//       } else if (err.request) {
//         // Request was made but no response received
//         setMessage('No response from server. Please check your network.');
//       } else {
//         // Something else happened
//         setMessage('An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 font-inter">
//       <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
//         <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Log In</h2>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Email Input */}
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="you@example.com"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
//               required
//               disabled={loading}
//             />
//           </div>

//           {/* Password Input */}
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="********"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
//               required
//               disabled={loading}
//             />
//           </div>

//           {/* Message Display */}
//           {message && (
//             <div className={`px-4 py-3 rounded-md relative ${
//               messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
//               'bg-red-100 border border-red-400 text-red-700'
//             }`} role="alert">
//               <span className="block sm:inline">{message}</span>
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition-all duration-300 transform ${
//               loading
//                 ? 'bg-blue-400 cursor-not-allowed' // Disabled state styling
//                 : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' // Enabled state styling
//             }`}
//             disabled={loading} // Disable button based on loading state
//           >
//             {loading ? 'Logging In...' : 'Log In'}
//           </button>
//         </form>

//         {/* Link to Signup Page */}
//         <p className="mt-6 text-center text-gray-600 text-sm">
//           Don't have an account?{' '}
//           <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await axios.post('http://localhost:5000/api/login', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('user_name', response.data.name);
        
        if (setIsLoggedIn) setIsLoggedIn(true);
        
        window.dispatchEvent(new Event('storage'));
        navigate('/dashboard');
      }
    } catch (err) {
      setMessageType('error');
      if (err.response) {
        setMessage(err.response.data.error || 'Login failed');
      } else {
        setMessage('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Log In</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-semibold ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-all duration-300`}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;