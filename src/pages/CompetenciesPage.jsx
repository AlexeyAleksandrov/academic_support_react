import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { competencyService, keywordService } from '../services/api';
import './PageStyles.css';

const CompetenciesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  const columns = [
    { header: '№', field: 'rowNumber', render: (row, index) => index + 1 },
    { header: 'Номер', field: 'number' },
    { header: 'Описание', field: 'description', render: (row) => row.description?.substring(0, 80) || '' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await competencyService.getAll();
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
      // Получить полную информацию о компетенции с ключевыми словами
      const response = await competencyService.getById(item.id);
      setSelectedItem(response.data);
      setModalMode('view');
      setModalOpen(true);
    } catch (error) {
      console.error('Error loading competency details:', error);
      alert('Ошибка при загрузке данных компетенции');
    }
  };

  const handleEdit = async (item) => {
    setSelectedItem(item);
    setFormData({
      number: item.number || '',
      description: item.description || '',
    });
    
    // Загрузить все ключевые слова и установить выбранные
    await fetchAllKeywords();
    
    // Получить полную информацию о компетенции с ключевыми словами
    try {
      const response = await competencyService.getById(item.id);
      const keywordsList = response.data.keywords || [];
      setSelectedKeywords(keywordsList);
    } catch (error) {
      console.error('Error loading competency keywords:', error);
      setSelectedKeywords([]);
    }
    
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleAdd = async () => {
    setSelectedItem(null);
    setFormData({});
    setSelectedKeywords([]);
    await fetchAllKeywords();
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Вы уверены, что хотите удалить компетенцию "${item.number}"?`)) {
      try {
        await competencyService.delete(item.id);
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
        number: formData.number,
        description: formData.description,
      };
      
      if (modalMode === 'add') {
        await competencyService.create(payload);
        alert('Успешно добавлено');
      } else if (modalMode === 'edit') {
        // Получить ID ключевых слов для обновления
        const keywordIds = allKeywords
          .filter(kw => selectedKeywords.includes(kw.keyword))
          .map(kw => kw.id);
        
        const updatePayload = {
          ...payload,
          keywordIds: keywordIds,
        };
        
        await competencyService.update(selectedItem.id, updatePayload);
        alert('Успешно обновлено');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchAllKeywords = async () => {
    try {
      const response = await keywordService.getAll();
      setAllKeywords(response.data || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      setAllKeywords([]);
    }
  };

  const handleGenerateKeywords = async (competencyId) => {
    if (window.confirm('Сгенерировать ключевые слова с помощью ИИ для этой компетенции?')) {
      try {
        await keywordService.generateForCompetency(competencyId);
        alert('Ключевые слова успешно сгенерированы');
        fetchData();
      } catch (error) {
        console.error('Error generating keywords:', error);
        alert('Ошибка при генерации ключевых слов: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
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
          <div className="view-field" style={{ display: 'block', marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Ключевые слова:</label>
            {selectedItem?.keywords && selectedItem.keywords.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {selectedItem.keywords.map((kw, index) => (
                  <span key={index} style={{
                    padding: '5px 12px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '15px',
                    fontSize: '14px',
                    color: '#1976d2'
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            ) : (
              <span>Нет ключевых слов</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="number">Номер:</label>
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
            rows="5"
            required
          />
        </div>
        
        {modalMode === 'edit' && (
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
              Ключевые слова:
            </label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
              {allKeywords.length > 0 ? (
                allKeywords.map(kw => (
                  <div key={kw.id} style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(kw.keyword)}
                        onChange={() => handleKeywordToggle(kw.keyword)}
                        style={{ marginRight: '8px' }}
                      />
                      <span>{kw.keyword}</span>
                    </label>
                  </div>
                ))
              ) : (
                <div style={{ color: '#999' }}>Нет доступных ключевых слов</div>
              )}
            </div>
          </div>
        )}
        
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

  const handleGenerateAllKeywords = async () => {
    if (data.length === 0) {
      alert('Нет компетенций для генерации ключевых слов');
      return;
    }
    
    if (window.confirm('Сгенерировать ключевые слова с помощью ИИ для всех компетенций?')) {
      let successCount = 0;
      let errorCount = 0;
      
      for (const comp of data) {
        try {
          await keywordService.generateForCompetency(comp.id);
          successCount++;
        } catch (error) {
          console.error(`Error generating keywords for competency ${comp.number}:`, error);
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        alert(`Успешно сгенерированы ключевые слова для ${successCount} компетенций`);
      } else {
        alert(`Готово: ${successCount} успешно, ${errorCount} с ошибками`);
      }
      
      fetchData();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Компетенции</h2>
        <button className="btn btn-add" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="action-buttons">
        <button className="btn btn-action" onClick={handleGenerateAllKeywords}>
          🤖 Выделить ключевые слова с помощью ИИ
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
            ? 'Просмотр компетенции'
            : modalMode === 'edit'
            ? 'Редактирование компетенции'
            : 'Добавление компетенции'
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default CompetenciesPage;
