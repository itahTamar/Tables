import React, { useContext, useEffect, useRef, useState } from "react";
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
  const { columns, setColumns, cells, setCells } = tableContext;
  const [sortedColumns, setSortedColumns] = useState(columns || []);
  const [sortedRows, setSortedRows] = useState<CellData[][]>([]);
  // const [rightClickFlag, setRightClickFlag] = useRef(false)

  const handleCellUpdate = async (cell: CellData, newData: any) => { 
    try {
      const updatedCell = { ...cell, data: newData };
      console.log(
        "at PlotTable handleCellUpdate the updatedCell:",
        updatedCell
      );
      // const success = await DocumentRestAPIMethods.update(
      //   serverUrl,
      //   "tables",
      //   { _id: cell._id },
      //   { data: newData }
      // );

      // if (success) {
      //   console.log("Cell updated successfully");
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
      // } else {
      //   console.error("Failed to update cell data.");
      // }
    } catch (error) {
      console.error("Error in handleCellUpdate:", error);
    }
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement>, //type provided by the React library to handle clipboard-related events
    cell: CellData
  ) => {
    e.preventDefault();
    const clipboardData = e.clipboardData; //property provides access to the data associated with the clipboard event (coping, cutting, pasting)
    const items = clipboardData.items; //A list of items (files or data) being transferred

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

  //convert a file to an string - so it be easier to save it in db
  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); //FileReader is a built-in JavaScript API for reading the contents of Blob or File objects.
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  //sort the columns array
  useEffect(() => {
    if (columns) {
      const sorted = [...columns].sort((a, b) => a.columnIndex - b.columnIndex);
      setSortedColumns(sorted);
    }
  }, [columns]);

  //sort the rows
  // Map rows to their respective cells
  useEffect(() => {
    const rows = cells.reduce<Record<number, CellData[]>>((acc, cell) => {
      acc[cell.rowIndex] = acc[cell.rowIndex] || [];
      acc[cell.rowIndex].push(cell);
      return acc;
    }, {});
    const sortTheRows = Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b)
      .map(
        (rowIndex) =>
          rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || []
      );
    setSortedRows(sortTheRows);
  }, [cells]);
  
  useEffect(() => {
    console.log("PlotTable cells updated:", cells);
    console.log("PlotTable columns updated:", columns);
  }, [cells, columns]);

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
                onBlur={(e) => {
                  handleCellUpdate(column, e.currentTarget.textContent || "");
                }}
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
                <td
                  key={cell._id}
                  className="border border-gray-400"
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
                      onBlur={(e) => {
                        handleCellUpdate(cell, e.currentTarget.value);
                      }}
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