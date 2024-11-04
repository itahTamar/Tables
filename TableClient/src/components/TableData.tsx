import {
  Column,
  ColumnDef,
  RowData,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useContext, useEffect, useState } from "react";
import {
  createNewRowData,
  getAllTableRowData,
  updateCellData,
} from "../api/dataApi";
import { ServerContext } from "../context/ServerUrlContext";
import { useParams } from "react-router-dom";

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
  const [loading, setLoading] = useState(false);
  // let [columns, setColumns] = useState<ColumnDef<ITableData>[]>([]);
  const [data, setData] = useState<ITableData[]>([]);
  const [hiddenData, setHiddenData] = useState<ITableData[]>([]);
  const serverUrl = useContext(ServerContext);
  const { tableId } = useParams();
  if (!tableId) {
    throw new Error("TableId is undefined");
  }

  const handelGetAllTableData = async () => {
    const tableData = await getAllTableRowData(serverUrl, tableId);

    if (tableData.length === 0) {
      const newRows = await Promise.all(
        Array.from({ length: 3 }, () => createNewRowData(serverUrl, tableId))
      );
      setData(newRows);
    } else {
      // Filter the data based on the `visible` field
      //@ts-ignore
      const visibleData = tableData.filter((row) => row.visible === true);
      //@ts-ignore
      const hiddenData = tableData.filter((row) => row.visible === false);
      setData(visibleData);
      setHiddenData(hiddenData);
    }
  };

  useEffect(() => {
    handelGetAllTableData();
  }, []);

  //build up the table columns header that can be changed
  const columns = React.useMemo<ColumnDef<ITableData>[]>(
    () => [
      {
        header: "Details",
        accessorKey: "details",
        // cell: ({ row, getValue }) => (
        //   <EditableCell
        //     value={getValue() as string}
        //     onSave={(newValue) =>
        //       handleUpdate(row.original._id, "details", newValue)
        //     }
        //   />
        // ),
      },
      {
        header: "Price",
        accessorKey: "price",
        // cell: ({ row, getValue }) => (
        //   <EditableCell
        //     value={getValue() as number}
        //     onSave={(newValue) =>
        //       handleUpdate(row.original._id, "price", newValue)
        //     }
        //   />
        // ),
      },
      {
        header: "Date Created",
        accessorKey: "dateCreated",
      },
      {
        header: "Hide",
        id: "visibility",
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={!row.original.visible}
            onChange={() => {
              console.log(
                "at TableData/columns/visibility the row.original._id:",
                row.original._id
              );
              console.log(
                "at TableData/columns/visibility the !row.original.visible:",
                !row.original.visible
              );
              handleUpdate(row.original._id, "visible", !row.original.visible);
            }}
          />
        ),
      },
    ],
    []
    // setColumns(columns);
  );

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
      {/* <button onClick={() => }>show hidden data</button> */}

      {/* Display the "Field of Interest" as table's Title */}
      {data[0] && (
        <h1 className="text-2xl font-semibold mb-4">
          {data[0].fieldOfInterest}
        </h1>
      )}

      <div className="table-container">
        {loading ? (
          <div className="text-black text-3xl">Loading ...</div>
        ) : (
          <div>
            {/* Render Filters */}
            {/* <div className="filters-container">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) =>
                  header.column.getCanFilter() ? (
                    <div key={header.id} className="filter-item">
                      <Filter column={header.column} table={table} />
                    </div>
                  ) : null
                )
              )}
            </div> */}

            <table className="w-full border-collapse border border-gray-300">
              {/* set the table header */}
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-300">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-2 border-r border-gray-300 bg-gray-100 text-left"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
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
      <div className="flex items-center gap-2">
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

// const EditableCell = ({
//   value,
//   onSave,
// }: {
//   value: any;
//   onSave: (value: any) => void;
// }) => {
//   const [editing, setEditing] = useState(false);
//   const [tempValue, setTempValue] = useState(value);

//   const handleSave = () => {
//     onSave(tempValue);
//     setEditing(false);
//   };

//   return editing ? (
//     <input
//       type="text"
//       value={tempValue}
//       onChange={(e) => setTempValue(e.target.value)}
//       onBlur={handleSave}
//       autoFocus
//     />
//   ) : (
//     <span onDoubleClick={() => setEditing(true)}>{value}</span>
//   );
// };

//filter/search fun
function Filter({
  column,
  table,
}: {
  column: Column<any, any>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  );
}
