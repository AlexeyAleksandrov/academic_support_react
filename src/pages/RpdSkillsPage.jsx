import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { rpdSkillService, technologyService, rpdService } from '../services/api';
import './PageStyles.css';

const RpdSkillsPage = () => {
  const { rpdId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [workSkills, setWorkSkills] = useState([]);
  const [rpdInfo, setRpdInfo] = useState(null);

  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { 
      header: 'Навык', 
      field: 'workSkillId',
      render: (row) => {
        const skill = workSkills.find(s => s.id === row.workSkillId);
        return skill ? skill.description : `ID: ${row.workSkillId}`;
      }
    },
    { 
      header: 'Время (акад. часы)', 
      field: 'time'
    },
  ];

  useEffect(() => {
    if (rpdId) {
      fetchRpdInfo();
      fetchWorkSkills();
      fetchData();
    }
  }, [rpdId]);

  const fetchRpdInfo = async () => {
    try {
      const response = await rpdService.getById(rpdId);
      setRpdInfo(response.data);
    } catch (error) {
      console.error('Error fetching RPD info:', error);
      // Не блокируем работу страницы, если не удалось загрузить информацию об РПД
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await rpdSkillService.getByRpdId(rpdId);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching RPD skills:', error);
      setData([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkSkills = async () => {
    try {
      const response = await technologyService.getAll();
      setWorkSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching work skills:', error);
      setWorkSkills([]); // Устанавливаем пустой массив в случае ошибки
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      workSkillId: item.workSkillId || '',
      time: item.time || '',
    });
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      workSkillId: '',
      time: '',
    });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    const skill = workSkills.find(s => s.id === item.workSkillId);
    const skillName = skill ? skill.description : `навык ID ${item.workSkillId}`;
    
    if (window.confirm(`Вы уверены, что хотите удалить "${skillName}"?`)) {
      try {
        await rpdSkillService.delete(item.id);
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
      const payload = {
        rpdId: parseInt(rpdId),
        workSkillId: parseInt(formData.workSkillId),
        time: parseInt(formData.time),
      };

      if (modalMode === 'add') {
        await rpdSkillService.create(payload);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await rpdSkillService.update(selectedItem.id, payload);
        alert('Успешно обновлено');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const renderModalContent = () => {
    if (modalMode === 'view') {
      const skill = workSkills.find(s => s.id === selectedItem.workSkillId);
      return (
        <div className="view-content">
          <div className="view-field">
            <label>ID:</label>
            <span>{selectedItem.id}</span>
          </div>
          <div className="view-field">
            <label>РПД ID:</label>
            <span>{selectedItem.rpdId}</span>
          </div>
          <div className="view-field">
            <label>Навык:</label>
            <span>{skill ? skill.description : `ID: ${selectedItem.workSkillId}`}</span>
          </div>
          <div className="view-field">
            <label>Время (акад. часы):</label>
            <span>{selectedItem.time}</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="workSkillId">Навык *</label>
          <select
            id="workSkillId"
            name="workSkillId"
            value={formData.workSkillId}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите навык...</option>
            {workSkills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time">Время (академические часы) *</label>
          <input
            type="number"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            min="1"
            placeholder="Введите количество часов"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {modalMode === 'add' ? 'Добавить' : 'Сохранить'}
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
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/rpd')}
            style={{ marginRight: '10px' }}
          >
            ← Назад к РПД
          </button>
          <h2>
            Управление навыками РПД
            {rpdInfo && ` - ${rpdInfo.disciplineName} (${rpdInfo.year})`}
          </h2>
        </div>
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
            ? 'Просмотр навыка РПД'
            : modalMode === 'edit'
            ? 'Редактирование навыка РПД'
            : 'Добавление навыка РПД'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default RpdSkillsPage;
