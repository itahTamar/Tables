// import { useContext } from "react";
// import { DocumentRestAPIMethods } from "../../api/docApi";
// import { ServerContext } from "../../context/ServerUrlContext";
// import { TableContext } from "../../context/tableContext";
// import { useGetAllTablesCells } from "../../hooks/tables/useGetTablesHooks";

// interface AddCellProp {
//   tableId: string;
// }
// //add cells type to build a row
// const AddNewTablesRow: React.FC<AddCellProp> = ({ tableId }) => {
//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);
//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }
//   const { tables, columns, cells } = tableContext;

//   const currentTable = tables.find((e) => e._id === tableId);
//   if (currentTable === undefined)
//     throw new Error("At AddNewTablesRow, no table index found");
//   const currentTableIndex = currentTable.tableIndex;
//   const getAllTablesCells = useGetAllTablesCells(currentTableIndex);

//   //last column index
//   const maxColumnIndexValue = columns.reduce((max, current) => {
//     return current.columnIndex > max ? current.columnIndex : max;
//   }, 0);

//   //last row index
//   const maxRowIndexValue = cells.reduce((max, current) => {
//     return current.rowIndex > max ? current.rowIndex : max;
//   }, 0);

//   console.log("At AddTablesRowCells the currentTableIndex:", currentTableIndex);
//   console.log("At AddTablesRowCells the maxRowIndexValue:", maxRowIndexValue);
//   console.log(
//     "At AddTablesRowCells the maxColumnIndexValue:",
//     maxColumnIndexValue
//   );

//   const handleAddTablesCell = async () => {
//     let i = 1;
//     while (i <= maxColumnIndexValue) {
//       try {
//         const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
//         type: "cell",
//         data: null,
//         columnIndex: i,
//         rowIndex: maxRowIndexValue + 1,
//         tableIndex: currentTableIndex,
//       });
//       if (success) {
//         console.log("Cell added successfully!");
//         }
//       } catch (error) {
//         console.error("Failed to add Cell");
//       }
//       i++;
//     }
//     await getAllTablesCells();
//   };

//   return (
//     <div className="add-table relative top-20">
//       <button onClick={handleAddTablesCell} className="add-button">
//         Add row cells
//       </button>
//     </div>
//   );
// };

// export default AddNewTablesRow;
