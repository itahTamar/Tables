import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../context/tableContext";
import GeneralSearch from "./GeneralSearch";
import { RowData } from "../types/tableType";

const UserTables: React.FC = () => {
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }

  const { tables } = tableContext;

  const [filteredTables, setFilteredTables] = useState<RowData[]>([]); // Store filtered results as RowData[]
  const navigate = useNavigate();

  // Handle search results from the GeneralSearch component
  const handleSearchResults = (results: string[]) => {
    if (results.length === 0) {
      setFilteredTables([]); // Clear filters if no results
    } else {
      setFilteredTables(
        tables.filter((table) =>
          table.fieldOfInterest.toLowerCase().includes(results[0].toLowerCase())
        )
      );
    }
  };

  const handleCardClick = (tableId: string) => {
    navigate(`/table/${tableId}`); // Navigate to table detail
  };

  return (
    <div>
      <div className="flex justify-center">
        <GeneralSearch onSearchResults={handleSearchResults} />
      </div>
      {/* Display tables in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-9 lg:grid-cols-4 gap-4 mt-16 ">
        {(filteredTables.length > 0 ? filteredTables : tables).map((table) => (
          <div
            key={table._id}
            onClick={() => handleCardClick(table._id)}
            className="border border-gray-300 p-4 rounded-lg cursor-pointer text-center"
          >
            <h3>{table.fieldOfInterest}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTables;
