import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Clipboard } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Column {
  key: string;
  label: string;
  width?: string;
  type: 'text' | 'number' | 'select' | 'readonly';
  options?: { value: string; label: string }[];
  align?: 'left' | 'right' | 'center';
  placeholder?: string;
}

interface EditableTableProps {
  columns: Column[];
  data: any[];
  onChange: (newData: any[]) => void;
  onRowClick?: (row: any, index: number) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  data,
  onChange,
  onRowClick
}) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [editCell, setEditCell] = useState<{ row: number; col: string } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const addRow = useCallback(() => {
    const newRow = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.type === 'number' ? 0 : '' }), {});
    onChange([...data, newRow]);
    setSelectedRow(data.length);
    setEditCell({ row: data.length, col: columns[0].key });
  }, [data, columns, onChange]);

  const deleteRow = useCallback((index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
    setSelectedRow(null);
  }, [data, onChange]);

  const moveRow = useCallback((index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === data.length - 1) return;
    
    const newData = [...data];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newData[index], newData[newIndex]] = [newData[newIndex], newData[index]];
    onChange(newData);
    setSelectedRow(newIndex);
  }, [data, onChange]);

  const handleCellChange = (rowIndex: number, colKey: string, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [colKey]: value };
    onChange(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, colKey: string) => {
    const colIndex = columns.findIndex(c => c.key === colKey);
    
    if (e.key === 'Tab') {
        if (!e.shiftKey && colIndex === columns.length - 1 && rowIndex === data.length - 1) {
            e.preventDefault();
            addRow();
        }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < data.length - 1) {
        setEditCell({ row: rowIndex + 1, col: colKey });
        setSelectedRow(rowIndex + 1);
      } else {
        addRow();
      }
    }

    if (e.key === 'Escape') {
      setEditCell(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split('\n').filter(r => r.trim());
      const pastedData = rows.map(row => {
        const cells = row.split('\t');
        const rowData: any = {};
        columns.forEach((col, idx) => {
          if (cells[idx]) {
            rowData[col.key] = col.type === 'number' ? Number(cells[idx].replace(/[^0-9.-]+/g, "")) : cells[idx];
          }
        });
        return rowData;
      });
      onChange([...data, ...pastedData]);
    } catch (err) {
      console.error('Failed to paste from clipboard', err);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-zinc-50 border-b border-zinc-200 px-3 py-2 flex items-center justify-between">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={addRow} className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5 px-3 border-zinc-300">
            <Plus className="w-3.5 h-3.5" />
            Tambah Baris
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedRow !== null && deleteRow(selectedRow)}
            disabled={selectedRow === null}
            className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5 px-3 border-zinc-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedRow !== null && moveRow(selectedRow, 'up')}
            disabled={selectedRow === null || selectedRow === 0}
            className="h-7 w-7 p-0 border-zinc-300"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedRow !== null && moveRow(selectedRow, 'down')}
            disabled={selectedRow === null || selectedRow === data.length - 1}
            className="h-7 w-7 p-0 border-zinc-300"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          <div className="w-[1px] h-4 bg-zinc-200 mx-1 self-center" />
          <Button variant="outline" size="sm" onClick={handlePaste} className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5 px-3 border-zinc-300">
            <Clipboard className="w-3.5 h-3.5" />
            Paste Excel
          </Button>
        </div>
      </div>

      <div className="overflow-auto max-h-[400px] custom-scrollbar">
        <Table className="border-separate border-spacing-0 min-w-full">
          <TableHeader className="sticky top-0 z-20 bg-zinc-50 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            <TableRow>
              <TableHead className="w-10 text-center border-b border-zinc-200 text-[10px] uppercase font-black tracking-widest text-zinc-400">#</TableHead>
              {columns.map(col => (
                <TableHead 
                  key={col.key} 
                  style={{ width: col.width }}
                  className={cn(
                    "border-b border-l border-zinc-200 text-[10px] uppercase font-black font-semibold tracking-widest text-[#1e3a5f]",
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
              <TableHead className="w-10 border-b border-l border-zinc-200"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center text-xs text-zinc-400 italic">
                  Belum ada data barang. Klik "+ Tambah Baris" untuk memulai.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  onClick={() => setSelectedRow(rowIndex)}
                  className={cn(
                    "group transition-colors h-8",
                    selectedRow === rowIndex ? "bg-blue-50/50" : rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8fafc]/50",
                    "hover:bg-zinc-50"
                  )}
                >
                  <TableCell className="text-center text-[10px] font-bold text-zinc-400 border-b border-zinc-100">
                    {rowIndex + 1}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell 
                      key={col.key} 
                      className={cn(
                        "p-0 border-b border-l border-zinc-100",
                        editCell?.row === rowIndex && editCell?.col === col.key ? "bg-yellow-50" : ""
                      )}
                      onDoubleClick={() => col.type !== 'readonly' && setEditCell({ row: rowIndex, col: col.key })}
                    >
                      {editCell?.row === rowIndex && editCell?.col === col.key ? (
                        <input
                          autoFocus
                          type={col.type === 'number' ? 'number' : 'text'}
                          className={cn(
                            "w-full h-full bg-transparent px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/50",
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          )}
                          value={row[col.key]}
                          onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, col.key)}
                          onBlur={() => setEditCell(null)}
                        />
                      ) : (
                        <div className={cn(
                          "px-3 py-1 text-xs font-medium truncate cursor-text",
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                          col.type === 'readonly' && "text-zinc-500 italic"
                        )}>
                          {col.type === 'number' && typeof row[col.key] === 'number' 
                            ? row[col.key].toLocaleString() 
                            : row[col.key] || <span className="text-zinc-300">...</span>}
                        </div>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-center border-b border-l border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                    <button 
                      onClick={() => deleteRow(rowIndex)}
                      className="text-zinc-300 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
