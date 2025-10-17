import React from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, onView, onEdit, onDelete, loading, customActions }) => {
  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="no-data">Нет данных для отображения</div>;
  }

  // Фильтруем null и undefined элементы
  const validData = data.filter(item => item !== null && item !== undefined);

  if (validData.length === 0) {
    return <div className="no-data">Нет данных для отображения</div>;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            <th className="actions-column">Действия</th>
          </tr>
        </thead>
        <tbody>
          {validData.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row, rowIndex) : row[column.field]}
                </td>
              ))}
              <td className="actions-cell">
                {customActions && customActions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    className={`action-btn ${action.className || ''}`}
                    onClick={() => action.onClick(row)}
                    title={action.title}
                  >
                    {action.icon}
                  </button>
                ))}
                <button
                  className="action-btn view-btn"
                  onClick={() => onView(row)}
                  title="Просмотр"
                >
                  👁️
                </button>
                <button
                  className="action-btn edit-btn"
                  onClick={() => onEdit(row)}
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => onDelete(row)}
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
  );
};

export default DataTable;
