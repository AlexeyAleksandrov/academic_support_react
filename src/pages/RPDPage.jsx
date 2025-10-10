import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { rpdService } from '../services/api';
import './PageStyles.css';

const RPDPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Название', field: 'name' },
    { header: 'Описание', field: 'description', render: (row) => row.description?.substring(0, 100) || '' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await rpdService.getAll();
      
      // Логирование для отладки
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // Обработка разных форматов ответа
      let dataArray = [];
      
      if (Array.isArray(response.data)) {
        // Если data уже массив
        dataArray = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Если data - объект, попробуем найти массив внутри
        // Проверяем популярные поля
        if (Array.isArray(response.data.items)) {
          dataArray = response.data.items;
        } else if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data.content)) {
          dataArray = response.data.content;
        } else if (Array.isArray(response.data.results)) {
          dataArray = response.data.results;
        } else {
          // Если это объект без массива, оборачиваем в массив
          console.warn('Response is object, not array. Wrapping in array:', response.data);
          dataArray = [response.data];
        }
      } else {
        console.warn('Unexpected response format:', response.data);
        dataArray = [];
      }
      
      console.log('Processed data array:', dataArray);
      setData(dataArray);
    } catch (error) {
      console.error('Error fetching RPD data:', error);
      console.error('Error details:', error.response?.data);
      alert('Ошибка при загрузке данных: ' + error.message);
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
    if (window.confirm(`Вы уверены, что хотите удалить "${item.name}"?`)) {
      try {
        await rpdService.delete(item.id);
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
        await rpdService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await rpdService.update(selectedItem.id, formData);
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
        <h2>РПД (Рабочие Программы Дисциплин)</h2>
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
            ? 'Просмотр РПД'
            : modalMode === 'edit'
            ? 'Редактирование РПД'
            : 'Добавление РПД'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default RPDPage;
