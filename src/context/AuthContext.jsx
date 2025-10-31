import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // При загрузке приложения проверяем наличие токена
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      // Можно добавить запрос для получения информации о пользователе
    }

    // Отслеживаем изменения в localStorage (работает между вкладками)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (e.newValue === null) {
          // Токен был удален - выполняем выход
          setToken(null);
          setUser(null);
        } else {
          // Токен был обновлен
          setToken(e.newValue);
        }
      }
    };

    // Периодически проверяем наличие токена в localStorage
    // (на случай если токен был удален interceptor'ом в текущей вкладке)
    const checkTokenInterval = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken !== token) {
        if (currentToken === null) {
          setToken(null);
          setUser(null);
        } else {
          setToken(currentToken);
        }
      }
    }, 1000); // Проверяем каждую секунду

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkTokenInterval);
    };
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const authToken = response.data.token;

      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser({ email });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка входа';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, middleName, email, password) => {
    setLoading(true);
    try {
      const response = await authService.register(firstName, lastName, middleName, email, password);
      const authToken = response.data.token;

      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser({ email, firstName, lastName, middleName });
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка регистрации';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
