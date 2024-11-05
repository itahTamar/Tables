import { Column, Table } from "@tanstack/react-table";

export function GeneralColumnFilter({
    column,
    table,
  }: {
    column: Column<any, any>;  //Represents a single column in the table. It’s an instance of a Column object, allowing access to various column-specific methods
    table: Table<any>; //Represents the table instance, providing methods to work with table data
  }) {
    const firstValue = table  //captures the value of the first row in the column before any filters are applied. This is used to check the data type in the column, so the component can conditionally render the appropriate filter UI (numeric vs. text-based)
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id);
  
    const columnFilterValue = column.getFilterValue(); //stores the current filter value for the column, which can be used to set the default value of the filter input fields
  
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