import { User, Truck, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ELD Trip Planner</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`inline-flex items-center px-4 py-2 rounded-md ${
                    location.pathname === '/profile'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center px-4 py-2 rounded-md ${
                  location.pathname === '/login'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <LogIn className="h-5 w-5 mr-2" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};