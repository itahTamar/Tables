import mongoose, { Model, Document } from "mongoose";
import { ObjectId } from "mongodb";
import { IUserWordDoc, MyJoinCollection } from "../API/words/wordModel";
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
  T extends MyDocument<IUserWordDoc>>(
  modelName: Model<MyJoinCollection<T>>,
  library1Name: string, // name of library 1
  library2Name: string, // name of library 2
  item1ID: ObjectId, // object from library 1
  item2ID: ObjectId // object from library 2
) => {
  try {
    console.log("at mongoCRUD/createAndSaveData the item1ID is:", item1ID);
    console.log("at mongoCRUD/createAndSaveData the item2ID is:", item2ID);
    console.log("at mongoCRUD/createAndSaveData the modelName is:", modelName);
    console.log(
      "at mongoCRUD/createAndSaveData the item1IdName is:",
      library1Name
    );
    console.log(
      "at mongoCRUD/createAndSaveData the item2IdName is:",
      library2Name
    );

    if (!item1ID || !item2ID) {
      throw new Error("Invalid item1ID or item2ID");
    }

    const newJoinData = await modelName.create({
      [library1Name]: item1ID,
      [library2Name]: item2ID,
    }); // save the new join in the join-DB
    console.log(
      "at mongoCRUD/createAndSaveData the newJoinData is:",
      newJoinData
    );

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
    console.log("at mongoCRUD/getAllData the modelName is:", modelName);
    const response = await modelName.find(filterCriteria);
    console.log("at mongoCRUD/getAllData the response is:", response);
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
    const response = await modelName.findOne(filterCriteria);
    console.log("at mongoCRUD/getOneDataFromMongoDB the response is:", response);
    if (response) {
      return { ok: true, response };
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
    wordsId: ObjectId;
    userId: string | ObjectId;
  }
) => {
  try {
    console.log("at mongoCRUD/getDataByID the modelName:", modelName);
    console.log("at mongoCRUD/getDataByID the filterCriteria:", filterCriteria);
    // Check if userId is a string and convert it to ObjectId
    if (typeof filterCriteria.userId === "string") {
      filterCriteria.userId = new ObjectId(filterCriteria.userId);
      console.log(
        "at mongoCRUD/getDataByID the new filterCriteria:",
        filterCriteria
      );
    }
    const response = await modelName.findOne(filterCriteria);
    console.log("at mongoCRUD/getDataByID the response is:", response);
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

//read - get a list of items by field (aggregate)
export const getXRandomDataList = async <T extends Document>(
  modelName: Model<MyDocument<T>>,
  modelId: string,
  IdMongoose: any,
  listLength: number,
  dbName: string,
  localFieldName: string,
  foreignFieldName: string,
  itemName: string
) => {
  try {
    console.log("at mongoCRUD/getDataByID the modelName:", modelName);
    console.log("at mongoCRUD/getDataByID the modelId:", modelId);
    console.log("at mongoCRUD/getDataByID the IdMongoose:", IdMongoose);
    console.log("at mongoCRUD/getDataByID the listLength:", listLength);
    console.log("at mongoCRUD/getDataByID the dbName:", dbName);
    console.log("at mongoCRUD/getDataByID the localFieldName:", localFieldName);
    console.log(
      "at mongoCRUD/getDataByID the foreignFieldName:",
      foreignFieldName
    );
    console.log("at mongoCRUD/getDataByID the itemName:", itemName);

    const response = await modelName.aggregate([
      { $match: { [modelId]: IdMongoose } },
      { $sample: { size: listLength } },
      {
        $lookup: {
          from: dbName,
          localField: localFieldName,
          foreignField: foreignFieldName,
          as: itemName,
        },
      },
    ]);
    if (response) {
      console.log("at mongoCRUD/getXRandomDataList the response:", response);
      return { ok: true, response };
    } else {
      return { ok: false };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//update
export const updateOneDataOnMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filter: any,
  update: any
) => {
  try {
    console.log("at mongoCRUD/updateOneDataOnMongoDB the modelName", modelName);
    console.log("at mongoCRUD/updateOneDataOnMongoDB the filter", filter);
    console.log("at mongoCRUD/updateOneDataOnMongoDB the update", update);
    const response = await modelName.findOneAndUpdate(filter, update, {
      new: true,
    });
    //By default, findOneAndUpdate() returns the document as it was before update was applied.
    //You should set the new option to true to return the document after update was applied
    if (response) {
      console.log("at mongoCRUD/updateOneData the response", response);
      return { ok: true, response, massage: "The word update successfully" };
    } else {
      return { ok: false, massage: "The word not exist nor update" };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//find one and update many
export const findOneAndUpdateDataOnMongoDB = async <T extends Document>(
  modelName: Model<T>,       // Generic model passed to the function
  filter: Record<string, any>, // Filter criterion (e.g., email, ID, etc.)
  update: Record<string, any>  // Fields to update
) => {
  try {
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
//item is uniq
export const deleteOneDataFromMongoDB = async <T extends Document>(
  modelName: Model<MyDocument<T>>,
  item: any
) => {
  try {
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the modelName:", modelName)
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the item:", item)

    const response = await modelName.findOneAndDelete( item );
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the response:", response)
    if (response === null) throw new Error("response is null");
    
    if (response) {
      return { ok: true };
    } else {
      return { ok: false };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok
