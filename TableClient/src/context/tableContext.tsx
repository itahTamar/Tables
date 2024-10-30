import { createContext } from "react";

// export const tableContext = createContext<any>(null)

interface Table {
    _id: string;
    fieldOfInterest: string;
  }
  
  interface TableContextType {
    tables: Table[];                     // Array of tables
    setTables: (tables: Table[]) => void; // Function to update tables
  }
  
  // Create the context with a default value
  export const tableContext = createContext<TableContextType | any>(null);
  