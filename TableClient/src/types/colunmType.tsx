export interface ColumnData {
    _id: string;
    rowIndex: number;
    columnIndex: number;
    tableIndex: number;
    __v: number;
  }
  
  export type Column = ColumnData[];