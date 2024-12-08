// tableContext.tsx - contain all user's table fetched from DB
import React, { createContext, ReactNode, useState } from "react";
import { TableData } from "../types/tableType"; // Import the TableData type

interface TableContextType {
  tables: TableData[]; // Define as an array of TableData
  setTables: (tables: TableData[]) => void;
  // updateTableFieldsOrder: (tableId: string, newFieldsOrder: string[]) => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<TableData[]>([]); // Initialize as an empty array

  // Function to update fieldsOrder for a specific table
  // const updateTableFieldsOrder = (tableId: string, newFieldsOrder: string[]) => {
  //   setTables((prevTables) =>
  //     prevTables.map((table) =>
  //       table._id === tableId ? { ...table, fieldsOrder: newFieldsOrder } : table
  //     )
  //   );
  // };

  return (
    <TableContext.Provider value={{ tables, setTables }}>
      {children}
    </TableContext.Provider>
  );
};


