import { CellData } from "../../../types/cellType";

interface SortResult {
  sortedCells: CellData[];
  newRowIndexesArr: number[];
}

export const sortTableByColumn = (
  columnIndex: number,
  cells: CellData[],
  order: "asc" | "desc" = "asc"
): SortResult => {
  // 1. Group cells by rowIndex
  const rowsMap = cells.reduce<Record<number, CellData[]>>((acc, cell) => {
    acc[cell.rowIndex] = acc[cell.rowIndex] || [];
    acc[cell.rowIndex].push(cell);
    return acc;
  }, {});

  // 2. Convert grouped rows into an array of rows
  const rowsArray = Object.values(rowsMap);

  (rowsMap);

  // 3. Separate the first row (which should remain unsorted)
  const firstRow = rowsArray[0]; // Get the first row directly
  const remainingRows = rowsArray.slice(1); // Get the remaining rows

  // 4. Sort the remaining rows based on the specified column's data (ASCII order)
  remainingRows.sort((rowA, rowB) => {
    const cellA = rowA.find((cell) => cell.columnIndex === columnIndex);
    const cellB = rowB.find((cell) => cell.columnIndex === columnIndex);

    const dataA = cellA?.data?.toString() || "";
    const dataB = cellB?.data?.toString() || "";

    // Compare the data for sorting
    const comparison = dataA.localeCompare(dataB, undefined, {
      numeric: true,
    });

    // Use the order variable to toggle ascending or descending
    return order === "asc" ? comparison : -comparison;
  });

  // 5. Combine the first row with the sorted remaining rows
  const sortedRows = [firstRow, ...remainingRows];

  // 6. Update row indexes for sorted rows
  const newRowIndexesArr: number[] = [];
  sortedRows.forEach((row, newRowIndex) => {
    const updatedRowIndex = newRowIndex + 1; // Start from 1, no header
    row.forEach((cell) => {
      cell.rowIndex = updatedRowIndex;
    });
    newRowIndexesArr.push(updatedRowIndex); // Collect the new row indexes
  });

  // 7. Flatten sorted rows back into a single array
  const sortedCells = rowsArray.flat();

  // 8. Return both sorted cells and the new rowIndexesArr
  return { sortedCells, newRowIndexesArr };
};

