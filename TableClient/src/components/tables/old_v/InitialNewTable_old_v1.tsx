// import { useContext, useState } from "react";
// import { ServerContext } from "../../context/ServerUrlContext";
// import { TableContext } from "../../context/tableContext";
// import { addOneNewCellsTypeColumn } from "../../functions/table/column/addOneNewColumnsTypeColumn";
// import { addNewRow } from "../../functions/table/row/old_v/addNewRow_old_v";
// import "../../style/buttons.css";
// import { getAllTablesColumns } from "../../functions/table/column/getAllTablesColumns";
// import { getAllTablesCells } from "../../functions/table/row/getAllTablesCells";

// interface InitialNewTableProps {
//   onClose: () => void;
//   tableId: string;
//   tableIndex: number;
// }

// const InitialNewTable: React.FC<InitialNewTableProps> = ({
//   onClose,
//   tableId,
//   tableIndex,
// }) => {
//   const [rowsNo, setRowsNo] = useState<number>(1);
//   const [columnsNo, setColumnsNo] = useState<number>(1);
//   const [message, setMessage] = useState<string>("");
//   const serverUrl = useContext(ServerContext);
//   const tableContext = useContext(TableContext);

//   if (!tableContext) {
//     throw new Error("TableContext must be used within a TableProvider");
//   }

//   if (!tableId || !tableIndex) {
//     setMessage("Invalid tableId or tableIndex");
//     return null; // Ensure the component returns null in invalid cases
//   }

//   console.log("InitialNewTable received tableId:", tableId);
//   console.log("InitialNewTable received tableIndex:", tableIndex);

//   const {cells, setCells, columns, setColumns } = tableContext;
//   // const { columns,  setColumns,cells, setCells } = tableContext;

//   const handleInitial = async (event: React.FormEvent) => {
//     event.preventDefault(); // Prevent form from reloading the page
//     console.log("InitialNewTable handleInitial");
//     onClose();

//     if (rowsNo <= 0 || columnsNo <= 0) {
//       setMessage("Please fill in valid numbers for rows and columns.");
//       return;
//     }

//     if (columns.length > 0 || cells.length > 0) {
//       setMessage("The table is already initialized");
//       return;
//     }

//     try {
//       console.log("Starting to add columns:", columnsNo);

//       let localColumns = [...columns]; // Use a local variable to manage columns
//       let localCells = [...cells]; // Use a local variable to manage cells of rows
//       let localAccepted = false; // Local success flag

//       for (let columnIndexToInsert = 1; columnIndexToInsert <= columnsNo; columnIndexToInsert++) {
//         console.log("Adding column:", columnIndexToInsert);

//         const success = await addOneNewCellsTypeColumn({
//           serverUrl,
//           tableId,
//           tableIndex,
//           columnIndexToInsert,
//         });

//         if (!success) {
//           console.error("Failed to create column:", columnIndexToInsert);
//           return; // Stop if any column fails
//         }

//         const fetchedColumns = await getAllTablesColumns({
//           serverUrl,
//           tableId,
//           tableIndex,
//         });

//         if (!fetchedColumns) {
//           throw new Error("Failed to fetch columns");
//         }

//         localColumns = fetchedColumns;
//         localAccepted = true; // Mark success
//         console.log("Fetched columns after addition:", localColumns);
//       }

//       // Update React state after column addition
//       setColumns(localColumns);

//       console.log("localColumns length after addition:", localColumns.length);
//       console.log("localAccepted is:", localAccepted);

//       if (localAccepted) {
//         console.log("Starting to add rows:", rowsNo);

//         for (let rowIndex = 1; rowIndex <= rowsNo; rowIndex++) {
//           console.log("Adding row:", rowIndex);

//           const success = await addNewRow({
//             serverUrl,
//             tableId,
//             tableIndex,
//             currentRowIndex: 0,
//             columns: localColumns,
//             cells: localCells,
//             addBefore: false,
//           });

//           if (!success) {
//             console.error("Row addition failed at index:", rowIndex);
//             break;
//           }

//           const fetchedCells = await getAllTablesCells({
//             serverUrl,
//             tableIndex,
//             tableId,
//           });

//           if (!fetchedCells) {
//             throw new Error("Failed to fetch cells");
//           }

//           setCells(fetchedCells);
//           console.log("Fetched cells after row addition:", fetchedCells);
//           localCells = fetchedCells
//         }
//       }

//       setMessage("Table successfully initialized!");
//     } catch (error) {
//       console.error("Error in handleInitial:", error);
//       setMessage("An error occurred while initializing the table.");
//     }
//   };

//   return (
//     <div>
//       <form className="relative top-24" onSubmit={handleInitial}>
//         <div>
//           <label>Rows</label>
//           <input
//             type="number"
//             placeholder="Rows"
//             value={rowsNo}
//             onChange={(ev) => setRowsNo(Math.max((parseInt(ev.target.value)),1))}
//             className="border border-black m-2 rounded-2xl indent-4"
//           />
//         </div>
//         <div>
//           <label>Columns</label>
//           <input
//             type="number"
//             placeholder="Columns"
//             value={columnsNo}
//             onChange={(ev) => setColumnsNo(Math.max((parseInt(ev.target.value)),1))}
//             className="border border-black m-2 rounded-2xl indent-4"
//           />
//         </div>
//         <button type="submit" className="add-button">
//           Create
//         </button>

//         {message && <p className="message">{message}</p>}
//       </form>
//     </div>
//   );
// };

// export default InitialNewTable;
// //work ok