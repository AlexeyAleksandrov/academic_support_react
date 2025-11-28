import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { expertOpinionService, expertOpinionSkillsGroupService, expertService, technologyService, techGroupService, indicatorService } from '../services/api';
import './PageStyles.css';

const ExpertOpinionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [experts, setExperts] = useState([]);
  const [workSkills, setWorkSkills] = useState([]);
  const [expertsMap, setExpertsMap] = useState({});
  const [skillsMap, setSkillsMap] = useState({});
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' или 'groups'
  const [skillsGroups, setSkillsGroups] = useState([]);
  const [skillsGroupsMap, setSkillsGroupsMap] = useState({});
  const [indicators, setIndicators] = useState([]);
  const [indicatorsMap, setIndicatorsMap] = useState({});

  const formatPercent = (value) => {
    if (!value || value === 0) return '0%';
    const percent = value * 100;
    return percent.toFixed(2) + '%';
  };

  const getColumns = () => [
    { header: 'Эксперт', field: 'expertId', render: (row) => expertsMap[row.expertId] || `ID: ${row.expertId}` },
    { header: 'Индикатор', field: 'competencyAchievementIndicatorId', render: (row) => indicatorsMap[row.competencyAchievementIndicatorId]?.number || `ID: ${row.competencyAchievementIndicatorId}` },
    { 
      header: activeTab === 'skills' ? 'Навык' : 'Группа технологий', 
      field: activeTab === 'skills' ? 'workSkillId' : 'skillsGroupId',
      render: (row) => activeTab === 'skills' 
        ? (skillsMap[row.workSkillId] || `ID: ${row.workSkillId}`)
        : (skillsGroupsMap[row.skillsGroupId] || `ID: ${row.skillsGroupId}`)
    },
    { header: 'Важность', field: 'skillImportance', render: (row) => formatPercent(row.skillImportance) },
  ];

  useEffect(() => {
    // Очищаем данные и показываем индикатор загрузки сразу при переключении вкладок
    setData([]);
    setLoading(true);
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = async () => {
    await fetchExperts();
    await fetchWorkSkills();
    await fetchSkillsGroups();
    await fetchIndicators();
    await fetchData();
  };

  const fetchExperts = async () => {
    try {
      const response = await expertService.getAll();
      const exp = response.data || [];
      setExperts(exp);
      const map = {};
      exp.forEach(e => {
        map[e.id] = e.name;
      });
      setExpertsMap(map);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const fetchWorkSkills = async () => {
    try {
      const response = await technologyService.getAll();
      const skills = response.data || [];
      setWorkSkills(skills);
      const map = {};
      skills.forEach(s => {
        map[s.id] = s.description;
      });
      setSkillsMap(map);
    } catch (error) {
      console.error('Error fetching work skills:', error);
    }
  };

  const fetchSkillsGroups = async () => {
    try {
      const response = await techGroupService.getAll();
      const groups = response.data || [];
      setSkillsGroups(groups);
      const map = {};
      groups.forEach(g => {
        map[g.id] = g.description;
      });
      setSkillsGroupsMap(map);
    } catch (error) {
      console.error('Error fetching skills groups:', error);
    }
  };

  const fetchIndicators = async () => {
    try {
      const response = await indicatorService.getAll();
      const inds = response.data || [];
      setIndicators(inds);
      const map = {};
      inds.forEach(ind => {
        map[ind.id] = ind;
      });
      setIndicatorsMap(map);
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const service = activeTab === 'skills' ? expertOpinionService : expertOpinionSkillsGroupService;
      const response = await service.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (activeTab === 'skills') {
      setFormData({
        expertId: item.expertId || '',
        competencyAchievementIndicatorId: item.competencyAchievementIndicatorId || '',
        workSkillId: item.workSkillId || '',
        skillImportance: item.skillImportance ? (item.skillImportance * 100).toFixed(2) : '',
      });
    } else {
      setFormData({
        expertId: item.expertId || '',
        competencyAchievementIndicatorId: item.competencyAchievementIndicatorId || '',
        skillsGroupId: item.skillsGroupId || '',
        skillImportance: item.skillImportance ? (item.skillImportance * 100).toFixed(2) : '',
      });
    }
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    if (activeTab === 'skills') {
      setFormData({
        expertId: '',
        competencyAchievementIndicatorId: '',
        workSkillId: '',
        skillImportance: '',
      });
    } else {
      setFormData({
        expertId: '',
        competencyAchievementIndicatorId: '',
        skillsGroupId: '',
        skillImportance: '',
      });
    }
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Вы уверены, что хотите удалить это мнение эксперта?')) {
      try {
        const service = activeTab === 'skills' ? expertOpinionService : expertOpinionSkillsGroupService;
        await service.delete(item.id);
        alert('Успешно удалено');
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const service = activeTab === 'skills' ? expertOpinionService : expertOpinionSkillsGroupService;
      
      console.log('Form Data before submit:', formData);
      
      // Преобразуем важность из процентов в десятичное число (0-1)
      const importanceValue = formData.skillImportance && formData.skillImportance !== '' 
        ? parseFloat(formData.skillImportance) / 100 
        : 0;
      
      console.log('Importance value calculated:', importanceValue, 'from input:', formData.skillImportance);
      
      let payload;
      
      if (activeTab === 'skills') {
        payload = {
          expertId: parseInt(formData.expertId),
          competencyAchievementIndicatorId: parseInt(formData.competencyAchievementIndicatorId),
          workSkillId: parseInt(formData.workSkillId),
          skillImportance: importanceValue,
        };
      } else {
        payload = {
          expertId: parseInt(formData.expertId),
          competencyAchievementIndicatorId: parseInt(formData.competencyAchievementIndicatorId),
          skillsGroupId: parseInt(formData.skillsGroupId),
          skillImportance: importanceValue,
        };
      }
      
      console.log('Payload to send:', payload);
      
      if (modalMode === 'add') {
        const response = await service.create(payload);
        console.log('Create response:', response.data);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        const response = await service.update(selectedItem.id, payload);
        console.log('Update response:', response.data);
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
      return (
        <div className="view-content">
          <div className="view-field">
            <label>ID:</label>
            <span>{selectedItem?.id}</span>
          </div>
          <div className="view-field">
            <label>Эксперт:</label>
            <span>{expertsMap[selectedItem?.expertId] || `ID: ${selectedItem?.expertId}`}</span>
          </div>
          <div className="view-field">
            <label>Индикатор:</label>
            <span>{indicatorsMap[selectedItem?.competencyAchievementIndicatorId]?.number}</span>
          </div>
          <div className="view-field">
            <label>{activeTab === 'skills' ? 'Навык:' : 'Группа технологий:'}</label>
            <span>
              {activeTab === 'skills'
                ? (skillsMap[selectedItem?.workSkillId] || `ID: ${selectedItem?.workSkillId}`)
                : (skillsGroupsMap[selectedItem?.skillsGroupId] || `ID: ${selectedItem?.skillsGroupId}`)}
            </span>
          </div>
          <div className="view-field">
            <label>Важность:</label>
            <span>{formatPercent(selectedItem?.skillImportance)}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="expertId">Эксперт:</label>
          <select
            id="expertId"
            name="expertId"
            value={formData.expertId || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите эксперта</option>
            {experts.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="competencyAchievementIndicatorId">Индикатор компетенции:</label>
          <select
            id="competencyAchievementIndicatorId"
            name="competencyAchievementIndicatorId"
            value={formData.competencyAchievementIndicatorId || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите индикатор</option>
            {indicators.map(ind => (
              <option key={ind.id} value={ind.id}>
                {ind.number}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={activeTab === 'skills' ? 'workSkillId' : 'skillsGroupId'}>
            {activeTab === 'skills' ? 'Навык:' : 'Группа технологий:'}
          </label>
          {activeTab === 'skills' ? (
            <select
              id="workSkillId"
              name="workSkillId"
              value={formData.workSkillId || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите навык</option>
              {workSkills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.description}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="skillsGroupId"
              name="skillsGroupId"
              value={formData.skillsGroupId || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите группу технологий</option>
              {skillsGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.description}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="skillImportance">Важность (%):</label>
          <input
            type="number"
            step="0.01"
            id="skillImportance"
            name="skillImportance"
            value={formData.skillImportance || ''}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
            placeholder="Введите важность от 0 до 100"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {modalMode === 'add' ? 'Добавить' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
            Отмена
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Мнения экспертов</h2>
        <button className="btn btn-add" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            border: '1px solid #ddd',
            backgroundColor: activeTab === 'skills' ? '#007bff' : '#fff',
            color: activeTab === 'skills' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: '5px',
            fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
          }}
        >
          Мнения по навыкам
        </button>
        <button 
          className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            backgroundColor: activeTab === 'groups' ? '#007bff' : '#fff',
            color: activeTab === 'groups' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: '5px',
            fontWeight: activeTab === 'groups' ? 'bold' : 'normal',
          }}
        >
          Мнения по группам технологий
        </button>
      </div>

      <DataTable
        columns={getColumns()}
        data={data}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalMode === 'view'
            ? 'Просмотр мнения эксперта'
            : modalMode === 'edit'
            ? 'Редактирование мнения эксперта'
            : 'Добавление мнения эксперта'
        }
        size="large"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ExpertOpinionsPage;
