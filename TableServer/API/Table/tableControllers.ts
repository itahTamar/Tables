import {
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneDataFromJoinCollectionInMongoDB,
  getOneDataFromMongoDB,
  saveDataToMongoDB,
} from "../../CRUD/mongoCRUD";
import { DataModel, TableDataModel } from "../Data/dataModel";
import { TableModel } from "./tableModel";
import jwt from "jwt-simple";

// add table
export async function addNewTable(req: any, res: any) {
  try {
    console.log("addNewTable():");
    const { fieldOfInterest, creator } = req.body;
    console.log(
      "At tableControllers/addTable the fieldOfInterest:",
      fieldOfInterest
    );
    console.log("At tableControllers/addTable the creator:", creator);

    if (!fieldOfInterest || !creator)
      throw new Error(
        "At tableControllers/addTable missing fieldOfInterest and/or creator"
      );

    const isExist = await isTableExist(fieldOfInterest)  
    if (isExist) return res.send({ok: false, massage: "Table Exist in DB"})
    
    // Create the new Table document
    const newTable = new TableModel({ fieldOfInterest, creator });

    console.log("At tableControllers/addTable the newTable:", newTable);

    // Save the new Table to MongoDB
    const response = await saveDataToMongoDB(newTable);
    console.log("At tableControllers/addTable the response:", response);
    if (!response.ok)
      throw new Error(
        "at tableControllers/addTable Fails to save the Table in Table-db"
      );
    const tableId = response.response._id;
    console.log("At tableControllers/addTable the tableId is:", tableId);

    res.send({ ok: true });
  } catch (error) {
    console.error("Error in addNewTable:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} //work ok

// get all table data
export async function getAllTableRowData(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    const tableRowData = await getAllDataFromMongoDB(TableDataModel, {
      tableId: tableID,
    });
    if (!tableRowData.ok) throw new Error(tableRowData.error);
    console.log(
      "At tableControllers/tableRowData the tableRowData:",
      tableRowData
    );

    //@ts-ignore
    const tableRowDataArray: ITableDataDocument[] = tableRowData.response;
    console.log(
      "At tableControllers/tableRowData the tableRowDataArray:",
      tableRowDataArray
    );

    const allTableRowDataArray = await tableRowDataArray.map((e) =>
      getOneDataFromJoinCollectionInMongoDB(DataModel, e.dataId)
    );
    console.log(
      "At tableControllers/tableRowData the allTableRowDataArray:",
      allTableRowDataArray
    );

    const allTableRowData = await Promise.all(
      allTableRowDataArray.map(async (promise) => await promise)
    );
    console.log(
      "At tableControllers/tableRowData the allTableRowData:",
      allTableRowData
    );

    const extractedResponses = allTableRowData.map((e) => e.response);
    console.log(
      "At tableControllers/tableRowData the extractedResponses:",
      extractedResponses
    );

    res.send({ ok: true, rowsData: extractedResponses });
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //work ok

// get all tables (for all users!)
export async function getAllTables(req: any, res: any) {
  try {
    console.log("getAllTables function");
    const dataDB = await getAllDataFromMongoDB<any>(TableModel);
    console.log("At getAllTables dataDB:", dataDB);
    res.send({ data: dataDB }); //send to client the tables information: id, fieldOdInterest, creator, fieldsOrder, dataCreated
  } catch (error) {
    console.error(error);
  }
} //work ok

// delete table
export async function deleteTable(req: any, res: any) {
  try {
    const tableID = req.params.tableId;
    const fieldOfInterest = req.params.fieldOfInterest;

    if (!tableID || !fieldOfInterest) {
      return res.status(400).json({
        message: "at deleteTable - not found params",
      });
    }
    const ok =
      (await deleteOneDataFromMongoDB(TableDataModel, tableID)) &&
      (await deleteOneDataFromMongoDB(TableModel, tableID));

    const ok2 = await deleteManyDataFromMongoDB(DataModel, fieldOfInterest)

    if (ok && ok2.ok) {
      res.send({
        ok: true,
        massage: "the table and data and the join deleted from DB",
      });
    } else {
      res.send({
        ok: false,
        massage: "problem in deleted table or data or join from DB",
      });
    }
  } catch (error) {
    console.error(error, "at tableControllers/deleteTable - deleted failed");
  }
} //work ok

export async function isTableExist(fieldOfInterest) {
  try {
    console.log("isTableExist function");
    console.log("At isTableExist fieldOfInterest:", fieldOfInterest);
    const dataDB = await getOneDataFromMongoDB<any>(TableModel, {
      fieldOfInterest: fieldOfInterest,
    });
    console.log("At isTableExist dataDB:", dataDB);
    console.log("At isTableExist dataDB.ok:", dataDB.ok);
    return dataDB.ok;
  } catch (error) {
    console.error(error);
    return error;
  }
} //work ok