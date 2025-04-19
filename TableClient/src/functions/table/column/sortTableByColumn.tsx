import { CellData } from "../../../types/cellType";

interface SortResult {
  sortedCells: CellData[];
  newRowIndexesArr: number[];
}

// Function to check if a string is a date in the format dd.mm.yy
const isDate = (str: string) => {
  const datePattern = /^\d{1,2}\.\d{1,2}\.\d{2}$/;
  return datePattern.test(str);
};

// Function to convert date from dd.mm.yy to yy.mm.dd for sorting
const convertToSortableFormat = (date: string) => {
  const [day, month, year] = date.split('.').map(Number);
  return `${year.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
};

// Custom sort function to identify the data type and sort it correctly
const customSort = (a: any, b: any): number => {
  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Handle dates
  if (isDate(a) && isDate(b)) {
    return convertToSortableFormat(a).localeCompare(convertToSortableFormat(b));
  }

  // Handle other strings (including URLs)
  return a.toString().localeCompare(b.toString());
};

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

  // 3. Separate the first row (which should remain unsorted)
  const firstRow = rowsArray[0]; // Get the first row directly
  const remainingRows = rowsArray.slice(1); // Get the remaining rows

  // 4. Sort the remaining rows based on the specified column's data (custom sort)
  remainingRows.sort((rowA, rowB) => {
    const cellA = rowA.find((cell) => cell.columnIndex === columnIndex);
    const cellB = rowB.find((cell) => cell.columnIndex === columnIndex);

    const dataA = cellA?.data || "";
    const dataB = cellB?.data || "";

    // Compare the data for sorting using customSort
    const comparison = customSort(dataA, dataB);

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
  const sortedCells = sortedRows.flat();

  // 8. Return both sorted cells and the new rowIndexesDisplayArr
  return { sortedCells, newRowIndexesArr };
};
