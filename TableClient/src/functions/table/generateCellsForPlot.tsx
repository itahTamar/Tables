import { CellData } from "../../types/cellType"

const generateCellsForPlot = (rowIndexesArr: number[], cells: CellData[]) => {
  console.log("generateCellsForPlot called with:", { rowIndexesArr, cells }); // Debug log
  
  if(! rowIndexesArr || rowIndexesArr.length === 0) {
    return cells; // Return all cells if no search
  }
  
  const displayArr = cells.filter(cell => rowIndexesArr.includes(cell.rowIndex));
  return displayArr
}
export default generateCellsForPlot
