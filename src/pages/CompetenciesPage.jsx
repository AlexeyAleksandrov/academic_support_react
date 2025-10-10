import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { competencyService } from '../services/api';
import './PageStyles.css';

const CompetenciesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Номер', field: 'number' },
    { header: 'Название', field: 'name' },
    { header: 'Описание', field: 'description', render: (row) => row.description?.substring(0, 80) || '' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await competencyService.getAll();
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
    if (window.confirm(`Вы уверены, что хотите удалить компетенцию "${item.name}"?`)) {
      try {
        await competencyService.delete(item.id);
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
        await competencyService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await competencyService.update(selectedItem.id, formData);
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
            <label>Номер:</label>
            <span>{selectedItem?.number}</span>
          </div>
          <div className="view-field">
            <label>Название:</label>
            <span>{selectedItem?.name}</span>
          </div>
          <div className="view-field">
            <label>Описание:</label>
            <span>{selectedItem?.description}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="number">Номер:</label>
          <input
            type="text"
            id="number"
            name="number"
            value={formData.number || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Название:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows="5"
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
        <h2>Компетенции</h2>
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
            ? 'Просмотр компетенции'
            : modalMode === 'edit'
            ? 'Редактирование компетенции'
            : 'Добавление компетенции'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default CompetenciesPage;
