import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlotTable from "../components/tables/PlotTable";
import SearchInTableCells from "../components/tables/SearchInTableCells";
import { ServerContext } from "../context/ServerUrlContext";
import { TableContext } from "../context/tableContext";
import { addNewColumnWithCells } from "../functions/table/column/addNewColumnWithCells";
import { DeleteColumnCells } from "../functions/table/column/deleteColumnCells";
import { addNewRowCells } from "../functions/table/row/addNewRow";
import { DeleteRowCells } from "../functions/table/row/deleteRowCells";
import { getAllTablesColumns } from "../functions/table/column/getAllTablesColumns";
import { getAllTablesCells } from "../functions/table/row/getAllTablesCells";

function TablePage() {
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext);
  const { tableId } = useParams();
  const [fetchAgain, setFetchAgain] = useState(false);
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

  const handleBackBtnClicked = async () => {
    setColumns([]);
    setCells([]);
    navigate("/mainTablesPage");
  };

  const handleAddRowBtnClick = async (addBefore: boolean) => {
    const fetchAgain = await addNewRowCells({
      serverUrl,
      tableIndex,
      currentRowIndex: 1, //!change
      columns,
      cells,
      addBefore,
    });
    setFetchAgain(fetchAgain);
  };

  const handleAddColumnBtnClicked = async (addBefore: boolean) => {
    const fetchAgain = await addNewColumnWithCells({
      serverUrl,
      tableIndex,
      currentColumnIndex: 1, //!change
      columns,
      cells,
      addBefore
    });
    //@ts-ignore
    setFetchAgain(fetchAgain);
  };

  const handleDeleteRowBtnClicked = async () => {
    try {
      const result = await DeleteRowCells({
        serverUrl,
        tableIndex,
        currentRowIndex: 3, //!change
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

  const handleDeleteColumnBtnClicked = async () => {
    try {
      const result = await DeleteColumnCells({
        serverUrl,
        tableIndex,
        currentColumnIndex: 1, //!change 
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
      </header>

      <h1>{tableName}</h1>
      <SearchInTableCells tableIndex={tableIndex} />
      <div className="flex flex-row mb-24">
        <button onClick={() => handleAddRowBtnClick(false)}>Add Row After</button>
        <button onClick={() => handleAddRowBtnClick(true)}>Add Row Before</button>
        <button onClick={() => handleAddColumnBtnClicked(false)}>Add Column After</button>
        <button onClick={() => handleAddColumnBtnClicked(true)}>Add Column Before</button>
        <button onClick={() => handleDeleteRowBtnClicked()}>Delete Row</button>
        <button onClick={() => handleDeleteColumnBtnClicked()}>Delete Column</button>
      </div>

      <PlotTable />
    </div>
  );
}

export default TablePage;
