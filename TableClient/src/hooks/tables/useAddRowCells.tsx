// import { useContext } from "react";
// import { ServerContext } from "../../context/ServerUrlContext";
// import { TableContext } from "../../context/tableContext";
// import { useGetAllTablesCells } from "./useGetTablesHooks";
// import { DocumentRestAPIMethods } from "../../api/docApi";

// interface AddRowProp {
//   tableIndex: number;
// }

// //custom hook to add one row to the table, row-cell will be cording to the number of columns
// export const useAddRowCells = ({ tableIndex }: AddRowProp) => {
//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);
//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }
//   const { columns, cells } = tableContext;

//   const getAllTablesCells = useGetAllTablesCells(tableIndex);

//   const handleAddRowCells = async () => {
//     //find last (max) column index
//     const maxColumnIndexValue = columns.reduce((max, current) => {
//       return current.columnIndex > max ? current.columnIndex : max;
//     }, 0);

//     //find last (max) row index
//     const maxRowIndexValue = cells.reduce((max, current) => {
//       return current.rowIndex > max ? current.rowIndex : max;
//     }, 0);

//     console.log("At useAddRowCells the tableIndex:", tableIndex);
//     console.log("At useAddRowCells the maxRowIndexValue:", maxRowIndexValue);
//     console.log(
//       "At useAddRowCells the maxColumnIndexValue:",
//       maxColumnIndexValue
//     );

//     console.log("At useAddRowCells addRowCell:");
//     let i = 1;
//     while (i <= maxColumnIndexValue) {
//       try {
//         const success = await DocumentRestAPIMethods.add(serverUrl, "tables", {
//           type: "cell",
//           data: null,
//           columnIndex: i,
//           rowIndex: maxRowIndexValue + 1,
//           tableIndex: tableIndex,
//         });
//         if (success) {
//           console.log("Cell added successfully!");
//           await getAllTablesCells();
//         } else {
//           console.log("Failed to add Cell.");
//         }
//       } catch (error) {
//         console.error("Failed to add Cell");
//       }
//       i++;
//     }
    
//   };

//   return handleAddRowCells;
// };
