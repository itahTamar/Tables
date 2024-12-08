import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TableContext } from "../context/tableContext";
import AddTablesColumn from "./../components/AddColumn";

function TablePage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
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

      <AddTablesColumn tableId={tableId} />
    </div>
  );
}

export default TablePage;
