import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { savedSearchService } from '../services/api';

const SavedSearchesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { header: 'Поисковый запрос', field: 'searchQuery' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await savedSearchService.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (item) => {
    try {
      const response = await savedSearchService.getById(item.id);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading saved search details:', error);
      alert('Ошибка при загрузке данных запроса');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      searchQuery: item.searchQuery || '',
    });
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
    if (window.confirm(`Вы уверены, что хотите удалить запрос "${item.searchQuery}"?`)) {
      try {
        await savedSearchService.delete(item.id);
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
        await savedSearchService.create(formData);
        alert('Запрос успешно создан');
      } else if (modalMode === 'edit') {
        await savedSearchService.update(selectedItem.id, formData);
        alert('Запрос успешно обновлён');
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
            <strong>Поисковый запрос:</strong>
            <span>{selectedItem.searchQuery}</span>
          </div>
        </div>
      );
    }

    if (modalMode === 'add' || modalMode === 'edit') {
      return (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="searchQuery">
              Поисковый запрос: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="searchQuery"
              name="searchQuery"
              value={formData.searchQuery || ''}
              onChange={handleInputChange}
              required
              placeholder="Введите поисковый запрос"
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
      case 'view': return 'Просмотр запроса';
      case 'edit': return 'Редактирование запроса';
      case 'add': return 'Добавление запроса';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Head Hunter - Сохранённые запросы</h1>
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

export default SavedSearchesPage;
