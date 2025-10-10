import React, { useState } from 'react';
import './PageStyles.css';

const KeywordsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Ключевые слова</h2>
      </div>
      
      <div className="info-message" style={{
        padding: '20px',
        backgroundColor: '#f0f8ff',
        border: '1px solid #4a90e2',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, color: '#4a90e2' }}>ℹ️ Информация</h3>
        <p style={{ lineHeight: '1.6', margin: '10px 0' }}>
          <strong>Ключевые слова</strong> не имеют отдельных CRUD операций в текущей версии API.
        </p>
        <p style={{ lineHeight: '1.6', margin: '10px 0' }}>
          Ключевые слова управляются через следующие эндпоинты:
        </p>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Создание ключевых слов для индикатора компетенции:</strong><br/>
            <code style={{ backgroundColor: '#e8e8e8', padding: '2px 6px', borderRadius: '4px' }}>
              POST /api/competencies/&#123;competencyNumber&#125;/indicators/&#123;number&#125;/keywords
            </code>
          </li>
          <li style={{ marginTop: '10px' }}>
            <strong>Генерация ключевых слов для компетенции:</strong><br/>
            <code style={{ backgroundColor: '#e8e8e8', padding: '2px 6px', borderRadius: '4px' }}>
              POST /api/competencies/&#123;id&#125;/keywords/generate
            </code>
          </li>
        </ul>
        <p style={{ lineHeight: '1.6', margin: '15px 0 0 0', fontStyle: 'italic', color: '#666' }}>
          Для работы с ключевыми словами используйте страницы <strong>Компетенции</strong> или <strong>Индикаторы</strong>.
        </p>
      </div>
    </div>
  );
};

export default KeywordsPage;
