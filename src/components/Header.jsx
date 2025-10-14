import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <h1>Academic Support System</h1>
        <p className="subtitle">Система поддержки академических программ</p>
      </Link>
    </header>
  );
};

export default Header;
