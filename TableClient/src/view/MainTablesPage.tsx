import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/userApi';
import UserTables from './../components/UserTables';

const MainTablesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddTable = () => {
    navigate('/add-table'); // Navigate to the add table page
  };

  return (
    <div className="relative p-6 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

        {/* Add Table Button */}
        <button
          onClick={handleAddTable}
          className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
          title="Add Table" // Tooltip message on hover
        >
          <span className="text-white text-2xl">+</span>
        </button>
      </header>

      {/* Center the UserTables component */}
      <section className="flex flex-col items-center">
        <UserTables />
      </section>
    </div>
  );
};

export default MainTablesPage;
