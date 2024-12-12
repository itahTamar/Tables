import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddNewTablesRow from "../components/AddNewRow";
import {
  useGetAllTablesCells,
  useGetAllTablesColumns,
} from "../components/useGetComponents";
import { TableContext } from "../context/tableContext";
import AddNewTablesColumn from "../components/AddNewColumn";
import NewTableData from "../components/NewTableData";

function TablePage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const getAllTablesCells = useGetAllTablesCells();
  const getAllTablesColumns = useGetAllTablesColumns();

  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  if (!tableId) {
    throw new Error("no tableId in params");
  }

  const { tables } = tableContext;
  const tableName = tables.map((e) => {
    return e._id === tableId ? e.tableName : null;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllTablesCells();
        await getAllTablesColumns();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <header className="flex justify-between items-center mb-24">
        {/* Logout Button */}
        <button
          onClick={() => navigate("/mainTablesPage")}
          className="absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Back
        </button>
      </header>

      <h1>{tableName}</h1>
      <div className="flex flex-row mb-24">
        <AddNewTablesRow tableId={tableId} />

        <AddNewTablesColumn tableId={tableId} />
      </div>

      <NewTableData/>
    </div>
  );
}

export default TablePage;
