import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableContext } from "../../context/tableContext";
import GeneralSearch from "../filters/GeneralSearch";
import { TableData } from "../../types/tableType";

interface UserTablesProp {
    handleRightClick: (
      event: React.MouseEvent,
      tableId: string,
    ) => void;
}

const UserTables: React.FC<UserTablesProp> = ({handleRightClick}) => {
  const tableContext = useContext(TableContext);

  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }

  const { tables } = tableContext;

  const [filteredTables, setFilteredTables] = useState<TableData[]>([]); // Store filtered results as TableData[]
  const navigate = useNavigate();

  // Handle search results from the GeneralSearch component
  const handleSearchResults = (results: string[]) => {
    if (results.length === 0) {
      setFilteredTables([]); // Clear filters if no results
    } else {
      setFilteredTables(
        tables.filter((table) =>
          table.tableName.toLowerCase().includes(results[0].toLowerCase())
        )
      );
    }
  };

  const handleCardClick = (tableId: string) => {
    navigate(`/table/${tableId}`); // Navigate to the specific table
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
            onContextMenu={(e) => {
              e.preventDefault(); // Prevent default context menu
              handleRightClick(e, table._id);
            }}
            onClick={() => handleCardClick(table._id)}
            className="border border-gray-300 p-4 rounded-lg cursor-pointer text-center"
          >
            <h3>{table.tableName}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTables;
//work ok