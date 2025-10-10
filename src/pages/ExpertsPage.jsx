import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { expertService } from '../services/api';
import './PageStyles.css';

const ExpertsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'ФИО', field: 'fullName' },
    { header: 'Email', field: 'email' },
    { header: 'Организация', field: 'organization' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await expertService.getAll();
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
    if (window.confirm(`Вы уверены, что хотите удалить эксперта "${item.fullName}"?`)) {
      try {
        await expertService.delete(item.id);
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
        await expertService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await expertService.update(selectedItem.id, formData);
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
            <label>ФИО:</label>
            <span>{selectedItem?.fullName}</span>
          </div>
          <div className="view-field">
            <label>Email:</label>
            <span>{selectedItem?.email}</span>
          </div>
          <div className="view-field">
            <label>Организация:</label>
            <span>{selectedItem?.organization}</span>
          </div>
          <div className="view-field">
            <label>Должность:</label>
            <span>{selectedItem?.position}</span>
          </div>
          <div className="view-field">
            <label>Специализация:</label>
            <span>{selectedItem?.specialization}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="fullName">ФИО:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="organization">Организация:</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="position">Должность:</label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="specialization">Специализация:</label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.specialization || ''}
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
        <h2>Эксперты</h2>
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
            ? 'Просмотр эксперта'
            : modalMode === 'edit'
            ? 'Редактирование эксперта'
            : 'Добавление эксперта'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ExpertsPage;
