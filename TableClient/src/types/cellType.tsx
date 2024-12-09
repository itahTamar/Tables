export interface CellData {
    _id: string;
    data: string;
    rowIndex: number;
    columnIndex: number;
    tableIndex: number;
    __v: number;
  }
  
  export type Cell = CellData[];