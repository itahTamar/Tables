export interface CellData {
    _id: string;
    type: string;
    data: any;
    visibility: true;
    rowIndex: number;
    columnIndex: number;
    tableIndex: number;
    __v: number;
  }
  
  export type Cell = CellData[];