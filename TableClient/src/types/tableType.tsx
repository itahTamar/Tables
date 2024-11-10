
export interface RowData {
    _id: string;
    fieldOfInterest: string;
    creator: string;
    fieldsOrder: string[];
    __v: number;
  }
  
  export type Table = RowData[]; // Define Table as an array of RowData
  