import {
  createAndSaveDataToMongoDB,
  getAllDataFromMongoDB,
  saveDataToMongoDB,
  updateOneDataOnMongoDB,
} from "../../CRUD/mongoCRUD";
import { DataModel, TableDataModel } from "./dataModel";

const { JWT_SECRET } = process.env;
const secret = JWT_SECRET;
const saltRounds = 10;

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
    const { tableId, fieldOfInterest, creator } = req.cookie;

    if (!fieldOfInterest || !creator || !tableId) {
      return res
        .status(400)
        .json({
          message:
            "Field of interest, creator, and tableId are not found in cookie",
        });
    }

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
    const DataID = req.params.DataID;
    if (!DataID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", DataID);

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
      { _id: DataID },
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
