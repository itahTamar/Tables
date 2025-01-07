// tableContext.tsx - contain all user's table fetched from DB
import React, { createContext, ReactNode, useState } from "react";
import { TableData } from "../types/tableType"; // Import the TableData type
import { CellData } from "../types/cellType";

interface TableContextType {
  tables: TableData[]; // Define as an array of TableData
  setTables: React.Dispatch<React.SetStateAction<TableData[]>>;
  columns: CellData[];
  setColumns: (columns: CellData[] | ((prev: CellData[]) => CellData[])) => void; // Allow updater function
  cells: CellData[];
  setCells: (cells: CellData[] | ((prev: CellData[]) => CellData[])) => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableData[]>([]); // Initialize as an empty array
  const [columns, setColumns] = useState<CellData[]>([])
  const [cells, setCells] = useState<CellData[]>([])

  return (
    <TableContext.Provider value={{ tables, setTables, columns, setColumns, cells, setCells }}>
      {children}
    </TableContext.Provider>
  );
};


