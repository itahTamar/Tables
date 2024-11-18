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
import { DataModel, TableDataModel } from "./rowModel";

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
} // 

export async function updateFieldByDataId(req: any, res: any) {
  try {
    const dataID = req.params.dataID;
    if (!dataID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", dataID);

    const { field } = req.body;
    console.log("at dataControllers/updateFieldByDataId the field:", field); //ok

    const { updateData } = req.body;
    console.log("at dataControllers/updateFieldByDataId the updateData:", updateData); //ok
//!changed this from (!updateData), need to try it in deferent fields types
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
} //

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
} //


