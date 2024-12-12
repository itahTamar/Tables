import React, { useContext, useState } from "react";
import { TableContext } from "../context/tableContext";
import { DocumentAPIWrapper } from "../api/docApi";
import { ServerContext } from "../context/ServerUrlContext";
import { useGetAllTablesCells } from "./useGetComponents";

//component that search in the DB
interface SearchInTableCellsProps {
  tableIndex: number | undefined
  placeholder?: string;
}

const SearchInTableCells: React.FC<SearchInTableCellsProps> = ({tableIndex, placeholder = "Search..." }) => {
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }
  const { setCells } = tableContext;
  const serverUrl = useContext(ServerContext);
  const getAllTablesCells = useGetAllTablesCells();

  const [query, setQuery] = useState<string>("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  ); // Correct type for the timer

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timer) clearTimeout(timer); // Clear previous timer

    // Set a new timer for 1 seconds
    const newTimer = setTimeout(() => {
      if (e.target.value) {
        handleSearchResults(e.target.value); // Trigger search with query
        } else {
          getAllTablesCells(); // No query, return empty results
      }
    }, 1000);

    setTimer(newTimer);
  };

  const handleSearchResults = async (target: any) => {
    console.log("At handleSearchResults the tableIndex from prop is:", tableIndex)
    const result = await DocumentAPIWrapper.getSearchInTableCells(serverUrl,"tables", tableIndex, target)
    if(!result) throw new Error("no result for search in table cells");
    setCells(result)
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "1rem",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
};

export default SearchInTableCells;
//work ok