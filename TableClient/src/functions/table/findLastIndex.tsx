import { CellData } from "../../types/cellType";
import { TableData } from "../../types/tableType";

interface findLastIndexProp {
    arr: CellData[] | TableData[];
    indexType: keyof CellData & keyof TableData; // Ensures indexType exists in both types // e.g., 'tableIndex', 'cellIndex', 'columnIndex'
  }
  
  export const findLastIndex = ({ arr, indexType }: findLastIndexProp): number | undefined => {
    try {
      // Ensure the array is not empty
      if (!arr.length) {
        console.log("Array is empty.");
        return 0;
      }
  
      const lastIndex = arr.reduce((max, current) => {
        const value = current[indexType] as unknown; // Dynamically access property 
        
        if (typeof value !== "number") {
          throw new Error(`Property ${indexType} is not a number.`);
        }
        
        return value > max ? value : max;
      }, 0);
  
      return lastIndex;
    } catch (error) {
      console.log("findLastIndex catch an error")
      console.error("Error in findLastIndex:", error);
      return undefined;
    }
  };
 