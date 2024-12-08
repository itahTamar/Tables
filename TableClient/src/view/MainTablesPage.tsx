import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/userApi';
import AddNewTable from '../components/AddNewTable';
import PopupWithAnimation from '../components/popupWithAnimation';
import '../style/mainTablePage.css';
import UserTables from './../components/UserTables';

const MainTablesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPopupAddNewTable, setShowPopupAddNewTable] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-6 ">
      <header className="flex justify-between items-center mb-24">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

        {/* Add Table Button */}
        <button
          onClick={() => setShowPopupAddNewTable(true)}
          className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
          title="Add Table" // Tooltip message on hover
        >
          <span className="text-white text-2xl text-center" style={{ paddingBottom: '0.33rem'}}>+</span>
        </button>
        {showPopupAddNewTable && (
            <PopupWithAnimation open={showPopupAddNewTable} onClose={() => setShowPopupAddNewTable(false)}>
              <AddNewTable onClose={() => setShowPopupAddNewTable(false)}/>
            </PopupWithAnimation>
          )}
      </header>

      {/* Center the UserTables component */}
      <section className="flex flex-col items-center">
        <UserTables />
      </section>
    </div>
  );
};

export default MainTablesPage;
//work ok