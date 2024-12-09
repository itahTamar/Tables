import React, { useContext } from "react";
import { TableContext } from "../context/tableContext";
import { CellData } from "../types/cellType";
import { DocumentAPIWrapper } from "../api/docApi";
import { ServerContext } from "../context/ServerUrlContext";
import "../style/tableData.css"

const NewTableData: React.FC = () => {
  const tableContext = useContext(TableContext);
  const serverUrl = useContext(ServerContext);

  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }

  const { columns, cells, setColumns, setCells } = tableContext;

  // Create a map of rows with their corresponding cells
  const rows = cells.reduce<Record<number, CellData[]>>((acc, cell) => {
    acc[cell.rowIndex] = acc[cell.rowIndex] || [];
    acc[cell.rowIndex].push(cell);
    return acc;
  }, {});

  //sort the columns cell e.g. the header row
  const sortedColumns = [...columns].sort((a, b) => a.columnIndex - b.columnIndex); 
  //sort the rows by their order and the cells inside in the correct columns order
  const sortedRows = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b)
    .map((rowIndex) => rows[rowIndex].sort((a, b) => a.columnIndex - b.columnIndex));

  const handleCellUpdate = async (cell: CellData, newData: string) => {
    const updatedCell = { ...cell, data: newData };
    const success = await DocumentAPIWrapper.update(serverUrl, "tables", {id: cell._id}, {data: newData});

    if (success) {
        console.log("cell updated succeed")
        //indicate a type column cell
        if (cell.rowIndex === 0) {  
            // Update column cell
            setColumns((prevColumns: CellData[]) =>
              prevColumns.map((c) => (c._id === cell._id ? updatedCell : c))
            );
          } else {
            // Update regular cell
            setCells((prevCells: CellData[]) =>
              prevCells.map((c) => (c._id === cell._id ? updatedCell : c))
            );
          }
        } else {
          console.error("Failed to update cell data.");
        }
  };

  return (
    <div className="table-container">
      <table className="table-auto border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr>
            {sortedColumns.map((column) => (
              <th
                key={column._id}
                className="border border-gray-400 p-2"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleCellUpdate(column, e.currentTarget.textContent || "")
                }
              >
                {column.data}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell) => (
                <td
                  key={cell._id}
                  className="border border-gray-400 p-2"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleCellUpdate(cell, e.currentTarget.textContent || "")
                  }
                >
                  {cell.data}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewTableData;
