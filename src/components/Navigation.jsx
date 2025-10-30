import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/rpd', label: 'РПД' },
    { path: '/competencies', label: 'Компетенции' },
    { path: '/indicators', label: 'Индикаторы' },
    { path: '/technologies', label: 'Технологии' },
    { path: '/tech-groups', label: 'Группы технологий' },
    { path: '/keywords', label: 'Ключевые слова' },
    { path: '/vacancies', label: 'Вакансии' },
    { path: '/saved-searches', label: 'Head Hunter' },
    { path: '/foresights', label: 'Прогнозы' },
    { path: '/experts', label: 'Эксперты' },
    { path: '/expert-opinions', label: 'Мнения экспертов' },
  ];

  return (
    <nav className="bg-muted/30 border-b">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap gap-1 py-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `inline-block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
