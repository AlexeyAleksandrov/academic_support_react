import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const sections = [
    {
      title: 'РПД',
      description: 'Управление рабочими программами дисциплин',
      path: '/rpd',
      icon: '📚',
      color: '#667eea'
    },
    {
      title: 'Компетенции',
      description: 'Управление компетенциями образовательных программ',
      path: '/competencies',
      icon: '🎓',
      color: '#764ba2'
    },
    {
      title: 'Индикаторы',
      description: 'Индикаторы достижения компетенций',
      path: '/indicators',
      icon: '📊',
      color: '#f093fb'
    },
    {
      title: 'Технологии',
      description: 'Рабочие технологии и навыки',
      path: '/technologies',
      icon: '💻',
      color: '#4facfe'
    },
    {
      title: 'Группы технологий',
      description: 'Категории технологий',
      path: '/tech-groups',
      icon: '🗂️',
      color: '#43e97b'
    },
    {
      title: 'Ключевые слова',
      description: 'Ключевые слова для связи с технологиями',
      path: '/keywords',
      icon: '🔑',
      color: '#fa709a'
    },
    {
      title: 'Вакансии',
      description: 'Управление вакансиями рынка труда',
      path: '/vacancies',
      icon: '💼',
      color: '#fee140'
    },
    {
      title: 'Эксперты',
      description: 'База данных экспертов',
      path: '/experts',
      icon: '👨‍🏫',
      color: '#30cfd0'
    },
    {
      title: 'Мнения экспертов',
      description: 'Экспертные оценки и рекомендации',
      path: '/expert-opinions',
      icon: '💭',
      color: '#a8edea'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Добро пожаловать в Academic Support System</h1>
        <p>Комплексная система управления академическими программами и анализа рынка труда</p>
      </div>

      <div className="home-grid">
        {sections.map((section, index) => (
          <Link
            key={index}
            to={section.path}
            className="home-card"
            style={{ '--card-color': section.color }}
          >
            <div className="card-icon">{section.icon}</div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="home-footer">
        <p>Выберите раздел для начала работы</p>
      </div>
    </div>
  );
};

export default HomePage;
