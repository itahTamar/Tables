// tableContext.tsx - contain all user's table fetched from DB
import React, { createContext, ReactNode, useState } from "react";
import { CellData } from "../types/cellType";
import { TableData } from "../types/tableType"; // Import the TableData type
interface TableContextType {
  tables: TableData[] ; // Define as an array of TableData
  setTables: React.Dispatch<React.SetStateAction<TableData[]>> ;
  headers: CellData[];
  setHeaders: (headers: CellData[] | ((prev: CellData[]) => CellData[])) => void; // Allow updater function
  cells: CellData[]; //all table document row&column cells
  setCells: (cells: CellData[] | ((prev: CellData[]) => CellData[])) => void;
  rowIndexesDisplayArr: number[]; //The array of indexes of the rows you want to display.
  colIndexesDisplayArr: number[]; //The array of indexes of the rows you want to display.
  setRowIndexesDisplayArr: (indexesArr: number[] | ((prev: number[]) => number[])) => void;
  setColIndexesDisplayArr: (indexesArr: number[] | ((prev: number[]) => number[])) => void;
  numOfColumns: number;
  setNumOfColumns: (numOfColumns: number | ((prev: number) => number)) => void;
  numOfRows: number;
  setNumOfRows: (numOfRows: number | ((prev: number) => number)) => void;
  checkedColumns: number[];
  setCheckedColumns: (checkedColumns: number[] | ((prev: number[]) => number[])) => void;
  tablesFetched:boolean;
  setTablesFetched:(tablesFetched: boolean | ((prev: boolean) => boolean)) => void
}

export const TablesContext = createContext<TableContextType | null>(null);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableData[]>([]); // Initialize as an empty array
  const [headers, setHeaders] = useState<CellData[]>([])
  const [cells, setCells] = useState<CellData[]>([])
  const [rowIndexesDisplayArr, setRowIndexesDisplayArr] = useState<number[]>([])
  const [colIndexesDisplayArr, setColIndexesDisplayArr] = useState<number[]>([])
  const [numOfRows, setNumOfRows] = useState<number>(1)
  const [numOfColumns, setNumOfColumns] = useState<number>(1)
  const [checkedColumns, setCheckedColumns] = useState<number[]>([])
  const [tablesFetched, setTablesFetched] = useState(false);

  return (
    <TablesContext.Provider 
          value={{ tables, setTables, 
          headers, setHeaders, 
          cells, setCells, 
          numOfRows, setNumOfRows,
          numOfColumns, setNumOfColumns,
          rowIndexesDisplayArr, setRowIndexesDisplayArr,
          colIndexesDisplayArr, setColIndexesDisplayArr,
          checkedColumns, setCheckedColumns,
          tablesFetched, setTablesFetched,
          }}>
      {children}
    </TablesContext.Provider>
  );
};


