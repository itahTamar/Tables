// tableContext.tsx - contain all user's table fetched from DB
import React, { createContext, ReactNode, useState } from "react";
import { CellData } from "../types/cellType";
import { TableData } from "../types/tableType"; // Import the TableData type
interface TableContextType {
  tables: TableData[] ; // Define as an array of TableData
  setTables: React.Dispatch<React.SetStateAction<TableData[]>> ;
  columns: CellData[];
  setColumns: (columns: CellData[] | ((prev: CellData[]) => CellData[])) => void; // Allow updater function
  cells: CellData[]; //all table document row&column cells
  setCells: (cells: CellData[] | ((prev: CellData[]) => CellData[])) => void;
  rowIndexesArr: number[];
  setRowIndexesArr: (indexesArr: number[] | ((prev: number[]) => number[])) => void;
  numOfColumns: number;
  setNumOfColumns: (numOfColumns: number | ((prev: number) => number)) => void;
  numOfRows: number;
  setNumOfRows: (numOfRows: number | ((prev: number) => number)) => void;
  checkedColumns: number[];
  setCheckedColumns: (checkedColumns: number[] | ((prev: number[]) => number[])) => void;
  tablesFetched:boolean;
  setTablesFetched:(tablesFetched: boolean | ((prev: boolean) => boolean)) => void
}

export const TableContext = createContext<TableContextType | null>(null);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableData[]>([]); // Initialize as an empty array
  const [columns, setColumns] = useState<CellData[]>([])
  const [cells, setCells] = useState<CellData[]>([])
  const [rowIndexesArr, setRowIndexesArr] = useState<number[]>([])
  const [numOfRows, setNumOfRows] = useState<number>(1)
  const [numOfColumns, setNumOfColumns] = useState<number>(1)
  const [checkedColumns, setCheckedColumns] = useState<number[]>([])
  const [tablesFetched, setTablesFetched] = useState(false);

  return (
    <TableContext.Provider 
          value={{ tables, setTables, 
          columns, setColumns, 
          cells, setCells, 
          numOfRows, setNumOfRows,
          numOfColumns, setNumOfColumns,
          rowIndexesArr, setRowIndexesArr,
          checkedColumns, setCheckedColumns,
          tablesFetched, setTablesFetched,
          }}>
      {children}
    </TableContext.Provider>
  );
};


