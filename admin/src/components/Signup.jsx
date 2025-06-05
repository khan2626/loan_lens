import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation to login

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success or error messages
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    // Basic email regex validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    const { name, email, password } = formData;

    // Client-side validation
    if (!name || !email || !password) {
      setMessage('All fields are required.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setMessage('Invalid email format.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    // Optional: Add password strength validation here (e.g., min length)
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // --- IMPORTANT: Replace with your actual Flask API URL ---
      const API_URL = 'https://loan-lens.onrender.com/api/signup'; // Adjust if deployed

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Assuming your Flask API returns { message: "...", access_token: "...", user_id: "..." } on success
      if (response.status === 201) {
        setMessage(response.data.message || 'User registered successfully!');
        setMessageType('success');
        localStorage.setItem('access_token', response.data.access_token); // Store the JWT
        localStorage.setItem('user_id', response.data.user_id); // Store user ID
        localStorage.setItem('user_name', response.data.name); // Store user name (if returned)

        // Redirect to dashboard after a short delay for message visibility
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setMessageType('error');
      if (err.response) {
        // Server responded with a status other than 2xx
        setMessage(err.response.data.error || err.response.data.message || 'Signup failed.');
      } else if (err.request) {
        // Request was made but no response received
        setMessage('No response from server. Please check your network.');
      } else {
        // Something else happened
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Email Input */}
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
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
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
              placeholder="********"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Message Display */}
          {message && (
            <div className={`px-4 py-3 rounded-md relative ${
              messageType === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
              'bg-red-100 border border-red-400 text-red-700'
            }`} role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition-all duration-300 transform ${
              loading
                ? 'bg-purple-400 cursor-not-allowed' // Disabled state styling
                : 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500' // Enabled state styling
            }`}
            disabled={loading} // Disable button based on loading state
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
