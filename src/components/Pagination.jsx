import React from 'react';
import { Button } from "@/components/ui/button";

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
        <Button
          key={`page-${i}`}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Кнопка следующей страницы: [>]
    if (currentPage < totalPages) {
      buttons.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          title="Следующая страница"
        >
          &gt;
        </Button>
      );
    }

    // Кнопка в конец: [>>]
    if (currentPage < totalPages) {
      buttons.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          title="Последняя страница"
        >
          &gt;&gt;
        </Button>
      );
    }

    // Текущая страница: [M]
    if (currentPage > 3 && currentPage < totalPages - 2) {
      buttons.push(
        <Button
          key="current"
          variant="default"
          size="sm"
        >
          {currentPage}
        </Button>
      );
    }

    // Кнопка в начало: [<<]
    if (currentPage > 1) {
      buttons.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          title="Первая страница"
        >
          &lt;&lt;
        </Button>
      );
    }

    // Кнопка предыдущей страницы: [<]
    if (currentPage > 1) {
      buttons.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          title="Предыдущая страница"
        >
          &lt;
        </Button>
      );
    }

    // Последние 3 страницы: [N-2][N-1][N]
    for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
      buttons.push(
        <Button
          key={`page-${i}`}
          variant={currentPage === i ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className="flex items-center gap-1">
        {renderPageButtons()}
      </div>
      <span className="ml-4 text-sm text-muted-foreground">
        Страница {currentPage} из {totalPages} (Всего: {totalCount})
      </span>
    </div>
  );
};

export default Pagination;
