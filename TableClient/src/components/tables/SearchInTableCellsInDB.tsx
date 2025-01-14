import React, { useContext, useState } from "react";
import { TableContext } from "../../context/tableContext";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { ServerContext } from "../../context/ServerUrlContext";
import { getAllTablesCells } from "../../functions/table/row/getAllTablesCells";

//component that search in the DB
interface SearchInTableCellsProps {
  tableId: string;
  tableIndex: number;
  placeholder?: string;
}

const SearchInTableCells: React.FC<SearchInTableCellsProps> = ({tableId, tableIndex, placeholder = "Search..." }) => {
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }
  const { setCells } = tableContext;
  const serverUrl = useContext(ServerContext);

  const [query, setQuery] = useState<string>("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  ); 

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timer) clearTimeout(timer); // Clear previous timer

    // Set a new timer for 1 seconds
    const newTimer = setTimeout(async() => {
      if (e.target.value != "") {
        handleSearchResults(e.target.value); // Trigger search with query in db 
        } else {
          const result = await getAllTablesCells({serverUrl, tableIndex, tableId}); // No query, return empty results
          setCells(result)
      }
    }, 1000);

    setTimer(newTimer);
  };

  const handleSearchResults = async (target: any) => {
    console.log("At handleSearchResults the tableId from prop is:", tableId)
    const result = await DocumentRestAPIMethods.getSearchInTableCells(serverUrl,"tables", tableId, target) //this is a search in db (will be an aggregation search)
    if(!result) throw new Error("no result for search in table cells");
    setCells(result)
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px"}} className="my-4 mx-auto">
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