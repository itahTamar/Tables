import {
  ColumnDef,
  RowData,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addNewColumn,
  createNewRowData,
  getAllTableRowData,
  updateCellData,
} from "../api/dataApi";
import { ServerContext } from "../context/ServerUrlContext";
import { GeneralFilter } from "./GeneralFilter";
import "../style/tableData.css";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, field: string, value: unknown) => void;
  }
}

interface ITableData {
  _id: string;
  index: number;
  dateCreated: Date;
  fieldOfInterest: string;
  details: string;
  dataLink: string;
  price: number;
  visible: boolean;
  newColumn?: string; //add the ability to add new column to the table
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<ITableData>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
    return (
      <input
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    );
  },
};

// Wrap a function with this to skip a pagination reset temporarily while update happen
function useSkipper() {
  const shouldSkipRef = React.useRef(true);
  const shouldSkip = shouldSkipRef.current;

  const skip = React.useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  React.useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

export function TableData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showHiddenRows, setShowHiddenRows] = useState(false);
  const [data, setData] = useState<ITableData[]>([]);
  const [visibleData, setVisibleData] = useState<ITableData[]>([]);
  const [allData, setAllData] = useState<ITableData[]>([]);
  const serverUrl = useContext(ServerContext);
  const { tableId } = useParams();
  if (!tableId) {
    throw new Error("TableId is undefined");
  }
  const { fieldsOrder } = useParams();
  if (!fieldsOrder) {
    throw new Error("fieldsOrder is undefined");
  }
  console.log("at TableData the fieldsOrder:", fieldsOrder);
  // Convert fieldsOrder back into an array
  const fieldsOrderArray = fieldsOrder.split(",");

  console.log("at TableData the fieldsOrder array:", fieldsOrderArray);

  console.log("at TableData the showHiddenRows:", showHiddenRows);
  const handelGetAllTableData = async () => {
    const tableData = await getAllTableRowData(serverUrl, tableId);

    if (tableData.length === 0) {
      //if the table is empty, start it with 3 new rows
      const newRows = await Promise.all(
        Array.from({ length: 3 }, () => createNewRowData(serverUrl, tableId))
      );
      setData(newRows);
      setVisibleData(newRows);
      setAllData(newRows);
    } else {
      // Filter the data based on the `visible` field
      //@ts-ignore
      const visibleData = tableData.filter((row) => row.visible === true);
      if (showHiddenRows) {
        setData(tableData.reverse());
      } else {
        setData(visibleData.reverse());
        setVisibleData(visibleData);
        setAllData(tableData.reverse());
      }
    }
    setLoading(false);
  };

  const handleShowAllData = () => {
    setShowHiddenRows((prev) => !prev);
  };

  useEffect(() => {
    console.log(
      "at TableData/handleShowAllData/useEffect the showHiddenRows:",
      showHiddenRows
    );

    //if showHiddenRows == true -> see all row
    if (showHiddenRows) {
      setData(allData);
    }
    //if showHiddenRows == false -> see only visible row
    else {
      setData(visibleData);
    }
  }, [showHiddenRows]);

  useEffect(() => {
    handelGetAllTableData();
  }, []);

  // Define column configuration for each possible field
  const columnDefinitions: Record<string, ColumnDef<ITableData>> = {
    details: {
      header: "Details",
      accessorKey: "details",
    },
    dataLink: {
      header: "Links",
      accessorKey: "dataLink",
    },
    price: {
      header: "Price",
      accessorKey: "price",
    },
  };

  // Add new column to `columnDefinitions`
  columnDefinitions.newColumn = {
    header: " ",
    accessorKey: "newColumn",
    cell: ({ row }) => row.original.newColumn || "Default Value",
  };

  // Build up the table columns based on fieldsOrder and add "No." and "visibility" columns
  const columns = React.useMemo<ColumnDef<ITableData>[]>(() => {
    const orderedColumns = fieldsOrderArray
      .map((field) => columnDefinitions[field])
      .filter(Boolean);

    return [
      {
        header: "No.",
        cell: ({ row }) => row.index + 1,
      },
      ...orderedColumns,
      {
        header: "Date Created",
        accessorKey: "dateCreated",
        cell: ({ getValue }) => {
          const dateValue = getValue<Date>();
          const formattedDate = new Date(dateValue).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }
          );
          return formattedDate;
        },
      },
      {
        header: "Hide",
        id: "visibility",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={!row.original.visible}
            onChange={() => {
              handleUpdate(row.original._id, "visible", !row.original.visible);
            }}
          />
        ),
      },
    ];
  }, [fieldsOrderArray]);

  // const refreshData = () => handelGetAllTableData();

  //the use of the useSkipper hook
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const handleUpdate = async (
    rowDataOriginalId: string,
    field: string,
    value: any
  ) => {
    try {
      console.log(
        "at tableData/handleUpdate the rowDataOriginalId:",
        rowDataOriginalId
      );
      console.log("at tableData/handleUpdate the field:", field);
      console.log("at tableData/handleUpdate the value:", value);

      if (!rowDataOriginalId || !field || value == undefined)
        throw new Error("At handleUpdate: fail catching data from cell");

      const response = await updateCellData(
        serverUrl,
        rowDataOriginalId,
        field,
        value
      );
      if (!response)
        throw new Error("At handleUpdate: filed catching response from axios");
      console.log("the response is:", response);
      if (response) {
        handelGetAllTableData();
      }
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  };

  const handleAddRow = async () => {
    try {
      const response = await createNewRowData(serverUrl, tableId);
      if (!response)
        throw new Error("At handleAddRow: filed catching response from axios");
      console.log("the response is:", response);
      handelGetAllTableData();
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  };

  const handleAddNewColumn = async (position: number) => {
    try {
      console.log("At handleAddNewColumn the position is:", position);
      const response = await addNewColumn(serverUrl, tableId, position);
      if (!response)
        throw new Error(
          "At handleAddNewColumn: filed catching response from axios"
        );
      console.log("the response is:", response);
      handelGetAllTableData();
    } catch (error) {
      console.error("Error:", (error as Error).message);
    }
  };

  //define a table using "react table library" hook
  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(), //row models from TanStack, return a basic row model that just a 1:1 mapping of original data passed to the table.
    getFilteredRowModel: getFilteredRowModel(), //row models from TanStack,returns a row model that accounts for column filtering and global filtering
    getPaginationRowModel: getPaginationRowModel(), //row models from TanStack, returns a row model that only includes the rows that should be displayed on the current page based on the pagination state
    autoResetPageIndex,
    // Provide our updateData function to our table meta
    // Table Meta allow to pass arbitrary data or fun' to the table and store metadata about the table and its data.
    meta: {
      updateData: (rowIndex, field, value) => {
        //updating the data in the table by setting a new value for a specific column and row
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              handleUpdate(row._id, field, value); //handling sending the update data to the server for DB-saving
              return {
                ...old[rowIndex]!,
                //Take the value at the rowIndex index from the old array,
                // and use it as is, without checking if it's null or undefined.
                [field]: value,
              };
            }
            return row;
          })
        );
      },
    },
    debugTable: true,
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-24 mt-6">
        {/* back button */}
        <button className="top-8 left-16" onClick={() => navigate(-1)}>
          Back
        </button>

        {/* hide/show button */}
        <button className="" onClick={() => handleShowAllData()}>
          {showHiddenRows ? "Hide again" : "Show all"}
        </button>
      </div>

      {/* Display the "Field of Interest" as table's Title */}
      {data[0] && (
        <h1 className="text-2xl font-semibold mb-4 mt-12">
          {data[0].fieldOfInterest}
        </h1>
      )}

      <div className="table-container">
        {loading ? (
          <div className="text-black text-3xl">Loading ...</div>
        ) : (
          <div>
            {/* Render Filters */}
            <div className="flex justify-center pt-4 pb-4 relative">
              <GeneralFilter table={table} />
              <button className="ml-4" onClick={() => handleAddRow()}>
                Add Row
              </button>
            </div>

            <table className="w-full border-collapse border border-gray-300">
              {/* set the table header with hidden + buttons */}
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-300">
                    {headerGroup.headers.map((header, index) => (
                      <React.Fragment key={header.id}>
                        <th
                          // key={header.id}
                          className="p-2 border-r border-gray-300 bg-gray-100 text-left"
                        >
                          {/* Display Column Header */}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {/* Conditionally render "+" button for specific columns only */}
                          {header.id !== "dateCreated" &&
                            header.id !== "visibility" && (
                              <button
                                className="plus-button"
                                onClick={() => handleAddNewColumn(index)}
                              >
                                +
                              </button>
                            )}
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </thead>

              {/*set the body of the table */}
              <tbody>
                {/*set the row */}
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-300 even:bg-gray-50"
                  >
                    {/*set the cell in the row*/}
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="p-2 border-r border-gray-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="h-2" />
      {/*Browsing between inner table's pages*/}
      <div className="flex items-center gap-2 justify-center">
        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>

        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>

        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>

        <button
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>

        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getRowModel().rows.length} Rows</div>
    </div>
  );
}
