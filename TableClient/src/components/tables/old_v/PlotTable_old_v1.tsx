// import React, { useContext, useEffect, useState } from "react";
// import { TableContext } from "../../../context/tableContext";
// import "../../style/tables/tableData.css";
// import { CellData } from "../../../types/cellType";

// interface PlotTableProps {
//   handleRightClick: (
//     event: React.MouseEvent,
//     rowIndex: number,
//     columnIndex: number
//   ) => boolean;
//   handleCellUpdate: (
//     cell: CellData,
//     newData: any,
//     prevData: any
//   ) => Promise<void>;
//   isSearch: boolean;
// }

// const PlotTable: React.FC<PlotTableProps> = ({
//   handleRightClick,
//   handleCellUpdate,
//   isSearch,
// }) => {
//   const tableContext = useContext(TableContext);
//   if (!tableContext) {
//     throw new Error("TablePage must be used within a TableProvider");
//   }
//   const { columns, cells } = tableContext;
//   // const { columns, cells, searchCells } = tableContext;
//   const [sortedColumns, setSortedColumns] = useState(columns || []);
//   const [sortedRows, setSortedRows] = useState<CellData[][]>([]);
//   const [rightClickFlag, setRightClickFlag] = useState(false); // Use React state instead of ref

//   const handleRightClickWithFlag = (
//     e: React.MouseEvent,
//     rowIndex: number,
//     columnIndex: number
//   ) => {
//     e.preventDefault();
//     setRightClickFlag(true); // Set flag to true
//     const target = e.target as HTMLElement;
//     if (target.tagName === "A" || target.tagName === "IMG") {
//       handleRightClick(e, rowIndex, columnIndex);
//     }
//     const success = handleRightClick(e, rowIndex, columnIndex); // Call the prop function
//     console.log(
//       "at handleRightClickWithFlag after handleRightClick rightClickFlag:",
//       rightClickFlag
//     );
//     console.log(
//       "at handleRightClickWithFlag after handleRightClick success:",
//       success
//     );
//     // Reset the flag based on the result
//     if (success) {
//       setRightClickFlag(false);
//     } else {
//       console.error("handleRightClick encountered an issue.");
//     }
//   };

//   //sort the columns array
//   useEffect(() => {
//     if (columns) {
//       const sorted = [...columns].sort((a, b) => a.columnIndex - b.columnIndex);
//       setSortedColumns(sorted);
//     }
//   }, [columns]);

//   //sort the table rows
//   useEffect(() => {
//     //in search mode
//     if (isSearch) {
//       const rows = searchCells.reduce<Record<number, CellData[]>>((acc, cell) => {
//         acc[cell.rowIndex] = acc[cell.rowIndex] || [];
//         acc[cell.rowIndex].push(cell);
//         return acc;
//       }, {});
//       const sortTheRows = Object.keys(rows)
//         .map(Number)
//         .sort((a, b) => a - b)
//         .map(
//           (rowIndex) =>
//             rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || []
//         );
//       setSortedRows(sortTheRows);
//     } else {
//       //in regular mode
//       const rows = cells.reduce<Record<number, CellData[]>>((acc, cell) => {
//         acc[cell.rowIndex] = acc[cell.rowIndex] || [];
//         acc[cell.rowIndex].push(cell);
//         return acc;
//       }, {});
//       const sortTheRows = Object.keys(rows)
//         .map(Number)
//         .sort((a, b) => a - b)
//         .map(
//           (rowIndex) =>
//             rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || []
//         );
//       setSortedRows(sortTheRows);
//     }
//   }, [cells, searchCells, isSearch]);

//   useEffect(() => {
//     console.log("PlotTable cells:", cells);
//     console.log("PlotTable searchCells:", searchCells);
//     console.log("PlotTable columns:", columns);
//   }, [cells, columns]);

//   return (
//     <div className="table-container">
//       <table className="table-auto border-collapse border border-gray-400 w-full text-center">
//         <thead>
//           <tr>
//             {sortedColumns.map((column) => (
//               <th
//                 key={column._id}
//                 className="border border-gray-400"
//                 contentEditable
//                 suppressContentEditableWarning
//                 onBlur={(e) => {
//                   if (!rightClickFlag) {
//                     handleCellUpdate(
//                       column,
//                       e.currentTarget.textContent || "",
//                       column.data
//                     );
//                   }
//                 }}
//                 onContextMenu={(e) =>
//                   handleRightClickWithFlag(
//                     e,
//                     column.rowIndex,
//                     column.columnIndex
//                   )
//                 }
//               >
//                 {column.data}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {sortedRows.map((row, rowIndex) => (
//             <tr key={`row-${rowIndex}`}>
//               {row.map((cell) => (
//                 <td
//                   key={cell._id}
//                   className="border border-gray-400 h-auto"
//                   onContextMenu={(e) =>
//                     handleRightClickWithFlag(e, cell.rowIndex, cell.columnIndex)
//                   }
//                 >
//                   {cell.data && cell.data.startsWith("data:image") ? (
//                     <img
//                       src={cell.data}
//                       alt="Pasted Image"
//                       className="max-w-full"
//                       onContextMenu={(e) =>
//                         handleRightClickWithFlag(
//                           e,
//                           cell.rowIndex,
//                           cell.columnIndex
//                         )
//                       }
//                     />
//                   ) : cell.data && cell.data.startsWith("http") ? (
//                     <a
//                       href={cell.data}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-500 hover:underline"
//                       onContextMenu={(e) =>
//                         handleRightClickWithFlag(
//                           e,
//                           cell.rowIndex,
//                           cell.columnIndex
//                         )
//                       }
//                     >
//                       {cell.data}
//                     </a>
//                   ) : (
//                     <textarea
//                       className="plotTableTextarea w-full h-26"
//                       defaultValue={cell.data}
//                       onBlur={(e) => {
//                         if (!rightClickFlag) {
//                           console.log("cell.data=", cell.data);
//                           handleCellUpdate(
//                             cell,
//                             e.currentTarget.value,
//                             cell.data
//                           );
//                         }
//                       }}
//                     />
//                   )}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PlotTable;
