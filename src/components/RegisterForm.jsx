import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const result = await register(
      formData.firstName,
      formData.lastName,
      formData.middleName,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Ошибка регистрации. Попробуйте снова.');
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="lastName">Фамилия *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Иванов"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="firstName">Имя *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Иван"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="middleName">Отчество</label>
          <input
            type="text"
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Иванович"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Минимум 6 символов"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторите пароль"
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

        <div className="form-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
