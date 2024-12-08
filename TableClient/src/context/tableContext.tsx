// tableContext.tsx - contain all user's table fetched from DB
import React, { createContext, ReactNode, useState } from "react";
import { ColumnData } from "../types/colunmType";
import { TableData } from "../types/tableType"; // Import the TableData type

interface TableContextType {
  tables: TableData[]; // Define as an array of TableData
  setTables: (tables: TableData[]) => void;
  columns: ColumnData[];
  setColumns: (columns: ColumnData[]) => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableData[]>([]); // Initialize as an empty array
  const [columns, setColumns] = useState<ColumnData[]>([])

  return (
    <TableContext.Provider value={{ tables, setTables, columns ,setColumns }}>
      {children}
    </TableContext.Provider>
  );
};


