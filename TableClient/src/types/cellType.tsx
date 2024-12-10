export interface CellData {
    _id: string;
    type: string;
    data: any;
    rowIndex: number;
    columnIndex: number;
    tableIndex: number;
    __v: number;
  }
  
  export type Cell = CellData[];