import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Apply from "./components/Apply";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";

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

  const RedirectIfLoggedIn = ({ children }) => {
    if (isLoggedIn) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        {/* Navbar is now always rendered */}
        <Navbar setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
        
        <div className="p-4">
          <Routes>
            <Route 
              path="/" 
              element={
                isLoggedIn ? <Navigate to="/dashboard" replace /> : <HomePage />
              } 
            />

            <Route path="/signup" element={<RedirectIfLoggedIn><Signup /></RedirectIfLoggedIn>} />
            
            <Route 
              path="/login" 
              element={<RedirectIfLoggedIn><Login setIsLoggedIn={setIsLoggedIn} /></RedirectIfLoggedIn>} 
            />
            
            <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            <Route path="*" element={
              <div className="flex justify-center items-center h-64">
                <h2 className="text-3xl text-center mt-10 text-red-500">Page Not Found</h2>
              </div>
            } />
          </Routes>
        </div>
      </BrowserRouter>
      {/* Footer only shows if logged in */}
      {isLoggedIn && <Footer setIsLoggedIn={setIsLoggedIn}/>}
    </div>
  );
}

export default App;
