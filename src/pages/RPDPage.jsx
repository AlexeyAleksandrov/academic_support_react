import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { rpdService, competencyService, indicatorService } from '../services/api';

const RPDPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [competencies, setCompetencies] = useState([]);
  const [indicatorsByCompetency, setIndicatorsByCompetency] = useState({});
  const [selectedIndicators, setSelectedIndicators] = useState({});

  const columns = [
    {
      accessorKey: 'rowNumber',
      header: '№',
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'disciplineName',
      header: 'Название',
    },
    {
      accessorKey: 'year',
      header: 'Год',
    },
  ];

  useEffect(() => {
    fetchData();
    fetchCompetencies();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await rpdService.getAll();
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching RPD data:', error);
      alert('Ошибка при загрузке данных: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetencies = async () => {
    try {
      const response = await competencyService.getAll();
      const comps = response.data || [];
      setCompetencies(comps);
      
      // Загрузить индикаторы для каждой компетенции
      const indicatorsMap = {};
      for (const comp of comps) {
        try {
          const indResp = await indicatorService.getByCompetency(comp.number);
          indicatorsMap[comp.number] = indResp.data || [];
        } catch (err) {
          console.error(`Error loading indicators for ${comp.number}:`, err);
          indicatorsMap[comp.number] = [];
        }
      }
      setIndicatorsByCompetency(indicatorsMap);
    } catch (error) {
      console.error('Error fetching competencies:', error);
    }
  };

  const handleView = async (item) => {
    try {
      // Загрузить детальную информацию об РПД
      const response = await rpdService.getById(item.id);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching RPD details:', error);
      alert('Ошибка при загрузке данных РПД');
    }
  };

  const handleEdit = async (item) => {
    try {
      // Загрузить детальную информацию об РПД
      const response = await rpdService.getById(item.id);
      const rpdDetails = response.data;
      
      setSelectedItem(rpdDetails);
      setFormData({
        disciplineName: rpdDetails.disciplineName || '',
        year: rpdDetails.year || new Date().getFullYear(),
      });
      
      // Загрузить компетенции и индикаторы
      await fetchCompetencies();
      
      // Установить выбранные индикаторы из новой структуры данных
      const selected = {};
      if (rpdDetails.competencies && rpdDetails.competencies.length > 0) {
        rpdDetails.competencies.forEach(competency => {
          if (competency.indicators && competency.indicators.length > 0) {
            selected[competency.number] = competency.indicators.map(ind => ind.id);
          }
        });
      }
      setSelectedIndicators(selected);
      
      setModalMode('edit');
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching RPD details for edit:', error);
      alert('Ошибка при загрузке данных РПД для редактирования');
    }
  };

  const handleAdd = async () => {
    setSelectedItem(null);
    setFormData({
      disciplineName: '',
      year: new Date().getFullYear(),
    });
    setSelectedIndicators({});
    await fetchCompetencies();
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить РПД "${item.disciplineName}"?`)) {
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

  const handleManageSkills = (item) => {
    navigate(`/rpd/${item.id}/skills`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Собрать ID выбранных индикаторов
      const indicatorIds = [];
      Object.values(selectedIndicators).forEach(arr => {
        indicatorIds.push(...arr);
      });

      const payload = {
        discipline_name: formData.disciplineName,
        year: parseInt(formData.year),
        competencyAchievementIndicators: indicatorIds.map(id => id.toString()),
      };

      if (modalMode === 'add') {
        await rpdService.create(payload);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        const editPayload = {
          disciplineName: formData.disciplineName,
          year: parseInt(formData.year),
          selectedIndicators: indicatorIds,
        };
        await rpdService.update(selectedItem.id, editPayload);
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

  const handleIndicatorToggle = (competencyNumber, indicatorId) => {
    setSelectedIndicators(prev => {
      const newSelected = { ...prev };
      if (!newSelected[competencyNumber]) {
        newSelected[competencyNumber] = [];
      }
      
      const index = newSelected[competencyNumber].indexOf(indicatorId);
      if (index > -1) {
        newSelected[competencyNumber] = newSelected[competencyNumber].filter(id => id !== indicatorId);
      } else {
        newSelected[competencyNumber] = [...newSelected[competencyNumber], indicatorId];
      }
      
      return newSelected;
    });
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
            <label>Название дисциплины:</label>
            <span>{selectedItem?.disciplineName}</span>
          </div>
          <div className="view-field">
            <label>Год:</label>
            <span>{selectedItem?.year}</span>
          </div>
          <div className="view-field" style={{ display: 'block', marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
              Индикаторы компетенций:
            </label>
            {selectedItem?.competencies && selectedItem.competencies.length > 0 ? (
              <div style={{ marginTop: '10px' }}>
                {selectedItem.competencies.map((competency) => (
                  <div key={competency.id} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      Компетенция {competency.number}:
                      <span style={{ fontWeight: 'normal', fontSize: '14px', display: 'block', marginTop: '5px' }}>
                        {competency.description}
                      </span>
                    </h4>
                    {competency.indicators && competency.indicators.length > 0 ? (
                      competency.indicators.map(ind => (
                        <div key={ind.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
                          <div><strong>Индикатор {ind.number}:</strong> {ind.description}</div>
                          {ind.indicatorKnow && (
                            <div style={{ marginTop: '5px' }}><strong>Знать:</strong> {ind.indicatorKnow}</div>
                          )}
                          {ind.indicatorAble && (
                            <div style={{ marginTop: '5px' }}><strong>Уметь:</strong> {ind.indicatorAble}</div>
                          )}
                          {ind.indicatorPossess && (
                            <div style={{ marginTop: '5px' }}><strong>Владеть:</strong> {ind.indicatorPossess}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ marginLeft: '10px', color: '#999' }}>Нет индикаторов</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span>Нет компетенций</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="disciplineName">Название дисциплины:</label>
          <input
            type="text"
            id="disciplineName"
            name="disciplineName"
            value={formData.disciplineName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="year">Год:</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year || ''}
            onChange={handleInputChange}
            required
            min="2000"
            max="2100"
          />
        </div>
        
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
            Выберите индикаторы компетенций:
          </label>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            {competencies.map(comp => (
              <div key={comp.number} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  {comp.number}: {comp.description}
                </h4>
                {indicatorsByCompetency[comp.number] && indicatorsByCompetency[comp.number].length > 0 ? (
                  indicatorsByCompetency[comp.number].map(ind => (
                    <div key={ind.id} style={{ marginBottom: '10px', marginLeft: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedIndicators[comp.number]?.includes(ind.id) || false}
                          onChange={() => handleIndicatorToggle(comp.number, ind.id)}
                          style={{ marginTop: '3px', marginRight: '8px' }}
                        />
                        <span>
                          <strong>{ind.number}:</strong> {ind.description}
                        </span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div style={{ marginLeft: '10px', color: '#999' }}>Нет индикаторов</div>
                )}
              </div>
            ))}
          </div>
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
        customActions={[
          {
            icon: '🎯',
            title: 'Управление навыками',
            onClick: handleManageSkills,
            className: 'manage-skills-btn'
          }
        ]}
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
