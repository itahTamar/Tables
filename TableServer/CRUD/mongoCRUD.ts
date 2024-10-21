import { ObjectId } from "mongodb";
import { Model, Document } from "mongoose";
import { DataModel } from './../API/dataModel';

export interface JoinDocument {
  item1ID: ObjectId;
  item2ID: ObjectId;
  _id?: ObjectId;
}
// Define the shape of your document
interface MyDocument<T extends Document> extends Document<any, any, T> {}

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