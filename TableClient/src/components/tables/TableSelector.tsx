import React, { useEffect, useState } from "react";
import { TableData } from "../../types/tableType";

interface TableSelectorProps {
  tables: TableData[] | undefined;
  onClose: () => void;
  onSave: (selectedTables: number[]) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ onClose, onSave, tables}) => {
  const [selectedTables, setSelectedTables] = useState<number[]>(
    []
  );
  if(tables === undefined) throw new Error("at TableSelector table is undefined");
  
  useEffect(() => {
    setSelectedTables(tables.filter(table => table.visibility !== false).map(table => table.tableIndex));
  }, [tables]);

  const handleCheckboxChange = (tableIndex: number) => {
    setSelectedTables(prev =>
      prev.includes(tableIndex)
        ? prev.filter(idx => idx !== tableIndex)
        : [...prev, tableIndex]
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
              checked={selectedTables.includes(table.tableIndex)}
              onChange={() => handleCheckboxChange(table.tableIndex)}
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
            onClick={() => {
              console.log("Saving selected tables:", selectedTables);
              onSave(selectedTables);
            }}
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
