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
import "../style/tables/tablePage.css";
import "../style/buttons.css";
import generateCellsForPlot from "../functions/table/generateCellsForPlot";
import { findTheLastIndex } from "../functions/table/findTheLastIndex";
import { handleAddToDB } from "../functions/dbHandler/handleAddToDB";
import { handleUpdateIndexInDB } from "../functions/dbHandler/handleUpdateIndexInDB";
import { handelDeleteInDB } from "../functions/dbHandler/handelDeleteInDB";

function TablePage() {
  //variables:
  const serverUrl = useContext(ServerContext);
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [showPopupInitialTable, setShowPopupInitialTable] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    rowIndex: number;
    columnIndex: number;
    elementType?: string;
  }>({ visible: false, x: 0, y: 0, rowIndex: -1, columnIndex: -1 });
  const [loading, setLoading] = useState(true);
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  if (!tableId) {
    throw new Error("no tableId in params");
  }

  const {
    tables,
    columns,
    cells,
    setColumns,
    setCells,
    rowIndexesArr,
    setRowIndexesArr,
    setNumOfColumns,
    setNumOfRows,
    numOfRows,
    numOfColumns,
  } = tableContext;

  const showGenerateTable =
    !loading && columns.length === 0 && cells.length === 0;

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
        setLoading(true);
        const fetchedColumns: CellData[] = await getAllTablesColumns({
          serverUrl,
          tableId,
          tableIndex,
        });
        const fetchedCells: CellData[] = await getAllTablesCells({
          serverUrl,
          tableIndex,
          tableId,
        });

        if (!fetchedColumns || !fetchedCells) {
          throw new Error("Failed to fetch columns or cells");
        }
        console.log("At TablePage fetched columns:", fetchedColumns);
        console.log("At TablePage fetched cells:", fetchedCells);

        // Ensure all rows are displayed on initial load or when search is cleared
        if (!rowIndexesArr || rowIndexesArr.length === 0) {
          setRowIndexesArr([
            ...new Set(fetchedCells.map((cell) => cell.rowIndex)),
          ]);
        }

        //find the highest number of row and column
        const highestColumnIndex = findTheLastIndex({
          arr: fetchedColumns,
          indexType: "columnIndex",
        });
        const highestRowIndex = findTheLastIndex({
          arr: fetchedCells,
          indexType: "rowIndex",
        });
        if (highestRowIndex === undefined)
          throw new Error("At TablePage the lastCellIndex not defined");
        if (highestColumnIndex === undefined)
          throw new Error("At TablePage the lastColumnIndex not defined");
        console.log("TablePage highestColumnIndex:", highestColumnIndex);
        console.log("TablePage highestRowIndex:", highestRowIndex);

        // Set all into the table context
        setColumns(fetchedColumns);
        setCells(fetchedCells);
        setFetchAgain(false);
        setNumOfColumns(highestColumnIndex);
        setNumOfRows(highestRowIndex);
      } catch (error) {
        console.error("Error fetching columns or cells:", error);
      } finally {
        console.log("TablePage fetchColumnsAndCells finally");
        setLoading(false); // Stop loading
      }
    };

    fetchColumnsAndCells();
  }, [setColumns, setCells, fetchAgain]);

  // Close the menu if the click is outside the table
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }; //works

  //update the data filed in the UI only
  const visualDataCellsUpdate = (
    cell: CellData,
    updatedCell: CellData
  ): CellData[] => {
    if (cell.rowIndex === 0) {
      const newColumns = columns.map((c) =>
        c._id === cell._id ? updatedCell : c
      );
      setColumns(newColumns); // Update the state
      return []; // Return the updated array
    } else {
      const newCells = cells.map((c) => (c._id === cell._id ? updatedCell : c));
      setCells(newCells); // Update the state
      return newCells; // Return the updated cells array
    }
  }; //works

  const handleCellUpdate = async (
    cell: CellData,
    newData: any,
    prevData: any
  ) => {
    console.log("at handleCellUpdate the prevData is:", prevData);
    console.log("at handleCellUpdate the newData is:", newData);
    if (prevData === newData) return;

    try {
      const updatedCell = { ...cell, data: newData };
      console.log(
        "at PlotTable handleCellUpdate the updatedCell:",
        updatedCell
      );

      // Update the visual state (columns or cells data)
      const resolve = await visualDataCellsUpdate(cell, updatedCell);
      console.log(
        "at handleCellUpdate after visualCellsUpdate the resolve is:",
        resolve
      );

      //update cell data in db
      const success = await DocumentRestAPIMethods.update(
        serverUrl,
        "tables",
        { _id: cell._id },
        { data: newData }
      );
      if (success)
        console.log("at handleCellUpdate Cell updated successfully in db");

      //add new empty first row if needed
      let newCellsAfterAddingRow; // Define outside of the if block
      if (
        //checks if the visual data update work/finish
        resolve.length > 0 &&
        newData != "" &&
        newData != null &&
        cell.rowIndex === 1
      ) {
        newCellsAfterAddingRow = await addNewRow({
          tableId,
          tableIndex,
          currentRowIndex: 1,
          numOfColumns,
          cells: resolve,
          addBefore: true,
          rowIndexesArr,
        });
        setCells(newCellsAfterAddingRow.newCellsArray);
        setRowIndexesArr([
          ...new Set(newCellsAfterAddingRow.updatedRowIndexesArr),
        ]);

        handleUpdateIndexInDB(newCellsAfterAddingRow.toBeUpdateInDB, serverUrl);
        handleAddToDB(newCellsAfterAddingRow.newToAddInDB, serverUrl);
      }
    } catch (error) {
      console.error("Error in handleCellUpdate:", error);
    }
  }; //works

  const handleRightClick = (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ): boolean => {
    try {
      const target = event.target as HTMLElement;
      const elementType = target.tagName;
      setMenuState({
        visible: true,
        x: event.pageX,
        y: event.pageY,
        rowIndex,
        columnIndex,
        elementType,
      });
      console.log(`Right-clicked on row ${rowIndex}, column ${columnIndex}`);
      return true; // Return true on success
    } catch (error) {
      console.error("Error in handleRightClick:", error);
      return false; // Return false on failure
    }
  }; //works

  const handleBackBtnClicked = async () => {
    setColumns([]);
    setCells([]);
    setRowIndexesArr([]);
    navigate("/mainTablesPage");
  }; //works

  const handleMenuAction = async (action: string) => {
    const { rowIndex, columnIndex } = menuState;
    if (action === "addRowAfter") {
      setMenuState({ ...menuState, visible: false }); // Close menu after action
      await handleAddRowBtnClick(false, rowIndex);
      // } else if (action === "addRowBefore") {
      //   setMenuState({ ...menuState, visible: false }); // Close menu after action
      //   await handleAddRowBtnClick(true, rowIndex);
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
    } else if (action === "clearData") {
      const cellToClear = cells.find(
        (cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex
      );
      if (cellToClear) {
        await handleCellUpdate(cellToClear, null, cellToClear.data); // Clear the cell data
      }
      setMenuState({ ...menuState, visible: false }); // Close menu
    }
  }; //works

  const handleAddRowBtnClick = async (
    addBefore: boolean,
    currentRowIndex: number
  ) => {
    console.log(
      "At TablePage/handleAddRowBtnClick the rowIndexesArr:",
      rowIndexesArr
    );
    console.log("At TablePage/handleAddRowBtnClick the numOfRows:", numOfRows);
    console.log(
      "At TablePage/handleAddRowBtnClick the numOfColumns:",
      numOfColumns
    );
    const newCellsAfterAddingRow = await addNewRow({
      tableId,
      tableIndex,
      currentRowIndex,
      numOfColumns,
      cells,
      rowIndexesArr,
      addBefore,
    });
    console.log("newCellsAfterAddingRow:", newCellsAfterAddingRow);
    setCells(newCellsAfterAddingRow.newCellsArray);
    setRowIndexesArr([...new Set(newCellsAfterAddingRow.updatedRowIndexesArr)]);
    setNumOfRows((prev) => prev + 1);

    handleUpdateIndexInDB(newCellsAfterAddingRow.toBeUpdateInDB, serverUrl);
    handleAddToDB(newCellsAfterAddingRow.newToAddInDB, serverUrl);
  }; //works

  const handleAddColumnBtnClicked = async (
    addBefore: boolean,
    currentColumnIndex: number
  ) => {
    console.log(
      "at handleAddColumnBtnClicked the currentColumnIndex:",
      currentColumnIndex
    );
    const newColumnAndCellsAfterAddingColumn = await addNewColumnWithCells({
      serverUrl,
      tableId,
      tableIndex,
      currentColumnIndex,
      numOfRows,
      columns,
      cells,
      addBefore,
    });
    setCells(newColumnAndCellsAfterAddingColumn.updatedCells);
    setColumns(newColumnAndCellsAfterAddingColumn.updatedColumns);
    setNumOfColumns((prev) => prev + 1);

    handleUpdateIndexInDB(
      newColumnAndCellsAfterAddingColumn.toBeUpdateInDB,
      serverUrl
    );
    handleAddToDB(newColumnAndCellsAfterAddingColumn.newToAddInDB, serverUrl);
  }; //works

  const handleDeleteRowBtnClicked = async (currentRowIndex: number) => {
    try {
      if (currentRowIndex === 0) {
        handelDeleteInDB(columns, serverUrl);
        setColumns([]);
      } else {
        const result = await DeleteRowCells({
          currentRowIndex,
          cells,
          numOfRows,
          rowIndexesArr,
        });

        if (result === undefined) {
          throw new Error("Result is undefined - delete row failed");
        }
        setCells(result.newCellsArrayAfterDelete);
        setRowIndexesArr([...new Set(result.updatedRowIndexesArr)]);
        setNumOfRows((prev) => prev - 1);

        handelDeleteInDB(result.toBeDeleted, serverUrl);
        handleUpdateIndexInDB(result.toBeUpdated, serverUrl);
        console.log("Row deleted successfully");
      }
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
      setColumns(result.newColumnsArrayAfterDelete);
      setCells(result.newCellsArrayAfterDelete);
      setNumOfColumns((prev) => prev - 1);

      handelDeleteInDB(result.toBeDeleted, serverUrl);
      handleUpdateIndexInDB(result.toBeUpdated, serverUrl);
      console.log("Column deleted successfully");
    } catch (error) {
      console.error("Error handling delete row:", error);
    }
  }; //works

  const handleExportCSV = async (tableId: string) => {
    try {
      const collectionName = "tables";
      const path = `export/csv/${tableId}`;
      const query = {};

      // Fetch CSV file as a Blob (pass `true` to isFile)
      const csvBlob = await DocumentRestAPIMethods.get(
        serverUrl,
        collectionName,
        query,
        path,
        true
      );

      if (!csvBlob) {
        console.error("Export failed: No response from server");
        return;
      }

      // Create a temporary download link
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `table_${tableName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("CSV export successful!");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Dynamically calculate `displayArr` based on `rowIndexesArr` and `cells`
  const displayArr = generateCellsForPlot(rowIndexesArr, cells);

  return (
    <div>
      <header className="flex justify-between items-center">
        {/* Back Button */}
        <button
          onClick={() => handleBackBtnClicked()}
          className="back absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 "
        >
          Back
        </button>

        <h1
          className="tableName absolute top-4"
          contentEditable //give the h1 tag an update ability
          suppressContentEditableWarning
          onBlur={(e) =>
            handleTableRenameUpdate(e.currentTarget.textContent || "")
          }
        >
          {tableName}
        </h1>

        <SearchInTableCells />

        <button className="exportBtn" onClick={() => handleExportCSV(tableId)}>Export table</button>
      </header>

      {loading ? ( // Show loading message if data is being fetched
        <div className="text-center text-6xl text-gray-500">Loading...</div>
      ) : (
        <>
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
          <PlotTable
            handleRightClick={handleRightClick || (() => false)} // Provide a no-op fallback if undefined
            handleCellUpdate={handleCellUpdate}
            displayArr={displayArr}
          />
          {menuState.visible && (
            // !isSearch &&
            <SelectionMenu x={menuState.x} y={menuState.y}>
              <ul className="list-none space-y-2">
                {menuState.elementType === "A" ||
                menuState.elementType === "IMG" ? (
                  <li>
                    <button onClick={() => handleMenuAction("clearData")}>
                      Clear Data
                    </button>
                  </li>
                ) : null}
                <li>
                  <button onClick={() => handleMenuAction("addRowAfter")}>
                    Add Row
                  </button>
                </li>
                {/* <li>
                  {menuState.rowIndex != 0 ? (
                    <button onClick={() => handleMenuAction("addRowBefore")}>
                      Add Row Before
                    </button>
                  ) : null}
                </li> */}
                <li>
                  {(cells.length !== 0 && menuState.rowIndex !== 0) ||
                  (cells.length === 0 && menuState.rowIndex === 0) ? (
                    <button onClick={() => handleMenuAction("deleteRow")}>
                      Delete Row
                    </button>
                  ) : null}
                </li>
                <li>
                  <button onClick={() => handleMenuAction("addColumnAfter")}>
                    Add Column
                  </button>
                </li>
                <li>
                  {menuState.columnIndex === 1 ? (
                    <button onClick={() => handleMenuAction("addColumnBefore")}>
                      Add Column Before
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
        </>
      )}
    </div>
  );
}

export default TablePage;
