import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentRestAPIMethods } from "../api/docApi";
import { logout } from "../api/userApi";
import PopupWithAnimation from "../components/popups/popupWithAnimation";
import AddNewTable from "../components/tables/AddNewTable";
import SelectionMenu from "../components/tables/SelectionMenu";
import UserTables from "../components/tables/UserTables";
import { ServerContext } from "../context/ServerUrlContext";
import { useGetAllUserTables } from "../hooks/tables/useGetTablesHooks";
import Popup from "../components/popups/Popup";

const MainTablesPage: React.FC = () => {
  // Page variables
  
  // Page state variables

  // Page callbacks


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
  const [tableRename, setTableRename] = useState("");
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] =
    useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

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

  // Use ref for the selection menu
  const selectionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
      // Close the menu if the click is outside the menu
      if (
        selectionMenuRef.current &&
        !selectionMenuRef.current.contains(event.target as Node)
      ) {
        setMenuState((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleRenameTable = async (tableId: string) => {
    setMessage("");
    if (!tableRename) {
      setMessage("Please fill the field.");
      return;
    }
    //update the table name (data)
    const updateSucceed = await DocumentRestAPIMethods.update(
      serverUrl,
      "tables",
      { _id: tableId },
      { tableName: tableRename }
    );
    if (updateSucceed) {
      setTableRename("");
      await getAllUserTables();
      setMenuState((prev) => ({ ...prev, visible: false }));
    } else {
      setMessage("Failed to add table.");
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    // Delete the table logic (e.g., API call)
    const deleteSucceed = await DocumentRestAPIMethods.delete(
      serverUrl,
      "tables",
      { _id: tableId },
      "deleteTablesDocs"
    );
    if (deleteSucceed) {
      setMessage(`Table deleted.`);
      setIsDeleteConfirmationVisible(false); // Close confirmation
      await getAllUserTables();
      setMenuState((prev) => ({ ...prev, visible: false }));
    } else {
      setMessage("Failed to delete table.");
    }
  };

  const handleCancelDeleteTable = () => {
    setIsDeleteConfirmationVisible(false); // Close delete confirmation without deleting
    setMenuState((prev) => ({ ...prev, visible: false }));
  };

  const handleCancelRenameTable = () => {
    setIsRenaming(false)
    setMenuState((prev) => ({ ...prev, visible: false }));
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
        ) }
      </header>

      {/* Center the UserTables component */}
      <section className="flex flex-col items-center">
        <UserTables handleRightClick={handleRightClick} />
        {menuState.visible && (
          <SelectionMenu ref={selectionMenuRef} x={menuState.x} y={menuState.y}>
            <button
              onClick={() => {
                setIsRenaming(true);
                setMenuState({ ...menuState, visible: false });
              }}
              className="add-button"
            >
              Rename
            </button>

            <button
              onClick={() => {
                setIsDeleteConfirmationVisible(true);
                setMenuState({ ...menuState, visible: false });
              }}
              className="bg-red-600"
            >
              Delete
            </button>
          </SelectionMenu>
        )}

        {isRenaming && menuState.tableId && (
          <SelectionMenu ref={selectionMenuRef} x={menuState.x} y={menuState.y}>
            <input
              type="text"
              placeholder="Rename your Table"
              value={tableRename}
              onChange={(e) => setTableRename(e.target.value)}
              className="border border-black m-2 rounded-2xl w-50 indent-4"
            />

            <button
              onClick={() => handleRenameTable(menuState.tableId)}
              className="add-button"
            >
              Rename
            </button>
            <button onClick={handleCancelRenameTable} className="bg-lime-400">
              Cancel
            </button>

            {message && <p className="message">{message}</p>}
          </SelectionMenu>
        )}

        {isDeleteConfirmationVisible && menuState.tableId && (
          <SelectionMenu ref={selectionMenuRef} x={menuState.x} y={menuState.y}>
            <p>Are you sure you want to delete this table?</p>

            <button
              onClick={() => handleDeleteTable(menuState.tableId)}
              className="bg-red-600"
            >
              Delete
            </button>

            <button onClick={handleCancelDeleteTable} className="bg-lime-400">
              Cancel
            </button>
          </SelectionMenu>
        )}
      </section>
    </div>
  );
};

export default MainTablesPage;
//work ok
