import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { expertOpinionService, expertService, technologyService } from '../services/api';
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

  const formatPercent = (value) => {
    if (!value || value === 0) return '0%';
    const percent = value * 100;
    return percent.toFixed(2) + '%';
  };

  const columns = [
    { header: 'Эксперт', field: 'expertId', render: (row) => expertsMap[row.expertId] || `ID: ${row.expertId}` },
    { header: 'Индикатор', field: 'competencyAchievementIndicatorId' },
    { header: 'Навык', field: 'workSkillId', render: (row) => skillsMap[row.workSkillId] || `ID: ${row.workSkillId}` },
    { header: 'Важность', field: 'skillImportance', render: (row) => formatPercent(row.skillImportance) },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchExperts();
    await fetchWorkSkills();
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await expertOpinionService.getAll();
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
    setFormData({
      expertId: item.expertId || '',
      competencyAchievementIndicatorId: item.competencyAchievementIndicatorId || '',
      workSkillId: item.workSkillId || '',
      skillImportance: item.skillImportance ? (item.skillImportance * 100).toFixed(2) : '0',
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      expertId: '',
      competencyAchievementIndicatorId: '',
      workSkillId: '',
      skillImportance: '0',
    });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Вы уверены, что хотите удалить это мнение эксперта?')) {
      try {
        await expertOpinionService.delete(item.id);
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
      const payload = {
        expertId: parseInt(formData.expertId),
        competencyAchievementIndicatorId: parseInt(formData.competencyAchievementIndicatorId),
        workSkillId: parseInt(formData.workSkillId),
        skillImportance: parseFloat(formData.skillImportance) / 100,
      };
      
      if (modalMode === 'add') {
        await expertOpinionService.create(payload);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await expertOpinionService.update(selectedItem.id, payload);
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
            <span>{selectedItem?.competencyAchievementIndicatorId}</span>
          </div>
          <div className="view-field">
            <label>Навык:</label>
            <span>{skillsMap[selectedItem?.workSkillId] || `ID: ${selectedItem?.workSkillId}`}</span>
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
          <label htmlFor="competencyAchievementIndicatorId">ID индикатора:</label>
          <input
            type="number"
            id="competencyAchievementIndicatorId"
            name="competencyAchievementIndicatorId"
            value={formData.competencyAchievementIndicatorId || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="workSkillId">Навык:</label>
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
        </div>
        <div className="form-group">
          <label htmlFor="skillImportance">Важность (%):</label>
          <input
            type="number"
            step="0.01"
            id="skillImportance"
            name="skillImportance"
            value={formData.skillImportance || '0'}
            onChange={handleInputChange}
            required
            min="0"
            max="100"
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

      <DataTable
        columns={columns}
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
