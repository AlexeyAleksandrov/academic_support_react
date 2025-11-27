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
        ? (expertOpinions.reduce((sum, eo) => sum + (eo.importance || 0), 0) / expertOpinions.length) * 100 
        : 0;
      
      // Процент прогнозов - упрощенная логика: если есть прогнозы - 100%, если нет - 0%
      // Позже можно усложнить на основе тренда, если такое поле будет доступно
      const foresightPercentage = foresights.length > 0 ? 100 : 0;
      
      console.log('Calculated foresightPercentage:', foresightPercentage);
      
      setDstData({
        rpdCoveragePercentage,
        marketDemand,
        expertOpinionPercentage,
        foresightPercentage,
      });
    } catch (error) {
      console.error('Error fetching DST aggregation:', error);
      alert('Ошибка при загрузке DST-аггрегации: ' + (error.response?.data?.message || error.message));
      setDstModalOpen(false);
    } finally {
      setLoadingDst(false);
    }
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

    return (
      <div className="view-content">
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
