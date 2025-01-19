import React, { useContext, useEffect, useState } from "react";
import { DocumentRestAPIMethods } from "../../api/docApi";
import { ServerContext } from "../../context/ServerUrlContext";
import { TableContext } from "../../context/tableContext";
import "../../style/tables/tablePage.css"
import { CellData } from "../../types/cellType";

//component that search in the DB
interface SearchInTableCellsProps {
  tableId: string;
  placeholder?: string;
  setIsSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchInTableCells: React.FC<SearchInTableCellsProps> = ({tableId, placeholder = "Search...", setIsSearch }) => {
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TablePage must be used within a TableProvider");
  }
  const { searchCells, setSearchCells, cells } = tableContext;
  const serverUrl = useContext(ServerContext);

  const [query, setQuery] = useState<string>("");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null); 
  const [resultFirstEmptyRow, setResultFirstEmptyRow] = useState<CellData[]>([])

  useEffect(() => {
    const firstEmptyRow = cells.filter((cell) => cell.rowIndex === 1);
    setResultFirstEmptyRow(firstEmptyRow);
  }, [cells, searchCells]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timer) clearTimeout(timer); // Clear previous timer

    // Set a new timer for 1 seconds
    const newTimer = setTimeout(async() => {
      if (e.target.value != "") {
        handleSearchResults(e.target.value); // Trigger search with query
        } else {
         setIsSearch(false)
      }
    }, 1000);

    setTimer(newTimer);
  };

  const handleSearchResults = async (target: any) => {
    const resultSearch = await DocumentRestAPIMethods.getSearchInTableCells(serverUrl,"tables", tableId, target)
    if(!resultSearch) throw new Error("no result for search in table cells");
    const combinedResults = [...resultFirstEmptyRow, ...resultSearch]
    console.log("At handleSearchResults the firstEmptyRow is:", resultFirstEmptyRow)
    setSearchCells(combinedResults)
    setIsSearch(true)
  }

  return (
    <div style={{ width: "100%", maxWidth: "400px"}} className="my-4 mx-auto">
      <input className="inputSearch"
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