import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './HeaderLogin.css';

const HeaderLogin = () => {
  return (
    <header className="headerLogin-container">
      <nav className="navbar-container">
        <div className="logo-container">
          <Link to="/" className="brand-logo">
            Competition
          </Link>
        </div>
        <div className="auth-links">
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'auth-link active-link' : 'auth-link')}
          >
            Sign in
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? 'auth-link active-link' : 'auth-link')}
          >
            Register
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default HeaderLogin;
