import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DocumentRestAPIMethods } from "../api/docApi";
import PopupWithAnimation from "../components/popups/popupWithAnimation";
import InitialNewTable from "../components/tables/InitialNewTable";
import PlotTable from "../components/tables/PlotTable";
import SearchInTableCells from "../components/tables/SearchInTableCells";
import { ServerContext } from "../context/ServerUrlContext";
import { TablesContext } from "../context/tableContext";
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
import { useGetAllUserTables } from "../hooks/tables/useGetTablesHooks";
import { addToSaveQueue } from "../utils/saveQueue";


function TablePage() {
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
    const [clipboardData, setClipboardData] = useState<{ data: any; isHeader: boolean } | null>(null);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showGenerateTable, setShowGenerateTable] = useState(false);
    const [menuState, setMenuState] = useState<{
      visible: boolean;
      x: number;
      y: number;
      rowIndex: number;
      columnIndex: number;
      elementType?: string;
      cellId: string; 
    }>({ visible: false, x: 0, y: 0, rowIndex: -1, columnIndex: -1, cellId: "" });

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
      return <div>problem with sets!</div>;
    }

    // gets  headers, cells, num rows, num columns from DB, and updates showGenerateTable state from DB
    const fetchHeadersAndCells = async () => {
      console.log("**** TablePage.tsx: fetchHeadersAndCells: start ****");
      try {
//! get from DB
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
        // ✅ Update showGenerateTable *inside setState* to ensure it's synced
        setShowGenerateTable(() => {
          const newState = tempCIndexDisplayArr.length === 0;
          return newState;
        });

        // Set into "local memory"
        setHeaders(fetchedHeaders);
        setCells(fetchedCells);
      } catch (error) {
        console.error("Error fetching headers or cells:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    //get user's tables every time the page is loaded (on init, refresh, ...)
    useEffect(() => { // triggered - Once when tablesFetched becomes true
      console.log("**** TablePage.tsx: useEffect[]: start ****");
      const fetchTables = async () => {
        if (tables.length === 0) {
//! tables from DB
          await getAllUserTables(); // here should set 'tablesFetched' to True or False also updates 'tables'
        }
      };
      fetchTables(); // call DB
    }, []);

    // Fetch headers and cells from DB
    useEffect(() => { // triggered - Every time selectedTable changes
      console.log("**** TablePage.tsx: useEffect[tablesFetched, showGenerateTable,]: start ****");

      if (!tablesFetched) {
        return;
      }

      // Fetch data only if it's not already available
      if (headers.length === 0) { //(cells.length === 0 || (headers.length === 0 && !showGenerateTable)) {
        fetchHeadersAndCells();
      }
    }, [tablesFetched, showGenerateTable,]);

    // Close the selection menu if the user clicks outside of it
    useEffect(() => { // triggered - Whenever cells are updated (via fetch, edit, add/delete)
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".selection-menu")) {
          setMenuState((prev) => ({ ...prev, visible: false }));
        }
      };

      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // Close the dropdown when clicking outside
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => { // triggered - Once on component mount
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
//! update the table name in DB
        const success = await DocumentRestAPIMethods.update(
          serverUrl,
          "tables",
          { _id: tableId },
          { tableName: rename }
        );
        if (success) {
          console.log("Table renamed successfully");

          // Update the tableName in the tableContext (UI)
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
    ): { updatedArray: CellData[]; isHeader: boolean } => {
      const isHeader = cell.rowIndex === 0;
      const source = isHeader ? headers : cells;

      const updated = [...source];
      const index = updated.findIndex((c) => c._id === updatedCell._id);

      if (index !== -1) {
        updated[index] = updatedCell;
      }
      return {updatedArray: updated, isHeader};
    };

    const handleCellUpdate = async (
      cell: CellData,
      newData: any,
      prevData: any
    ) => {
      if (prevData === null && newData === "") return;
      if (prevData === newData) return;

      try {
        const updatedCell = { ...cell, data: newData };
        const result = await visualDataCellsUpdate(cell, updatedCell);

        //add new empty first row if needed
        let newCellsAfterAddingRow; 
        if (!result.isHeader && result.updatedArray.length > 0 &&
          newData != "" && newData != null && cell.rowIndex === 1 ) {
          newCellsAfterAddingRow = await addNewRow({ tableId: tableId, tableIndex: tableIndex, currentRowIndex: 1, 
            cells: result.updatedArray, rowIndexesDisplayArr: rowIndexesDisplayArr, headers: headers});
          setCells(newCellsAfterAddingRow.newCellsArray);
          setRowIndexesDisplayArr([...new Set(newCellsAfterAddingRow.updatedRowIndexesArr),]);
          setNumOfRows((prev) => prev + 1);
        }
        else if (result.updatedArray){
          if (result.isHeader) 
            setHeaders(result.updatedArray)
          else 
            setCells(result.updatedArray)
        }
        scheduleAutoSave();
      } catch (error) {
        console.error("Error in handleCellUpdate:", error);
      }
    };

    const scheduleAutoSave = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        console.log("💾 Auto-saving due to idle...");
        addToSaveQueue(handleSaveToDB); // Add to queue
      }, 1000); // 10 seconds idle threshold
    };

    const handleRightClick = (
      event: React.MouseEvent,
      rowIndex: number,
      columnIndex: number,
      cellId: string
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
          cellId,
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

    // Copy cell content to local clipboard
    const handleCopyCell = (cell: CellData) => {
      const isHeader = cell.rowIndex === 0;
      const text = cell.data ?? "";
      
      // Save to internal state
      setClipboardData({ data: cell.data, isHeader });
      
      // Copy to system clipboard
      navigator.clipboard.writeText(text).then(() => {
        console.log("📋 Copied to system clipboard:", text);
      }).catch(err => {
        console.error("Clipboard write failed:", err);
      });
    };

    const findCell = ({ rowIndex, columnIndex }: typeof menuState) =>
      (rowIndex === 0 ? headers : cells).find(
        (c) => c.rowIndex === rowIndex && c.columnIndex === columnIndex
    );


    // Paste clipboard content into selected cell
    const handlePasteCell = async (cell: CellData) => {
      const isHeader = cell.rowIndex === 0;

      // If internal state exists and types match, use that first
      if (clipboardData) {
        if (clipboardData.isHeader !== isHeader) {
          console.warn("🚫 Cannot paste header data into a regular cell or vice versa.");
          return;
        }
        await handleCellUpdate(cell, clipboardData.data, cell.data);
        console.log("📥 Pasted from internal clipboard");
        return;
      }

      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith("image/")) {
              const blob = await item.getType(type);
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result as string;
                handleCellUpdate(cell, dataUrl, cell.data);
              };
              reader.readAsDataURL(blob);
              return; // Only handle the first image
            }
          }
        }

        // Fallback: if not image, try text
        const text = await navigator.clipboard.readText();
        await handleCellUpdate(cell, text, cell.data);
        console.log("📥 Pasted text from system clipboard");

      } catch (error) {
        console.error("Clipboard read failed:", error);
      }
    };


    const handleMenuAction = async (action: string) => {
      const { rowIndex, columnIndex, cellId } = menuState;
      if (action === "addRowAfter") {
        setMenuState({ ...menuState, visible: false }); // Close menu after action
        await handleAddRowBtnClick(rowIndex);
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
      } else if (action === "deleteCell") {
        setMenuState({ ...menuState, visible: false }); // Close menu after action
        await handleDeleteCellBtnClick(cellId);
      }
    };

    const handleAddRowBtnClick = async (
      currentRowIndex: number
    ) => {
      const newCellsAfterAddingRow = await addNewRow({
        tableId,
        tableIndex,
        currentRowIndex,
        rowIndexesDisplayArr,
        cells,
        headers,
      });
      console.log("newCellsAfterAddingRow:", newCellsAfterAddingRow);
      setCells(newCellsAfterAddingRow.newCellsArray);
      setRowIndexesDisplayArr([
        ...new Set(newCellsAfterAddingRow.updatedRowIndexesArr),
      ]);
      setNumOfRows((prev) => prev + 1);

//! update indexes in DB + add the new documents into DB
      // handleUpdateIndexInDB(newCellsAfterAddingRow.toBeUpdateInDB, serverUrl);
      // handleAddToDB(newCellsAfterAddingRow.newToAddInDB, serverUrl);
    };// reviewed

    const handleAddColumnBtnClick = async (
      addBefore: boolean,
      currentColumnIndex: number
    ) => {

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
    };

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

          console.log("Row deleted successfully");
        }
      } catch (error) {
        console.error("Error handling delete row:", error);
      }
    };

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
          throw new Error("!!!****!!!!!!Result is undefined - delete column failed");
        }
        setHeaders(result.newHeaders);
        setCells(result.newCells);
        setColIndexesDisplayArr(result.newColIdx);
      } catch (error) {
        console.error("Error handling delete row:", error);
      }
    };

    const removeCellFromState = (cellIdToRemove: string) => {
      setCells((prevCells) => prevCells.filter((cell) => cell._id !== cellIdToRemove));
    };

    const handleDeleteCellBtnClick = async (cellId: string) => {
      try {
        removeCellFromState(cellId)

      } catch (error) {
        console.error("Error handling delete Cell:", error);
      }
    };

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
      setShowColumnSelector(false);
    };

    const handleSelectColumns = () => {
      setShowColumnSelector(true);
      setTimeout(() => setShowColumnSelector(true), 0); // Delay to ensure state update
    };

    const handleSaveToDB = async () => {
      setIsSaving(true);
      console.log("!!!! ✅0 start to handleSaveToDB✅ !!!!")
      const collectionName = "tables";
      const currentDocs = [...headers, ...cells];
      // add to_delete field to document
      try {
        // 1. Get all current _ids in local memory
        const currentIds = new Set(currentDocs.map(doc => doc._id));
        console.log("!!!! ✅1 currentIds✅ !!!!",currentIds)

        // 2. Fetch all documents in DB for this tableId
        const fetchedHeaders: CellData[] = await getHeaders({serverUrl,tableId,}); // get table's headers (documents)
        const fetchedCells: CellData[] = await getCells({serverUrl,tableId,}); // get table's cells (documents)
        const existingDocs = [...fetchedHeaders, ...fetchedCells]
        const existingIds = new Set(existingDocs.map(doc => doc._id));
        console.log("!!!! ✅2 currentIds✅ !!!!",currentIds)

        // 3. Determine which _ids are stale (exist in DB but not locally)
        const toDelete = [...existingIds].filter(id => !currentIds.has(id));
        console.log("!!!! ✅3 currentIds✅ !!!!",currentIds)

        // 4. Build update (upsert) operations for headers + cells
        const updates = currentDocs.map(doc => ({
          _id: doc._id,
          update: {
            data: doc.data,
            visibility: doc.visibility,
            rowIndex: doc.rowIndex,
            columnIndex: doc.columnIndex,
            tableId: doc.tableId,
            type: doc.type,
          },
        }));
        console.log("!!!! ✅4 currentIds✅ !!!!",currentIds)

        // 5. Delete stale docs (if any)
        if (toDelete.length > 0) {
          await DocumentRestAPIMethods.bulkDelete(serverUrl, collectionName, toDelete);
          console.log(`🗑️ Deleted ${toDelete.length} stale documents`);
        }
        console.log("!!!! ✅5 currentIds✅ !!!!",currentIds)

        // 6. Upsert all current docs
        const success = await DocumentRestAPIMethods.bulkUpdate(
          serverUrl,
          collectionName,
          updates
        );
        console.log("!!!! ✅6 currentIds✅ !!!!",currentIds)

        if (success) {
          console.log("✅ All cells and headers saved successfully.");
        } else {
          console.error("❌ Failed to save cells and headers.");
        }
      } catch (error) {
        console.error("❌ Error in handleSaveToDB:", error);
      } finally {
        setIsSaving(false);
      }
    };

    
    console.log("🔥✅ About to return JSX in TablePage");

    return (
      <div>
        <header className="flex justify-between items-center">
          {isSaving && (
            <div className="absolute top-2 right-2 text-sm text-gray-500 italic animate-pulse">
              Saving...
            </div>
          )}
          {/* Back Button */}
          <button
            onClick={() => handleBackBtnClick()}
            className="back absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 "
          >
            Back
          </button>
          {/* Save Button */}
          <button className="save absolute px-4 py-2 rounded" onClick={handleSaveToDB}>Save</button>
          {/* table name */}
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
            {/*user search window */}
            <SearchInTableCells />

          {/* Dropdown Menu */}
          <div className="dropDownMenuBtn text-left" ref={dropdownRef}>
            {/*Action button */}
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
                <div className="flex justify-center items-center h-[calc(100vh-20rem)] w-full">
                  <button
                    onClick={() => setShowPopupInitialTable(true)}
                    className="w-50 h-15 bg-blue-500 hover:bg-blue-600 text-white text-2xl rounded shadow"
                    title="Generate Table"
                  >
                    Generate Table
                  </button>
                </div>
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
              <SelectionMenu 
                x={menuState.x} 
                y={menuState.y}onPasteText={(text) => {
                    const cell = findCell(menuState);
                    if (cell) handleCellUpdate(cell, text, cell.data);
                    setMenuState((prev) => ({ ...prev, visible: false }));
                  }}
                  onPasteImage={(imgData) => {
                    const cell = findCell(menuState);
                    if (cell) handleCellUpdate(cell, imgData, cell.data);
                    setMenuState((prev) => ({ ...prev, visible: false }));
                  }}
                >
                <ul className="list-none space-y-0.5 w-15">
                <li>
                  <button className="w-full h-8 text-sm"  onClick={() => {
                      const cell = (menuState.rowIndex === 0
                        ? headers
                        : cells
                      ).find(
                        (c) =>
                          c.rowIndex === menuState.rowIndex &&
                          c.columnIndex === menuState.columnIndex
                      );
                      if (cell) {
                        handleCopyCell(cell);
                        setMenuState((prev) => ({ ...prev, visible: false })); // ✅ close the menu
                      }
                    }}>Copy</button>
                </li>
                <li>
                  <button className="w-full h-8 text-sm" onClick={() => {
                      const cell = (menuState.rowIndex === 0
                        ? headers
                        : cells
                      ).find(
                        (c) =>
                          c.rowIndex === menuState.rowIndex &&
                          c.columnIndex === menuState.columnIndex
                      );
                      if (cell) {
                        handlePasteCell(cell);
                        setMenuState((prev) => ({ ...prev, visible: false })); // ✅ close the menu
                      }
                    }}>Paste</button>
                </li>
                  {menuState.elementType === "A" ||
                  menuState.elementType === "IMG" ? (
                    <li>
                      <button className="w-full h-8 text-sm" onClick={() => handleMenuAction("clearData")}> Clear Data </button>
                    </li>
                  ) : null}
                  <li>
                    <button className="w-full h-8 text-sm" onClick={() => handleMenuAction("addRowAfter")}>Add Row</button>
                  </li>
                  <li>
                    {menuState.columnIndex === 1 ? (
                      <button className="w-full h-8 text-sm" onClick={() => handleMenuAction("addColumnBefore")}>Add Column Before</button>
                    ) : null}
                  </li>    
                  <li>
                    <button className="w-full h-8 text-sm" onClick={() => handleMenuAction("addColumnAfter")}>Add Column</button>
                  </li>
                  <li>
                    {(cells.length !== 0 && menuState.rowIndex !== 0) ||
                    (cells.length === 0 && menuState.rowIndex === 0) ? (
                      <button className="w-full h-8 text-sm bg-red-100 text-red-700" onClick={() => handleMenuAction("deleteRow")}>Delete Row</button>
                    ) : null}
                  </li>
                  <li>
                    <button className="w-full h-8 text-sm bg-red-100 text-red-700" onClick={() => handleMenuAction("deleteColumn")}>Delete Column</button>
                  </li>
                  <li>
                    <button className="w-full h-8 text-sm bg-red-100 text-red-700" onClick={() => handleMenuAction("deleteCell")}>Delete Cell</button>
                  </li>
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
