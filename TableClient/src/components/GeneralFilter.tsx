import { Table } from "@tanstack/react-table";

export function GeneralFilter({ table }: { table: Table<any> }) {
    const globalFilterValue = table.getState().globalFilter ?? "";
  
    return (
      <input
        type="text"
        value={globalFilterValue}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        placeholder="Search the table..."
        className="w-72 border shadow rounded p-2"
      />
    );
  }
  