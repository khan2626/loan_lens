import React, { useState } from 'react';
import logo from '../assets/logo.jpeg';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ setIsLoggedIn }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    
    // Update parent component state
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    
    // Trigger event for other components
    window.dispatchEvent(new Event('app-logout'));
    
    // Navigate to login page
    navigate('/login');
    
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="relative bg-green-800 text-white p-4 shadow-lg rounded-lg font-inter">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <p className="">Admin Panel</p>
          <img
            src={logo}
            alt="Naija Loan Lens Logo"
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
          <h1 className="text-2xl font-extrabold tracking-wide text-blue-300">
            NAIJA LOAN LENS
          </h1>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-8 text-lg font-medium">
          <li className="hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
            <Link 
              to="/applications" 
              className={`${isActive('/applications') ? 'text-blue-400' : 'text-white'}`}
            >
              Applications
            </Link>
          </li>
          
        </ul>

        {/* Desktop Logout Button */}
        <div className="hidden md:block">
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white text-3xl focus:outline-none p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-50 animate-fade-in-down md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="absolute top-6 right-6 text-white text-4xl focus:outline-none p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close mobile menu"
          >
            ✕
          </button>

          <ul className="flex flex-col items-center space-y-6 text-2xl font-bold">
            <li className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
              <Link to="/applications" onClick={toggleMobileMenu}>Applications</Link>
            </li>
            
            <li>
              <button
                onClick={handleLogout}
                className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 w-full"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;