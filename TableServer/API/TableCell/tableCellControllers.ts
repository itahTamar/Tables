import {
  addDataToMongoDB,
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneJoinDataFromMongoDB,
} from "../../mongoCRUD/mongoCRUD";
import { CellModel } from "../Cell/cellModel";
import { TableCellModel } from "./tableCellModel";


//!create
//add cell to table
export async function addTablesCell(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }

    // Create the new Cell document
    const newCell = new CellModel();
    console.log("At addTablesCell the newCell:", newCell);

    const response1 = await addDataToMongoDB(newCell)

    //create the new join document
    const newJoin = new TableCellModel(tableID, newCell._id)
    console.log("At addTablesCell the newJoin:", newJoin);

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
export async function getAllTablesCells(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "table data from cookie are not found in cookie",
      });
    }
    //get the join data
    const tableCellsData = await getAllDataFromMongoDB(TableCellModel, {
      tableId: tableID,
    });
    if (!tableCellsData.ok) throw new Error(tableCellsData.error);
    console.log(
      "At tableControllers/getAllTableCells the tableRowData:",
      tableCellsData
    );

    //@ts-ignore  put it in array
    const tableCellArray: ITableCellDocument[] = tableCellData.response;
    console.log(
      "At tableControllers/getAllTableCells the tableCellArray:",
      tableCellArray
    );

    //collect all the cellId from the array (as a Promise array)
    const allTableCellsArray = await tableCellArray.map((e) =>
      getOneJoinDataFromMongoDB(CellModel, e.cellId)
    );
    console.log(
      "At tableControllers/getAllTableCells the allTableCellsArray:",
      allTableCellsArray
    );
    //wait for all promises to resolve and stor the values
    const allTableCells = await Promise.all(
      allTableCellsArray.map(async (promise) => await promise)
    );
    console.log(
      "At tableControllers/getAllTableCells the allTableCells:",
      allTableCells
    );

    const extractedResponses = allTableCells.map((e) => e.response);
    console.log(
      "At tableControllers/getAllTableCells the extractedResponses:",
      extractedResponses
    );

    res.send({ ok: true, tableCellsData: extractedResponses });
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //

//!delete
//delete the table's cells and join - An empty table remains
export async function deleteTablesCells(req: any, res: any) {
  try {
    const tableID = req.params.tableId;

    if (!tableID) {
      return res.status(400).json({
        message: "at deleteTable - not found params",
      });
    }

    const tableCells = await getAllTablesCells(tableID, res);
    if (!tableCells.ok) throw new Error("failed getting table's cells");
    console.log(
      "At tableControllers/deleteTable the tableCells is:",
      tableCells
    );

    const ok = await deleteManyDataFromMongoDB(TableCellModel, tableID);

    const ok2 = await tableCells.map((e) =>
      deleteOneDataFromMongoDB(CellModel, e.cellId)
    );

    if (ok && ok2.ok) {
      res.send({
        ok: true,
        massage: "the table's cell and the join deleted from DB",
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
