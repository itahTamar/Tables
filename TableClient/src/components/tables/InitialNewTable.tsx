import { useContext, useState } from "react";
import { TablesContext } from "../../context/tableContext";
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
  onTableCreated: () => void;
}

const InitialNewTable: React.FC<InitialNewTableProps> = ({
  onClose,
  tableId,
  tableIndex,
  onTableCreated,
}) => {
  const serverUrl = useContext(ServerContext);
  const [rowsNo, setRowsNo] = useState<number>(1);
  const [columnsNo, setColumnsNo] = useState<number>(1);
  const [message, setMessage] = useState<string>("");
  const tableContext = useContext(TablesContext);

  if (!tableContext) {
    throw new Error("TablesContext must be used within a TableProvider");
  }

  if (!tableId || !tableIndex) {
    setMessage("Invalid tableId or tableIndex");
    return null; // Ensure the component returns null in invalid cases
  }

  const { cells, setCells, headers, setHeaders, setRowIndexesDisplayArr, setColIndexesDisplayArr, setNumOfColumns, setNumOfRows } = tableContext;

  const handleInitial = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from reloading the page
    console.log("InitialNewTable handleInitial");

    if (rowsNo <= 0 || columnsNo <= 0) {
      setMessage("Please fill in valid numbers for rows and headers.");
      return;
    }

    if (headers.length > 0 || cells.length > 0) {
      setMessage("The table is already initialized");
      return;
    }

    try {
      console.log(`InitialNewTable.tsx: Starting to add ${columnsNo} column's type cells`);

      // Create new Header's type cells based on columnsNo
      const newHeaders: CellData[] = Array.from(
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
      console.log(`InitialNewTable.tsx: columnsNo =`, newHeaders);
      
      const newCells: CellData[] = Array.from(
        { length: rowsNo * columnsNo },  // Total length: rows * columns
        (_, index) => {
          const rowIndex = Math.floor(index / columnsNo) + 1;  // Determine row based on index
          const columnIndex = (index % columnsNo) + 1;             // Determine column based on index
          
          return {
            _id: generateObjectId(),
            type: "cell",
            data: null,
            visibility: true,
            rowIndex: rowIndex,
            columnIndex: columnIndex,
            tableIndex: tableIndex,
            tableId: tableId,
            __v: 0,
          };
        }
      );

      const addToDB = [...newHeaders, ...newCells];
      handleAddToDB(addToDB, serverUrl);

      setHeaders(newHeaders);
      setCells(newCells);
      setRowIndexesDisplayArr(Array.from({ length: rowsNo }, (_, index) => index + 1));
      setColIndexesDisplayArr(Array.from({ length: columnsNo }, (_, index) => index + 1));
      setNumOfColumns(columnsNo);
      setNumOfRows(rowsNo)
      onTableCreated();
      onClose();
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
