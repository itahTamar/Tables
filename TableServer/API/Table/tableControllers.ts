import {
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneDataFromJoinCollectionInMongoDB,
  saveDataToMongoDB,
} from "../../CRUD/mongoCRUD";
import { DataModel, TableDataModel } from "../Data/dataModel";
import { TableModel } from "./tableModel";
import jwt from "jwt-simple";

const { JWT_SECRET } = process.env;
const secret = JWT_SECRET;

// add table
export async function addNewTable(req: any, res: any) {
  try {
    const { fieldOfInterest, creator } = req.body;
    if (!fieldOfInterest || !creator)
      throw new Error(
        "At tableControllers/addTable missing fieldOfInterest and/or creator"
      );

    // Create the new Table document
    const newTable = new TableModel({ fieldOfInterest, creator });

    // Save the new Table to MongoDB
    const ok = await saveDataToMongoDB(newTable);
    if (!ok.ok)
      throw new Error(
        "at tableControllers/addTable Fails to save the Table in Table-db"
      );
    const tableId = ok.response._id;
    console.log("At tableControllers/addTable the tableId is:", tableId);

    //create and encode cookie with JWT
    const JWTCookie = jwt.encode({ tableId, fieldOfInterest }, secret); //the id given by mongo is store in the cookie
    console.log("At tableControllers/addTable JWTCookie:", JWTCookie); //got it here!
    if (!JWTCookie)
      throw new Error("At tableControllers/addTable JWTCookie failed");

    res.cookie(fieldOfInterest, JWTCookie, {
      // httpOnly: true,  //makes the cookie inaccessible via JavaScript on the client side. It won't show up in document.cookie or the browser's developer tools.
      path: "/", // Set the path to root to make it available across the entire site
      sameSite: "None", // Required for cross-origin cookies
      secure: process.env.NODE_ENV === "production", //conditionally set based on the environment (production (true) vs. development(false))
      maxAge: 1000 * 60 * 60 * 24, //1 day
    }); //auto send the cookie to client
    res.send({ ok: true });
  } catch (error) {
    console.error("Error in addNewRowData:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// get all table data
export async function getAllTableRowData(req: any, res: any) {
  try {
    //get table id from cookie
    const tableData = req.cookies; // get the tableId & fieldOfInterest from the cookie - its coded!

    if (!tableData) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("At tableControllers/tableRowData: Couldn't load secret from .env");
    const decodedTableData = jwt.decode(tableData, secret);
    const { tableId, fieldOfInterest } = decodedTableData;
    console.log(
      "At tableControllers/tableRowData the tableId, fieldOfInterest:",
      tableId,
      fieldOfInterest
    );

    // const allUserWordsIDFromDBs = await UserWordsModel.find({userId: decodedUserId}); //get all users word into array of objects with the id of the words not the words themselves
    const tableRowData = await getAllDataFromMongoDB(TableDataModel, {
      tableId,
    });
    if (!tableRowData.ok) throw new Error(tableRowData.error);
    console.log(
      "At tableControllers/tableRowData the userWordDocResult:",
      tableRowData
    );

    //@ts-ignore
    const tableRowDataArray: ITableDataDocument[] = tableRowData.response;
    console.log(
      "At tableControllers/tableRowData the userWordArray1:",
      tableRowDataArray
    );

    const allTableRowDataArray = await tableRowDataArray.map((e) =>
      getOneDataFromJoinCollectionInMongoDB(DataModel, e.dataId)
    );
    console.log(
      "At tableControllers/tableRowData the allUserWordsArray:",
      allTableRowDataArray
    );

    const allTableRowData = await Promise.all(
      allTableRowDataArray.map(async (promise) => await promise)
    );
    console.log(
      "At tableControllers/tableRowData the allUserWordsData:",
      allTableRowData
    );

    const extractedResponses = allTableRowData.map((e) => e.response);
    console.log(
      "At tableControllers/tableRowData the response:",
      extractedResponses
    );

    res.send({ ok: true, words: extractedResponses });
    // res.send({ ok: true, words: allUserWordsArray});
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
}

// delete table
export async function deleteTable(req: any, res: any) {
  try {
    //get table id from cookie
    const tableData = req.cookies; // get the tableId & fieldOfInterest from the cookie - its coded!

    if (!tableData) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error("At tableControllers/deleteTable: Couldn't load secret from .env");
    const decodedTableData = jwt.decode(tableData, secret);
    const { tableId, fieldOfInterest } = decodedTableData;
    console.log(
      "At tableControllers/deleteTable the tableId, fieldOfInterest:",
      tableId,
      fieldOfInterest
    );

    if (
      (await deleteOneDataFromMongoDB(TableDataModel, tableId)) &&
      (await deleteManyDataFromMongoDB(DataModel, fieldOfInterest))
    ) {
      res.send({ ok: true, massage: "the table and data deleted from DB" });
    } else {
      res.send({ ok: false, massage: "the table and data not deleted from DB" });
    }
  } catch (error) {
    console.error(error, "at tableControllers/deleteTable - deleted failed");
  }
}
