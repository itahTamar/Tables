import React, { useContext, useEffect, useState } from "react";
import { TableContext } from "../../context/tableContext";
import "../../style/tables/tablePage.css";

//component that search in the cells array
interface SearchInTableCellsProps {
  placeholder?: string;
}

const SearchInTableCells: React.FC<SearchInTableCellsProps> = ({
  placeholder = "Search...",
}) => {
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("at SearchInTableCells the tableContext is undefined");
  }
  const { cells, setRowIndexesArr, rowIndexesArr, checkedColumns } =
    tableContext;

  const [query, setQuery] = useState<string>("");
  const [excludeSearch, setExcludeSearch] = useState<boolean>(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timer) clearTimeout(timer); // Clear previous timer

    // Set a new timer for 1 seconds
    const newTimer = setTimeout(async () => {
      if (e.target.value != "") {
        handleSearchResults(e.target.value); // Trigger search with query
      } else {
        const resultSearchIndexes = [
          ...new Set(cells.map((cell) => cell.rowIndex)),
        ];
        console.log("Resetting rowIndexesArr:", resultSearchIndexes); // Debug log
        setRowIndexesArr(resultSearchIndexes);
      }
    }, 1000);

    setTimer(newTimer);
  };

  // Handle checkbox change
  const handleCheckboxChange = () => {
    setExcludeSearch((prev) => !prev);
  };

  const handleSearchResults = (target: string) => {
    console.log("Search Query:", target);
    console.log("Checked Columns:", checkedColumns);

    let resultSearchIndexes: number[];

    // Apply the column filter only if columns are checked
    let filteredCells =
      checkedColumns.length > 0
        ? cells.filter((cell) => checkedColumns.includes(cell.columnIndex))
        : cells;

    console.log("filteredCells:", filteredCells);
    if (filteredCells.length === 0) {
      console.warn("No filtered cells found!");
    }

    if (excludeSearch) {
      // Find all row indices that contain the search term
      const rowsToExclude = new Set(
        filteredCells
          .filter((cell) => cell.data && cell.data.includes(target))
          .map((cell) => cell.rowIndex)
      );
      console.log("Rows to Exclude:", Array.from(rowsToExclude));

      // Include only row indices that are NOT in rowsToExclude
      resultSearchIndexes = cells
        .map((cell) => cell.rowIndex) // Get all row indices
        .filter((rowIndex) => !rowsToExclude.has(rowIndex)); // Exclude the marked rows
    } else {
      // Include only rows that contain the search term
      resultSearchIndexes = filteredCells
        .filter((cell) => cell.data && cell.data.includes(target))
        .map((cell) => cell.rowIndex);
    }
    console.log("Result Search Indexes:", resultSearchIndexes);
    
    // Ensure rowIndex 1 is included in the result
    if (!resultSearchIndexes.includes(1)) {
      resultSearchIndexes.push(1);
    }

    console.log("Updating rowIndexesArr for search:", resultSearchIndexes);
    setRowIndexesArr([...new Set(resultSearchIndexes)]);
  };

  useEffect(() => {
    console.log("SearchInTableCells: Updated rowIndexesArr:", rowIndexesArr);
  }, [rowIndexesArr]);

  useEffect(() => {
    if (query !== "") {
      handleSearchResults(query); // Ensure search runs again when checkbox is clicked
    }
  }, [excludeSearch]); // Only runs when checkbox is toggled

  return (
    <div style={{ width: "100%", maxWidth: "400px" }} className="my-4 mx-auto">
      <input
        className="inputSearch"
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
        <input
          type="checkbox"
          id="excludeSearch"
          checked={excludeSearch}
          onChange={handleCheckboxChange}
          style={{ marginRight: "5px" }}
        />
        <label htmlFor="excludeSearch">Exclude search</label>
      </div>
    </div>
  );
};

export default SearchInTableCells;
//work ok
