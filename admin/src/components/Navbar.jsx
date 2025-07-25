// import React, { useState } from 'react';
// import logo from '../assets/logo.jpeg';
// import { Link, useLocation, useNavigate } from 'react-router-dom';

// const Navbar = ({ setIsLoggedIn }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handleLogout = () => {
//     // Clear all auth-related data
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('user_id');
//     localStorage.removeItem('user_name');
    
//     // Update parent component state
//     if (setIsLoggedIn) {
//       setIsLoggedIn(false);
//     }
    
//     // Trigger event for other components
//     window.dispatchEvent(new Event('app-logout'));
    
//     // Navigate to login page
//     navigate('/login');
    
//     // Close mobile menu if open
//     setIsMobileMenuOpen(false);
//   };

//   const isActive = (path) => location.pathname === path;

//   return (
//     <nav className="relative bg-green-800 text-white p-4 shadow-lg rounded-lg font-inter">
//       <div className="container mx-auto flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <p className="">Admin Panel</p>
//           <img
//             src={logo}
//             alt="Naija Loan Lens Logo"
//             className="h-10 w-10 rounded-full object-cover shadow-md"
//           />
//           <h1 className="text-2xl font-extrabold tracking-wide text-blue-300">
//             NAIJA LOAN LENS
//           </h1>
//         </div>

//         {/* Desktop Navigation */}
//         <ul className="hidden md:flex items-center space-x-8 text-lg font-medium">
//           <li className="hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
//             <Link 
//               to="/applications" 
//               className={`${isActive('/applications') ? 'text-blue-400' : 'text-white'}`}
//             >
//               Applications
//             </Link>
//           </li>
          
//         </ul>

//         {/* Desktop Logout Button */}
//         <div className="hidden md:block">
//           <button 
//             onClick={handleLogout}
//             className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
//           >
//             Logout
//           </button>
//         </div>

//         {/* Mobile Menu Toggle */}
//         <div className="md:hidden">
//           <button
//             onClick={toggleMobileMenu}
//             className="text-white text-3xl focus:outline-none p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
//             aria-label="Toggle mobile menu"
//           >
//             {isMobileMenuOpen ? '✕' : '☰'}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-50 animate-fade-in-down md:hidden">
//           <button
//             onClick={toggleMobileMenu}
//             className="absolute top-6 right-6 text-white text-4xl focus:outline-none p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
//             aria-label="Close mobile menu"
//           >
//             ✕
//           </button>

//           <ul className="flex flex-col items-center space-y-6 text-2xl font-bold">
//             <li className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
//               <Link to="/applications" onClick={toggleMobileMenu}>Applications</Link>
//             </li>
            
