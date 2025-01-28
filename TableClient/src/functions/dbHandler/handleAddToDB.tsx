import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";

export const handleAddToDB = async (newToAddInDB: CellData[], serverUrl: string) => {
    const successAddCells = await Promise.all(
      newToAddInDB.map((cell) =>
        DocumentRestAPIMethods.add(serverUrl, "tables", cell, "addDoc")
      )
    );
    if (successAddCells)
      console.log("At TablePage rows and columns added successfully to DB");
  }; //works