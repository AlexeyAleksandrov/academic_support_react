import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { vacancyService } from '../services/api';
import './PageStyles.css';

const VacanciesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    // +3 часа для московского времени
    date.setHours(date.getHours() + 3);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { header: 'Название', field: 'name' },
    { header: 'Дата публикации', field: 'publishedAt', render: (row) => formatDate(row.publishedAt) },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await vacancyService.getAll();
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
      // Получить полную информацию о вакансии с навыками по hhId
      const response = await vacancyService.getByHhId(item.hhId);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading vacancy details:', error);
      alert('Ошибка при загрузке данных вакансии');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // Преобразовать timestamp в формат datetime-local
    let publishedAtFormatted = '';
    if (item.publishedAt) {
      const date = new Date(item.publishedAt);
      publishedAtFormatted = date.toISOString().slice(0, 16);
    }
    setFormData({
      ...item,
      publishedAt: publishedAtFormatted,
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
    if (window.confirm(`Вы уверены, что хотите удалить вакансию "${item.name}"?`)) {
      try {
        await vacancyService.delete(item.id);
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
        await vacancyService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await vacancyService.update(selectedItem.id, formData);
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
            <label>Дата публикации:</label>
            <span>{formatDate(selectedItem?.publishedAt)}</span>
          </div>
          <div className="view-field" style={{ display: 'block' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Описание:</label>
            <span>{stripHtml(selectedItem?.description)}</span>
          </div>
          <div className="view-field" style={{ display: 'block', marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Навыки:</label>
            {selectedItem?.skills && selectedItem.skills.length > 0 ? (
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {selectedItem.skills.map((skill, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {skill.description || skill}
                  </li>
                ))}
              </ul>
            ) : (
              <span>Нет</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="name">Название вакансии:</label>
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
          <label htmlFor="publishedAt">Дата и время публикации:</label>
          <input
            type="datetime-local"
            id="publishedAt"
            name="publishedAt"
            value={formData.publishedAt || ''}
            onChange={handleInputChange}
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
        <h2>Вакансии</h2>
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
            ? 'Просмотр вакансии'
            : modalMode === 'edit'
            ? 'Редактирование вакансии'
            : 'Добавление вакансии'
        }
        size="large"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default VacanciesPage;
