import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Navbar({ session }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-green-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-white font-bold text-xl space-x-2"
            >
              <img src="/logo3.svg" alt="Logo" className="h-20 w-auto" />
              <span>AIROGEN</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link to="/" className="text-white hover:text-green-200">
                  Dashboard
                </Link>
                <Link
                  to="/calculator"
                  className="text-white hover:text-green-200"
                >
                  Calculator
                </Link>
                <Link to="/map" className="text-white hover:text-green-200">
                  Activity Map
                </Link>
                <Link
                  to="/activities"
                  className="text-white hover:text-green-200"
                >
                  Reduction Activities
                </Link>
                <Link to="/Bot" className="text-white hover:text-green-200">
                  Chat Bot
                </Link>
                <Link to="/profile" className="text-white hover:text-green-200">
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white hover:bg-gray-100 text-green-600 font-bold py-2 px-4 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-600 pb-4 px-4">
          {session ? (
            <>
              <Link
                to="/"
                className="block text-white hover:text-green-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/calculator"
                className="block text-white hover:text-green-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Calculator
              </Link>
              <Link
                to="/map"
                className="block text-white hover:text-green-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Activity Map
              </Link>
              <Link
                to="/activities"
                className="block text-white hover:text-green-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Reduction Activities
              </Link>
              <Link
                to="/profile"
                className="block text-white hover:text-green-200 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded mt-2 w-full"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded my-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block bg-white hover:bg-gray-100 text-green-600 font-bold py-2 px-4 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
