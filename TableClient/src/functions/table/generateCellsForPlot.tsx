import { CellData } from "../../types/cellType"

const generateCellsForPlot = (rowIndexesDisplayArr: number[], colIndexesDisplayArr: number[], cells: CellData[], headers: CellData[]): { headers: CellData[]; rows: CellData[][] } => {
  console.log("**** generateCellsForPlot.tsx: called with:", { rowIndexesDisplayArr, colIndexesDisplayArr});
  
  const displayHeadersArr = headers.filter(h => colIndexesDisplayArr.includes(h.columnIndex)).sort((a, b) => a.columnIndex - b.columnIndex);
  const displayCellsArr = cells.filter(c => rowIndexesDisplayArr.includes(c.rowIndex) && colIndexesDisplayArr.includes(c.columnIndex));

    // split cells into rows and later sort it
    const rows = displayCellsArr.reduce<Record<number, CellData[]>>((acc, cell) => { 
        acc[cell.rowIndex] = acc[cell.rowIndex] || [];
        acc[cell.rowIndex].push(cell);
        return acc;
      }, {});
    const sortedRows = Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b)
      .map(
        (rowIndex) =>
          rows[rowIndex]?.sort((a, b) => a.columnIndex - b.columnIndex) || [] //sort the cells in the row by their column index
      );

  return {headers: displayHeadersArr, rows: sortedRows}
}
export default generateCellsForPlot
