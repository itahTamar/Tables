
export interface TableData {
    _id: string;
    tableName: string;
    tableIndex: number;
    __v: number;
  }
  
  export type Table = TableData[]; // Define Table as an array of RowData
  