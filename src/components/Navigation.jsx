import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const navItems = [
    { path: '/rpd', label: 'РПД' },
    { path: '/competencies', label: 'Компетенции' },
    { path: '/indicators', label: 'Индикаторы' },
    { path: '/technologies', label: 'Технологии' },
    { path: '/tech-groups', label: 'Группы технологий' },
    { path: '/keywords', label: 'Ключевые слова' },
    { path: '/vacancies', label: 'Вакансии' },
    { path: '/experts', label: 'Эксперты' },
    { path: '/expert-opinions', label: 'Мнения экспертов' },
  ];

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
