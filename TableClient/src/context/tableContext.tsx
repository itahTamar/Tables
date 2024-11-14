// tableContext.tsx
// import React, { createContext, ReactNode, useState } from "react";
// import { Table } from "../types/tableType";

// interface TableContextType {
//   tables: Table; // Define as an array of RowData
//   setTables: (tables: Table) => void;
// }

// export const TableContext = createContext<TableContextType | undefined>(undefined);

// export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [tables, setTables] = useState<Table>([]); // Initialize as an empty array

//   return (
//     <TableContext.Provider value={{ tables, setTables }}>
//       {children}
//     </TableContext.Provider>
//   );
// };

// tableContext.tsx
import React, { createContext, ReactNode, useState } from "react";
import { RowData } from "../types/tableType"; // Import the RowData type

interface TableContextType {
  tables: RowData[]; // Define as an array of RowData
  setTables: (tables: RowData[]) => void;
  updateTableFieldsOrder: (tableId: string, newFieldsOrder: string[]) => void;
}

export const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<RowData[]>([]); // Initialize as an empty array

  // Function to update fieldsOrder for a specific table
  const updateTableFieldsOrder = (tableId: string, newFieldsOrder: string[]) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table._id === tableId ? { ...table, fieldsOrder: newFieldsOrder } : table
      )
    );
  };

  return (
    <TableContext.Provider value={{ tables, setTables, updateTableFieldsOrder }}>
      {children}
    </TableContext.Provider>
  );
};


