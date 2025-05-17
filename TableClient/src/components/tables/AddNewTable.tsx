import { useContext, useState } from "react";
import { ServerContext } from "../../context/ServerUrlContext";
import "../../style/buttons.css";
import { TablesContext } from "../../context/tableContext";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { useGetAllUserTables } from "../../hooks/tables/useGetTablesHooks";

interface AddTableProps {
  onClose: () => void;
}
 //add one table cell to table collection
const AddNewTable: React.FC<AddTableProps> = ({ onClose }) => {
  const [tableSubject, setTableSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const serverUrl = useContext(ServerContext);
  const getAllUserTables = useGetAllUserTables();
  const tableContext = useContext(TablesContext);
  if (!tableContext) {
    throw new Error("TablesContext must be used within a TableProvider");
  }
  const { tables } = tableContext;
  if (tables === undefined) throw new Error("at MainTablePage tables are undefine");

  const handleAddTable = async () => {
    if (!tableSubject) {
      setMessage("Please fill the field.");
      return;
    }

    //fine last (max) table index
    // const maxTableIndexValue = tables.reduce((max, current) => {
    //   return current.tableIndex > max ? current.tableIndex : max;
    // }, 0);

    // console.log("At handleAddTable the maxTableIndexValue is:", maxTableIndexValue)

    const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
      type: "table",
      tableName: tableSubject,
      visibility: true,
      // tableIndex: maxTableIndexValue + 1,
      rowNumber: 0,
      columnNumber: 0,
      users: [] 
    }, "addNewUsersTable");

    if (success) {
      setMessage("Table added successfully!");
      setTableSubject("");
      await getAllUserTables();
      onClose();
    } else {
      setMessage("Failed to add table.");
    }
  };

  return (
    <div className="add-table relative top-20">
      <input
        type="text"
        placeholder="Table Name"
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
//work ok