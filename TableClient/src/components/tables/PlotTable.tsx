import React, { useContext, useState } from "react";
import { TablesContext } from "../../context/tableContext";
import "../../style/tables/tableData.css";
import { CellData } from "../../types/cellType";
import { dragAndDropColumn } from "../../functions/table/column/dragAndDropColumn";
import { dragAndDropRow } from "../../functions/table/row/dragAndDropRow";
import { sortTableByColumn } from "../../functions/table/column/sortTableByColumn";

interface PlotTableProps {
  handleRightClick: (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number,
    cellId: string
  ) => boolean;
  handleCellUpdate: (
    cell: CellData,
    newData: any,
    prevData: any
  ) => Promise<void>;
  displayArr: { headers: CellData[]; rows: CellData[][] };
}

const PlotTable: React.FC<PlotTableProps> = ({
  handleRightClick,
  handleCellUpdate,
  displayArr,
}) => {
  const tableContext = useContext(TablesContext);
  const [imagePopup, setImagePopup] = useState<string | null>(null);

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
  } = tableContext;

  const [rightClickFlag, setRightClickFlag] = useState(false);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  const handleRightClickWithFlag = (
    e: React.MouseEvent,
    rowIndex: number,
    columnIndex: number,
    _id: string
  ) => {
    e.preventDefault();
    setRightClickFlag(true);
    const success = handleRightClick(e, rowIndex, columnIndex, _id);
    if (success) setRightClickFlag(false);
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
          reader.readAsDataURL(file);
        }
        e.preventDefault();
        break;
      }
    }
  };

  const handleCheckboxChange = (columnIndex: number) => {
    setCheckedColumns((prev) =>
      prev.includes(columnIndex)
        ? prev.filter((col) => col !== columnIndex)
        : [...prev, columnIndex]
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

    if (draggedColumnIndex != null && draggedColumnIndex !== targetColumnIndex) {
      const result = await dragAndDropColumn({
        currentColumnIndex: draggedColumnIndex,
        targetColumnIndex,
        headerArr: headers,
        cellsArr: cells,
      });
      if (result) {
        setCells(result.newCells);
        setHeaders(result.newHeaders);
      }
    }

    if (draggedRowIndex != null && draggedRowIndex !== targetRowIndex) {
      const result = await dragAndDropRow({
        currentRowIndex: draggedRowIndex,
        targetRowIndex,
        cellsArr: cells,
      });
      if (result) setCells(result.newCells);
    }

    setDraggedColumnIndex(null);
    setDraggedRowIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  const handleSort = (column: CellData) => {
    const sortOrder: "asc" | "desc" = column.sortState === "asc" ? "desc" : "asc";
    const { sortedCells } = sortTableByColumn(column.columnIndex, cells, sortOrder);

    const updatedHeaders = headers.map((h) => ({
      ...h,
      sortState: h._id === column._id ? sortOrder : null,
    }));

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

  const totalCells = cells.length;
  const maxRow = Math.max(...cells.map(cell => cell.rowIndex), 0);
  const maxCol = Math.max(...cells.map(cell => cell.columnIndex), 0);
  const expectedCells = (maxRow + 1*0) * (maxCol + 1*0);
  const isMismatch = expectedCells !== totalCells;

  return (
    <div>
      {cells.length > 0 && headers.length > 0 && 
      <div style={{ padding: "0.5rem", fontSize: "0.9rem", backgroundColor: isMismatch ? "#ffeeba" : "#f4f4f4" }}>
        Total Cells: {totalCells}, Max Row Index: {maxRow}, Max Column Index: {maxCol}, Expected Cells: {expectedCells}
        {isMismatch && <strong> ⚠ Mismatch Detected</strong>}
      </div>}

      <div className="table-container" style={{ width: "100vw", height: "calc(100vh - 3rem)", overflow: "auto" }}>
        <table className="table-auto border-collapse border border-gray-400 w-full text-center">
          <thead>
            <tr>
              {displayArr.headers.map((h) => (
                <th
                  key={h._id}
                  className={`border border-gray-400 relative ${dragOverColumnIndex === h.columnIndex ? "drag-over" : ""}`}
                  onContextMenu={(e) => handleRightClickWithFlag(e, h.rowIndex, h.columnIndex, h._id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, h.columnIndex, h.rowIndex)}
                  onDragOver={(e) => handleDragOver(e, h.columnIndex, h.rowIndex)}
                  onDrop={(e) => handleDrop(e, h.columnIndex, h.rowIndex)}
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
                    <i className={`fa-solid ${getSortIcon(h.sortState || null)}`}></i>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full h-full text-center outline-none"
                    onBlur={(e) => {
                      if (!rightClickFlag) {
                        handleCellUpdate(h, e.currentTarget.textContent || "", h.data);
                      }
                    }}
                  >
                    {h.data}
                  </div>
                  <div style={{ color: "rgb(255, 255, 255)" }}>({h.rowIndex},{h.columnIndex})</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayArr.rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} style={isMismatch ? { backgroundColor: "#fff3cd" } : {}}>
                {row.map((cell) => (
                  <td
                    key={cell._id}
                    className={`border border-gray-400 h-auto ${dragOverRowIndex === cell.rowIndex ? "drag-over" : ""}`}
                    onContextMenu={(e) => handleRightClickWithFlag(e, cell.rowIndex, cell.columnIndex, cell._id)}
                    onPaste={(e) => handlePasteImage(e, cell)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cell.columnIndex, cell.rowIndex)}
                    onDragOver={(e) => handleDragOver(e, cell.columnIndex, cell.rowIndex)}
                    onDrop={(e) => handleDrop(e, cell.columnIndex, cell.rowIndex)}
                    onDragEnd={handleDragEnd}
                  >
                    {cell.data && cell.data.startsWith("data:image") ? (
                      <img
                        src={cell.data}
                        alt="Pasted"
                        className="max-w-full cursor-pointer"
                        onClick={() => setImagePopup(cell.data)} // ✅ this opens the image popup
                      />
                    ) : cell.data && cell.data.startsWith("http") ? (
                      <a
                        href={cell.data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Go to
                      </a>
                    ) : (
                      <textarea
                        className="plotTableTextarea w-full h-auto"
                        defaultValue={cell.data}
                        // ref={(el) => {
                        //   if (el) {
                        //     el.style.width = "auto";
                        //     el.style.height = "auto";
                        //     el.style.height = Math.min(el.scrollHeight, 200) + "px";
                        //   }
                        // }}
                        onInput={(e) => {
                          const target = e.currentTarget;
                          target.style.height = "auto";
                          target.style.height = Math.min(target.scrollHeight, 200) + "px";
                        }}
                        onBlur={(e) => {
                          if (!rightClickFlag) {
                            handleCellUpdate(cell, e.currentTarget.value, cell.data);
                          }
                        }}
                      />
                    )}
                    <div style={{ color: "rgb(230, 230, 230)" }}>({cell.rowIndex},{cell.columnIndex})</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {imagePopup && (
  <div
    onClick={() => setImagePopup(null)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      zIndex: 1000,
      // overflowY: "auto",
    }}
  >
    <img
      src={imagePopup}
      alt="Large view"
      style={{
        marginTop: "2.5vh",          // Shift the image up visually
        maxWidth: "90vw",
        maxHeight: "90vh",
        boxShadow: "0 0 5px white",
        borderRadius: "8px",
        marginBottom: "0.5rem",
        cursor: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    />
    <a
      href={imagePopup}
      download="image.png"
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: "0.1rem 0.1rem",
        backgroundColor: "#fff",
        borderRadius: "2px",
        color: "#000",
        textDecoration: "none",
        fontWeight: "regular",
        boxShadow: "10 10px 1px rgba(0,0,0,0.3)",
        marginBottom: "0.1rem",     // Give spacing below the button
        maxHeight: "3vh",
      }}
    >Download Image</a>
  </div>
)}


    </div>
  );
};

export default PlotTable;
