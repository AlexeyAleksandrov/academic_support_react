import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataTable = ({ columns, data, onView, onEdit, onDelete, loading, customActions }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  // Фильтруем null и undefined элементы
  const validData = data.filter(item => item !== null && item !== undefined);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
            <TableHead className="w-[200px] text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validData.map((row, rowIndex) => (
            <TableRow key={row.id || rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex}>
                  {column.render ? column.render(row, rowIndex) : row[column.field]}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {customActions && customActions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      size="sm"
                      variant="ghost"
                      className={action.className || ''}
                      onClick={() => action.onClick(row)}
                      title={action.title}
                    >
                      {action.icon}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(row)}
                    title="Просмотр"
                  >
                    👁️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                    title="Редактировать"
                  >
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    title="Удалить"
                    className="text-destructive hover:text-destructive"
                  >
                    🗑️
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
