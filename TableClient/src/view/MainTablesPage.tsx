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

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">

        <button
          onClick={handleLogout}
          className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <section className="flex flex-wrap gap-4">
      <UserTables />
      </section>
    </div>
  );
};

export default MainTablesPage;
