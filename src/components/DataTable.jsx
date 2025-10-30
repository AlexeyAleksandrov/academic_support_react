import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataTable = ({ columns, data, onView, onEdit, onDelete, loading, customActions }) => {
  // Создаем колонку с действиями
  const actionColumn = {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Открыть меню</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Кастомные действия */}
            {customActions && customActions.map((action, index) => (
              <DropdownMenuItem
                key={`custom-${index}`}
                onClick={() => action.onClick(item)}
                className="cursor-pointer"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.title}
              </DropdownMenuItem>
            ))}
            
            {customActions && customActions.length > 0 && <DropdownMenuSeparator />}
            
            {/* Основные действия */}
            <DropdownMenuItem
              onClick={() => onView(item)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              Просмотр
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onEdit(item)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  // Добавляем колонку действий к существующим колонкам
  const tableColumns = [...columns, actionColumn];

  const table = useReactTable({
    data: data || [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                Нет результатов.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
