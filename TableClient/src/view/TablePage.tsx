import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentRestAPIMethods } from "../api/docApi";
import PopupWithAnimation from "../components/popups/popupWithAnimation";
import InitialNewTable from "../components/tables/InitialNewTable";
import PlotTable from "../components/tables/PlotTable";
import SearchInTableCells from "../components/tables/SearchInTableCells";
import { ServerContext } from "../context/ServerUrlContext";
import { TablesContext } from "../context/tableContext";
import { handelDeleteInDB } from "../functions/dbHandler/handelDeleteInDB";
import { handleAddToDB } from "../functions/dbHandler/handleAddToDB";
import { handleUpdateIndexInDB } from "../functions/dbHandler/handleUpdateIndexInDB";
import { addNewColumnWithCells } from "../functions/table/column/addNewColumnWithCells";
import { deleteColumnCells } from "../functions/table/column/deleteColumnCells";
import { getHeaders } from "../functions/table/column/getHeaders";
import generateCellsForPlot from "../functions/table/generateCellsForPlot";
import { addNewRow } from "../functions/table/row/addNewRow";
import { DeleteRowCells } from "../functions/table/row/deleteRowCells";
import { getCells } from "../functions/table/row/getCells";
import "../style/buttons.css";
import "../style/tables/tablePage.css";
import { CellData } from "../types/cellType";
import SelectionMenu from "./../components/tables/SelectionMenu";
// import { hideOrRevealColumn } from "../functions/table/column/hideOrRevealColumn";
import ColumnSelector from "../components/columns/ColumnSelector";
import { handleUpdateVisibilityToDB } from "../functions/dbHandler/handleUpdateVisibilityToDB";
import { useGetAllUserTables } from "../hooks/tables/useGetTablesHooks";

