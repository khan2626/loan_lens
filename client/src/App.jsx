// import React, { useState, useEffect } from "react";
// import Navbar from "./components/Navbar";
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate for redirects
// import Apply from "./components/Apply";
// import Dashboard from "./components/Dashboard";
// import Signup from "./components/Signup";
// import Login from "./components/Login";

// function App() {
//   // State to track if the user is logged in
//   // Initialize from localStorage to handle page refreshes
//   const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

//   // Effect to listen for changes in localStorage (e.g., from login/logout actions)
//   useEffect((e) => {
    
//     const handleStorageChange = () => {
//       // Update isLoggedIn state based on the presence of 'access_token' in localStorage
//       setIsLoggedIn(!!localStorage.getItem('access_token'));
//     };

//     // Add event listener for 'storage' event to react to changes in other tabs/windows
//     window.addEventListener('storage', handleStorageChange);

//     // Clean up the event listener when the component unmounts
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []); // Empty dependency array means this effect runs once on mount

//   // A simple ProtectedRoute component to guard routes
//   const ProtectedRoute = ({ children }) => {
//     if (!isLoggedIn) {
//       // If not logged in, redirect them to the login page
//       return <Navigate to="/login" replace />;
//     }
//     return children; // If logged in, render the child components
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* BrowserRouter wraps all routing components and hooks */}
//       <BrowserRouter>
//         {/* Navbar is rendered conditionally based on login status */}
//         {isLoggedIn && <Navbar />}
        
//         <div className="p-4"> {/* Add some padding around the main content area */}
//           <Routes>
//             {/* Public Routes: Accessible without being logged in */}
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/login" element={<Login />} />

//             {/* Default/Root Route:
//                 - If logged in, redirect to dashboard.
//                 - If not logged in, show the Login page.
//                 This ensures either login or dashboard is the first view.
//             */}
//             <Route 
//               path="/" 
//               element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} 
//             />

//             {/* Protected Routes: Only accessible if isLoggedIn is true */}
//             <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
//             <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

//             {/* Catch-all route for any undefined paths */}
//             <Route path="*" element={<h2 className="text-3xl text-center mt-10 text-red-500">Page Not Found</h2>} />
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;






import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Apply from "./components/Apply";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";

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
              element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />} 
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
    </div>
  );
}

export default App;