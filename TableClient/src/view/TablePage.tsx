import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlotTable from "../components/tables/PlotTable";
import SearchInTableCells from "../components/tables/SearchInTableCells";
import { ServerContext } from "../context/ServerUrlContext";
import { TableContext } from "../context/tableContext";
import { addNewColumnWithCells } from "../functions/table/column/addNewColumnWithCells";
import { DeleteColumnCells } from "../functions/table/column/deleteColumnCells";
import { addNewRow } from "../functions/table/row/addNewRow";
import { DeleteRowCells } from "../functions/table/row/deleteRowCells";
import { getAllTablesColumns } from "../functions/table/column/getAllTablesColumns";
import { getAllTablesCells } from "../functions/table/row/getAllTablesCells";
import SelectionMenu from "./../components/tables/SelectionMenu";
import { DocumentRestAPIMethods } from "../api/docApi";

function TablePage() {
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext);
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

  const tableName = tables.map((e) => (e._id === tableId ? e.tableName : null));
  const tableIndex = tables.find((e) => e._id === tableId)?.tableIndex;
  if (!tableIndex) throw new Error("no tableIndex in tablePage");
  console.log("At TablePage the tableIndex is:", tableIndex); //ok

  // Fetch columns and cells in useEffect
  useEffect(() => {
    const fetchColumnsAndCells = async () => {
      try {
        const fetchedColumns = await getAllTablesColumns({
          serverUrl,
          tableIndex,
        });
        const fetchedCells = await getAllTablesCells({ serverUrl, tableIndex });

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
      if (!target.closest(".table-container") && !target.closest(".selection-menu")) {
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
  }

  const handleRightClick = (
    event: React.MouseEvent,
    rowIndex: number,
    columnIndex: number
  ) => {
    setMenuState({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      rowIndex,
      columnIndex,
    });
  };

  const handleBackBtnClicked = async () => {
    setColumns([]);
    setCells([]);
    navigate("/mainTablesPage");
  };

  const handleMenuAction = async (action: string) => {
    const { rowIndex, columnIndex } = menuState;
  
    if (action === "addRowAfter") {
      await handleAddRowBtnClick(false, rowIndex);
    } else if (action === "addRowBefore") {
      await handleAddRowBtnClick(true, rowIndex);
    } else if (action === "addColumnAfter") {
      await handleAddColumnBtnClicked(false, columnIndex);
    } else if (action === "addColumnBefore") {
      await handleAddColumnBtnClicked(true, columnIndex);
    } else if (action === "deleteRow") {
      await handleDeleteRowBtnClicked(rowIndex);
    } else if (action === "deleteColumn") {
      await handleDeleteColumnBtnClicked(columnIndex);
    }
  
    setMenuState({ ...menuState, visible: false }); // Close menu after action
  };
  
  const handleAddRowBtnClick = async (addBefore: boolean, currentRowIndex: number) => {
    const fetchAgain = await addNewRow({
      serverUrl,
      tableIndex,
      currentRowIndex, 
      columns,
      cells,
      addBefore,
    });
    setFetchAgain(fetchAgain);
  };

  const handleAddColumnBtnClicked = async (addBefore: boolean, currentColumnIndex:number) => {
    const fetchAgain = await addNewColumnWithCells({
      serverUrl,
      tableIndex,
      currentColumnIndex,
      columns,
      cells,
      addBefore,
    });
    //@ts-ignore
    setFetchAgain(fetchAgain);
  };

  const handleDeleteRowBtnClicked = async (currentRowIndex:number) => {
    try {
      const result = await DeleteRowCells({
        serverUrl,
        tableIndex,
        currentRowIndex,
        columns,
        cells,
      });

      if (result === undefined) {
        throw new Error("Result is undefined - delete row failed");
      }

      setFetchAgain(result);
    } catch (error) {
      console.error("Error handling delete row:", error);
    }
  };

  const handleDeleteColumnBtnClicked = async (currentColumnIndex: number) => {
    try {
      const result = await DeleteColumnCells({
        serverUrl,
        tableIndex,
        currentColumnIndex,
        columns,
        cells,
      });

      if (result === undefined) {
        throw new Error("Result is undefined - delete row failed");
      }

      setFetchAgain(result);
    } catch (error) {
      console.error("Error handling delete row:", error);
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-24">
        {/* Logout Button */}
        <button
          onClick={() => handleBackBtnClicked()}
          className="absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Back
        </button>
        <button className="absolute top-4 right-4" onClick={() => handleAddColumnBtnClicked(false, 0)} >
          Initial Column 
        </button>
      </header>

      <h1
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          handleTableRenameUpdate(e.currentTarget.textContent || "")
        }
      >{tableName}</h1>

      <SearchInTableCells tableIndex={tableIndex} />
      <div className="m-4"></div>
      <PlotTable handleRightClick={handleRightClick} />
      {menuState.visible && (
        <SelectionMenu x={menuState.x} y={menuState.y}>
          <ul className="list-none space-y-2"> {/* Add styling here */}
            <li>
              <button onClick={() => handleMenuAction("addRowAfter")}>Add Row After</button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("addRowBefore")}>Add Row Before</button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("addColumnAfter")}>Add Column After</button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("addColumnBefore")}>Add Column Before</button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("deleteRow")}>Delete Row</button>
            </li>
            <li>
              <button onClick={() => handleMenuAction("deleteColumn")}>Delete Column</button>
            </li>
          </ul>
        </SelectionMenu>
      )}
    </div>
  );
}

export default TablePage;
