import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { expertOpinionService } from '../services/api';
import './PageStyles.css';

const ExpertOpinionsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Эксперт', field: 'expertName' },
    { header: 'Тема', field: 'topic' },
    { header: 'Оценка', field: 'rating' },
    { header: 'Дата', field: 'date' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

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
      if (modalMode === 'add') {
        await expertOpinionService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await expertOpinionService.update(selectedItem.id, formData);
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
            <label>Эксперт:</label>
            <span>{selectedItem?.expertName}</span>
          </div>
          <div className="view-field">
            <label>Тема:</label>
            <span>{selectedItem?.topic}</span>
          </div>
          <div className="view-field">
            <label>Мнение:</label>
            <span>{selectedItem?.opinion}</span>
          </div>
          <div className="view-field">
            <label>Оценка:</label>
            <span>{selectedItem?.rating}</span>
          </div>
          <div className="view-field">
            <label>Дата:</label>
            <span>{selectedItem?.date}</span>
          </div>
          <div className="view-field">
            <label>Комментарий:</label>
            <span>{selectedItem?.comment}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="expertId">ID эксперта:</label>
          <input
            type="number"
            id="expertId"
            name="expertId"
            value={formData.expertId || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="topic">Тема:</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="opinion">Мнение:</label>
          <textarea
            id="opinion"
            name="opinion"
            value={formData.opinion || ''}
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="rating">Оценка (1-10):</label>
          <input
            type="number"
            id="rating"
            name="rating"
            min="1"
            max="10"
            value={formData.rating || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date">Дата:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Комментарий:</label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment || ''}
            onChange={handleInputChange}
            rows="3"
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
