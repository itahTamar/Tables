// //!not working - I don't know were the problem 


// import { useContext } from "react";
// import { TableContext } from "../../context/tableContext";
// import { useAddTablesColumnsCell } from "./useAddColumnCell";
// import { useAddRowCells } from "./useAddRowCells";
// import {
//   useGetAllTablesCells,
//   useGetAllTablesColumns,
// } from "./useGetTablesHooks";

// interface AddColumnProp {
//   tableId: string;
// }

// //custom hook to initial an empty table with 5 columns and 3 rows
// export const useInitializeTable = ({ tableId }: AddColumnProp) => {
//   const addTableColumn = useAddTablesColumnsCell({ tableId });
//   const addTableRow = useAddRowCells({ tableId });
//   const tableContext = useContext(TableContext);
//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }
//   if (!tableId) {
//     throw new Error("no tableId in params");
//   }

//   const { tables, columns, cells } = tableContext;

//   const tableIndex = tables.find((e) => e._id === tableId)?.tableIndex;
//   console.log("At useInitializeTable the tableIndex is:", tableIndex);

//   if (!tableIndex) throw new Error("at useInitializeTable no tableIndex");

//   const getAllTablesCells = useGetAllTablesCells(tableIndex);
//   const getAllTablesColumns = useGetAllTablesColumns(tableIndex);

//   const fetchData = async () => {
//     try {
//       await getAllTablesCells();
//       await getAllTablesColumns();
//     } catch (error) {
//       console.error("Error useInitializeTable/fetching data:", error);
//     }
//   };
//   console.log("At useInitializeTable/fetchData columns:", columns);
//   console.log("At useInitializeTable/fetchData cells:", cells);

//   const initial = async () => {
//     let currentColumns = [...columns]; // Local copy of columns
//     let currentCells = [...cells]; // Local copy of cells
  
//     // Add columns if none exist
//     if (currentColumns.length === 0) {
//       for (let i = 0; i < 2; i++) {
//         await addTableColumn();
//         currentColumns = await getAllTablesColumns(); // Fetch updated columns
//         console.log("Updated columns after adding:", currentColumns);
//       }
//     }
  
//     // Add rows if none exist
//     if (currentCells.length === 0) {
//       for (let i = 0; i < 2; i++) {
//         await addTableRow();
//         currentCells = await getAllTablesCells(); // Fetch updated cells
//         console.log("Updated cells after adding:", currentCells);
//       }
//     }
//   };
  

//   return initial;
// };
