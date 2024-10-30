// tableContext.tsx
import React, { createContext, ReactNode, useState } from "react";
import { Table } from "../types/tableType";

interface TableContextType {
  tables: Table; // Define as an array of RowData
  setTables: (tables: Table) => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table>([]); // Initialize as an empty array

  return (
    <TableContext.Provider value={{ tables, setTables }}>
      {children}
    </TableContext.Provider>
  );
};
