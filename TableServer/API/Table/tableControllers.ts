import mongoose from "mongoose";
import {
  addDataToMongoDB,
  addFieldToSchemaAndMongoDB,
  deleteFieldFromSchemaAndMongoDB,
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneDataFromMongoDB,
  updateDataOnMongoDB,
} from "../../mongoCRUD/mongoCRUD";
import { CellModel } from "../Cell/cellModel";
import { isItemExist } from "../helpFunctions";
import { getAllTablesColumns } from "./ColumnJoins/TablesColumns/tablesColumnControllers";
import { TableColumnModel } from "./ColumnJoins/TablesColumns/tablesColumnModel";
import { TableModel } from "./tableModel";

//!create
// add table
export async function addTable(req: any, res: any) {
  try {
    console.log("addNewTable():");
    const { tableName } = req.body;
    console.log(
      "At tableControllers/addTable the tableName:",
      tableName
    );

    if (!tableName)
      throw new Error(
        "At tableControllers/addTable missing tableName"
      );

    //@ts-ignore
    // const isExist = await isItemExist(TableModel, {tableName});
    // if (isExist) return res.send({ ok: false, massage: "Table Exist in DB" });

    // Create the new Table document
    const newTable = new TableModel({ tableName });

    console.log("At tableControllers/addTable the newTable:", newTable);

    // Save the new Table to MongoDB
    const response = await addDataToMongoDB(newTable);
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
} // work ok

//add new field to all table's documents
export async function addTableField(req: any, res: any) {
  try {
    const { fieldName } = req.body.fieldName;
    if (!fieldName) throw new Error("At addUserField no fieldName found");

    await addFieldToSchemaAndMongoDB(TableModel, fieldName, " ");
    res.send({ ok: true, massage: "documents were updated with the field" });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //

//!read
//get one table
export async function getTable(req: any, res: any) {
  try {
    const tableId = new mongoose.Types.ObjectId(String(req.params.tableId));
    if (!tableId) throw new Error("at getTable no tableId found");

    const table = await getOneDataFromMongoDB(TableModel, tableId);

    if (table.ok) {
      res.send(table.response); //return the table data
    } else {
      res.send(table.ok); //return false
    }
  } catch (error) {
    console.error(error);
  }
} //work ok

// get all tables (for all users!) - useless
export async function getAllTables(req: any, res: any) {
  try {
    console.log("getAllTables function");
    const dataDB = await getAllDataFromMongoDB<any>(TableModel);
    console.log("At getAllTables dataDB:", dataDB);
    res.send({ data: dataDB }); //send to client the tables information: id, fieldOdInterest, creator, fieldsOrder, dataCreated
  } catch (error) {
    console.error(error);
  }
} //not in use

//!update
export async function updateTableFieldsValue(req: any, res: any) {
  try {
    const dataID = req.params.tableID;
    if (!dataID) throw new Error("no Data id in params updateData");
    console.log("at dataControllers/updateFieldByDataId the DataID:", dataID);

    const { field } = req.body;
    console.log("at dataControllers/updateFieldByDataId the field:", field); //ok

    const { updateData } = req.body;
    console.log("at dataControllers/updateFieldByDataId the updateData:", updateData); //ok
    if (!field || updateData == undefined)
      throw new Error("missing data required field or updateData");

    const updateFieldData = { [field]: updateData };
    console.log(
      "at dataControllers/updateFieldByDataId the updateFieldData:",
      updateFieldData
    );

    //find the Data in DB by Data_id and update the require field
    const DataExistAndUpdate = await updateDataOnMongoDB(
      TableModel,
      { _id: dataID },
      updateFieldData
    );
    console.log(
      "at dataControllers/updateFieldByDataId the DataExistAndUpdate",
      DataExistAndUpdate
    );
    res.send(DataExistAndUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
} //

//!delete
//delete all table records (table, cells, tableCell)
export async function deleteTable(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "at deleteTable - not found params",
      });
    }

    const tableCells = await getAllTablesColumns(tableID, res);
    if (!tableCells.ok) throw new Error("failed getting table's cells");
    console.log(
      "At tableControllers/deleteTable the tableCells is:",
      tableCells
    );

    const ok =
      (await deleteManyDataFromMongoDB(TableColumnModel, tableID)) &&
      (await deleteOneDataFromMongoDB(TableModel, tableID));

    const ok2 = await tableCells.map((e) =>
      deleteOneDataFromMongoDB(CellModel, e.cellId)
    );

    if (ok && ok2.ok) {
      res.send({
        ok: true,
        massage: "the table and her cell and the join deleted from DB",
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
} //

export async function deleteTableField(req: any, res: any) {
  try {
    const { fieldName } = req.body.fieldName;
    if (!fieldName) throw new Error("At addUserField no fieldName found");

    await deleteFieldFromSchemaAndMongoDB(TableModel, fieldName);
    res.send({
      ok: true,
      massage: "field successfully deleted from all documents",
    });
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
} //
