import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";

export const handleUpdateVisibilityToDB = async (newToAddInDB: CellData[], serverUrl: string) => {
    const successAddCells = await Promise.all(
      newToAddInDB.map((cell) =>
        DocumentRestAPIMethods.update(serverUrl, "tables",  { _id: cell._id },
            { visibility: cell.visibility })
      )
    );
    if (successAddCells)
      console.log("At TablePage rows and columns added successfully to DB");
  }; //works