import React from 'react';
import { Link } from 'react-router-dom';
import './Pagenotfound.css';

const Pagenotfound = () => {
  return (
    <div className="pagenotfound-container">
      <h1 className="pagenotfound-title">404</h1>
      <h2 className="pagenotfound-subtitle">Page Not Found</h2>
      <p className="pagenotfound-text">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="pagenotfound-home-button">Go Back Home</Link>
    </div>
  );
};

export default Pagenotfound;
