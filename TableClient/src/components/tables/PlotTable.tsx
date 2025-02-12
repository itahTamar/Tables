import React, { useContext, useEffect, useState } from "react";
import { TableContext } from "../../context/tableContext";
import "../../style/tables/tableData.css";
import { CellData } from "../../types/cellType";
import { handleUpdateIndexInDB } from "../../functions/dbHandler/handleUpdateIndexInDB";
import { dragAndDropColumn } from "../../functions/table/column/dragAndDropColumn";
import { ServerContext } from "../../context/ServerUrlContext";
import { dragAndDropRow } from "../../functions/table/row/dragAndDropRow";

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
  displayArr: CellData[];
}

const PlotTable: React.FC<PlotTableProps> = ({
  handleRightClick,
  handleCellUpdate,
  displayArr,
}) => {
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }
  const {
    columns,
    setColumns,
    checkedColumns,
    setCheckedColumns,
    cells,
    setCells,
    numOfRows,
    rowIndexesArr,
    setRowIndexesArr,
  } = tableContext;
  const [sortedColumns, setSortedColumns] = useState(columns || []);
  const [sortedRows, setSortedRows] = useState<CellData[][]>([]);
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

  //sort the columns array
  useEffect(() => {
    if (columns) {
      setSortedColumns((prev) => {
        const sorted = [...columns].sort(
          (a, b) => a.columnIndex - b.columnIndex
        );
        const filteredColumns = sorted.filter(
          (cell) => cell.visibility !== false
        );

        //Avoid unnecessary state updates
        if (JSON.stringify(prev) === JSON.stringify(filteredColumns)) {
          return prev; // No change, prevent re-render
        }
        return filteredColumns;
      });
    }
  }, [columns]);

  //sort the table rows
  useEffect(() => {
    const rows = displayArr.reduce<Record<number, CellData[]>>((acc, cell) => {
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
    const filteredRows = sortTheRows.map((row) =>
      row.filter((cell) => cell.visibility !== false)
    );
    setSortedRows(filteredRows);
  }, [displayArr]); // Only depend on `displayArr`

  useEffect(() => {
    console.log("PlotTable displayArr:", displayArr);
    console.log("PlotTable columns:", columns);
  }, [columns]);

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
        columnArr: columns,
        cellsArr: cells,
      });

      if (result) {
        const {
          newSortedUpdatedColumns,
          newSortedUpdatedRows,
          newSortedUpdatedCells,
        } = result;
        setSortedColumns(newSortedUpdatedColumns);
        setSortedRows(newSortedUpdatedRows);
        setCells(newSortedUpdatedCells);
        setColumns(newSortedUpdatedColumns);

        // Update indices in the database
        handleUpdateIndexInDB(newSortedUpdatedColumns, serverUrl);
        handleUpdateIndexInDB(newSortedUpdatedCells, serverUrl);
      }

      // Reset draggedColumnIndex
      setDraggedColumnIndex(null);
    }

    if (draggedRowIndex != targetRowIndex) {
      const result = await dragAndDropRow({
        currentRowIndex: draggedRowIndex,
        targetRowIndex: targetRowIndex,
        cellsArr: cells,
        numOfRows,
        rowIndexesArr,
      });

      if (result) {
        const {
          newSortedUpdatedRows,
          newSortedUpdatedCells,
          adjustedRowIndexes,
        } = result;
        setSortedRows(newSortedUpdatedRows);
        setCells(newSortedUpdatedCells);

        // Preserve the search state by re-filtering the adjustedRowIndexes
        setRowIndexesArr((prev) =>
          prev.filter((index) => adjustedRowIndexes.includes(index))
        );

        // Update indices in the database
        handleUpdateIndexInDB(newSortedUpdatedCells, serverUrl);
      }

      // Reset draggedRowIndex
      setDraggedRowIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  return (
    <div className="table-container">
      <table className="table-auto border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr>
            {sortedColumns.map((column) => (
              <th
                key={column._id}
                className={`border border-gray-400 relative ${
                  dragOverColumnIndex === column.columnIndex ? "drag-over" : ""
                }`}
                onContextMenu={(e) =>
                  handleRightClickWithFlag(
                    e,
                    column.rowIndex,
                    column.columnIndex
                  )
                }
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, column.columnIndex, column.rowIndex)
                }
                onDragOver={(e) =>
                  handleDragOver(e, column.columnIndex, column.rowIndex)
                }
                onDrop={(e) =>
                  handleDrop(e, column.columnIndex, column.rowIndex)
                }
                onDragEnd={handleDragEnd}
              >
                <div className="absolute top-1 left-1">
                  <input
                    type="checkbox"
                    className="checkedBoxColumns"
                    checked={checkedColumns.includes(column.columnIndex)}
                    onChange={() => handleCheckboxChange(column.columnIndex)}
                  />
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full h-full text-center outline-none"
                  onBlur={(e) => {
                    if (!rightClickFlag) {
                      handleCellUpdate(
                        column,
                        e.currentTarget.textContent || "",
                        column.data
                      );
                    }
                  }}
                >
                  {column.data}
                </div>
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