function TablePage() {
  try {
    //variables:
    console.log("🛠️ Inside TablePage Component");
    let renderCount = useRef(0);
    renderCount.current += 1;
    console.log("🔄 TablePage Render Count:", renderCount.current);

    const serverUrl = useContext(ServerContext);
    const tableContext = useContext(TablesContext);
    const { tableId } = useParams();
    const navigate = useNavigate();
    const getAllUserTables = useGetAllUserTables();
    const [showPopupInitialTable, setShowPopupInitialTable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showGenerateTable, setShowGenerateTable] = useState(false);
    const [menuState, setMenuState] = useState<{
      visible: boolean;
      x: number;
      y: number;
      rowIndex: number;
      columnIndex: number;
      elementType?: string;
    }>({ visible: false, x: 0, y: 0, rowIndex: -1, columnIndex: -1 });

    if (!tableId) throw new Error("at TablePage no tableId in params!");

    const {
      tables = [],
      tablesFetched, // flag which tel that data from DB is not empty
      headers, 
      cells,
      setHeaders,
      setCells,
      rowIndexesDisplayArr, // todo replace with DisplayObject
      setRowIndexesDisplayArr,
      colIndexesDisplayArr, // todo replace with DisplayObject
      setColIndexesDisplayArr,
      setNumOfColumns,
      setNumOfRows,
      numOfRows,
      numOfColumns,
    } = tableContext || {};

    if (
      cells===undefined ||
      headers===undefined ||
      numOfColumns===undefined ||
      numOfRows===undefined
    ) {
      console.log("⏳ line 83: Waiting for tables to load...");
      console.log("⏳ Debug info:");
      console.log("cells, headers, numOfColumns, numOfRows:", cells, headers, numOfColumns, numOfRows);
      return <div>Loading cells and headers...</div>;
    }

    if (
      setCells===undefined ||
      setHeaders===undefined ||
      setRowIndexesDisplayArr===undefined ||
      setColIndexesDisplayArr===undefined ||
      setNumOfColumns===undefined ||
      setNumOfRows===undefined
    ) {
      console.log("TablePage.tsx line 96: setCells,setHeaders,setRowIndexesDisplayArr,setColIndexesDisplayArr,setNumOfColumns,setNumOfRows:",setCells,setHeaders,setRowIndexesDisplayArr,setColIndexesDisplayArr,setNumOfColumns,setNumOfRows);
      return <div>problem with sets!</div>;
    }

    // gets  headers, cells, num rows, num columns from DB, and updates showGenerateTable state
    const fetchHeadersAndCells = async () => {
      console.log("**** TablePage.tsx: fetchHeadersAndCells: start ****");

      try {
        const fetchedHeaders: CellData[] = await getHeaders({serverUrl,tableId,}); // get table's headers (documents)
        const fetchedCells: CellData[] = await getCells({serverUrl,tableId,}); // get table's cells (documents)

        if (!fetchedHeaders || !fetchedCells) {
          throw new Error("Failed to fetch headers or cells");
        }

        // Ensure all rows are displayed on initial load or when search is cleared
        const tempRIndexDisplayArr = [...new Set(fetchedCells.map((e) => e.rowIndex)),]; 
        setRowIndexesDisplayArr(tempRIndexDisplayArr);
        setNumOfRows(tempRIndexDisplayArr.length);
        console.log("TablePage.tsx: tempRIndexDisplayArr = ", tempRIndexDisplayArr);

        // Ensure all columns are displayed on initial load or when search is cleared
        const tempCIndexDisplayArr = [...new Set(fetchedHeaders.map((e) => e.columnIndex)),]; 
        setColIndexesDisplayArr(tempCIndexDisplayArr);
        setNumOfColumns(tempCIndexDisplayArr.length);
        console.log("TablePage.tsx: tempCIndexDisplayArr = ", tempCIndexDisplayArr);
        
        // ✅ Update showGenerateTable *inside setState* to ensure it's synced
        setShowGenerateTable(() => {
          const newState = tempCIndexDisplayArr.length === 0;
          return newState;
        });

        // Set into local memory
        setHeaders(fetchedHeaders);
        setCells(fetchedCells);
      } catch (error) {
        console.error("Error fetching headers or cells:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    //get user's tables every time the page is loaded (on init, refresh, ...)
    useEffect(() => {
      console.log("**** TablePage.tsx: useEffect[]: start ****");
      const fetchTables = async () => {
        if (tables.length === 0) {
          await getAllUserTables(); // here should set 'tablesFetched' to True or False also updates 'tables'
        }
      };
      fetchTables();
    }, []);

    // Fetch headers and cells
    useEffect(() => {
      console.log("**** TablePage.tsx: useEffect[tablesFetched, showGenerateTable,]: start ****");

      if (!tablesFetched) {
        return;
      }

      // Fetch data only if it's not already available
      if (headers.length === 0) { //(cells.length === 0 || (headers.length === 0 && !showGenerateTable)) {
        fetchHeadersAndCells();
      }
    }, [tablesFetched, showGenerateTable,]);

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

    // Close the dropdown when clicking outside
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    console.log("Context values:", { serverUrl, tableContext });
    //Verification
    if (!serverUrl) console.error("🚨 Missing serverUrl!");
    if (!tableContext) console.error("🚨 Missing tableContext!");
    if (!serverUrl || !tableContext) {
      console.error("TablesContext or ServerContext is missing in TablePage.");
      return <div>Loading severUrl or tableContext..</div>;
    }
    if (!tableContext || typeof tableContext !== "object") {
      console.error("🚨 tableContext is invalid or missing:", tableContext);
      return <div>TablesContext is corrupted.</div>;
    }
    if (!tableContext.tablesFetched) {
      console.log("⏳ !tableContext.tablesFetched: Waiting for tables to load...");
      return <div>Loading ableContext.tablesFetched...</div>;
    }
    if (!rowIndexesDisplayArr || !setRowIndexesDisplayArr) {
      console.log("⏳ !rowIndexesDisplayArr || !setRowIndexesDisplayArr: Waiting for tables to load...");
      return <div>Loading rowIndexesDisplayArr...</div>;
    }
    if (!colIndexesDisplayArr || !setColIndexesDisplayArr) {
      console.log("⏳ !colIndexesDisplayArr || !setColIndexesDisplayArr: Waiting for tables to load...");
      return <div>Loading colIndexesDisplayArr...</div>;
    }

    console.log("Current rowIndexesDisplayArr:", rowIndexesDisplayArr);
    console.log("Current cells:", cells);
    console.log("Current headers:", headers);
    console.log("Current tableId:", tableId);
    console.log("All tables in context:", tables);

    const table = tables.find((t) => t._id === tableId);
    if (!table || table === undefined) {
      console.log(
        `Table is ${table} with ID ${tableId} not found. Waiting for tables to load...`
      );
      return <div>Loading table information...</div>;
    }

    //Wait until tables are loaded before accessing `tableName
    const tableName = table.tableName;
    const tableIndex = table.tableIndex;

    console.log("Current tableName:", tableName);
    console.log("Current tableIndex:", tableIndex);

    // Dynamically calculate `displayArr` based on `rowIndexesDisplayArr` and `cells`
    const displayArr = generateCellsForPlot(rowIndexesDisplayArr, colIndexesDisplayArr, cells, headers);

    //local functions:
    // Toggle the dropdown menu
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };

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
            prevTables != undefined
              ? prevTables.map((table) =>
                  table._id === tableId
                    ? { ...table, tableName: rename }
                    : table
                )
              : []
          );
        }
      } catch (error) {
        console.error("Error in handleTableRenameUpdate:", error);
      }
    };

    // update the data field only in the UI
    const visualDataCellsUpdate = (
      cell: CellData,
      updatedCell: CellData
    ): CellData[] => {
      if (cell.rowIndex === 0) {
        const newHeaders = headers.map((c) =>
          c._id === cell._id ? updatedCell : c
        );
        setHeaders((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(newHeaders)) return prev;
          return newHeaders;
        });
        return []; // Return the updated array
      } else {
        const newCells = cells.map((c) =>
          c._id === cell._id ? updatedCell : c
        );

        setCells(newCells); // Update the state
        return newCells; // Return the updated cells array
      }
    };

    const handleCellUpdate = async (
      cell: CellData,
      newData: any,
      prevData: any
    ) => {
      console.log("at handleCellUpdate the prevData is:", prevData);
      console.log("at handleCellUpdate the newData is:", newData);
      if (prevData === null && newData === "") return;
      if (prevData === newData) return;

      try {
        const updatedCell = { ...cell, data: newData };
        console.log(
          "at PlotTable handleCellUpdate the updatedCell:",
          updatedCell
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

        // Update the visual state (headers or cells data)
        const resolve = await visualDataCellsUpdate(cell, updatedCell);
        console.log(
          "at handleCellUpdate after visualCellsUpdate the resolve is:",
          resolve
        );

        //add new empty first row if needed
        let newCellsAfterAddingRow; 
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
            rowIndexesDisplayArr,
          });

          setCells(newCellsAfterAddingRow.newCellsArray);
          setRowIndexesDisplayArr([
            ...new Set(newCellsAfterAddingRow.updatedRowIndexesArr),
          ]);

          setNumOfRows((prev) => prev + 1);

          handleUpdateIndexInDB(
            newCellsAfterAddingRow.toBeUpdateInDB,
            serverUrl
          );
          handleAddToDB(newCellsAfterAddingRow.newToAddInDB, serverUrl);
        }
      } catch (error) {
        console.error("Error in handleCellUpdate:", error);
      }
    };

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
    };

    const handleBackBtnClick = async () => {
      setHeaders([]);
      setCells([]);
      setRowIndexesDisplayArr([]);
      navigate("/mainTablesPage");
    };

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
        await handleAddColumnBtnClick(false, columnIndex);
      } else if (action === "addColumnBefore") {
        setMenuState({ ...menuState, visible: false }); // Close menu after action
        await handleAddColumnBtnClick(true, columnIndex);
      } else if (action === "deleteRow") {
        setMenuState({ ...menuState, visible: false }); // Close menu after action
        await handleDeleteRowBtnClick(rowIndex);
      } else if (action === "deleteColumn") {
        setMenuState({ ...menuState, visible: false }); // Close menu after action
        await handleDeleteColumnBtnClick(columnIndex);
      } else if (action === "clearData") {
        const cellToClear = cells.find(
          (cell) =>
            cell.rowIndex === rowIndex && cell.columnIndex === columnIndex
        );
        if (cellToClear) {
          await handleCellUpdate(cellToClear, null, cellToClear.data); // Clear the cell data
        }
        setMenuState({ ...menuState, visible: false }); // Close menu
      }
    };

    const handleAddRowBtnClick = async (
      addBefore: boolean,
      currentRowIndex: number
    ) => {
      console.log(
        "At TablePage/handleAddRowBtnClick the rowIndexesDisplayArr:",
        rowIndexesDisplayArr
      );
      console.log(
        "At TablePage/handleAddRowBtnClick the numOfRows:",
        numOfRows
      );
      console.log(
        "At TablePage/handleAddRowBtnClick the numOfColumns:",
        numOfColumns
      );
      const newCellsAfterAddingRow = await addNewRow({
        tableId,
        tableIndex,
        currentRowIndex,
        numOfColumns,
        rowIndexesDisplayArr,
        cells,
      });
      console.log("newCellsAfterAddingRow:", newCellsAfterAddingRow);
      setCells(newCellsAfterAddingRow.newCellsArray);
      setRowIndexesDisplayArr([
        ...new Set(newCellsAfterAddingRow.updatedRowIndexesArr),
      ]);
      setNumOfRows((prev) => prev + 1);

      handleUpdateIndexInDB(newCellsAfterAddingRow.toBeUpdateInDB, serverUrl);
      handleAddToDB(newCellsAfterAddingRow.newToAddInDB, serverUrl);
    };// reviewed

    const handleAddColumnBtnClick = async (
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
        colIndexesDisplayArr,
        numOfRows,
        headers,
        cells,
        addBefore,
      });

      setCells(newColumnAndCellsAfterAddingColumn.updatedCells);
      setHeaders(newColumnAndCellsAfterAddingColumn.updatedHeaders);
      setColIndexesDisplayArr(newColumnAndCellsAfterAddingColumn.updatedColIndexesArr)
      setNumOfColumns((prev) => prev + 1);
      handleUpdateIndexInDB(
        newColumnAndCellsAfterAddingColumn.toBeUpdateInDB,
        serverUrl
      );
      handleAddToDB(newColumnAndCellsAfterAddingColumn.newToAddInDB, serverUrl);
    };// reviewed

    const handleDeleteRowBtnClick = async (currentRowIndex: number) => {
      try {
        if (currentRowIndex != 0) {
          const result = await DeleteRowCells({
            currentRowIndex,
            cells,
            numOfRows,
            rowIndexesDisplayArr,
          });

          if (result === undefined) {
            throw new Error("Result is undefined - delete row failed");
          }
          setCells(result.newCellsArrayAfterDelete);
          setRowIndexesDisplayArr([...new Set(result.updatedRowIndexesArr)]);
          setNumOfRows((prev) => prev - 1);

          handelDeleteInDB(result.toBeDeleted, serverUrl);
          handleUpdateIndexInDB(result.toBeUpdated, serverUrl);
          console.log("Row deleted successfully");
        }
      } catch (error) {
        console.error("Error handling delete row:", error);
      }
    }; // reviewed

    const handleDeleteColumnBtnClick = async (currentColumnIndex: number) => {
      console.log("Columns state before deletion:", headers);
      console.log("Cells state before deletion:", cells);
      try {
        const result = await deleteColumnCells({
          colArrayIdx: colIndexesDisplayArr,
          currentColumnIndex,
          headers,
          cells,
        });

        if (result === undefined) {
          throw new Error("Result is undefined - delete column failed");
        }
//@ts-ignore

        setHeaders(result.newHeaders);
//@ts-ignore

        setCells(result.newCells);
//@ts-ignore

        // setNumOfColumns((prev) => prev - 1);
        setColIndexesDisplayArr(result.newColIdx);
        handelDeleteInDB(result.toBeDeleted, serverUrl);
        handleUpdateIndexInDB(result.toBeUpdated, serverUrl);
        console.log("Column deleted successfully");
      } catch (error) {
        console.error("Error handling delete row:", error);
      }
    }; // reviewed

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

    const handleSaveSelectedColumns = async (
      selectedColumnIndices: number[]
    ) => {
      setDropdownOpen(false);
      setColIndexesDisplayArr(selectedColumnIndices)
      // // update headers visibility state
      // const updatedHeaders = headers.map((column) => ({
      //   ...column,
      //   visibility: selectedColumnIndices.includes(column.columnIndex),
      // }));
      // // update the headers local
      // setHeaders(updatedHeaders);
      setShowColumnSelector(false);
    };

    const handleSelectColumns = () => {
      setShowColumnSelector(true);
      setTimeout(() => setShowColumnSelector(true), 0); // Delay to ensure state update
    };

    console.log("🔥✅ About to return JSX in TablePage");
    console.log("🔥✅ About to return JSX in TablePage loading is:", loading);
    console.log("🔥✅ About to return JSX in TablePage showGenerateTable:", showGenerateTable);

    return (
      <div>
        <header className="flex justify-between items-center">
          {/* Back Button */}
          <button
            onClick={() => handleBackBtnClick()}
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

          {/* Dropdown Menu */}
          <div className="dropDownMenuBtn text-left" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              Actions
              <svg
                className="ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 13.414l3.293-3.293a1 1 0 011.414
                   1.414L10 13.414l-4.707-4.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown Content */}
            {dropdownOpen && (
              <div className="origin-top-right absolute z-50 right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  {/* export to file */}
                  <button
                    onClick={() => {
                      handleExportCSV(tableId);
                      setDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    Export Table
                  </button>
                  {/* select headers */}
                  <button
                    onClick={() => handleSelectColumns()}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    Select Columns
                  </button>
                  {showColumnSelector && (
                    <ColumnSelector
                      headers={headers}
                      onClose={() => {
                        setShowColumnSelector(false);
                        setDropdownOpen(false);
                      }}
                      onSave={handleSaveSelectedColumns}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
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
                    setShowPopupInitialTable(false);
                  }}
                  onTableCreated={() => setShowGenerateTable(false)} // Hide button
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
                      <button
                        onClick={() => handleMenuAction("addColumnBefore")}
                      >
                        Add Column Before
                      </button>
                    ) : null}
                  </li>
                  <li>
                    <button onClick={() => handleMenuAction("deleteColumn")}>
                      Delete Column
                    </button>
                  </li>
                  {/* hide and reveal column  */}
                  {/* <li>
                    <button onClick={() => handleMenuAction("hideColumn")}>
                      Hide Column
                    </button>
                  </li>
                  {cells.some(
                    (cell) =>
                      (cell.columnIndex === menuState.columnIndex - 1 ||
                        cell.columnIndex === menuState.columnIndex + 1) &&
                      !cell.visibility
                  ) && (
                    <li>
                      <button onClick={() => handleMenuAction("revealColumn")}>
                        Reveal Column
                      </button>
                    </li>
                  )} */}
                </ul>
              </SelectionMenu>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("🚨 Caught an error in TablePage.tsx:", error);
    return <div>Something went wrong! Check console logs.</div>;
  }
}

export default TablePage;
