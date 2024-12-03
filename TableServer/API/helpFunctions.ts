import { Model } from "mongoose";
import { getOneDataFromMongoDB } from "../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD";

//help functions:
export async function isItemExist<T extends Document>(
    modelName: Model<T>,
    item: Partial<T>
  ): Promise<boolean> {
    try {
      console.log("isItemExist function");
      console.log("At isItemExist item:", item);
      const dataDB = await getOneDataFromMongoDB<any>(modelName, {
        filterCriteria: item,
      });
      console.log("At isItemExist dataDB:", dataDB);
      console.log("At isItemExist dataDB.ok:", dataDB.ok);
      return dataDB.ok;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

