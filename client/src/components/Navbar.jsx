import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, LogOut, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Calendar className="brand-icon" />
          <span>EventHub</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            Events
          </Link>

          {user ? (
            <>
              <Link to="/create-event" className="nav-link" onClick={() => setIsOpen(false)}>
                <Plus size={18} />
                Create Event
              </Link>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                <User size={18} />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

