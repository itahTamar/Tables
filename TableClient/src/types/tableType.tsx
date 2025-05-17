
export interface TableData {
    _id: string;
    tableName: string;
    visibility: boolean;
    // tableIndex: number;
    rowNumber: number;
    columnNumber: number;
    __v: number;
  }
  
  export type Table = TableData[]; // Define Table as an array of TableData
  