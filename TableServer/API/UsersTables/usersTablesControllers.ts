import jwt from "jwt-simple";
import { Document, ObjectId } from "mongoose";
import {
  addDataToMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneJoinDataFromMongoDB,
} from "../../mongoCRUD/mongoCRUD";
import { UsersTablesModel } from "./usersTAblesModel";
import { TableModel } from "../Table/tableModel";

let ObjectId = require("mongoose").Types.ObjectId;

interface UserTableDocument extends Document {
  id: string;
  userId: ObjectId;
  tablesId: ObjectId;
  // Add any other properties you need
}


//!create
//add Column to table
export async function addUsersTable(req: any, res: any) {
  try {
    const userID = req.params.tableId;

    if (!userID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    // Create the new Table document
    const newTable = new TableModel();
    console.log("At addTablesColumn the newColumn:", newTable);

    const response1 = await addDataToMongoDB(newTable)

    //create the new join document
    const newJoin = new UsersTablesModel(userID, newTable._id)
    console.log("At addTablesColumn the newJoin:", newJoin);

    const response2 = await addDataToMongoDB(newJoin)

    if(response1.ok && response2.ok){
      res.send({ok: true})
    } else {
      res.send({ok: false})
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //

//!read
export async function getAllUsersTables(req: any, res: any) {
  try {
    //get user id from cookie
    console.log("hello from server getAllUserTables function")
    const userID: string = req.cookies.user; //unique id. get the user id from the cookie - its coded!
    if (!userID)
      throw new Error(
        "At userTablesCont getAllUsersTables: userID not found in cookie"
      );
    console.log("At userTablesCont getUserTables the userID from cookies: ", {
      userID,
    }); //

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error(
        "At userTablesCont getAllUsersTables: Couldn't load secret from .env"
      );

    const decodedUserId = jwt.decode(userID, secret);
    console.log(
      "At userTablesCont getAllUsersTables the decodedUserId:",
      decodedUserId
    ); //

    // const allUserTablesIDFromDBs = await UserTablesModel.find({userId: decodedUserId}); //get all users Table into array of objects with the id of the Tables not the Tables themselves
    const userTableDocResult = await getAllDataFromMongoDB(
      UsersTablesModel,
      { userId: decodedUserId }
    );
    if (!userTableDocResult.ok) throw new Error(userTableDocResult.error);
    console.log(
      "At userTablesCont getAllUsersTables the userTableDocResult:",
      userTableDocResult
    );

    //@ts-ignore
    const userTableArray1: UserTableDocument[] = userTableDocResult.response;
    console.log(
      "At userTablesCont getAllUsersTables the userTableArray1:",
      userTableArray1
    );

    const allUsersTablesArray = await userTableArray1.map((e) =>
      getOneJoinDataFromMongoDB(TableModel, e.tablesId)
    );
    console.log(
      "At userTablesCont getAllUsersTables the allUserTablesArray:",
      allUsersTablesArray
    );

    const allUserTablesData = await Promise.all(
      allUsersTablesArray.map(async (promise) => await promise)
    );
    console.log(
      "At userTablesCont getAllUsersTables the allUserTablesData:",
      allUserTablesData
    );

    const extractedResponses = allUserTablesData.map((e) => e.response);
    console.log(
      "At userTablesCont getAllUsersTables the response:",
      extractedResponses
    );

    res.send({ ok: true, Tables: extractedResponses });
    // res.send({ ok: true, Tables: allUserTablesArray});
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //

//!delete
//delete Table from user
export async function deleteUserTable(req: any, res: any) {
  try {
    const userID: string = req.cookies.user; //unique id. get the user id from the cookie - its coded!
    if (!userID)
      throw new Error(
        "At userTablesCont getUserTables: userID not found in cookie"
      );
    console.log("At userTablesCont getUserTables the userID from cookies: ", {
      userID,
    });

    const secret = process.env.JWT_SECRET;
    if (!secret)
      throw new Error(
        "At userTablesCont getUserTables: Couldn't load secret from .env"
      );

    const decodedUserId = jwt.decode(userID, secret);
    console.log("At userTablesCont getUserTables the decodedUserId:", decodedUserId);

    const TableID = req.params.TableID;
    if (!TableID) throw new Error("no Table id in params deleteUserTable");
    console.log("at TableCont/deleteUserTable the TableID:", TableID);

    if (
      await deleteOneDataFromMongoDB(UsersTablesModel, {
        TablesId: TableID,
        userId: decodedUserId,
      })
    ) {
      res.send({ ok: true, massage: "the Table deleted from user" });
    } else {
      res.send({ ok: false, massage: "the Table not deleted from user" });
    }
  } catch (error) {
    console.error(error, "at TableCont/deleteUserTable delete failed");
  }
} //