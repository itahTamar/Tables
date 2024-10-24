import {
  createAndSaveDataToMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  saveDataToMongoDB,
  updateOneDataOnMongoDB,
} from "../../CRUD/mongoCRUD";
import { DataModel, TableDataModel } from "./dataModel";
import jwt from 'jwt-simple';

export async function getAllData(req: any, res: any) {
  try {
    console.log("getAllData function");
    const dataDB = await getAllDataFromMongoDB<any>(DataModel);
    console.log("At getAllData dataDB:", dataDB);
    res.send({ data: dataDB });
  } catch (error) {
    console.error(error);
  }
}

export async function addNewRowData(req: any, res: any) {
  try {
    const tableData = req.cookies; // get the tableId&fieldOfInterest from the cookie - its coded!

    if (!tableData) {
      return res.status(400).json({
        message:
          "table data from cookie are not found in cookie",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("At addNewRowData: Couldn't load secret from .env");
    const decodedTableData = jwt.decode(tableData, secret);
    const { tableId, fieldOfInterest } = decodedTableData
    console.log("At userCont getUser the tableId, fieldOfInterest:", tableId, fieldOfInterest); 

    // Create the new Data document
    const newRowDataEmpty = new DataModel({
      fieldOfInterest,
      details: "", // Empty string for details
      dataLink: "", // Empty string for dataLink
      price: 0, // Default price
      visible: true, // Default to visible
    });

    // Save the new Data to MongoDB
    const ok = await saveDataToMongoDB(newRowDataEmpty);
    if (!ok.ok)
      throw new Error("at addNewRowData Fails to save the Data in Data-db");
    const dataId = ok.response._id;
    console.log("At addNewRowData the dataId is:", dataId);

    // Use the createAndSaveDataToMongoDB function to save the join
    const response = await createAndSaveDataToMongoDB(
      TableDataModel,
      "tableId",
      "dataId",
      tableId,
      dataId
    );

    // If the join was successfully saved, respond with the result
    if (response.ok) {
      return res.status(201).json({
        message: "New data created and linked to table",
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
}

export async function updateFieldByDataId(req: any, res: any) {
  try {
    const dataID = req.params.dataID;
    if (!dataID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", dataID);

    const { field } = req.body;
    console.log("at dataControllers/updateFieldByDataId the field:", field); //ok

    const { updateData } = req.body;

    if (!field || !updateData)
      throw new Error("missing data required field or updateData");

    const updateFieldData = { [field]: updateData };
    console.log(
      "at dataControllers/updateFieldByDataId the updateDataData:",
      updateFieldData
    );

    //find the Data in DB by Data_id and update the require field
    const DataExistAndUpdate = await updateOneDataOnMongoDB(
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
}

export async function deleteRowDataById(req: any, res: any) {
  try {
    const dataID = req.params.dataID;
    if (!dataID) throw new Error("no data id in params deleteRowDataById");
    console.log("at dataControllers/deleteRowDataById the dataID:", dataID);

    const {tableId} = req.cookie;
    if (!tableId) throw new Error("no data id in params deleteRowDataById");
    console.log("at dataControllers/deleteRowDataById the tableID:", tableId);

    if (await deleteOneDataFromMongoDB(TableDataModel, {   //delete the data from the specific table
        tableID: tableId,
        dataID: dataID,
      })
    ) {
      res.send({ ok: true, massage: "the data deleted from table" });
    } else {
      res.send({ ok: false, massage: "the data not deleted from table" });
    }

    if (await deleteOneDataFromMongoDB(DataModel, {dataID: dataID}) //delete the data from the DB
    ) {
      res.send({ ok: true, massage: "the data deleted from table" });
    } else {
      res.send({ ok: false, massage: "the data not deleted from table" });
    }

  } catch (error) {
    console.error(error, "at dataControllers/deleteRowDataById delete failed");
  }
}
