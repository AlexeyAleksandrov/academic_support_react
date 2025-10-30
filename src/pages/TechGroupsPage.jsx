import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { techGroupService } from '../services/api';

const TechGroupsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [groupWorkSkills, setGroupWorkSkills] = useState([]);

  const formatPercent = (value) => {
    if (!value || value === 0) return '0%';
    const percent = value * 100;
    if (percent < 0.1) return '<0.1%';
    return percent.toFixed(2) + '%';
  };

  const columns = [
    {
      accessorKey: 'rowNumber',
      header: '№',
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'description',
      header: 'Описание',
    },
    {
      accessorKey: 'marketDemand',
      header: 'Востребованность',
      cell: ({ row }) => formatPercent(row.original.marketDemand),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await techGroupService.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchToTechnologies = async () => {
    if (window.confirm('Соотнести группы с технологиями?')) {
      try {
        await techGroupService.matchToTechnologies();
        alert('Успешно соотнесено');
        fetchData();
      } catch (error) {
        console.error('Error matching to technologies:', error);
        alert('Ошибка при соотнесении');
      }
    }
  };

  const handleCalculateDemand = async () => {
    if (window.confirm('Рассчитать востребованность групп технологий?')) {
      try {
        await techGroupService.updateMarketDemand();
        alert('Успешно рассчитано');
        fetchData();
      } catch (error) {
        console.error('Error calculating demand:', error);
        alert('Ошибка при расчёте');
      }
    }
  };

  const handleView = async (item) => {
    setSelectedItem(item);
    
    // Загрузить технологии для этой группы
    try {
      const response = await techGroupService.getWorkSkills(item.id);
      setGroupWorkSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching work skills:', error);
      setGroupWorkSkills([]);
    }
    
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
    if (window.confirm(`Вы уверены, что хотите удалить группу "${item.description}"?`)) {
      try {
        await techGroupService.delete(item.id);
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
        await techGroupService.create(formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await techGroupService.update(selectedItem.id, formData);
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
            <span>{formatPercent(selectedItem?.marketDemand)}</span>
          </div>
          <div className="view-field" style={{ display: 'block', marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Технологии в этой группе:</label>
            {groupWorkSkills.length > 0 ? (
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {groupWorkSkills.map(skill => (
                  <li key={skill.id} style={{ marginBottom: '8px' }}>
                    {skill.description}
                  </li>
                ))}
              </ul>
            ) : (
              <span>Нет технологий</span>
            )}
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
            value={formData.marketDemand !== undefined && formData.marketDemand !== null ? formData.marketDemand : '0'}
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
        <h2>Группы технологий</h2>
        <button className="btn btn-add" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="action-buttons">
        <button className="btn btn-action" onClick={handleMatchToTechnologies}>
          🔗 Соотнести с технологиями
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
            ? 'Просмотр группы технологий'
            : modalMode === 'edit'
            ? 'Редактирование группы технологий'
            : 'Добавление группы технологий'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default TechGroupsPage;
