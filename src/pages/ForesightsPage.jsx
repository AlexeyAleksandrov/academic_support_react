import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { foresightService, foresightSkillsGroupService, technologyService, techGroupService } from '../services/api';
import './PageStyles.css';

const ForesightsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [allWorkSkills, setAllWorkSkills] = useState([]);
  const [allSkillsGroups, setAllSkillsGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' или 'groups'

  const getColumns = () => [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { header: 'Источник', field: 'sourceName' },
    { 
      header: activeTab === 'skills' ? 'Навык' : 'Группа технологий', 
      field: activeTab === 'skills' ? 'workSkillId' : 'skillsGroupId',
      render: (row) => activeTab === 'skills' 
        ? getWorkSkillName(row.workSkillId) 
        : getSkillsGroupName(row.skillsGroupId)
    },
  ];

  useEffect(() => {
    // Очищаем данные и показываем индикатор загрузки сразу при переключении вкладок
    setData([]);
    setLoading(true);
    fetchAllWorkSkills();
    fetchAllSkillsGroups();
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const response = activeTab === 'skills' 
        ? await foresightService.getAll() 
        : await foresightSkillsGroupService.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkSkills = async () => {
    try {
      const response = await technologyService.getAll();
      setAllWorkSkills(response.data || []);
    } catch (error) {
      console.error('Error fetching work skills:', error);
      alert('Ошибка при загрузке навыков');
    }
  };

  const fetchAllSkillsGroups = async () => {
    try {
      const response = await techGroupService.getAll();
      setAllSkillsGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching skills groups:', error);
      alert('Ошибка при загрузке групп технологий');
    }
  };

  const getWorkSkillName = (workSkillId) => {
    const skill = allWorkSkills.find(s => s.id === workSkillId);
    return skill ? skill.description : `ID: ${workSkillId}`;
  };

  const getSkillsGroupName = (skillsGroupId) => {
    const group = allSkillsGroups.find(g => g.id === skillsGroupId);
    return group ? group.description : `ID: ${skillsGroupId}`;
  };

  const handleView = async (item) => {
    try {
      await fetchAllWorkSkills();
      await fetchAllSkillsGroups();
      const service = activeTab === 'skills' ? foresightService : foresightSkillsGroupService;
      const response = await service.getById(item.id);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading foresight details:', error);
      alert('Ошибка при загрузке данных прогноза');
    }
  };

  const handleEdit = async (item) => {
    setSelectedItem(item);
    if (activeTab === 'skills') {
      setFormData({
        workSkillId: item.workSkillId || '',
        sourceName: item.sourceName || '',
        sourceUrl: item.sourceUrl || '',
      });
    } else {
      setFormData({
        skillsGroupId: item.skillsGroupId || '',
        sourceName: item.sourceName || '',
        sourceUrl: item.sourceUrl || '',
      });
    }
    await fetchAllWorkSkills();
    await fetchAllSkillsGroups();
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = async () => {
    setSelectedItem(null);
    setFormData({});
    await fetchAllWorkSkills();
    await fetchAllSkillsGroups();
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить прогноз из "${item.sourceName}"?`)) {
      try {
        const service = activeTab === 'skills' ? foresightService : foresightSkillsGroupService;
        await service.delete(item.id);
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
      const service = activeTab === 'skills' ? foresightService : foresightSkillsGroupService;
      let submitData;
      
      if (activeTab === 'skills') {
        submitData = {
          workSkillId: parseInt(formData.workSkillId),
          sourceName: formData.sourceName,
          sourceUrl: formData.sourceUrl,
        };
      } else {
        submitData = {
          skillsGroupId: parseInt(formData.skillsGroupId),
          sourceName: formData.sourceName,
          sourceUrl: formData.sourceUrl,
        };
      }

      if (modalMode === 'add') {
        await service.create(submitData);
        alert('Прогноз успешно создан');
      } else if (modalMode === 'edit') {
        await service.update(selectedItem.id, submitData);
        alert('Прогноз успешно обновлён');
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
            <strong>{activeTab === 'skills' ? 'Навык:' : 'Группа технологий:'}</strong>
            <span>
              {activeTab === 'skills' 
                ? getWorkSkillName(selectedItem.workSkillId) 
                : getSkillsGroupName(selectedItem.skillsGroupId)}
            </span>
          </div>
          <div className="view-field">
            <strong>Источник:</strong>
            <span>{selectedItem.sourceName}</span>
          </div>
          <div className="view-field">
            <strong>URL источника:</strong>
            <span>
              {selectedItem.sourceUrl ? (
                <a href={selectedItem.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {selectedItem.sourceUrl}
                </a>
              ) : (
                'Не указан'
              )}
            </span>
          </div>
        </div>
      );
    }

    if (modalMode === 'add' || modalMode === 'edit') {
      return (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor={activeTab === 'skills' ? 'workSkillId' : 'skillsGroupId'}>
              {activeTab === 'skills' ? 'Навык:' : 'Группа технологий:'} <span className="required">*</span>
            </label>
            {activeTab === 'skills' ? (
              <select
                id="workSkillId"
                name="workSkillId"
                value={formData.workSkillId || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите навык</option>
                {allWorkSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.description}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="skillsGroupId"
                name="skillsGroupId"
                value={formData.skillsGroupId || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите группу технологий</option>
                {allSkillsGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="sourceName">
              Источник: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="sourceName"
              name="sourceName"
              value={formData.sourceName || ''}
              onChange={handleInputChange}
              required
              placeholder="Введите название источника"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sourceUrl">
              URL источника:
            </label>
            <input
              type="url"
              id="sourceUrl"
              name="sourceUrl"
              value={formData.sourceUrl || ''}
              onChange={handleInputChange}
              placeholder="https://..."
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
      case 'view': return 'Просмотр прогноза';
      case 'edit': return 'Редактирование прогноза';
      case 'add': return 'Добавление прогноза';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Прогнозы востребованности технологий</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            border: '1px solid #ddd',
            backgroundColor: activeTab === 'skills' ? '#007bff' : '#fff',
            color: activeTab === 'skills' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: '5px',
            fontWeight: activeTab === 'skills' ? 'bold' : 'normal',
          }}
        >
          Прогнозы навыков
        </button>
        <button 
          className={`tab-button ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            backgroundColor: activeTab === 'groups' ? '#007bff' : '#fff',
            color: activeTab === 'groups' ? '#fff' : '#333',
            cursor: 'pointer',
            borderRadius: '5px',
            fontWeight: activeTab === 'groups' ? 'bold' : 'normal',
          }}
        >
          Прогнозы групп технологий
        </button>
      </div>

      <DataTable
        columns={getColumns()}
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

export default ForesightsPage;
