import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentRestAPIMethods } from "../api/docApi";
import PopupWithAnimation from "../components/popups/popupWithAnimation";
import InitialNewTable from "../components/tables/InitialNewTable";
import PlotTable from "../components/tables/PlotTable";
import SearchInTableCells from "../components/tables/SearchInTableCells";
import { ServerContext } from "../context/ServerUrlContext";
import { TableContext } from "../context/tableContext";
import { addNewColumnWithCells } from "../functions/table/column/addNewColumnWithCells";
import { getAllTablesColumns } from "../functions/table/column/getAllTablesColumns";
import { addNewRow } from "../functions/table/row/addNewRow";
import { DeleteRowCells } from "../functions/table/row/deleteRowCells";
import { getAllTablesCells } from "../functions/table/row/getAllTablesCells";
import { CellData } from "../types/cellType";
import SelectionMenu from "./../components/tables/SelectionMenu";
import { deleteColumnCells } from "../functions/table/column/deleteColumnCells";

function TablePage() {
  //variables:
  const serverUrl = useContext(ServerContext);
  const navigate = useNavigate();
  const [showPopupInitialTable, setShowPopupInitialTable] = useState(false);
  const { tableId } = useParams();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    rowIndex: number;
    columnIndex: number;
  }>({ visible: false, x: 0, y: 0, rowIndex: -1, columnIndex: -1 });
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  if (!tableId) {
    throw new Error("no tableId in params");
  }

  const { tables, columns, cells, setColumns, setCells } = tableContext;

  const showGenerateTable = columns.length === 0 && cells.length === 0; // Check if arrays are empty

  useEffect(() => {
    if (tables.length === 0) {
      console.error("No tables found in context.");
      return;
    }
  }, [tables]);

  const tableName = tables.map((e) => (e._id === tableId ? e.tableName : null));
  const tableIndex = tables.find((e) => e._id === tableId)?.tableIndex;
  if (tableIndex === undefined) {
    console.error(`No tableIndex found for tableId: ${tableId}`);
    return null; // Or navigate away
  }
  console.log("At TablePage the tableIndex is:", tableIndex); //ok
  console.log("At TablePage the tableId is:", tableId); //ok

  //local functions:
  // Fetch columns and cells in useEffect
  useEffect(() => {
    const fetchColumnsAndCells = async () => {
      try {
        const fetchedColumns = await getAllTablesColumns({
          serverUrl,
          tableId,
          tableIndex,
        });
        const fetchedCells = await getAllTablesCells({
          serverUrl,
          tableIndex,
          tableId,
        });

        if (!fetchedColumns || !fetchedCells) {
          throw new Error("Failed to fetch columns or cells");
        }

        // Set the fetched columns and cells into the context
        setColumns(fetchedColumns);
        setCells(fetchedCells);
        setFetchAgain(false);
        console.log("At TablePage fetched columns:", fetchedColumns);
        console.log("At TablePage fetched cells:", fetchedCells);
      } catch (error) {
        console.error("Error fetching columns or cells:", error);
      }
    };

    fetchColumnsAndCells();
  }, [setColumns, setCells, fetchAgain]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close the menu if the click is outside the table
      const target = event.target as HTMLElement;
      if (
        !target.closest(".table-container") &&
        !target.closest(".selection-menu")
      ) {
        setMenuState((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleUpdateDB = async (toBeUpdateInDB: CellData[]) => {
    const successUpdate = await Promise.all(
      toBeUpdateInDB.map((item) =>
            DocumentRestAPIMethods.update(
              serverUrl,
              "tables",
              { _id: item._id },
              {
                columnIndex: item.columnIndex,
                ...(item.rowIndex !== undefined && { rowIndex: item.rowIndex }), 
              }
            )
          )
        );
    if (successUpdate) console.log("At TablePage rows and columns updated successfully to DB");
  } //works

  const handleAddToDB = async (newToAddInDB: CellData[]) => {
    const successAddCells = await Promise.all(
      newToAddInDB.map((cell) =>
        DocumentRestAPIMethods.add(serverUrl, "tables", cell, "addDoc")
      )
    );
    if (successAddCells) console.log("At TablePage rows and columns added successfully to DB");
  } //works

  const handelDeleteInDB = async (cellsToDelete: CellData[]) => {
    const successDeleteCells = await Promise.all(
      cellsToDelete.map((cell) =>
        DocumentRestAPIMethods.delete(serverUrl, "tables", cell, "deleteDoc")
      )
    );
    if (successDeleteCells) console.log("At TablePage row deleted successfully from DB")
  } //?works

  const handleTableRenameUpdate = async (rename: string) => {
    try {
      const success = await DocumentRestAPIMethods.update(
        serverUrl,
        "tables",
        { _id: tableId },
        { tableName: rename }
      );
      if (success) {
        console.log("Table renamed successfully");

        // Update the tableName in the tableContext
        tableContext.setTables((prevTables) =>
          prevTables.map((table) =>
            table._id === tableId ? { ...table, tableName: rename } : table
          )
        );
      }
    } catch (error) {
      console.error("Error in handleTableRenameUpdate:", error);
    }
  };

  const handleRightClick = (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ): boolean => {
    try {
      setMenuState({
            visible: true,
            x: event.pageX,
            y: event.pageY,
            rowIndex,
            columnIndex,
          });
      console.log(`Right-clicked on row ${rowIndex}, column ${columnIndex}`);
      return true; // Return true on success
    } catch (error) {
      console.error("Error in handleRightClick:", error);
      return false; // Return false on failure
    }
  };

  const handleBackBtnClicked = async () => {
    setColumns([]);
    setCells([]);
    navigate("/mainTablesPage");
  };

  const handleMenuAction = async (action: string) => {
    const { rowIndex, columnIndex } = menuState;

    if (action === "addRowAfter") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleAddRowBtnClick(false, rowIndex);
    } else if (action === "addRowBefore") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleAddRowBtnClick(true, rowIndex);
    } else if (action === "addColumnAfter") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleAddColumnBtnClicked(false, columnIndex);
    } else if (action === "addColumnBefore") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleAddColumnBtnClicked(true, columnIndex);
    } else if (action === "deleteRow") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleDeleteRowBtnClicked(rowIndex);
    } else if (action === "deleteColumn") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleDeleteColumnBtnClicked(columnIndex);
    }
  }; //works

  const handleAddRowBtnClick = async (
    addBefore: boolean,
    currentRowIndex: number
  ) => {
    const newCellsAfterAddingRow = await addNewRow({
      serverUrl,
      tableId,
      tableIndex,
      currentRowIndex,
      columns,
      cells,
      addBefore,
    });
    console.log("newCellsAfterAddingRow:", newCellsAfterAddingRow);
    setCells(newCellsAfterAddingRow.newCellsArray);
    handleUpdateDB(newCellsAfterAddingRow.toBeUpdateInDB)
    handleAddToDB(newCellsAfterAddingRow.newToAddInDB)
  }; //works

  const handleAddColumnBtnClicked = async (
    addBefore: boolean,
    currentColumnIndex: number
  ) => {
    const newColumnAndCellsAfterAddingColumn = await addNewColumnWithCells({
      serverUrl,
      tableId,
      tableIndex,
      currentColumnIndex,
      columns,
      cells,
      addBefore,
    });
    setCells(newColumnAndCellsAfterAddingColumn.updatedCells)
    setColumns(newColumnAndCellsAfterAddingColumn.updatedColumns)
    handleUpdateDB(newColumnAndCellsAfterAddingColumn.toBeUpdateInDB)
    handleAddToDB(newColumnAndCellsAfterAddingColumn.newToAddInDB)
  }; //works

  const handleDeleteRowBtnClicked = async (currentRowIndex: number) => {
    try {
      const result = await DeleteRowCells({
        currentRowIndex,
        columns,
        cells,
      });

      if (result === undefined) {
        throw new Error("Result is undefined - delete row failed");
      }
      setCells(result.newCellsArrayAfterDelete)
      handelDeleteInDB(result.toBeDeleted)
      handleUpdateDB(result.toBeUpdated)
      console.log("Row deleted successfully");
    } catch (error) {
      console.error("Error handling delete row:", error);
    }
  }; //works

  const handleDeleteColumnBtnClicked = async (currentColumnIndex: number) => {
    try {
      const result = await deleteColumnCells({
        currentColumnIndex,
        columns,
        cells,
      });

      if (result === undefined) {
        throw new Error("Result is undefined - delete row failed");
      }
      setColumns(result.newColumnsArrayAfterDelete)
      setCells(result.newCellsArrayAfterDelete)
      handelDeleteInDB(result.toBeDeleted)
      handleUpdateDB(result.toBeUpdated)
      console.log("Column deleted successfully");
    } catch (error) {
      console.error("Error handling delete row:", error);
    }
  }; //works

  return (
    <div>
      <header className="flex justify-between items-center mb-24">
        {/* Back Button */}
        <button
          onClick={() => handleBackBtnClicked()}
          className="absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Back
        </button>
      </header>

      <h1
        contentEditable //give the h1 tag an update ability
        suppressContentEditableWarning
        onBlur={(e) =>
          handleTableRenameUpdate(e.currentTarget.textContent || "")
        }
      >
        {tableName}
      </h1>

      <SearchInTableCells tableIndex={tableIndex} tableId={tableId} />
      <div className="m-4"></div>

      {/*Initial the table*/}
      {showGenerateTable && (
        <button
          onClick={() => setShowPopupInitialTable(true)}
          className="absolute flex items-center justify-center w-30 h-12 bg-blue-500 hover:bg-blue-600"
          title="Generate Table" // Tooltip message on hover
        >
          <span
            className="text-white text-2xl text-center"
            style={{ paddingBottom: "0.33rem" }}
          >
            Generate Table
          </span>
        </button>
      )}

      {showPopupInitialTable && (
        <PopupWithAnimation
          open={showPopupInitialTable}
          onClose={() => setShowPopupInitialTable(false)}
        >
          <InitialNewTable
            onClose={() => {
              setFetchAgain(true);
              setShowPopupInitialTable(false);
            }}
            tableId={tableId}
            tableIndex={tableIndex}
          />
        </PopupWithAnimation>
      )}
      <PlotTable handleRightClick={handleRightClick} />
      {menuState.visible && (
        <SelectionMenu x={menuState.x} y={menuState.y}>
          <ul className="list-none space-y-2">
            <li>
              <button onClick={() => handleMenuAction("addRowAfter")}>
                Add Row After
              </button>
            </li>
            <li>
              {menuState.rowIndex != 0 ? (
                <button onClick={() => handleMenuAction("addRowBefore")}>
                  Add Row Before
                </button>
              ) : null}
            </li>
            <li>
              <button onClick={() => handleMenuAction("addColumnAfter")}>
                Add Column After
              </button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("addColumnBefore")}>
                Add Column Before
              </button>
            </li>
            <li>
              {(cells.length !== 0 && menuState.rowIndex !== 0) ||
              (cells.length === 0 && menuState.rowIndex === 0) ? (
                <button onClick={() => handleMenuAction("deleteRow")}>
                  Delete Row
                </button>
              ) : null}
            </li>
            <li>
              <button onClick={() => handleMenuAction("deleteColumn")}>
                Delete Column
              </button>
            </li>
          </ul>
        </SelectionMenu>
      )}
    </div>
  );
}

export default TablePage;
