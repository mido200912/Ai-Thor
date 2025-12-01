import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';
import '../pages/landing/LandingPage.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useI18n();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          AiThor
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            Home
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className={`nav-item ${isActive('/login')}`}>
                Login
              </Link>
              <Link to="/register" className={`nav-item ${isActive('/register')}`}>
                Register
              </Link>
              <Link to="/dashboard" className="nav-btn-primary">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="nav-btn-logout">
                Logout
              </button>
            </>
          )}

          <button onClick={toggleTheme} className="nav-theme-toggle" aria-label="Toggle Theme">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Mobile Toggle & Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mobile-actions">
          <div className="navbar-mobile-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" className={`navbar-mobile-item ${isActive('/')}`} onClick={closeMobileMenu}>
          Home
        </Link>

        {!isAuthenticated ? (
          <>
            <Link to="/login" className={`navbar-mobile-item ${isActive('/login')}`} onClick={closeMobileMenu}>
              Login
            </Link>
            <Link to="/register" className={`navbar-mobile-item ${isActive('/register')}`} onClick={closeMobileMenu}>
              Register
            </Link>
            <Link to="/dashboard" className="nav-btn-primary" style={{ textAlign: 'center' }} onClick={closeMobileMenu}>
              Get Started
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`navbar-mobile-item ${isActive('/dashboard')}`} onClick={closeMobileMenu}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="nav-btn-logout" style={{ width: '100%' }}>
              Logout
            </button>
          </>
        )}

        {/* Theme Toggle inside Mobile Menu */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={toggleTheme}
            className="nav-theme-toggle"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {theme === 'dark' ? (
              <> <FaSun style={{ marginRight: '8px' }} /> Light Mode </>
            ) : (
              <> <FaMoon style={{ marginRight: '8px' }} /> Dark Mode </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
