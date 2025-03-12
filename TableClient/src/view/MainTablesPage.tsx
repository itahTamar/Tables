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
import "../style/search.css";
import TableSelector from "../components/tables/TableSelector";
import { TableContext } from "../context/tableContext";
import { handleUpdateVisibilityToDB } from "../functions/dbHandler/handleUpdateVisibilityToDB";
import Cookies from "js-cookie";
import axios from "axios";

const MainTablesPage: React.FC = () => {
  //variables
  const navigate = useNavigate();
  const getAllUserTables = useGetAllUserTables();
  const serverUrl = useContext(ServerContext);
  const [showPopupAddNewTable, setShowPopupAddNewTable] = useState(false);
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [tableVisibility, setTableVisibility] = useState<Record<string, boolean>>({});
  const tableContext = useContext(TableContext);
  if (!tableContext) {
    throw new Error("TableContext must be used within a TableProvider");
  }
  const { tables, setTables } = tableContext;
  if (tables === undefined) throw new Error("at MainTablePage tables are undefine");
  
  //cookie
  console.log("User Cookie after refresh:", Cookies.get("user"));
  useEffect(() => {
    const checkServerCookies = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/test-cookies`, {
          withCredentials: true,
        });
        console.log("at checkServerCookies Server response:", response.data);
      } catch (error) {
        console.error("Error fetching server cookies:", error);
        navigate("/"); // Redirect to login if no cookie
      }
    };
    checkServerCookies();
  }, []);
  
  //local functions:
  //get user tables after refresh
  useEffect(() => {
    const fetchTables = async () => {
      await getAllUserTables();
    };
    fetchTables();
  }, []);
  
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

  const selectionMenuRef = useRef<HTMLDivElement | null>(null); // Use ref for the selection menu

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

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  // Close the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setIsRenaming(false);
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
    setIsRenaming(false);
    setMenuState((prev) => ({ ...prev, visible: false }));
  };

  const handleSaveSelectedTables = async (selectedTablesIndices: number[]) => {
    setDropdownOpen(false);
  
    //Ensure local state is updated before saving
    const updatedTables = tables.map((table) => ({
      ...table,
      visibility: selectedTablesIndices.includes(table.tableIndex),
    }));
    setTables(updatedTables); // Update UI state immediately
    
    setTableVisibility(
      Object.fromEntries(updatedTables.map((table) => [table._id, table.visibility]))
    );

    //database update
    await handleUpdateVisibilityToDB(updatedTables, serverUrl)

    setShowTableSelector(false);
  };
  
  const handleSelectTables = () => {
    setShowTableSelector(true);
    setTimeout(() => setShowTableSelector(true), 0); // Delay to ensure state update
  };

  return (
    <div className="p-6 ">
      <header className="flex justify-between items-center mb-24">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="back absolute top-4 left-4 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

        {/* update user details */}
        {/* <button
              type="button"
              className="absolute top-4 left-28"
              onClick={() => navigate("/updateUserDetails")}
            >
              <span className="emoji">&#xf2bd;</span>
            </button> */}

        {/* Add Table Button */}
        {/* <button
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
        </button>*/}
        {showPopupAddNewTable && (
          <PopupWithAnimation
            open={showPopupAddNewTable}
            onClose={() => setShowPopupAddNewTable(false)}
          >
            <AddNewTable onClose={() => setShowPopupAddNewTable(false)} />
          </PopupWithAnimation>
        )}

        {/* table dropdown menu */}
        <div className="fixed top-4 right-4">
          <button
            onClick={toggleDropdown}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            Actions
            <svg
              className="ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 13.414l3.293-3.293a1 1 0 011.414 1.414L10 13.414l-4.707-4.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 right-0 top-full mt-1 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {/* Add Table Button */}
                <button
                  onClick={() => {
                    setShowPopupAddNewTable(true);
                    setDropdownOpen(false);
                  }}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  Add Table
                </button>

                {/* Select Table */}
                <button
                  onClick={() => {
                    handleSelectTables();
                  }}
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  Select Table
                </button>
                {showTableSelector && (
                  <TableSelector
                    tables={tables}
                    onClose={() => {
                      setShowTableSelector(false);
                      setDropdownOpen(false);
                    }}
                    onSave={handleSaveSelectedTables}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="flex flex-col items-center">
        <UserTables
          handleRightClick={handleRightClick}
          tableVisibility={tableVisibility}
        />

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
