import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { rpdSkillsGroupService, techGroupService, rpdService, dstAggregationSkillsGroupService, expertOpinionSkillsGroupService, foresightSkillsGroupService } from '../services/api';
import './PageStyles.css';

const RpdSkillsGroupsPage = () => {
  const { rpdId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [skillsGroups, setSkillsGroups] = useState([]);
  const [rpdInfo, setRpdInfo] = useState(null);
  const [dstModalOpen, setDstModalOpen] = useState(false);
  const [dstData, setDstData] = useState(null);
  const [loadingDst, setLoadingDst] = useState(false);
  const [dstResults, setDstResults] = useState(null);
  
  // Коэффициенты для DST расчетов
  const [kMarket, setKMarket] = useState(0.8);
  const [kExpert, setKExpert] = useState(0.9);
  const [kForecast, setKForecast] = useState(0.6);
  
  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { 
      header: 'Группа технологий', 
      field: 'skillsGroupId',
      render: (row) => {
        const group = skillsGroups.find(g => g.id === row.skillsGroupId);
        return group ? group.description : `ID: ${row.skillsGroupId}`;
      }
    },
    { 
      header: 'Время (акад. часы)', 
      field: 'time'
    },
  ];

  useEffect(() => {
    if (rpdId) {
      fetchRpdInfo();
      fetchSkillsGroups();
      fetchData();
    }
  }, [rpdId]);

  const fetchRpdInfo = async () => {
    try {
      const response = await rpdService.getById(rpdId);
      setRpdInfo(response.data);
    } catch (error) {
      console.error('Error fetching RPD info:', error);
      // Не блокируем работу страницы, если не удалось загрузить информацию об РПД
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await rpdSkillsGroupService.getByRpdId(rpdId);
      
      // Фильтруем null и undefined элементы и проверяем, что это массив
      const rawData = response.data;
      if (Array.isArray(rawData)) {
        const filteredData = rawData.filter(item => item !== null && item !== undefined);
        setData(filteredData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching RPD skills groups:', error);
      setData([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsGroups = async () => {
    try {
      const response = await techGroupService.getAll();
      setSkillsGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching skills groups:', error);
      setSkillsGroups([]); // Устанавливаем пустой массив в случае ошибки
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      skillsGroupId: item.skillsGroupId || '',
      time: item.time || '',
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      skillsGroupId: '',
      time: '',
    });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    const group = skillsGroups.find(g => g.id === item.skillsGroupId);
    const groupName = group ? group.description : `группу ID ${item.skillsGroupId}`;
    
    if (window.confirm(`Вы уверены, что хотите удалить "${groupName}"?`)) {
      try {
        await rpdSkillsGroupService.delete(item.id);
        alert('Успешно удалено');
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const handleShowDstAggregation = async (item) => {
    try {
      setLoadingDst(true);
      setDstModalOpen(true);
      setDstData(null);
      
      // Получаем данные из разных источников
      const [skillsGroupResponse, expertOpinionsResponse, foresightsResponse] = await Promise.allSettled([
        techGroupService.getById(item.skillsGroupId),
        expertOpinionSkillsGroupService.getBySkillsGroupId(item.skillsGroupId),
        foresightSkillsGroupService.getBySkillsGroupId(item.skillsGroupId)
      ]);
      
      // Обработка результатов
      const skillsGroupData = skillsGroupResponse.status === 'fulfilled' ? skillsGroupResponse.value.data : null;
      const expertOpinions = expertOpinionsResponse.status === 'fulfilled' ? expertOpinionsResponse.value.data : [];
      const foresights = foresightsResponse.status === 'fulfilled' ? foresightsResponse.value.data : [];
      
      // Отладочная информация
      console.log('DST Aggregation Debug:');
      console.log('Skills Group ID:', item.skillsGroupId);
      console.log('Skills Group Data:', skillsGroupData);
      console.log('Expert Opinions:', expertOpinions);
      console.log('Foresights:', foresights);
      console.log('Foresights Response:', foresightsResponse);
      
      // Вычисление процента часов в РПД
      const totalTime = data.reduce((sum, d) => sum + (d.time || 0), 0);
      const rpdCoveragePercentage = totalTime > 0 ? (item.time / totalTime) * 100 : 0;
      
      // Востребованность на рынке (из данных группы)
      const marketDemand = skillsGroupData?.marketDemand ? skillsGroupData.marketDemand * 100 : 0;
      
      // Средняя оценка экспертов
      const expertOpinionPercentage = expertOpinions.length > 0 
        ? (expertOpinions.reduce((sum, eo) => sum + (eo.groupImportance || 0), 0) / expertOpinions.length) * 100 
        : 0;
      
      // Процент прогнозов - упрощенная логика: если есть прогнозы - 100%, если нет - 0%
      // Позже можно усложнить на основе тренда, если такое поле будет доступно
      const foresightPercentage = foresights.length > 0 ? 100 : 0;
      
      console.log('Calculated foresightPercentage:', foresightPercentage);
      
      // Вычисляем DST на основе полученных данных
      // Преобразуем проценты в доли (0-1) для расчетов
      const marketValueFraction = marketDemand / 100;
      const expertValueFraction = expertOpinionPercentage / 100;
      const forecastValueFraction = foresightPercentage / 100;
      
      // Выполняем расчет DST
      const dstResult = calculateFullDST(
        marketValueFraction,
        expertValueFraction,
        forecastValueFraction,
        kMarket,
        kExpert,
        kForecast
      );
      
      console.log('DST Full Result (with intermediate):', dstResult);
      setDstResults(dstResult); // Сохраняем весь объект с промежуточными значениями
      
      const dstDataToSet = {
        rpdCoveragePercentage,
        marketDemand,
        expertOpinionPercentage,
        foresightPercentage,
      };
      
      console.log('DST Data to set:', dstDataToSet);
      
      setDstData(dstDataToSet);
    } catch (error) {
      console.error('Error fetching DST aggregation:', error);
      alert('Ошибка при загрузке DST-аггрегации: ' + (error.response?.data?.message || error.message));
      setDstModalOpen(false);
    } finally {
      setLoadingDst(false);
    }
  };

  // ===== DST РАСЧЕТЫ =====
  
  /**
   * Вычисляет функцию правдоподобия для одного источника данных
   * @param {number} value - значение метрики (0-1, например 0.05 для 5%)
   * @param {number} k - коэффициент уверенности в источнике (0-1)
   * @returns {{mT: number, mU: number, mF: number}} - функция правдоподобия
   */
  const calculateSourceBelief = (value, k) => {
    const mT = k * value;           // Уверенность во включении
    const mU = 1 - k * value;       // Неопределенность
    const mF = 0;                   // Уверенность в исключении (всегда 0 по условию)
    return { mT, mU, mF };
  };

  /**
   * Комбинирует две функции правдоподобия по формуле Демпстера-Шафера
   * @param {{mT: number, mU: number, mF: number}} m1 - первая функция
   * @param {{mT: number, mU: number, mF: number}} m2 - вторая функция
   * @returns {{mT: number, mU: number, mF: number}} - комбинированная функция
   */
  const combineDST = (m1, m2) => {
    // Конфликт (всегда 0, так как mF = 0 для обоих источников)
    const K = m1.mT * m2.mF + m1.mF * m2.mT;
    const normFactor = 1 - K;
    
    // Комбинированные значения
    const mT = (m1.mT * m2.mT + m1.mT * m2.mU + m1.mU * m2.mT) / normFactor;
    const mU = (m1.mU * m2.mU) / normFactor;
    const mF = 0; // По условию всегда 0
    
    return { mT, mU, mF };
  };

  /**
   * Выполняет полный расчет DST для всех трех источников данных
   * @param {number} marketValue - востребованность на рынке (0-1)
   * @param {number} expertValue - оценка экспертов (0-1)
   * @param {number} forecastValue - доля прогнозов (0-1)
   * @param {number} kM - коэффициент для рынка
   * @param {number} kE - коэффициент для экспертов
   * @param {number} kF - коэффициент для прогнозов
   * @returns {{final: {mT, mU, mF}, intermediate: {market, expert, forecast, step12}}} - итоговая и промежуточные функции правдоподобия
   */
  const calculateFullDST = (marketValue, expertValue, forecastValue, kM, kE, kF) => {
    console.log('=== DST CALCULATION START ===');
    console.log('Input values:', { marketValue, expertValue, forecastValue });
    console.log('Coefficients:', { kM, kE, kF });
    
    // Вычисляем функции правдоподобия для каждого источника
    const m_market = calculateSourceBelief(marketValue, kM);
    console.log('m_market (Рынок):', m_market);
    
    const m_expert = calculateSourceBelief(expertValue, kE);
    console.log('m_expert (Эксперты):', m_expert);
    
    const m_forecast = calculateSourceBelief(forecastValue, kF);
    console.log('m_forecast (Прогнозы):', m_forecast);
    
    // Комбинируем последовательно: рынок + эксперты
    const m_12 = combineDST(m_market, m_expert);
    console.log('m_12 (Рынок + Эксперты):', m_12);
    
    // Результат + прогнозы
    const m_final = combineDST(m_12, m_forecast);
    console.log('m_final (Итог):', m_final);
    console.log('=== DST CALCULATION END ===');
    
    return {
      final: m_final,
      intermediate: {
        market: m_market,
        expert: m_expert,
        forecast: m_forecast,
        step12: m_12
      }
    };
  };

  /**
   * Определяет рекомендацию на основе результатов DST-анализа
   * @param {number} mT - Уверенность во включении (0-1)
   * @param {number} mU - Неопределенность (0-1)
   * @param {number} mF - Уверенность в исключении (0-1)
   * @returns {{text: string, level: string, color: string, backgroundColor: string}} - рекомендация с визуальными параметрами
   */
  const getDSTRecommendation = (mT, mU, mF) => {
    // ПРАВИЛО 5: СИЛЬНАЯ РЕКОМЕНДАЦИЯ ИСКЛЮЧИТЬ (проверяем первым как самое критичное)
    if (mF > 0.8 && mT < 0.1 && mU < 0.2) {
      return {
        text: "Исключить из программы",
        level: "danger",
        color: "#721c24",
        backgroundColor: "#f8d7da",
        border: "2px solid #f5c6cb"
      };
    }
    
    // ПРАВИЛО 4: РЕКОМЕНДАЦИЯ УМЕНЬШИТЬ
    if (mF > 0.6 && mT < 0.3) {
      return {
        text: "Сократить часы на 50-70% или перенести в факультатив",
        level: "warning",
        color: "#856404",
        backgroundColor: "#fff3cd",
        border: "2px solid #ffc107"
      };
    }
    
    // ПРАВИЛО 3: КОНФЛИКТ - ТРЕБУЕТСЯ АНАЛИЗ
    if (mU > 0.4 || (mT > 0.4 && mF > 0.4)) {
      return {
        text: "Требуется дополнительный анализ. Рассмотреть как опциональный модуль",
        level: "info",
        color: "#004085",
        backgroundColor: "#d1ecf1",
        border: "2px solid #bee5eb"
      };
    }
    
    // ПРАВИЛО 1: СИЛЬНАЯ РЕКОМЕНДАЦИЯ УВЕЛИЧИТЬ
    if (mT > 0.8 && mF < 0.1) {
      return {
        text: "Значительно увеличить часы (50-100%)",
        level: "success-strong",
        color: "#155724",
        backgroundColor: "#d4edda",
        border: "2px solid #28a745"
      };
    }
    
    // ПРАВИЛО 2: СТАНДАРТНАЯ РЕКОМЕНДАЦИЯ
    if (mT > 0.6 && mF < 0.3) {
      return {
        text: "Сохранить текущее количество часов",
        level: "success",
        color: "#0c5460",
        backgroundColor: "#d1ecf1",
        border: "2px solid #17a2b8"
      };
    }
    
    // Если ни одно правило не сработало - общая рекомендация
    return {
      text: "Результаты неоднозначны. Рекомендуется дополнительная экспертная оценка",
      level: "secondary",
      color: "#383d41",
      backgroundColor: "#e2e3e5",
      border: "2px solid #d6d8db"
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        rpdId: parseInt(rpdId),
        skillsGroupId: parseInt(formData.skillsGroupId),
        time: parseInt(formData.time),
      };

      if (modalMode === 'add') {
        await rpdSkillsGroupService.create(payload);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await rpdSkillsGroupService.update(selectedItem.id, payload);
        alert('Успешно обновлено');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const renderModalContent = () => {
    if (modalMode === 'view') {
      if (!selectedItem) {
        return <div className="no-data">Нет данных для отображения</div>;
      }
      
      const group = skillsGroups.find(g => g.id === selectedItem.skillsGroupId);
      return (
        <div className="view-content">
          <div className="view-field">
            <label>ID:</label>
            <span>{selectedItem.id}</span>
          </div>
          <div className="view-field">
            <label>РПД ID:</label>
            <span>{selectedItem.rpdId}</span>
          </div>
          <div className="view-field">
            <label>Группа технологий:</label>
            <span>{group ? group.description : `ID: ${selectedItem.skillsGroupId}`}</span>
          </div>
          <div className="view-field">
            <label>Время (акад. часы):</label>
            <span>{selectedItem.time}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="skillsGroupId">Группа технологий *</label>
          <select
            id="skillsGroupId"
            name="skillsGroupId"
            value={formData.skillsGroupId}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите группу технологий...</option>
            {skillsGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time">Время (академические часы) *</label>
          <input
            type="number"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="Введите количество часов"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {modalMode === 'add' ? 'Добавить' : 'Сохранить'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModalOpen(false)}
          >
            Отмена
          </button>
        </div>
      </form>
    );
  };

  const renderDstModalContent = () => {
    console.log('Rendering DST Modal with dstData:', dstData);
    
    if (loadingDst) {
      return <div className="loading">Загрузка DST-аггрегации...</div>;
    }

    if (!dstData) {
      return <div className="no-data">Нет данных для отображения</div>;
    }

    const formatDstPercent = (value) => {
      if (value === null || value === undefined) return 'Нет данных';
      return `${(value).toFixed(2)}%`;
    };

    // Обработчик изменения коэффициентов k с пересчетом DST
    const handleKChange = (e) => {
      const { name, value } = e.target;
      const numValue = parseFloat(value);
      
      // Обновляем коэффициент
      if (name === 'kMarket') setKMarket(numValue);
      if (name === 'kExpert') setKExpert(numValue);
      if (name === 'kForecast') setKForecast(numValue);
      
      // Пересчитываем DST с новыми коэффициентами
      const marketValueFraction = dstData.marketDemand / 100;
      const expertValueFraction = dstData.expertOpinionPercentage / 100;
      const forecastValueFraction = dstData.foresightPercentage / 100;
      
      const newKMarket = name === 'kMarket' ? numValue : kMarket;
      const newKExpert = name === 'kExpert' ? numValue : kExpert;
      const newKForecast = name === 'kForecast' ? numValue : kForecast;
      
      const dstResult = calculateFullDST(
        marketValueFraction,
        expertValueFraction,
        forecastValueFraction,
        newKMarket,
        newKExpert,
        newKForecast
      );
      
      setDstResults(dstResult); // Сохраняем весь объект с промежуточными значениями
    };

    return (
      <div className="view-content">
        <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
          Исходные данные
        </h3>
        
        <div className="view-field">
          <label>Процент часов в РПД:</label>
          <span>{formatDstPercent(dstData.rpdCoveragePercentage)}</span>
        </div>
        <div className="view-field">
          <label>Востребованность на рынке:</label>
          <span>{formatDstPercent(dstData.marketDemand)}</span>
        </div>
        <div className="view-field">
          <label>Оценка востребованности экспертами:</label>
          <span>{formatDstPercent(dstData.expertOpinionPercentage)}</span>
        </div>
        <div className="view-field">
          <label>Доля прогнозов:</label>
          <span>{formatDstPercent(dstData.foresightPercentage)}</span>
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '10px' }}>
          Коэффициенты уверенности в источниках (k)
        </h3>
        
        <div className="form-group">
          <label htmlFor="kMarket">k_рынок (надежность данных рынка):</label>
          <input
            type="number"
            id="kMarket"
            name="kMarket"
            value={kMarket}
            onChange={handleKChange}
            step="0.1"
            min="0"
            max="1"
            style={{ width: '100px' }}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>
            (текущее: {kMarket})
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="kExpert">k_эксперт (надежность мнений экспертов):</label>
          <input
            type="number"
            id="kExpert"
            name="kExpert"
            value={kExpert}
            onChange={handleKChange}
            step="0.1"
            min="0"
            max="1"
            style={{ width: '100px' }}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>
            (текущее: {kExpert})
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="kForecast">k_прогноз (надежность прогнозов):</label>
          <input
            type="number"
            id="kForecast"
            name="kForecast"
            value={kForecast}
            onChange={handleKChange}
            step="0.1"
            min="0"
            max="1"
            style={{ width: '100px' }}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>
            (текущее: {kForecast})
          </span>
        </div>

        {dstResults && (
          <>
            <h3 style={{ marginTop: '20px', marginBottom: '15px', borderBottom: '2px solid #dc3545', paddingBottom: '10px' }}>
              Результаты DST-анализа (Теория Демпстера-Шафера)
            </h3>
            
            <div className="view-field" style={{ 
              backgroundColor: '#d4edda', 
              padding: '15px', 
              borderRadius: '5px',
              border: '2px solid #28a745',
              marginBottom: '10px'
            }}>
              <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#155724' }}>
                ✓ Уверенность во включении:
              </label>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {(dstResults.final.mT * 100).toFixed(2)}%
              </span>
            </div>
            
            <div className="view-field" style={{ 
              backgroundColor: '#fff3cd', 
              padding: '10px', 
              borderRadius: '5px',
              border: '1px solid #ffc107'
            }}>
              <label style={{ color: '#856404' }}>Неопределенность:</label>
              <span style={{ fontWeight: 'bold', color: '#856404' }}>
                {(dstResults.final.mU * 100).toFixed(2)}%
              </span>
            </div>
            
            <div className="view-field">
              <label>Уверенность в исключении:</label>
              <span>{(dstResults.final.mF * 100).toFixed(2)}%</span>
            </div>
            
            {/* Детали расчета - промежуточные значения */}
            <details style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: 'bold',
                color: '#495057',
                padding: '5px'
              }}>
                📊 Детали расчета (промежуточные значения m_)
              </summary>
              
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                <h4 style={{ color: '#007bff', marginTop: '10px' }}>Шаг 1: Функции правдоподобия для каждого источника</h4>
                
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <strong>m_рынок (Востребованность на рынке):</strong>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>m(T) = {dstResults.intermediate.market.mT.toFixed(4)} ({(dstResults.intermediate.market.mT * 100).toFixed(2)}%)</li>
                    <li>m(U) = {dstResults.intermediate.market.mU.toFixed(4)} ({(dstResults.intermediate.market.mU * 100).toFixed(2)}%)</li>
                    <li>m(F) = {dstResults.intermediate.market.mF.toFixed(4)} ({(dstResults.intermediate.market.mF * 100).toFixed(2)}%)</li>
                  </ul>
                </div>
                
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <strong>m_эксперт (Оценка экспертов):</strong>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>m(T) = {dstResults.intermediate.expert.mT.toFixed(4)} ({(dstResults.intermediate.expert.mT * 100).toFixed(2)}%)</li>
                    <li>m(U) = {dstResults.intermediate.expert.mU.toFixed(4)} ({(dstResults.intermediate.expert.mU * 100).toFixed(2)}%)</li>
                    <li>m(F) = {dstResults.intermediate.expert.mF.toFixed(4)} ({(dstResults.intermediate.expert.mF * 100).toFixed(2)}%)</li>
                  </ul>
                </div>
                
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <strong>m_прогноз (Доля прогнозов):</strong>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>m(T) = {dstResults.intermediate.forecast.mT.toFixed(4)} ({(dstResults.intermediate.forecast.mT * 100).toFixed(2)}%)</li>
                    <li>m(U) = {dstResults.intermediate.forecast.mU.toFixed(4)} ({(dstResults.intermediate.forecast.mU * 100).toFixed(2)}%)</li>
                    <li>m(F) = {dstResults.intermediate.forecast.mF.toFixed(4)} ({(dstResults.intermediate.forecast.mF * 100).toFixed(2)}%)</li>
                  </ul>
                </div>
                
                <h4 style={{ color: '#007bff', marginTop: '15px' }}>Шаг 2: Комбинирование m_рынок + m_эксперт = m₁₂</h4>
                
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <strong>m₁₂ (Рынок + Эксперты):</strong>
                  <ul style={{ marginLeft: '20px' }}>
                    <li>m(T) = {dstResults.intermediate.step12.mT.toFixed(4)} ({(dstResults.intermediate.step12.mT * 100).toFixed(2)}%)</li>
                    <li>m(U) = {dstResults.intermediate.step12.mU.toFixed(4)} ({(dstResults.intermediate.step12.mU * 100).toFixed(2)}%)</li>
                    <li>m(F) = {dstResults.intermediate.step12.mF.toFixed(4)} ({(dstResults.intermediate.step12.mF * 100).toFixed(2)}%)</li>
                  </ul>
                </div>
                
                <h4 style={{ color: '#007bff', marginTop: '15px' }}>Шаг 3: Комбинирование m₁₂ + m_прогноз = m_итог</h4>
                
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                  <strong>m_итог (Финальный результат):</strong>
                  <ul style={{ marginLeft: '20px' }}>
                    <li><strong style={{ color: '#28a745' }}>m(T) = {dstResults.final.mT.toFixed(4)} ({(dstResults.final.mT * 100).toFixed(2)}%)</strong> ← Уверенность во включении</li>
                    <li>m(U) = {dstResults.final.mU.toFixed(4)} ({(dstResults.final.mU * 100).toFixed(2)}%) ← Неопределенность</li>
                    <li>m(F) = {dstResults.final.mF.toFixed(4)} ({(dstResults.final.mF * 100).toFixed(2)}%) ← Уверенность в исключении</li>
                  </ul>
                </div>
              </div>
            </details>
            
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '14px',
              color: '#666'
            }}>
              <strong>Интерпретация:</strong> На основе анализа данных рынка, экспертных оценок и прогнозов, 
              уверенность в необходимости включения этой технологии в программу составляет{' '}
              <strong style={{ color: '#28a745' }}>{(dstResults.final.mT * 100).toFixed(2)}%</strong>.
            </div>
            
            {/* Рекомендация на основе триггеров */}
            {(() => {
              const recommendation = getDSTRecommendation(dstResults.final.mT, dstResults.final.mU, dstResults.final.mF);
              return (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: recommendation.backgroundColor,
                  border: recommendation.border,
                  borderRadius: '5px',
                  fontSize: '16px',
                  color: recommendation.color
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px' }}>
                      {recommendation.level === 'success-strong' && '🎯'}
                      {recommendation.level === 'success' && '✅'}
                      {recommendation.level === 'info' && '⚠️'}
                      {recommendation.level === 'warning' && '⬇️'}
                      {recommendation.level === 'danger' && '❌'}
                      {recommendation.level === 'secondary' && '❓'}
                    </span>
                    <strong style={{ fontSize: '18px' }}>Автоматическая рекомендация</strong>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>
                    {recommendation.text}
                  </div>
                  <div style={{ 
                    marginTop: '10px', 
                    fontSize: '13px', 
                    fontStyle: 'italic',
                    opacity: 0.8
                  }}>
                    Рекомендация основана на правилах принятия решений DST-методологии
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/rpd')}
          >
            ← Назад к РПД
          </button>
          <button className="btn btn-add" onClick={handleAdd}>
            + Добавить
          </button>
        </div>
        <h2>
          Управление группами технологий РПД
          {rpdInfo && ` - ${rpdInfo.disciplineName} (${rpdInfo.year})`}
        </h2>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        customActions={[
          {
            icon: '📈',
            title: 'DST-аггрегация',
            onClick: handleShowDstAggregation,
            className: 'dst-aggregation-btn'
          }
        ]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'view'
            ? 'Просмотр группы технологий РПД'
            : modalMode === 'edit'
            ? 'Редактирование группы технологий РПД'
            : 'Добавление группы технологий РПД'
        }
      >
        {renderModalContent()}
      </Modal>

      <Modal
        isOpen={dstModalOpen}
        onClose={() => setDstModalOpen(false)}
        title="DST-аггрегация группы технологий"
      >
        {renderDstModalContent()}
      </Modal>
    </div>
  );
};

export default RpdSkillsGroupsPage;
