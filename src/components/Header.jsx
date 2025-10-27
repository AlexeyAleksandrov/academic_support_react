import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <h1>Academic Support System</h1>
        <p className="subtitle">Система поддержки академических программ</p>
      </Link>
      <div className="auth-section">
        {isAuthenticated() ? (
          <div className="user-info">
            {user?.email && <span className="user-email">{user.email}</span>}
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login">
              <button className="login-button">Вход</button>
            </Link>
            <Link to="/register">
              <button className="register-button">Регистрация</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
