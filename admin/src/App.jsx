import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Applications from "./components/Applications";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Footer from "./components/Footer";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(!!localStorage.getItem('access_token'));
    };

    // Check immediately
    checkAuthStatus();

    // Listen for storage events from other tabs
    window.addEventListener('storage', checkAuthStatus);

    // Listen for custom logout events
    window.addEventListener('app-logout', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('app-logout', checkAuthStatus);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        {isLoggedIn && <Navbar setIsLoggedIn={setIsLoggedIn} />}
        
        <div className="p-4">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route 
              path="/" 
              element={isLoggedIn ? <Navigate to="/applications" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />} 
            />
            <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="flex justify-center items-center h-64">
                <h2 className="text-3xl text-center mt-10 text-red-500">Page Not Found</h2>
              </div>
            } />
          </Routes>
        </div>
      </BrowserRouter>
      {isLoggedIn && <Footer setIsLoggedIn={setIsLoggedIn} />}
    </div>
  );
}

export default App;