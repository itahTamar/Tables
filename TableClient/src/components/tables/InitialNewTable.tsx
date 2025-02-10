import { useContext, useState } from "react";
import { TableContext } from "../../context/tableContext";
import {
  addNewRow,
  generateObjectId,
} from "../../functions/table/row/addNewRow";
import "../../style/buttons.css";
import { CellData } from "../../types/cellType";
import { handleAddToDB } from "../../functions/dbHandler/handleAddToDB";
import { ServerContext } from "../../context/ServerUrlContext";

interface InitialNewTableProps {
  onClose: () => void;
  tableId: string;
  tableIndex: number;
}

const InitialNewTable: React.FC<InitialNewTableProps> = ({
  onClose,
  tableId,
  tableIndex,
}) => {
  const serverUrl = useContext(ServerContext);
  const [rowsNo, setRowsNo] = useState<number>(1);
  const [columnsNo, setColumnsNo] = useState<number>(1);
  const [message, setMessage] = useState<string>("");
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }

  if (!tableId || !tableIndex) {
    setMessage("Invalid tableId or tableIndex");
    return null; // Ensure the component returns null in invalid cases
  }

  console.log("InitialNewTable received tableId:", tableId);
  console.log("InitialNewTable received tableIndex:", tableIndex);

  const { cells, setCells, columns, setColumns, setRowIndexesArr } =
    tableContext;
  // const { columns,  setColumns,cells, setCells } = tableContext;

  const handleInitial = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from reloading the page
    console.log("InitialNewTable handleInitial");
    onClose();

    if (rowsNo <= 0 || columnsNo <= 0) {
      setMessage("Please fill in valid numbers for rows and columns.");
      return;
    }

    if (columns.length > 0 || cells.length > 0) {
      setMessage("The table is already initialized");
      return;
    }

    try {
      console.log(`Starting to add ${columnsNo} column's type cells`);

      // Create new column's type cells based on columnsNo
      const newColumnCells: CellData[] = Array.from(
        { length: columnsNo },
        (_, columnIndex) => ({
          //columnIndex by default of "Array.from" start from 0
          _id: generateObjectId(), // Placeholder function to generate a unique ID
          type: "column",
          data: null,
          visibility: true,
          rowIndex: 0,
          columnIndex: columnIndex + 1,
          tableIndex: tableIndex,
          tableId: tableId,
          __v: 0,
        })
      );
      console.log("New column's type Cells array:", newColumnCells);
      
      console.log(`Starting to add ${rowsNo * columnsNo} row's type cells`);
      const newRowIndexesArr = [];
      const newRowsCells = [];
      for (let rowIndex = 0; rowIndex < rowsNo; rowIndex++) {
        console.log("Adding row:", rowIndex+1);
        const newCellsAfterAddingRow = await addNewRow({
          tableId,
          tableIndex,
          currentRowIndex: rowIndex,
          numOfColumns: columnsNo,
          cells,
          rowIndexesArr: [],
          addBefore: false,
        });
        newRowsCells.push(...newCellsAfterAddingRow.newCellsArray); // Append the new cells to the result array
        newRowIndexesArr.push(...newCellsAfterAddingRow.updatedRowIndexesArr);
      }

      console.log("New rows's Cells array:", newRowsCells);
      const addToDB = [...newColumnCells, ...newRowsCells];
      handleAddToDB(addToDB, serverUrl);

      setColumns(newColumnCells);
      setCells(newRowsCells);
      setRowIndexesArr([...new Set(newRowIndexesArr)]);
    } catch (error) {
      console.error("Error in handleInitial:", error);
      setMessage("An error occurred while initializing the table.");
    }
  };

  return (
    <div>
      <form className="relative top-24" onSubmit={handleInitial}>
        <div>
          <label>Rows</label>
          <input
            type="number"
            placeholder="Rows"
            value={rowsNo}
            onChange={(ev) => setRowsNo(Math.max(parseInt(ev.target.value), 1))}
            className="border border-black m-2 rounded-2xl indent-4"
          />
        </div>
        <div>
          <label>Columns</label>
          <input
            type="number"
            placeholder="Columns"
            value={columnsNo}
            onChange={(ev) =>
              setColumnsNo(Math.max(parseInt(ev.target.value), 1))
            }
            className="border border-black m-2 rounded-2xl indent-4"
          />
        </div>
        <button type="submit" className="add-button">
          Create
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default InitialNewTable;
//work ok
