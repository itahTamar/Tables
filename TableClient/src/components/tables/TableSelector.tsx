import React, { useState, useEffect } from "react";
import { TableData } from "../../types/tableType";

interface TableSelectorProps {
  tables: TableData[];
  onClose: () => void;
  onSave: (selectedTables: string[]) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ tables, onClose, onSave }) => {
  const [selectedTables, setSelectedTables] = useState<string[]>(
    tables.filter((table) => table.visibility !== false).map((table) => table._id)
  );

  const handleCheckboxChange = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg max-h-full overflow-auto">
        <h2 className="text-xl mb-4">Select Tables</h2>
        {tables.map((table) => (
          <label key={table._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedTables.includes(table._id)}
              onChange={() => handleCheckboxChange(table._id)}
              className="mr-2"
            />
            {table.tableName}
          </label>
        ))}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-4 px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedTables)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSelector;
