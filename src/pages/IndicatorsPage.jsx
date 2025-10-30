import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { indicatorService, competencyService } from '../services/api';

const IndicatorsPage = () => {
  const [allIndicators, setAllIndicators] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const compResponse = await competencyService.getAll();
      const comps = compResponse.data || [];
      setCompetencies(comps);
      
      // Загрузить все индикаторы для всех компетенций
      const allInds = [];
      for (const comp of comps) {
        try {
          const indResp = await indicatorService.getByCompetency(comp.number);
          const indicators = indResp.data || [];
          allInds.push(...indicators);
        } catch (err) {
          console.error(`Error loading indicators for ${comp.number}:`, err);
        }
      }
      setAllIndicators(allInds);
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
    setFormData({ competencyNumber: competencies.length > 0 ? competencies[0].number : '' });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить индикатор "${item.number}"?`)) {
      try {
        await indicatorService.delete(item.competencyNumber, item.number);
        alert('Успешно удалено');
        fetchAllData();
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
        await indicatorService.create(formData.competencyNumber, formData);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        await indicatorService.update(selectedItem.competencyNumber, selectedItem.number, formData);
        alert('Успешно обновлено');
      }
      setModalOpen(false);
      fetchAllData();
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
            <label>Номер компетенции:</label>
            <span>{selectedItem?.competencyNumber}</span>
          </div>
          <div className="view-field">
            <label>Номер индикатора:</label>
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
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="competencyNumber">Номер компетенции:</label>
          <select
            id="competencyNumber"
            name="competencyNumber"
            value={formData.competencyNumber || ''}
            onChange={handleInputChange}
            required
          >
            <option value="">Выберите компетенцию</option>
            {competencies.map(comp => (
              <option key={comp.id} value={comp.number}>
                {comp.number} - {comp.description}
              </option>
            ))}
          </select>
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

  // Группировка индикаторов по компетенциям
  const groupedIndicators = allIndicators.reduce((acc, ind) => {
    const compNum = ind.competencyNumber;
    if (!acc[compNum]) {
      acc[compNum] = [];
    }
    acc[compNum].push(ind);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Индикаторы достижения компетенций</h2>
        <button onClick={handleAdd} className="btn btn-add">+ Добавить</button>
      </div>

      {loading ? (
        <div className="loading">Загрузка данных...</div>
      ) : allIndicators.length === 0 ? (
        <div className="no-data">Нет данных для отображения</div>
      ) : (
        <div>
          {competencies.map(comp => {
            const indicators = groupedIndicators[comp.number] || [];
            if (indicators.length === 0) return null;
            
            return (
              <div key={comp.number} style={{ marginBottom: '30px' }}>
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '12px 15px', 
                  borderRadius: '8px',
                  marginBottom: '15px',
                  color: '#2c3e50',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  Компетенция {comp.number}: {comp.description}
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Номер</th>
                        <th>Описание</th>
                        <th className="actions-column">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicators.map((ind) => (
                        <tr key={ind.id}>
                          <td>{ind.number}</td>
                          <td>{ind.description?.substring(0, 100) || ''}</td>
                          <td className="actions-cell">
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleView(ind)}
                              title="Просмотр"
                            >
                              👁️
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(ind)}
                              title="Редактировать"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(ind)}
                              title="Удалить"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
