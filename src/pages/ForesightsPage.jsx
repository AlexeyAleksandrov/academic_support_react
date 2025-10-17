import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { foresightService, technologyService } from '../services/api';
import './PageStyles.css';

const ForesightsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [allWorkSkills, setAllWorkSkills] = useState([]);

  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { header: 'Источник', field: 'sourceName' },
    { header: 'URL источника', field: 'sourceUrl', render: (row) => row.sourceUrl?.substring(0, 50) || '' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await foresightService.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkSkills = async () => {
    try {
      const response = await technologyService.getAll();
      setAllWorkSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching work skills:', error);
      alert('Ошибка при загрузке навыков');
    }
  };

  const getWorkSkillName = (workSkillId) => {
    const skill = allWorkSkills.find(s => s.id === workSkillId);
    return skill ? skill.name : `ID: ${workSkillId}`;
  };

  const handleView = async (item) => {
    try {
      await fetchAllWorkSkills();
      const response = await foresightService.getById(item.id);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading foresight details:', error);
      alert('Ошибка при загрузке данных прогноза');
    }
  };

  const handleEdit = async (item) => {
    setSelectedItem(item);
    setFormData({
      workSkillId: item.workSkillId || '',
      sourceName: item.sourceName || '',
      sourceUrl: item.sourceUrl || '',
    });
    await fetchAllWorkSkills();
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = async () => {
    setSelectedItem(null);
    setFormData({});
    await fetchAllWorkSkills();
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить прогноз из "${item.sourceName}"?`)) {
      try {
        await foresightService.delete(item.id);
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
      const submitData = {
        workSkillId: parseInt(formData.workSkillId),
        sourceName: formData.sourceName,
        sourceUrl: formData.sourceUrl,
      };

      if (modalMode === 'add') {
        await foresightService.create(submitData);
        alert('Прогноз успешно создан');
      } else if (modalMode === 'edit') {
        await foresightService.update(selectedItem.id, submitData);
        alert('Прогноз успешно обновлён');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Ошибка при сохранении данных');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderModalContent = () => {
    if (modalMode === 'view' && selectedItem) {
      return (
        <div className="view-content">
          <div className="view-field">
            <strong>ID:</strong>
            <span>{selectedItem.id}</span>
          </div>
          <div className="view-field">
            <strong>Навык:</strong>
            <span>{getWorkSkillName(selectedItem.workSkillId)}</span>
          </div>
          <div className="view-field">
            <strong>Источник:</strong>
            <span>{selectedItem.sourceName}</span>
          </div>
          <div className="view-field">
            <strong>URL источника:</strong>
            <span>{selectedItem.sourceUrl}</span>
          </div>
        </div>
      );
    }

    if (modalMode === 'add' || modalMode === 'edit') {
      return (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="workSkillId">
              Навык: <span className="required">*</span>
            </label>
            <select
              id="workSkillId"
              name="workSkillId"
              value={formData.workSkillId || ''}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите навык</option>
              {allWorkSkills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sourceName">
              Источник: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="sourceName"
              name="sourceName"
              value={formData.sourceName || ''}
              onChange={handleInputChange}
              required
              placeholder="Введите название источника"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sourceUrl">
              URL источника:
            </label>
            <input
              type="url"
              id="sourceUrl"
              name="sourceUrl"
              value={formData.sourceUrl || ''}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {modalMode === 'add' ? 'Создать' : 'Сохранить'}
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
    }
  };

  const getModalTitle = () => {
    switch(modalMode) {
      case 'view': return 'Просмотр прогноза';
      case 'edit': return 'Редактирование прогноза';
      case 'add': return 'Добавление прогноза';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Прогнозы востребованности технологий</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
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
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ForesightsPage;
