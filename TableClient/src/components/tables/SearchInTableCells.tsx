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
    throw new Error("TablePage must be used within a TableProvider");
  }
  const { cells, setRowIndexesArr, rowIndexesArr } = tableContext;

  const [query, setQuery] = useState<string>("");
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

  const handleSearchResults = (target: any) => {
    const resultSearchIndexes = cells
      .filter((cell) => cell.data && cell.data.includes(target)) // Filter cells where data contains the search string
      .map((cell) => cell.rowIndex); // Map the filtered cells to their rowIndex
    // Ensure rowIndex 1 is included in the result
    if (!resultSearchIndexes.includes(1)) {
      resultSearchIndexes.push(1);
    }
    console.log("Updating rowIndexesArr for search:", resultSearchIndexes); // Debug log
    setRowIndexesArr([...new Set(resultSearchIndexes)]); // Use unique row indexes
  };

  useEffect(() => {
    console.log("SearchInTableCells: Updated rowIndexesArr:", rowIndexesArr);
  }, [rowIndexesArr]);

  return (
    <div style={{ width: "100%", maxWidth: "400px" }} className="my-4 mx-auto">
      <input
        className="inputSearch"
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInTableCells;
//work ok
