import {
  createAndSaveDataToMongoDB,
  findOneAndUpdateDataOnMongoDB,
  getOneDataFromMongoDB,
  saveDataToMongoDB,
} from "../../CRUD/mongoCRUD";
import { TableModel } from "../Table/tableModel";
import { ColumnModel, TableColumnModel } from "./columnModel";

export async function addNewColumn(req: any, res: any) {
  try {
    console.log("At addNewColumn");
    const tableID = req.params.tableId;
    console.log("At addNewColumn tableID :", tableID);

    if (!tableID) {
      return res.status(400).json({
        message: "table data from not found in params",
      });
    }

    const newColumnName = req.body.newColumnName;
    if (!newColumnName) {
      return res.status(400).json({ error: "newColumnName are required." });
    }
    console.log(
      "at dataControllers/addNewColumn newColumnName:",
      newColumnName
    );

    // Create the new Data document
    const newColumn = new ColumnModel({
      headerName: newColumnName,
      visible: true, // Default to visible
    });

    // Save the new Data to MongoDB
    const ok = await saveDataToMongoDB(newColumn);
    if (!ok.ok)
      throw new Error("at addNewRowData Fails to save the Data in Data-db");
    const columnId = newColumn._id;
    console.log("At addNewRowData the dataId is:", columnId);

    // Use the createAndSaveDataToMongoDB function to save the join
    const response = await createAndSaveDataToMongoDB(
      TableColumnModel,
      "tableId", //library1Name
      "columnId", //library2Name
      tableID, //item1ID
      columnId //item2ID
    );

    // If the join was successfully saved, respond with the result
    if (response.ok) {
      return res.status(201).json({
        ok: true,
        data: ok.response,
        tableDataEntry: response.response, // The saved join entry
      });
    } else {
      throw new Error(response.error || "Failed to create join entry");
    }
  } catch (error) {
    console.error("Error in addNewColumn:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //

export async function renameColumn(req: any, res: any) {
  try {
    const columnID = req.params.columnID;
    if (!columnID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", columnID);

    const renameColumnName = req.body.renameColumnName;
    if (!renameColumnName) {
      return res.status(400).json({ error: "renameColumnName are required." });
    }
    console.log(
      "at dataControllers/renameColumn renameColumnName:",
      renameColumnName
    );

    const updateFieldData = { headerName: renameColumnName };
    console.log(
      "at dataControllers/updateFieldByDataId the updateFieldData:",
      updateFieldData
    );

    //find the Data in DB by Data_id and update the require field
    const columnExistAndUpdate = await findOneAndUpdateDataOnMongoDB(
      ColumnModel,
      { _id: columnID },
      updateFieldData
    );
    console.log(
      "at dataControllers/updateFieldByDataId the DataExistAndUpdate",
      columnExistAndUpdate
    );
    res.send(columnExistAndUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
} //


