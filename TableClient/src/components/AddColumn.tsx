import { useContext, useState } from "react";
import { ServerContext } from "../context/ServerUrlContext";
import { TableContext } from "../context/tableContext";
import { DocumentAPIWrapper } from "../api/docApi";
import { useGetAllTablesColumns } from "./useGetComponents";

interface AddColumnProp {
    tableId: string,
}
//add one column cell to table collection
const AddTablesColumn: React.FC<AddColumnProp> = ({tableId}) =>  {
  const serverUrl = useContext(ServerContext);
  const [message, setMessage] = useState<string>("");
  const getAllTablesColumns = useGetAllTablesColumns();
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { tables, columns } = tableContext;
  
  const currentTableIndex = tables.find((e) => {
    return e._id===tableId ? e.tableIndex : null
  })
  if(currentTableIndex===null) throw new Error("At AddTablesColumn, no table index found");
  
  const handleAddTablesColumn = async () => {
    
    //last column index
    const maxColumnIndexValue = columns.reduce((max, current) => {
      return current.columnIndex > max ? current.columnIndex : max;
    }, 0);

    const success = await DocumentAPIWrapper.add(serverUrl, "tables", {
      type: "column",
      data: " ",
      columnIndex: maxColumnIndexValue+1,
      rowIndex: 0,
      tableIndex: currentTableIndex
    });

    if (success) {
      setMessage("Column added successfully!");
      await getAllTablesColumns();
    } else {
      setMessage("Failed to add Column.");
    }
  };

  return (
    <div className="add-table relative top-20">
     
      <button onClick={handleAddTablesColumn} className="add-button">
        Add column cell
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
  }

 export default AddTablesColumn;
  