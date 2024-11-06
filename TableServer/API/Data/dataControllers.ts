import jwt from 'jwt-simple';
import mongoose, { UpdateQuery } from 'mongoose';
import {
  createAndSaveDataToMongoDB,
  deleteOneDataFromMongoDB,
  findOneAndUpdateDataOnMongoDB,
  // getAllDataFromMongoDB,
  getOneDataFromMongoDB,
  saveDataToMongoDB
} from "../../CRUD/mongoCRUD";
import { TableModel } from "../Table/tableModel";
import { DataModel, TableDataModel } from "./dataModel";

export async function addNewRowData(req: any, res: any) {
  try {
    console.log("At addNewRowData")
    const tableID = req.params.tableId; // get the tableId&fieldOfInterest from the cookie - its coded!
    console.log("At addNewRowData tableID :", tableID)

    if (!tableID) {
      return res.status(400).json({
        message:
          "table data from cookie are not found in cookie",
      });
    }

    const tableDetails = await getOneDataFromMongoDB(TableModel, {_id: tableID})
    console.log("At addNewRowData the tableDetails:", tableDetails);

    const fieldOfInterest = tableDetails.response.fieldOfInterest
    console.log("At addNewRowData the fieldOfInterest:", fieldOfInterest);

    // Create the new Data document
    const newRowDataEmpty = new DataModel({
      fieldOfInterest: fieldOfInterest,
      details: "", // Empty string for details
      dataLink: "", // Empty string for dataLink
      price: 0, // Default price
      visible: true, // Default to visible
    });

    // Save the new Data to MongoDB
    const ok = await saveDataToMongoDB(newRowDataEmpty);
    if (!ok.ok)
      throw new Error("at addNewRowData Fails to save the Data in Data-db");
    const dataId = newRowDataEmpty._id;
    console.log("At addNewRowData the dataId is:", dataId);

    // Use the createAndSaveDataToMongoDB function to save the join
    const response = await createAndSaveDataToMongoDB(
      TableDataModel,
      "tableId", //library1Name
      "dataId",  //library2Name
      tableID,  //item1ID
      dataId    //item2ID
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
    console.error("Error in addNewRowData:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} // work ok

export async function updateFieldByDataId(req: any, res: any) {
  try {
    const dataID = req.params.dataID;
    if (!dataID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", dataID);

    const { field } = req.body;
    console.log("at dataControllers/updateFieldByDataId the field:", field); //ok

    const { updateData } = req.body;
    console.log("at dataControllers/updateFieldByDataId the updateData:", updateData); //ok
//!changed this from !updateData, try it in deferent fields types
    if (!field || updateData == undefined)
      throw new Error("missing data required field or updateData");

    const updateFieldData = { [field]: updateData };
    console.log(
      "at dataControllers/updateFieldByDataId the updateFieldData:",
      updateFieldData
    );

    //find the Data in DB by Data_id and update the require field
    const DataExistAndUpdate = await findOneAndUpdateDataOnMongoDB(
      DataModel,
      { _id: dataID },
      updateFieldData
    );
    console.log(
      "at dataControllers/updateFieldByDataId the DataExistAndUpdate",
      DataExistAndUpdate
    );
    res.send(DataExistAndUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
} //work ok

export async function deleteRowDataById(req: any, res: any) {
  try {
    const dataID = req.params.dataID;
    if (!dataID) throw new Error("no data id in params deleteRowDataById");
    console.log("at dataControllers/deleteRowDataById the dataID:", dataID);

    const tableId = req.cookies.table;
    if (!tableId) throw new Error("no data id in params deleteRowDataById");
    console.log("at dataControllers/deleteRowDataById the tableID:", tableId);

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("At addNewRowData: Couldn't load secret from .env");
    const decodedTableID = jwt.decode(tableId, secret);
    console.log("Encoded JWT Cookie:", decodedTableID);

    if (await deleteOneDataFromMongoDB(TableDataModel, {   //delete the data from the specific table
        tableId: decodedTableID,
        dataId: dataID,
      })
    ) {
      res.send({ ok: true, massage: "the data deleted from table" });
    } else {
      res.send({ ok: false, massage: "the data not deleted from table" });
    }

    if (await deleteOneDataFromMongoDB(DataModel, {_id: dataID}) //delete the data from the DB
    ) {
      res.send({ ok: true, massage: "the data deleted from table" });
    } else {
      res.send({ ok: false, massage: "the data not deleted from table" });
    }

  } catch (error) {
    console.error(error, "at dataControllers/deleteRowDataById delete failed");
  }
} //work ok

export async function addNewColumn(req: any, res: any){
  try {
    const tableId = req.params.tableId
     if (!tableId) {
      return res.status(400).json({ error: 'Table ID are required.' });
    }
    console.log("at dataControllers/addNewColumn tableId:", tableId)

    const fieldName = req.body.newColumnName
    if (!fieldName) {
      return res.status(400).json({ error: 'fieldName are required.' });
    }
    console.log("at dataControllers/addNewColumn fieldName:", fieldName)
    
    const response = await addFieldToSpecificTableDocuments(tableId, fieldName)
    if (!response) throw new Error("at dataControllers/addNewColumn failed to add nee column");
    console.log("at dataControllers/addNewColumn response:", response)
    
    res.send({ok: true})

  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to add the field to specific table documents.' });
  }
} //work ok

//function to add a new field to specific table's documents in the datas collection
export async function addFieldToSpecificTableDocuments(
  tableId: mongoose.Types.ObjectId, // The specific tableId to target
  fieldName: string, // The new field to add
): Promise<boolean> {
  try {
      console.log("at dataControllers/addFieldToSpecificTableDocuments the tableId:", tableId)
      console.log("at dataControllers/addFieldToSpecificTableDocuments the fieldName:", fieldName)

    // Step 1: Find all `dataId`s in `tabledatas` linked to the given `tableId`
    const tableDataRecords = await TableDataModel.find({ tableId }).select('dataId');
      console.log("at dataControllers/addFieldToSpecificTableDocuments the tableDataRecords:", tableDataRecords)

    //@ts-ignore
    const dataIds = tableDataRecords.map(record => record.dataId);
      console.log("at dataControllers/addFieldToSpecificTableDocuments the dataIds:", dataIds)

    // Step 2: Update each `data` document with the new field, filtering by `dataId`
    const defaultValue = ""
    const update: UpdateQuery<any> = { $set: { [fieldName as string]: defaultValue } } as unknown as UpdateQuery<any>;
      console.log("at dataControllers/addFieldToSpecificTableDocuments the update:", update)

    const result = await DataModel.updateMany({ _id: { $in: dataIds } }, update, { writeConcern: { w: "majority" }} ); //set the writeConcern option to enforce an acknowledgment if MongoDB is configured with specific write concerns
      console.log("at dataControllers/addFieldToSpecificTableDocuments the result:", result)
    if (!result.acknowledged) throw new Error("at dataControllers/addFieldToSpecificTableDocuments fail to add new filed");

    console.log(`${result.modifiedCount} documents were updated with the field "${fieldName}" for the specified table.`);
    return true
  } catch (err) {
    console.error(`Error updating documents with the field "${fieldName}":`, err);
  }
} //work ok
