import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { technologyService } from '../services/api';
import './PageStyles.css';

const TechnologiesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Описание', field: 'description' },
    { header: 'Востребованность', field: 'marketDemand', render: (row) => row.marketDemand?.toFixed(2) || '0' },
    { header: 'Группа', field: 'skillsGroupId', render: (row) => row.skillsGroupBySkillsGroupId?.description || '-' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await technologyService.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchToKeywords = async () => {
    if (window.confirm('Соотнести технологии с ключевыми словами?')) {
      try {
        await technologyService.matchToKeywords();
        alert('Успешно соотнесено');
        fetchData();
      } catch (error) {
        console.error('Error matching to keywords:', error);
        alert('Ошибка при соотнесении');
      }
    }
  };

  const handleCalculateDemand = async () => {
    if (window.confirm('Рассчитать востребованность технологий?')) {
      try {
        await technologyService.updateMarketDemand();
        alert('Успешно рассчитано');
        fetchData();
      } catch (error) {
        console.error('Error calculating demand:', error);
        alert('Ошибка при расчёте');
      }
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({});
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить технологию "${item.description}"?`)) {
      try {
        await technologyService.delete(item.id);
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
      if (modalMode === 'add') {
        await technologyService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await technologyService.update(selectedItem.id, formData);
        alert('Успешно обновлено');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Ошибка при сохранении');
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
            <label>Описание:</label>
            <span>{selectedItem?.description}</span>
          </div>
          <div className="view-field">
            <label>Востребованность:</label>
            <span>{selectedItem?.marketDemand?.toFixed(2) || '0'}</span>
          </div>
          <div className="view-field">
            <label>Группа технологий:</label>
            <span>{selectedItem?.skillsGroupBySkillsGroupId?.description || '-'}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="marketDemand">Востребованность:</label>
          <input
            type="number"
            step="0.01"
            id="marketDemand"
            name="marketDemand"
            value={formData.marketDemand || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="skillsGroupId">ID группы технологий:</label>
          <input
            type="number"
            id="skillsGroupId"
            name="skillsGroupId"
            value={formData.skillsGroupId || ''}
            onChange={handleInputChange}
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
        <h2>Технологии</h2>
        <button className="btn btn-add" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="action-buttons">
        <button className="btn btn-action" onClick={handleMatchToKeywords}>
          🔗 Соотнести с ключевыми словами
        </button>
        <button className="btn btn-action" onClick={handleCalculateDemand}>
          📊 Рассчитать востребованность
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
            ? 'Просмотр технологии'
            : modalMode === 'edit'
            ? 'Редактирование технологии'
            : 'Добавление технологии'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default TechnologiesPage;
