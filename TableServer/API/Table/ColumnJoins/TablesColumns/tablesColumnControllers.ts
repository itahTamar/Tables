import {
  addDataToMongoDB,
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneJoinDataFromMongoDB,
} from "../../../../mongoDB/mongoose/mongoCRUD/withMongoose/mongoCRUD";
import { ColumnModel } from "../columnModel";
import { TableColumnModel } from "./tablesColumnModel";


//!create
//add Column to table
export async function addTablesColumn(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    // Create the new Column document
    const newColumn = new ColumnModel();
    console.log("At addTablesColumn the newColumn:", newColumn);

    const response1 = await addDataToMongoDB(newColumn)

    //create the new join document
    const newJoin = new TableColumnModel(tableID, newColumn._id)
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
// get all
export async function getAllTablesColumns(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }
    //get the join data
    const tableColumnsData = await getAllDataFromMongoDB(TableColumnModel, {
      tableId: tableID,
    });
    if (!tableColumnsData.ok) throw new Error(tableColumnsData.error);
    console.log(
      "At tableControllers/getAllTableColumns the tableRowData:",
      tableColumnsData
    );

    //@ts-ignore  put it in array
    const tableColumnArray: ITableColumnDocument[] = tableColumnData.response;
    console.log(
      "At tableControllers/getAllTableColumns the tableColumnArray:",
      tableColumnArray
    );

    //collect all the ColumnId from the array (as a Promise array)
    const allTableColumnsArray = await tableColumnArray.map((e) =>
      getOneJoinDataFromMongoDB(ColumnModel, e.ColumnId)
    );
    console.log(
      "At tableControllers/getAllTableColumns the allTableColumnsArray:",
      allTableColumnsArray
    );
    //wait for all promises to resolve and stor the values
    const allTableColumns = await Promise.all(
      allTableColumnsArray.map(async (promise) => await promise)
    );
    console.log(
      "At tableControllers/getAllTableColumns the allTableColumns:",
      allTableColumns
    );

    const extractedResponses = allTableColumns.map((e) => e.response);
    console.log(
      "At tableControllers/getAllTableColumns the extractedResponses:",
      extractedResponses
    );

    res.send({ ok: true, tableColumnsData: extractedResponses });
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //

//!delete
//delete the table's Columns and join - An empty table remains
export async function deleteTablesColumns(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "at deleteTable - not found params",
      });
    }

    const tableColumns = await getAllTablesColumns(tableID, res);
    if (!tableColumns.ok) throw new Error("failed getting table's Columns");
    console.log(
      "At tableControllers/deleteTable the tableColumns is:",
      tableColumns
    );

    const ok = await deleteManyDataFromMongoDB(TableColumnModel, tableID);

    const ok2 = await tableColumns.map((e) =>
      deleteOneDataFromMongoDB(ColumnModel, e.ColumnId)
    );

    if (ok && ok2.ok) {
      res.send({
        ok: true,
        massage: "the table's Column and the join deleted from DB",
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
