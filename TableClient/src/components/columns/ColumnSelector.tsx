// ColumnSelector.tsx
import React, { useState } from 'react';
import { CellData } from '../../types/cellType';

interface ColumnSelectorProps {
  columns: CellData[];
  onClose: () => void;
  onSave: (selectedColumns: number[]) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, onClose, onSave }) => {
  const [selectedColumns, setSelectedColumns] = useState<number[]>(
    columns.filter(col => col.visibility !== false).map(col => col.columnIndex)
  );

  const handleCheckboxChange = (columnIndex: number) => {
    setSelectedColumns(prev =>
      prev.includes(columnIndex)
        ? prev.filter(idx => idx !== columnIndex)
        : [...prev, columnIndex]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-h-full overflow-auto">
        <h2 className="text-xl mb-4">Select Columns</h2>
        {columns.map(column => (
          <label key={column._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.columnIndex)}
              onChange={() => handleCheckboxChange(column.columnIndex)}
              className="mr-2"
            />
            {column.data}
          </label>
        ))}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="mr-4 px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={() => onSave(selectedColumns)} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;
