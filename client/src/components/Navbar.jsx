import React, { useState } from 'react';

const logo = 'https://placehold.co/40x40/000000/FFFFFF?text=Logo';

const Navbar = () => {
  // State to manage the visibility of the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="relative bg-gray-800 text-white p-4 shadow-lg rounded-lg font-inter">
      {/* Main Navbar Container */}
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Naija Loan Lens Logo"
            className="h-10 w-10 rounded-full object-cover shadow-md"
            // Fallback for broken image (optional, but good practice)
            // This onError is now largely redundant as 'logo' is a direct URL,
            // but kept for robustness if 'logo' were to become dynamic.
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/000000/FFFFFF?text=Logo"; }}
          />
          <h1 className="text-2xl font-extrabold tracking-wide text-blue-300">
            NAIJA LOAN LENS
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center space-x-8 text-lg font-medium">
          <li className="cursor-pointer hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
            Apply
          </li>
          <li className="cursor-pointer hover:text-blue-400 transition-colors duration-300 transform hover:scale-105">
            Dashboard
          </li>
        </ul>

        {/* Desktop Logout Button */}
        <div className="hidden md:block">
          <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75">
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle Button (Hamburger Icon) */}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8 z-50 animate-fade-in-down md:hidden">
          {/* Close Button for Mobile Menu */}
          <button
            onClick={toggleMobileMenu}
            className="absolute top-6 right-6 text-white text-4xl focus:outline-none p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
            aria-label="Close mobile menu"
          >
            ✕
          </button>

          {/* Mobile Navigation Links */}
          <ul className="flex flex-col items-center space-y-6 text-2xl font-bold">
            <li
              className="cursor-pointer text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105"
              onClick={toggleMobileMenu}
            >
              Apply
            </li>
            <li
              className="cursor-pointer text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-105"
              onClick={toggleMobileMenu}
            >
              Dashboard
            </li>
            <li>
              <button
                onClick={toggleMobileMenu} // Close menu on logout click
                className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 w-full"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Tailwind Custom Animation (add to your CSS if not using JIT mode) */}
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



// import React from 'react'
// import logo from '../assets/logo.jpeg'
// const Navbar = () => {
//   return (
//     <div>
//       <div className="">
//         <img src={logo} alt="" className="" />
//         <h1 className="">NAIJA LOAN LENS</h1>
//       </div>
//       <div className="">
//         <li className="">
//           <ul className="">Apply</ul>
//           <ul className="">Dashboard</ul>
//         </li>
//       </div>
//       <div className="">
//         <button className=''>Logout</button>
//       </div>
//     </div>
//   )
// }

