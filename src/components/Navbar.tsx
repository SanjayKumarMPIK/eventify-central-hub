
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-eventify-purple to-eventify-blue bg-clip-text text-transparent">
            Eventify
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/events" className="text-gray-600 hover:text-eventify-purple transition-colors">
            Events
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-gray-600 hover:text-eventify-purple transition-colors">
              Dashboard
            </Link>
          )}
          <Link to="/about" className="text-gray-600 hover:text-eventify-purple transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <div className="hidden md:block text-sm">
                <span className="text-gray-500">Welcome,</span>{' '}
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-eventify-light text-eventify-purple font-medium">
                  {user.role === 'admin' ? 'Admin' : 'Student'}
                </span>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                <User className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
              <Button onClick={() => navigate('/register')} variant="default" size="sm">
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