//             <li>
//               <button
//                 onClick={handleLogout}
//                 className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 w-full"
//               >
//                 Logout
//               </button>
//             </li>
//           </ul>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeInDown {
//           from {
//             opacity: 0;
//             transform: translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fade-in-down {
//           animation: fadeInDown 0.3s ease-out forwards;
//         }
//       `}</style>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import logo from '../assets/logo.jpeg';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ setIsLoggedIn, isLoggedIn }) => { // Accept isLoggedIn prop
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApplicationsDropdownOpen, setIsApplicationsDropdownOpen] = useState(false); // New state for dropdown
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef(null); // Ref for detecting clicks outside

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close dropdown if mobile menu opens
    if (!isMobileMenuOpen) setIsApplicationsDropdownOpen(false);
  };

  const toggleApplicationsDropdown = () => {
    setIsApplicationsDropdownOpen(!isApplicationsDropdownOpen);
    // Close mobile menu if dropdown opens
    if (!isApplicationsDropdownOpen) setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    
    // Update parent component state
    if (setIsLoggedIn) {
      setIsLoggedIn(true);
    }
    
    // Trigger event for other components
    window.dispatchEvent(new Event('app-logout'));
    
    // Navigate to login page
    navigate('/login'); // Changed to /login as per your App.js logic
    
    // Close all menus
    setIsMobileMenuOpen(false);
    setIsApplicationsDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsApplicationsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]); // Dependency array includes dropdownRef

  // Function to close dropdown after clicking a link inside it
  const handleDropdownLinkClick = () => {
    setIsApplicationsDropdownOpen(false);
    setIsMobileMenuOpen(false); // Also close mobile menu if it's open and a link is clicked
  };


  return (
    <nav className="relative bg-green-800 text-white p-4 shadow-lg rounded-lg font-inter">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <p className="text-xl font-bold text-gray-200">Admin Panel</p> 
          
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
          {isLoggedIn ? (
            <>
              {/* Applications Dropdown */}
              <li className="relative" ref={dropdownRef}> {/* Add relative and ref here */}
                <button
                  onClick={toggleApplicationsDropdown}
                  className={`
                    flex items-center hover:text-blue-400 transition-colors duration-300 transform hover:scale-105
                    ${isActive('/applications') || isActive('/applications/pending') || isActive('/applications/approved') ? 'text-blue-400' : 'text-white'}
                    focus:outline-none
                  `}
                >
                  Applications
                  <svg className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${isApplicationsDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isApplicationsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in-down">
                    {/* <Link
                      to="/applications/all"
                      onClick={handleDropdownLinkClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      All
                    </Link> */}
                    <Link
                      to="/applications"
                      onClick={handleDropdownLinkClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      Pending
                    </Link>
                    <Link
                      to="/applications/approved"
                      onClick={handleDropdownLinkClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      Approved
                    </Link>
                    {/* You can add a "Rejected" link here too if needed */}
                    {/* <Link
                      to="/applications/rejected"
                      onClick={handleDropdownLinkClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      Rejected
                    </Link> */}
                  </div>
                )}
              </li>
              {/* Other logged-in links can go here if any */}
            </>
          ) : (
            <>
              <li className="hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
                <Link 
                  to="/login" 
                  className={`${isActive('/login') ? 'text-blue-400' : 'text-white'}`}
                >
                  Login
                </Link>
              </li>
              <li className="hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
                <Link 
                  to="/signup" 
                  className={`${isActive('/signup') ? 'text-blue-400' : 'text-white'}`}
                >
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Desktop Auth Button */}
        <div className="hidden md:block">
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Login
            </Link>
          )}
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
            {isLoggedIn ? (
              <>
                {/* Mobile Applications Dropdown */}
                <li className="relative w-full text-center">
                  <button
                    onClick={toggleApplicationsDropdown}
                    className={`
                      text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105
                      focus:outline-none text-2xl font-bold
                    `}
                  >
                    Applications
                    <svg className={`ml-2 h-6 w-6 inline-block transform transition-transform duration-200 ${isApplicationsDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  {isApplicationsDropdownOpen && (
                    <div className="mt-4 bg-gray-700 rounded-md shadow-lg py-2 z-20 animate-fade-in-down w-4/5 mx-auto">
                      <Link
                        to="/applications/all"
                        onClick={handleDropdownLinkClick}
                        className="block px-4 py-3 text-xl text-white hover:bg-gray-600 hover:text-blue-400"
                      >
                        All
                      </Link>
                      <Link
                        to="/applications/pending"
                        onClick={handleDropdownLinkClick}
                        className="block px-4 py-3 text-xl text-white hover:bg-gray-600 hover:text-blue-400"
                      >
                        Pending
                      </Link>
                      <Link
                        to="/applications/approved"
                        onClick={handleDropdownLinkClick}
                        className="block px-4 py-3 text-xl text-white hover:bg-gray-600 hover:text-blue-400"
                      >
                        Approved
                      </Link>
                      <Link
                        to="/applications/rejected"
                        onClick={handleDropdownLinkClick}
                        className="block px-4 py-3 text-xl text-white hover:bg-gray-600 hover:text-blue-400"
                      >
                        Rejected
                      </Link>
                    </div>
                  )}
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 w-full"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
                  <Link to="/login" onClick={handleDropdownLinkClick}>Login</Link>
                </li>
                <li className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
                  <Link to="/signup" onClick={handleDropdownLinkClick}>Signup</Link>
                </li>
              </>
            )}
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
