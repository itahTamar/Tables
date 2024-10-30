import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTables } from '../api/tablesApi';
import { ServerContext } from '../context/ServerUrlContext';
import GeneralSearch from './GeneralSearch';
import { tableContext } from '../context/tableContext';

const UserTables: React.FC = () => {
  const {tables, setTables} = useContext(tableContext); // Use context to get tables and setTables
  const [filteredTables, setFilteredTables] = useState<string[]>([]); // Store filtered results
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext);

  // Fetch all user tables from the server
  const handleGetAllUserTables = async () => {
    try {
      const tablesData = await fetchTables(serverUrl);
      if (!tablesData) throw new Error("No tables found.");
      setTables(tablesData); // Update the context state
    } catch (error) {
      console.error('Error fetching user tables:', error);
    }
  };

  // Fetch tables on component mount
  useEffect(() => {
    handleGetAllUserTables();
  }, []);

  // Handle search results from the GeneralSearch component
  const handleSearchResults = (results: string[]) => {
    if (results.length === 0) {
      setFilteredTables([]); // Clear filters if no results
    } else {
     // @ts-ignore
      setFilteredTables(tables.filter(table => 
        table.fieldOfInterest.toLowerCase().includes(results[0].toLowerCase()) // Filter by fieldOfInterest
      ));
    }
  };

  const handleCardClick = (tableId: string) => {
    navigate(`/table/${tableId}`); // Navigate to table detail
  };

  return (
    <div>
      <GeneralSearch
        onSearchResults={handleSearchResults} // Pass the search results handler
      />

      {/* Display tables in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {/* @ts-ignore */}
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
