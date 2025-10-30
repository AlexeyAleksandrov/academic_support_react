import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
  const sections = [
    {
      title: 'РПД',
      description: 'Управление рабочими программами дисциплин',
      path: '/rpd',
      icon: '📚',
    },
    {
      title: 'Компетенции',
      description: 'Управление компетенциями образовательных программ',
      path: '/competencies',
      icon: '🎓',
    },
    {
      title: 'Индикаторы',
      description: 'Индикаторы достижения компетенций',
      path: '/indicators',
      icon: '📊',
    },
    {
      title: 'Технологии',
      description: 'Рабочие технологии и навыки',
      path: '/technologies',
      icon: '💻',
    },
    {
      title: 'Группы технологий',
      description: 'Категории технологий',
      path: '/tech-groups',
      icon: '🗂️',
    },
    {
      title: 'Ключевые слова',
      description: 'Ключевые слова для связи с технологиями',
      path: '/keywords',
      icon: '🔑',
    },
    {
      title: 'Вакансии',
      description: 'Управление вакансиями рынка труда',
      path: '/vacancies',
      icon: '💼',
    },
    {
      title: 'Head Hunter',
      description: 'Сохраненные поисковые запросы и анализ',
      path: '/saved-searches',
      icon: '🔍',
    },
    {
      title: 'Прогнозы',
      description: 'Прогнозирование и анализ трендов',
      path: '/foresights',
      icon: '🔮',
    },
    {
      title: 'Эксперты',
      description: 'База данных экспертов',
      path: '/experts',
      icon: '👨‍🏫',
    },
    {
      title: 'Мнения экспертов',
      description: 'Экспертные оценки и рекомендации',
      path: '/expert-opinions',
      icon: '💭',
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Добро пожаловать в Academic Support System
        </h1>
        <p className="text-xl text-muted-foreground">
          Комплексная система управления академическими программами и анализа рынка труда
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Link
            key={index}
            to={section.path}
            className="transition-transform hover:scale-105"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{section.icon}</div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Выберите раздел для начала работы
        </p>
      </div>
    </div>
  );
};

export default HomePage;
