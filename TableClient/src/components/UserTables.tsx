import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTables } from '../api/tablesApi';
import { ServerContext } from '../context/ServerUrlContext';

interface Table {
  _id: string;
  fieldOfInterest: string;
}

const UserTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext)

  const handleGetAllUserTables = async () => {
    try {
        const tables = await fetchTables(serverUrl);
        if (!tables) throw new Error("at UserTable/handleGetAllUserTables - no tables");
        setTables(tables)
        
    } catch (error) {
        console.error('Error UserTable/handleGetAllUserTables:', error);
    }
  }

  useEffect( () => {
    handleGetAllUserTables()
  }, []);

  const handleCardClick = (tableId: string) => {
    navigate(`/table/${tableId}`); // Adjust the path to match your route structure
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {tables.map((table) => (
        <div
          key={table._id}
          onClick={() => handleCardClick(table._id)}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '200px',
            textAlign: 'center',
          }}
        >
          <h3>{table.fieldOfInterest}</h3>
        </div>
      ))}
    </div>
  );
};

export default UserTables;
