import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";

export const handleUpdateIndexInDB = async (toBeUpdateInDB: CellData[], serverUrl: string) => {
    const successUpdate = await Promise.all(
      toBeUpdateInDB.map((item) =>
        DocumentRestAPIMethods.update(
          serverUrl,
          "tables",
          { _id: item._id },
          {
            columnIndex: item.columnIndex,
            ...(item.rowIndex !== undefined && { rowIndex: item.rowIndex }),
          }
        )
      )
    );
    if (successUpdate)
      console.log("At TablePage rows and columns indexes updated successfully to DB");
  }; //works