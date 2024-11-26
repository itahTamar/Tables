import mongoose, { Model, Document, UpdateQuery, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import {
  IJoinDataObjectDocument,
  MyJoinDataObjectCollection,
} from "../API/joinDataObjectModel";
export interface JoinDocument {
  item1ID: ObjectId;
  item2ID: ObjectId;
  _id?: ObjectId;
}
// Define the shape of your document
interface MyDocument<T extends Document> extends Document<any, any, T> {}

//!create:
//add object/document to a specific collection
export const addDataToMongoDB = async (data: any) => {
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

//add new field to an object/document
export async function addFieldToSchemaAndMongoDB<T>(
  modelName: Model<T>,
  fieldName: keyof T,
  defaultValue: any
): Promise<void> {
  try {
    // Check if the field already exists in the schema
    if (!(fieldName in modelName.schema.paths)) {
      // Dynamically add the field to the schema
      const newFieldSchema: Record<string, any> = {
        [fieldName as string]: {
          type: typeof defaultValue,
          default: defaultValue,
        },
      };

      // Dynamically add the field to the model's schema
      modelName.schema.add(newFieldSchema as Schema<T>);
    }

    // Update all documents with the new field and default value
    const update: UpdateQuery<T> = {
      $set: { [fieldName as string]: defaultValue },
    } as unknown as UpdateQuery<T>;
    const result = await modelName.updateMany({}, update);
    console.log(
      `${result.modifiedCount} documents were updated with the field "${String(
        fieldName
      )}".`
    );
  } catch (err) {
    console.error(
      `Error updating documents with the field "${String(fieldName)}":`,
      err
    );
  }
}

//!read:
//read - get all - find all
export const getAllDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filterCriteria?: Record<string, any>
) => {
  try {
    console.log(
      "at mongoCRUD/getAllDataFromMongoDB the modelName is:",
      modelName
    );
    const response = await modelName.find(filterCriteria);
    console.log(
      "at mongoCRUD/getAllDataFromMongoDB the response is:",
      response
    );
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
    console.log(
      "at mongoCRUD/getOneDataFromMongoDB the modelName is:",
      modelName
    );
    console.log(
      "at mongoCRUD/getOneDataFromMongoDB the filterCriteria is:",
      filterCriteria
    );
    const response = await modelName.findOne(filterCriteria);
    console.log(
      "at mongoCRUD/getOneDataFromMongoDB the response is:",
      response
    );
    if (response) {
      return { ok: true, response };
    }
    if (!response) {
      return { ok: false };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//!update:
//find one document and update - can pass multiple fields for updating.
export const updateDataOnMongoDB = async <T extends Document>(
  modelName: Model<T>, // Generic model passed to the function
  filter: Record<string, any>, // Filter criterion (e.g., email, ID, etc.) - how to find the document
  update: Record<string, any> // Fields to update - work on multiple fields
) => {
  try {
    console.log("at mongoCRUD/findOneAndUpdateDataOnMongoDB");
    console.log(
      "at mongoCRUD/findOneAndUpdateDataOnMongoDB the modelName",
      modelName
    );
    console.log(
      "at mongoCRUD/findOneAndUpdateDataOnMongoDB the filter",
      filter
    );
    console.log(
      "at mongoCRUD/findOneAndUpdateDataOnMongoDB the update",
      update
    );

    // Find a document by the filter and update the specified fields
    const response = await modelName.findOneAndUpdate(
      filter,
      { $set: update },
      {
        //$set Operator: This ensures that the fields passed in the update object are updated in the document.
        new: true, // Return the updated document
      }
    );

    if (response) {
      console.log(
        "at mongoCRUD/findOneAndUpdateDataOnMongoDB the response",
        response
      );
      return { ok: true, response, message: "Document updated successfully" };
    } else {
      return { ok: false, message: "Document not found or update failed" };
    }
  } catch (error) {
    console.error("at mongoCRUD/findOneAndUpdateDataOnMongoDB error", error);
    return { ok: false, error: error.message };
  }
}; //work ok

//!delete:
//item is uniq (delete one)
export const deleteOneDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  item: any
) => {
  try {
    console.log(
      "At mongoCRUD/deleteOneDataFromMongoDB the modelName:",
      modelName
    );
    console.log("At mongoCRUD/deleteOneDataFromMongoDB the item:", item);

    const response = await modelName.findOneAndDelete(item);
    console.log(
      "At mongoCRUD/deleteOneDataFromMongoDB the response:",
      response
    );
    if (response === null) throw new Error("response is null");

    if (response) {
      return true;
    } else {
      return false;
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

    const result = await modelName.deleteMany({ fieldOfInterest: `${filter}` });
    console.log("At deleteManyDataFromMongoDB result:", result);

    if (result.deletedCount === 0) {
      return {
        ok: false,
        deletedCount: 0,
        error: "No documents matched the filter",
      };
    }

    return { ok: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error in deleteManyDataFromMongoDB:", error);
    return { ok: false, error: error.message };
  }
}; //work ok

//delete object/document from a specific collection
export async function deleteFieldFromSchemaAndMongoDB<T>(
  modelName: Model<T>,
  FieldName: keyof T,
): Promise<boolean> {
  try {
    if (!FieldName) throw new Error("must receive the field name for delete");
    console.log("at deleteFieldFromSchemaAndMongoDB the FieldName:", FieldName)
    if (FieldName in modelName.schema.paths) {
      //Remove the field from the schema and documents
      modelName.schema.remove(FieldName as string); // Remove from schema
      const unsetUpdate = {
        $unset: { [FieldName as string]: "" },
      } as unknown as UpdateQuery<T>;
      await modelName.updateMany({}, unsetUpdate); // Remove from documents
      console.log(
        `Field "${String(FieldName)}" successfully deleted from all documents.`
      );
      return true
    } else {
      console.log(`"${String(FieldName)}" field do not exist`)
      return false
    }
  } catch (err) {
    console.error(`Error deleting field from "${String(FieldName)}":`, err);
  }
} //!not working good - don't know where the error

//**for join collection:
//!create:
export const addJoinDataToMongoDB = async <
  T extends MyDocument<IJoinDataObjectDocument>
>(
  modelName: Model<MyJoinDataObjectCollection<T>>,
  field1Name: string, // field's name of first object (example: userId)
  field2Name: string, // field's name of second object (example: tableId)
  item1ID: ObjectId, // the id of the first object
  item2ID: ObjectId // the id of the second object
) => {
  try {
    console.log(
      "at mongoCRUD/createAndSaveData the field1Name is:",
      field1Name
    );
    console.log(
      "at mongoCRUD/createAndSaveData the field2Name is:",
      field2Name
    );
    console.log("at mongoCRUD/createAndSaveData the item1ID is:", item1ID);
    console.log("at mongoCRUD/createAndSaveData the item2ID is:", item2ID);
    console.log("at mongoCRUD/createAndSaveData the modelName is:", modelName);

    if (!item1ID || !item2ID) {
      throw new Error("Invalid item1ID or item2ID");
    }

    const newJoinData = await modelName.create({
      [field1Name]: item1ID,
      [field2Name]: item2ID,
    }); // save the new join in the join-DB
    console.log(
      "at mongoCRUD/createAndSaveData the newJoinData is:",
      newJoinData
    );

    const response = await addDataToMongoDB(newJoinData);
    console.log("at mongoCRUD/createAndSaveData the response is:", response);

    if (response) {
      return { ok: true, response };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: error.message };
  }
}; //work ok

//!get:
//read - get by id
export const getOneJoinDataFromMongoDB = async <T extends Document>(
  modelName: Model<T>,
  filterCriteria: {
    id: string | ObjectId;
  }
) => {
  try {
    console.log(
      "at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the modelName:",
      modelName
    );
    console.log(
      "at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the filterCriteria:",
      filterCriteria
    );
    // Check if id is a string and convert it to ObjectId
    if (typeof filterCriteria.id === "string") {
      filterCriteria.id = new ObjectId(filterCriteria.id);
      console.log(
        "at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the new filterCriteria:",
        filterCriteria
      );
    }
    const response = await modelName.findOne(filterCriteria);
    console.log(
      "at mongoCRUD/getOneDataFromJoinCollectionInMongoDB the response is:",
      response
    );
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