import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentRestAPIMethods } from "../api/docApi";
import { logout } from "../api/userApi";
import PopupWithAnimation from "../components/popups/popupWithAnimation";
import AddNewTable from "../components/tables/AddNewTable";
import SelectionMenu from "../components/tables/SelectionMenu";
import UserTables from "../components/tables/UserTables";
import { ServerContext } from "../context/ServerUrlContext";
import { useGetAllUserTables } from "../hooks/tables/useGetTablesHooks";

const MainTablesPage: React.FC = () => {
  const navigate = useNavigate();
  const serverUrl = useContext(ServerContext);
  const [showPopupAddNewTable, setShowPopupAddNewTable] = useState(false);
  const getAllUserTables = useGetAllUserTables();
  const [message, setMessage] = useState<string>("");
  const [menuState, setMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tableId: string;
  }>({ visible: false, x: 0, y: 0, tableId: "" });
  const [tableRename, setTableRename] = useState("")

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRightClick = (event: React.MouseEvent, tableId: string) => {
    setMenuState({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      tableId,
    });
  };

  const handleRenameTable = async (tableId: string) => {
    if (!tableRename) {
      setMessage("Please fill the field.");
      return;
    }
    //update the table name (data)
    const updateSucceed = await DocumentRestAPIMethods.update(serverUrl, "tables", {_id: tableId}, {tableName: tableRename})
    if (updateSucceed) {
      setMessage("Table renamed successfully!");
      setTableRename("");
      await getAllUserTables();
      setMenuState((prev) => ({ ...prev, visible: false }));
    } else {
      setMessage("Failed to add table.");
    }
    
  }

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
          <span
            className="text-white text-2xl text-center"
            style={{ paddingBottom: "0.33rem" }}
          >
            +
          </span>
        </button>
        {showPopupAddNewTable && (
          <PopupWithAnimation
            open={showPopupAddNewTable}
            onClose={() => setShowPopupAddNewTable(false)}
          >
            <AddNewTable onClose={() => setShowPopupAddNewTable(false)} />
          </PopupWithAnimation>
        )}
      </header>

      {/* Center the UserTables component */}
      <section className="flex flex-col items-center">
        <UserTables handleRightClick={handleRightClick} />
        {menuState.visible && (
          <SelectionMenu
            x={menuState.x}
            y={menuState.y}
          >
            <input
              type="text"
              placeholder="Rename your Table"
              value={tableRename}
              onChange={(e) => setTableRename(e.target.value)}
              className="border border-black m-2 rounded-2xl w-50 indent-4"
            />

            <button onClick={() => {handleRenameTable(menuState.tableId)}} className="add-button">
              Rename
            </button>

            {message && <p className="message">{message}</p>}
          </SelectionMenu>
        )}
      </section>
    </div>
  );
};

export default MainTablesPage;
//work ok
