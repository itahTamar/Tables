import React, { useContext, useEffect, useState } from "react";
import { TablesContext } from "../../context/tableContext";
import "../../style/tables/tableData.css";
import { CellData } from "../../types/cellType";
import { handleUpdateIndexInDB } from "../../functions/dbHandler/handleUpdateIndexInDB";
import { dragAndDropColumn } from "../../functions/table/column/dragAndDropColumn";
import { ServerContext } from "../../context/ServerUrlContext";
import { dragAndDropRow } from "../../functions/table/row/dragAndDropRow";
import { sortTableByColumn } from "../../functions/table/column/sortTableByColumn";

interface PlotTableProps {
  handleRightClick: (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ) => boolean;
  handleCellUpdate: (
    cell: CellData,
    newData: any,
    prevData: any
  ) => Promise<void>;
  displayArr: {headers: CellData[],rows: CellData[][]};
}

const PlotTable: React.FC<PlotTableProps> = ({
  handleRightClick,
  handleCellUpdate,
  displayArr,
}) => {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TablesContext);
  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }
  const {
    headers,
    setHeaders,
    checkedColumns,
    setCheckedColumns,
    cells,
    setCells,
    numOfRows,
    rowIndexesDisplayArr,
    setRowIndexesDisplayArr,
  } = tableContext;
  // const [sortedHeaders, setSortedHeaders] = useState(headers || []);
  // const [sortedRows, setSortedRows] = useState<CellData[][]>([]);
  const [rightClickFlag, setRightClickFlag] = useState(false); // Use React state instead of ref
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(
    null
  );
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  const handleRightClickWithFlag = (
    e: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ) => {
    e.preventDefault();
    setRightClickFlag(true); // Set flag to true
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.tagName === "IMG") {
      handleRightClick(e, rowIndex, columnIndex);
    }
    const success = handleRightClick(e, rowIndex, columnIndex); // Call the prop function
    console.log(
      "at handleRightClickWithFlag after handleRightClick rightClickFlag:",
      rightClickFlag
    );
    console.log(
      "at handleRightClickWithFlag after handleRightClick success:",
      success
    );
    // Reset the flag based on the result
    if (success) {
      setRightClickFlag(false);
    } else {
      console.error("handleRightClick encountered an issue.");
    }
  };

  const handlePasteImage = (e: React.ClipboardEvent, cell: CellData) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && event.target.result) {
              handleCellUpdate(cell, event.target.result as string, cell.data);
            }
          };
          reader.readAsDataURL(file); // Convert image to Base64
        }
        e.preventDefault(); // Prevent default paste behavior
        break;
      }
    }
  };

  const handleCheckboxChange = (columnIndex: number) => {
    setCheckedColumns(
      (prev) =>
        prev.includes(columnIndex)
          ? prev.filter((col) => col !== columnIndex) // Uncheck
          : [...prev, columnIndex] // Check
    );
  };

  const handleDragStart = (
    e: React.DragEvent,
    columnIndex: number,
    rowIndex: number
  ) => {
    setDraggedRowIndex(rowIndex);
    setDraggedColumnIndex(columnIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent,
    columnIndex: number,
    rowIndex: number
  ) => {
    e.preventDefault();
    setDragOverColumnIndex(columnIndex);
    setDragOverRowIndex(rowIndex);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetColumnIndex: number,
    targetRowIndex: number
  ) => {
    e.preventDefault();
    setDragOverColumnIndex(null);
    setDragOverRowIndex(null);

    if (draggedColumnIndex === null) return;
    if (draggedRowIndex === null) return;

    if (draggedColumnIndex != targetColumnIndex) {
      const result = await dragAndDropColumn({
        currentColumnIndex: draggedColumnIndex,
        targetColumnIndex: targetColumnIndex,
        headerArr: headers,
        cellsArr: cells,
      });

      if (result) {
        // const {
        //   headerToBeInxUpdate,
        //   cellsToBeInxUpdate,
        // } = result;
        setCells(result.newCells);
        setHeaders(result.newHeaders);
        
        // Update indices in the database
        // handleUpdateIndexInDB(headerToBeInxUpdate, serverUrl);
        // handleUpdateIndexInDB(cellsToBeInxUpdate, serverUrl);
      }

      // Reset draggedColumnIndex
      setDraggedColumnIndex(null);
    }

    if (draggedRowIndex != targetRowIndex) {
      const result = await dragAndDropRow({
        currentRowIndex: draggedRowIndex,
        targetRowIndex: targetRowIndex,
        cellsArr: cells,
      });

      if (result) {
        setCells(result.newCells);

        // Update indices in the database
        // handleUpdateIndexInDB(result.cellsToBeInxUpdate, serverUrl);
      }

      // Reset draggedRowIndex
      setDraggedRowIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  const handleSort = (column: CellData) => {
    const sortOrder: "asc" | "desc" =
      column.sortState === "asc" ? "desc" : "asc";
    const { sortedCells } = sortTableByColumn(
      column.columnIndex,
      cells,
      sortOrder
    );

    const updatedHeaders = headers.map((h) => {
      if (h._id === column._id) {
        h.sortState = sortOrder;
      } else {
        h.sortState = null; // Reset sort state for other headers
      }
      return h;
    });

    setHeaders(updatedHeaders);
    setCells(sortedCells);
  };

  const getSortIcon = (sortState: "asc" | "desc" | null): string => {
    switch (sortState) {
      case "asc":
        return "fa-sort-up";
      case "desc":
        return "fa-sort-down";
      default:
        return "fa-sort";
    }
  };

  return (
    <div className="table-container">
      <table className="table-auto border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr>
            {/* display the sorted headers  */}
            {
              displayArr.headers.map((h) => (
              <th
                key={h._id}
                className={`border border-gray-400 relative ${
                  dragOverColumnIndex === h.columnIndex ? "drag-over" : ""
                }`}
                onContextMenu={(e) =>
                  handleRightClickWithFlag(
                    e,
                    h.rowIndex,
                    h.columnIndex
                  )
                }
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, h.columnIndex, h.rowIndex)
                }
                onDragOver={(e) =>
                  handleDragOver(e, h.columnIndex, h.rowIndex)
                }
                onDrop={(e) =>
                  handleDrop(e, h.columnIndex, h.rowIndex)
                }
                onDragEnd={handleDragEnd}
              >
                
                <div className="absolute top-1 left-1">
                  <input
                    type="checkbox"
                    className="checkedBoxColumns"
                    checked={checkedColumns.includes(h.columnIndex)}
                    onChange={() => handleCheckboxChange(h.columnIndex)}
                  />
                </div>
                
                <div className="sort-button" onClick={() => handleSort(h)}>
                  <i
                    className={`fa-solid ${getSortIcon(
                      h.sortState || null
                    )}`}
                  ></i>
                </div>

               {/* plot the current header to screen */}
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full h-full text-center outline-none"
                  onBlur={(e) => {
                    if (!rightClickFlag) {
                      handleCellUpdate(
                        h,
                        e.currentTarget.textContent || "",
                        h.data
                      );
                    }
                  }}
                >
                  {h.data}
                  
                </div>
                <div style={{ color: 'rgb(255, 255, 255)' }}>({h.rowIndex},{ h.columnIndex})</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* display the sorted rows */}
          {displayArr.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell) => (
                <td
                  key={cell._id}
                  className={`border border-gray-400 h-auto" ${
                    dragOverRowIndex === cell.rowIndex ? "drag-over" : ""
                  }`}
                  onContextMenu={(e) =>
                    handleRightClickWithFlag(e, cell.rowIndex, cell.columnIndex)
                  }
                  onPaste={(e) => handlePasteImage(e, cell)}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, cell.columnIndex, cell.rowIndex)
                  }
                  onDragOver={(e) =>
                    handleDragOver(e, cell.columnIndex, cell.rowIndex)
                  }
                  onDrop={(e) => handleDrop(e, cell.columnIndex, cell.rowIndex)}
                  onDragEnd={handleDragEnd}
                >
                  {cell.data && cell.data.startsWith("data:image") ? (
                    <img
                      src={cell.data}
                      alt="Pasted Image"
                      className="max-w-full"
                      onContextMenu={(e) =>
                        handleRightClickWithFlag(
                          e,
                          cell.rowIndex,
                          cell.columnIndex
                        )
                      }
                    />
                  ) : cell.data && cell.data.startsWith("http") ? (
                    <a
                      href={cell.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                      onContextMenu={(e) =>
                        handleRightClickWithFlag(
                          e,
                          cell.rowIndex,
                          cell.columnIndex
                        )
                      }
                    >
                      Go to
                    </a>
                  ) : (
                    <textarea
                      className="plotTableTextarea w-full h-auto"
                      defaultValue={cell.data}
                      ref={(el) => {
                        if (el) {
                          el.style.height = "auto"; // Reset height
                          el.style.height =
                            Math.min(el.scrollHeight, 200) + "px"; // Set max height to 200px
                        }
                      }}
                      onInput={(e) => {
                        const target = e.currentTarget;
                        target.style.height = "auto"; // Reset height to recalculate
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + "px"; // Max height is 200px
                      }}
                      onBlur={(e) => {
                        if (!rightClickFlag) {
                          handleCellUpdate(
                            cell,
                            e.currentTarget.value,
                            cell.data
                          );
                        }
                      }}
                    />
                  )}
                  <div style={{ color: 'rgb(230, 230, 230)' }}>({cell.rowIndex},{cell.columnIndex})</div>
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
