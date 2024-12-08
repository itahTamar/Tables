import mongoose, { Model, Document } from "mongoose";
import { ObjectId } from "mongodb";
import { ITableDataDocument, MyJoinCollection } from "../API/Data/dataModel";
export interface JoinDocument {
  item1ID: ObjectId;
  item2ID: ObjectId;
  _id?: ObjectId;
}
// Define the shape of your document
interface MyDocument<T extends Document> extends Document<any, any, T> {}

//create
export const saveDataToMongoDB = async (data: any) => {
  try {
    console.log("at mongoCRUD/saveData the data is:", data);
    const response = await data.save();
    console.log("at mongoCRUD/saveData the response is:", response);
    if (response) {
      return { ok: true, response };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//only for join collection
export const createAndSaveDataToMongoDB = async <
  T extends MyDocument<ITableDataDocument>>(
  modelName: Model<MyJoinCollection<T>>,
  library1Name: string, // name of first library (e.g: tableId)
  library2Name: string, // name of second library (e,g: allDataId)
  item1ID: ObjectId, // object from first library 
  item2ID: ObjectId // object from second library 
) => {
  try {
    console.log("at mongoCRUD/createAndSaveData the library1Name is:", library1Name);
    console.log("at mongoCRUD/createAndSaveData the library2Name is:", library2Name);
    console.log("at mongoCRUD/createAndSaveData the item1ID is:", item1ID);
    console.log("at mongoCRUD/createAndSaveData the item2ID is:", item2ID);
    console.log("at mongoCRUD/createAndSaveData the modelName is:", modelName);

    if (!item1ID || !item2ID) {
      throw new Error("Invalid item1ID or item2ID");
    }

    const newJoinData = await modelName.create({
      [library1Name]: item1ID,
      [library2Name]: item2ID,
    }); // save the new join in the join-DB
    console.log("at mongoCRUD/createAndSaveData the newJoinData is:", newJoinData);

    const response = await saveDataToMongoDB(newJoinData);
    console.log("at mongoCRUD/createAndSaveData the response is:", response);

    if (response) {
      return { ok: true, response };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//read - get all - find all
export const getAllDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filterCriteria?: Record<string, any>
) => {
  try {
    console.log("at mongoCRUD/getAllDataFromMongoDB the modelName is:", modelName);
    const response = await modelName.find(filterCriteria);
    console.log("at mongoCRUD/getAllDataFromMongoDB the response is:", response);
    if (response) {
      return { ok: true, response };
    } else {
      return { ok: false };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//read - get one - find one
export const getOneDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filterCriteria: Record<string, any>
) => {
  try {
    console.log("at mongoCRUD/getOneDataFromMongoDB the modelName is:", modelName);
    console.log("at mongoCRUD/getOneDataFromMongoDB the filterCriteria is:", filterCriteria);
    const response = await modelName.findOne(filterCriteria);
    console.log("at mongoCRUD/getOneDataFromMongoDB the response is:", response);
    if (response) {
      return { ok: true, response };
    }
    if (!response) {
      return {ok: false}
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//read - get by id
export const getOneDataFromJoinCollectionInMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filterCriteria: {
    id: string | ObjectId;
  }
) => {
  try {
    console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the modelName:", modelName);
    console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the filterCriteria:", filterCriteria);
    // Check if id is a string and convert it to ObjectId
    if (typeof filterCriteria.id === "string") {
      filterCriteria.id = new ObjectId(filterCriteria.id);
      console.log(
        "at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the new filterCriteria:",
        filterCriteria
      );
    }
    const response = await modelName.findOne(filterCriteria);
    console.log("at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the response is:", response);
    if (response) {
      return { ok: true, response };
    } else {
      return { ok: false, error: "No document found" };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//find one and update many
export const findOneAndUpdateDataOnMongoDB = async <T extends Document>(
  modelName: Model<T>,       // Generic model passed to the function
  filter: Record<string, any>, // Filter criterion (e.g., email, ID, etc.) - how to find the document
  update: Record<string, any>  // Fields to update - work on multiple fields
) => {
  try {
    console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB");
    console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the modelName", modelName);
    console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the filter", filter);
    console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the update", update);

    // Find a document by the filter and update the specified fields
    const response = await modelName.findOneAndUpdate(filter, { $set: update }, {
      //$set Operator: This ensures that the fields passed in the update object are updated in the document. 
      //You can pass multiple fields for updating.
      new: true,  // Return the updated document
    });

    if (response) {
      console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB the response", response);
      return { ok: true, response, message: "Document updated successfully" };
    } else {
      return { ok: false, message: "Document not found or update failed" };
    }
  } catch (error) {
    console.error("at mongoCRUD/findOneAndUpdateDataOnMongoDB error", error);
    return { ok: false, error: error.message };
  }
}; //work ok

//delete
//item is uniq (delete one)
export const deleteOneDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  item: any
) => {
  try {
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the modelName:", modelName)
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the item:", item)

    const response = await modelName.findOneAndDelete( item );
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the response:", response)
    if (response === null) throw new Error("response is null");
    
    if (response) {
      return true ;
    } else {
      return false ;
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//delete many by one field

export const deleteManyDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filter: any
): Promise<{ ok: boolean; deletedCount?: number; error?: string }> => {
  try {
    console.log("At deleteManyDataFromMongoDB the modelName:", modelName);
    console.log("At deleteManyDataFromMongoDB the filter:", filter);

    const result = await modelName.deleteMany({fieldOfInterest: `${filter}`});
    console.log("At deleteManyDataFromMongoDB result:", result);

    if (result.deletedCount === 0) {
      return { ok: false, deletedCount: 0, error: "No documents matched the filter" };
    }

    return { ok: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error in deleteManyDataFromMongoDB:", error);
    return { ok: false, error: error.message };
  }
}; //work ok