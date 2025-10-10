import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { indicatorService, competencyService } from '../services/api';
import './PageStyles.css';

const IndicatorsPage = () => {
  const [data, setData] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const columns = [
    { header: 'ID', field: 'id' },
    { header: 'Номер', field: 'number' },
    { header: 'Описание', field: 'description', render: (row) => row.description?.substring(0, 60) || '' },
    { header: 'Компетенция', field: 'competencyNumber' },
  ];

  useEffect(() => {
    fetchCompetencies();
  }, []);

  useEffect(() => {
    if (selectedCompetency) {
      fetchData();
    }
  }, [selectedCompetency]);

  const fetchCompetencies = async () => {
    try {
      const response = await competencyService.getAll();
      setCompetencies(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedCompetency(response.data[0].number);
      }
    } catch (error) {
      console.error('Error fetching competencies:', error);
      alert('Ошибка при загрузке компетенций');
    }
  };

  const fetchData = async () => {
    if (!selectedCompetency) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await indicatorService.getByCompetency(selectedCompetency);
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
    setFormData({ competencyNumber: selectedCompetency });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить индикатор "${item.number}"?`)) {
      try {
        await indicatorService.delete(item.competencyNumber, item.number);
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
        await indicatorService.create(formData.competencyNumber || selectedCompetency, formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await indicatorService.update(selectedItem.competencyNumber, selectedItem.number, formData);
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
            <label>Описание:</label>
            <span>{selectedItem?.description}</span>
          </div>
          <div className="view-field">
            <label>Знать:</label>
            <span>{selectedItem?.indicatorKnow}</span>
          </div>
          <div className="view-field">
            <label>Уметь:</label>
            <span>{selectedItem?.indicatorAble}</span>
          </div>
          <div className="view-field">
            <label>Владеть:</label>
            <span>{selectedItem?.indicatorPossess}</span>
          </div>
          <div className="view-field">
            <label>Номер компетенции:</label>
            <span>{selectedItem?.competencyNumber}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="competencyNumber">Номер компетенции:</label>
          <input
            type="text"
            id="competencyNumber"
            name="competencyNumber"
            value={formData.competencyNumber || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="number">Номер индикатора:</label>
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
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="indicatorKnow">Знать:</label>
          <textarea
            id="indicatorKnow"
            name="indicatorKnow"
            value={formData.indicatorKnow || ''}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="indicatorAble">Уметь:</label>
          <textarea
            id="indicatorAble"
            name="indicatorAble"
            value={formData.indicatorAble || ''}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <label htmlFor="indicatorPossess">Владеть:</label>
          <textarea
            id="indicatorPossess"
            name="indicatorPossess"
            value={formData.indicatorPossess || ''}
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
        <h1>Индикаторы достижения компетенций</h1>
        <div className="header-controls">
          <div className="competency-filter">
            <label htmlFor="competency-select">Компетенция: </label>
            <select 
              id="competency-select"
              value={selectedCompetency} 
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="competency-select"
            >
              <option value="">Выберите компетенцию</option>
              {competencies.map(comp => (
                <option key={comp.id} value={comp.number}>
                  {comp.number} - {comp.name}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} className="add-button">Добавить</button>
        </div>
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
            ? 'Просмотр индикатора'
            : modalMode === 'edit'
            ? 'Редактирование индикатора'
            : 'Добавление индикатора'
        }
        size="large"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default IndicatorsPage;
