import React from 'react';
import { Link } from 'react-router-dom';
import { Home, DollarSign, BarChart, ShieldCheck, Lightbulb } from 'lucide-react'; 

// Main Home Page Component
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800">
      {/* Hero Section */}
      <header className="relative py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Simple SVG background pattern for visual interest */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 L 0 10" fill="none" stroke="#cbd5e1" strokeWidth="0.1"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-800 leading-tight mb-6 animate-fade-in-down">
            Naija Loan Lens: Smart Lending, Clear Decisions
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto animate-fade-in-up">
            Revolutionizing loan applications and risk assessment with intelligent insights and transparency.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200">
            <Link
              to="/apply"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              <DollarSign className="mr-3 h-6 w-6" /> Apply for a Loan
            </Link>
            <Link
              to="/applications"
              className="inline-flex items-center justify-center px-8 py-4 border border-blue-600 text-base font-medium rounded-full shadow-lg text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              <BarChart className="mr-3 h-6 w-6" /> View My Applications
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white shadow-inner-lg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose Loan Lens?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-blue-50 p-8 rounded-xl shadow-md border border-blue-200 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <DollarSign className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Seamless Application</h3>
              <p className="text-gray-700">
                Apply for loans quickly and effortlessly with our intuitive, user-friendly forms.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-green-50 p-8 rounded-xl shadow-md border border-green-200 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <ShieldCheck className="h-16 w-16 text-green-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Intelligent Risk Assessment</h3>
              <p className="text-gray-700">
                Leverage advanced machine learning to get accurate and fair loan risk evaluations.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-purple-50 p-8 rounded-xl shadow-md border border-purple-200 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-6">
                <Lightbulb className="h-16 w-16 text-purple-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Transparent & Explainable AI</h3>
              <p className="text-gray-700">
                Understand exactly why a decision was made with clear feature importance breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">1</div>
              <h3 className="text-xl font-semibold mb-2">Apply Online</h3>
              <p className="text-gray-700">Fill out our secure and easy loan application form.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">2</div>
              <h3 className="text-xl font-semibold mb-2">Instant Assessment</h3>
              <p className="text-gray-700">Our AI model evaluates your application in real-time.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">3</div>
              <h3 className="text-xl font-semibold mb-2">Transparent Feedback</h3>
              <p className="text-gray-700">Get a clear recommendation and understand the key factors.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">4</div>
              <h3 className="text-xl font-semibold mb-2">Track & Manage</h3>
              <p className="text-gray-700">Monitor your application status through your personalized dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Smarter Lending?</h2>
          <p className="text-xl mb-10">
            Join thousands of users who are simplifying their loan journey with Loan Lens.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-lg font-medium rounded-full shadow-xl text-indigo-600 bg-white hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8 text-center text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} Loan Lens. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors duration-200">Terms of Service</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
