import { Model } from "mongoose";
import { getOneDataFromMongoDB } from "../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD";
import jwt from 'jwt-simple';

//help functions:
export async function isItemExist<T extends Document>(
  modelName: Model<T>,
  item: Partial<T>
): Promise<boolean> {
  try {
    console.log("isItemExist function");
    console.log("At isItemExist item:", item);
    const dataDB = await getOneDataFromMongoDB<any>(modelName, item);
    console.log("At isItemExist dataDB:", dataDB);
    console.log("At isItemExist dataDB.ok:", dataDB.ok);
    return dataDB.ok;
  } catch (error) {
    console.error(error);
    return error;
  }
} //work ok

export const extractCookie = (req: any, res: any, next) => {
  try {
    console.log("Request Cookies:", req.cookies);
    const userID: string = req.cookies.user; //unique id. get the user id from the cookie - its coded!
    if (!userID)
      throw new Error(
        "At extractCookie: userID not found in cookie"
      );
    console.log("At extractCookie the userID from cookies: ", {
      userID,
    }); 

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error(
        "At extractCookie: Couldn't load secret from .env"
      );

    const decodedUserId = jwt.decode(userID, secret);
    console.log(
      "At extractCookie the decodedUserId:",
      decodedUserId
    ); 
   
        // Attach the decoded user ID to the req object
        req.user = decodedUserId;

        next(); // Pass control to the next middleware/handler
  } catch (error) {
    console.error("Error in extractCookie middleware:", error.message);
    res.status(401).send({ error: "Unauthorized access" });
  }
} //work ok