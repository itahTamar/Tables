import { useContext, useState } from "react";
import { addNewTable, fetchTables } from "../api/tablesApi"; // Import the API function
import { ServerContext } from "../context/ServerUrlContext";
import '../style/buttons.css'
import { TableContext } from "../context/tableContext";

interface AddTableProps {
    onClose: () => void;
  }

const AddNewTable: React.FC<AddTableProps> = ({ onClose }) => {
  const [tableSubject, setTableSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const serverUrl = useContext(ServerContext);
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { setTables } = tableContext
  const handleAddTable = async () => {
    if (!tableSubject) {
      setMessage("Please fill in both fields.");
      return;
    }

    const handleGetAllUserTables = async () => {
        try {
          const tablesData = await fetchTables(serverUrl);
          if (!tablesData) throw new Error("No tables found.");
          setTables(tablesData);
        } catch (error) {
          console.error("Error fetching user tables:", error);
        }
      };

    const success = await addNewTable(serverUrl, tableSubject);
    if (success) {
      setMessage("Table added successfully!");
      setTableSubject("");
      handleGetAllUserTables()
      onClose()
    } else {
      setMessage("Failed to add table.");
    }
  };

  return (
    <div className="add-table relative top-20">
      <input
        type="text"
        placeholder="Table Name/Subject"
        value={tableSubject}
        onChange={(e) => setTableSubject(e.target.value)}
        className="border border-black m-2 rounded-2xl w-50 indent-4"
      />

      <button onClick={handleAddTable} className="add-button">
        ADD
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddNewTable;
