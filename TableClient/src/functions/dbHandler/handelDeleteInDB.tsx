import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";

export const handelDeleteInDB = async (cellsToDelete: CellData[], serverUrl: string) => {
    const successDeleteCells = await Promise.all(
      cellsToDelete.map((cell) =>
        DocumentRestAPIMethods.delete(serverUrl, "tables", {_id: cell._id}, "deleteDoc")
      )
    );
    if (successDeleteCells)
      console.log("At TablePage row deleted successfully from DB");
  }; //works