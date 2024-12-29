import React, { useContext, useEffect, useState } from "react";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { ServerContext } from "../../context/ServerUrlContext";
import { TableContext } from "../../context/tableContext";
import "../../style/tables/tableData.css";
import { CellData } from "../../types/cellType";

interface PlotTableProps {
  handleRightClick: (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ) => void;
}

const PlotTable: React.FC<PlotTableProps> = ({ handleRightClick }) => {
  const tableContext = useContext(TableContext);
  const serverUrl = useContext(ServerContext);

  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }

  const { columns, cells, setColumns, setCells } = tableContext;

  // Map rows to their respective cells
  const rows = cells.reduce<Record<number, CellData[]>>((acc, cell) => {
    acc[cell.rowIndex] = acc[cell.rowIndex] || [];
    acc[cell.rowIndex].push(cell);
    return acc;
  }, {});

  const [sortedColumns, setSortedColumns] = useState(columns || []);
  useEffect(() => {
    if (columns) {
      const sorted = [...columns].sort((a, b) => a.columnIndex - b.columnIndex);
      setSortedColumns(sorted);
    }
  }, [columns]);
  
  const sortedRows = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b)
    .map((rowIndex) =>
      rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || []
    );

  const handleCellUpdate = async (cell: CellData, newData: any) => {
    try {
      const updatedCell = { ...cell, data: newData };
      const success = await DocumentRestAPIMethods.update(
        serverUrl,
        "tables",
        { _id: cell._id },
        { data: newData }
      );

      if (success) {
        console.log("Cell updated successfully");
        if (cell.rowIndex === 0) {
          // Update column cells
          setColumns((prevColumns) =>
            prevColumns.map((c) => (c._id === cell._id ? updatedCell : c))
          );
        } else {
          // Update regular cells
          setCells((prevCells) =>
            prevCells.map((c) => (c._id === cell._id ? updatedCell : c))
          );
        }
      } else {
        console.error("Failed to update cell data.");
      }
    } catch (error) {
      console.error("Error in handleCellUpdate:", error);
    }
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    cell: CellData
  ) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith("image")) {
        const blob = item.getAsFile();
        if (blob) {
          const base64 = await convertToBase64(blob);
          handleCellUpdate(cell, base64);
          return;
        }
      }
    }

    const text = clipboardData.getData("text/plain");
    handleCellUpdate(cell, text);
  };

  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="table-container">
      <table className="table-auto border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr>
            {sortedColumns.map((column) => (
              <th
                key={column._id}
                className="border border-gray-400"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleCellUpdate(column, e.currentTarget.textContent || "")
                }
                onContextMenu={(e) => {
                  e.preventDefault(); // Prevent default context menu
                  handleRightClick(e, column.rowIndex, column.columnIndex);
                }}
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
                <td key={cell._id} className="border border-gray-400"
                onContextMenu={(e) => {
                  e.preventDefault(); // Prevent default context menu
                  handleRightClick(e, cell.rowIndex, cell.columnIndex);
                }}
                >
                  {cell.data && cell.data.startsWith("data:image") ? (
                    <img
                      src={cell.data}
                      alt="Pasted Image"
                      className="max-w-full h-auto"
                    />
                  ) : cell.data && cell.data.startsWith("http") ? (
                    <a
                      href={cell.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {cell.data}
                    </a>
                  ) : (
                    <textarea
                      className="plotTableTextarea w-full h-26"
                      defaultValue={cell.data}
                      onBlur={(e) =>
                        handleCellUpdate(cell, e.currentTarget.value)
                      }
                      onPaste={(e) => handlePaste(e, cell)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlotTable;
