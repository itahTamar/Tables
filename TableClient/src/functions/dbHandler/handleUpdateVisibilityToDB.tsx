import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";
import { TableData } from "../../types/tableType";

export const handleUpdateVisibilityToDB = async (newToUpdatedInDB: CellData[] | TableData[], serverUrl: string) => {
  // console.log("At handleUpdateVisibilityToDB Visibility the newToUpdatedInDB:",newToUpdatedInDB);
  const successAddCells = await Promise.all(
    newToUpdatedInDB.map((e) =>
        DocumentRestAPIMethods.update(serverUrl, "tables",  { _id: e._id },
            { visibility: e.visibility })
      )
    );
    if (successAddCells)
      console.log("At handleUpdateVisibilityToDB Visibility updated successfully to DB");
  }; //works