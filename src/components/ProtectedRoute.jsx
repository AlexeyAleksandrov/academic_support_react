import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    // Перенаправляем на страницу входа, если пользователь не авторизован
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
