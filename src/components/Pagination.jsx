import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalCount, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageButtons = () => {
    const buttons = [];

    // Первые 3 страницы: [1][2][3]
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      buttons.push(
        <button
          key={`page-${i}`}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Кнопка следующей страницы: [>]
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          title="Следующая страница"
        >
          &gt;
        </button>
      );
    }

    // Кнопка в конец: [>>]
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="last"
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          title="Последняя страница"
        >
          &gt;&gt;
        </button>
      );
    }

    // Текущая страница: [M]
    if (currentPage > 3 && currentPage < totalPages - 2) {
      buttons.push(
        <button
          key={`current-${currentPage}`}
          className="pagination-btn active"
          disabled
        >
          {currentPage}
        </button>
      );
    }

    // Кнопка в начало: [<<]
    if (currentPage > 1) {
      buttons.push(
        <button
          key="first"
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          title="Первая страница"
        >
          &lt;&lt;
        </button>
      );
    }

    // Кнопка предыдущей страницы: [<]
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          title="Предыдущая страница"
        >
          &lt;
        </button>
      );
    }

    // Последние 3 страницы: [N-2][N-1][N]
    for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
      buttons.push(
        <button
          key={`page-${i}`}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Страница {currentPage} из {totalPages} (всего записей: {totalCount})
      </div>
      <div className="pagination-buttons">
        {renderPageButtons()}
      </div>
    </div>
  );
};

export default Pagination;
