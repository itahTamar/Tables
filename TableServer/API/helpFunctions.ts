import { Model } from "mongoose";
import { getOneDataFromMongoDB } from "../mongoCRUD/mongoCRUD";

//help functions:
export async function isItemExist<T extends Document>(
    modelName: Model<T>,
    item: Partial<T>
  ): Promise<boolean> {
    try {
      console.log("isDataExist function");
      console.log("At isDataExist item:", item);
      const dataDB = await getOneDataFromMongoDB<any>(modelName, {
        filterCriteria: item,
      });
      console.log("At isDataExist dataDB:", dataDB);
      console.log("At isDataExist dataDB.ok:", dataDB.ok);
      return dataDB.ok;
    } catch (error) {
      console.error(error);
      return error;
    }
  }