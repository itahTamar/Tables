// import { useContext } from "react";
// import { DocumentRestAPIMethods } from "../../api/docApi";
// import { ServerContext } from "../../context/ServerUrlContext";
// import { TableContext } from "../../context/tableContext";
// import { useGetAllTablesColumns } from "./useGetTablesHooks";

// interface AddColumnProp {
//   tableId: string;
// }
// //custom hook to add only one column type cell to table collection
// export const useAddTablesColumnsCell = ({ tableId }: AddColumnProp) => {
//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);

//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }

//   const { tables, columns } = tableContext;

//   const currentTable = tables.find((e) => e._id === tableId);
//   if (!currentTable)
//     throw new Error("At useAddTablesColumnsCell, no table index found");

//   const currentTableIndex = currentTable.tableIndex;
//   console.log("At useAddTablesColumnsCell the currentTableIndex:", currentTableIndex);
  
//   const getAllTablesColumns = useGetAllTablesColumns(currentTableIndex);

//   const addTablesColumnsCell = async () => {
//     console.log("At addTablesColumnsCell the columns:", columns);
    
//     //find the last (max) column index
//     const maxColumnIndexValue = columns.reduce((max, current) => {
//       return current.columnIndex > max ? current.columnIndex : max;
//     }, 0);

//     console.log(
//       "At addTablesColumnsCell the maxColumnIndexValue:",
//       maxColumnIndexValue
//     );

//     const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
//       type: "column",
//       data: " ",
//       columnIndex: maxColumnIndexValue + 1,
//       rowIndex: 0,
//       tableIndex: currentTableIndex,
//     });

//     if (success) {
//       console.log("Column added successfully!");
//       await getAllTablesColumns();
//     } else {
//       console.log("Failed to add Column.");
//     }
//   };

//   return addTablesColumnsCell;
// }; //work ok
