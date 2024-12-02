import {
  addDataToMongoDB,
  deleteManyDataFromMongoDB,
  deleteOneDataFromMongoDB,
  getAllDataFromMongoDB,
  getOneJoinDataFromMongoDB,
} from "../../../../mongoCRUD/withMongoose/mongoCRUD";
import { CellModel } from "../../../Cell/cellModel";
import { ColumnsCellsModel } from "./columnsCellsModel";

//!create
//add Cell to Column
export async function addColumnsCell(req: any, res: any) {
  try {
    const columnID = req.params.columnID;

    if (!columnID) {
      return res.status(400).json({
        message: "Column data from cookie are not found in cookie",
      });
    }

    // Create the new Cell document
    const newCell = new CellModel();
    console.log("At addColumnsCell the newCell:", newCell);

    const response1 = await addDataToMongoDB(newCell)

    //create the new join document
    const newJoin = new ColumnsCellsModel(columnID, newCell._id)
    console.log("At addColumnsCell the newJoin:", newJoin);

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
export async function getAllColumnsCells(req: any, res: any) {
  try {
    const columnID = req.params.columnID;

    if (!columnID) {
      return res.status(400).json({
        message: "Column data from cookie are not found in cookie",
      });
    }
    //get the join data
    const ColumnCellsData = await getAllDataFromMongoDB(ColumnsCellsModel, {
      columnID: columnID,
    });
    if (!ColumnCellsData.ok) throw new Error(ColumnCellsData.error);
    console.log(
      "At ColumnControllers/getAllColumnCells the ColumnRowData:",
      ColumnCellsData
    );

    //@ts-ignore  put it in array
    const ColumnCellArray: IColumnCellDocument[] = ColumnCellData.response;
    console.log(
      "At ColumnControllers/getAllColumnCells the ColumnCellArray:",
      ColumnCellArray
    );

    //collect all the CellId from the array (as a Promise array)
    const allColumnCellsArray = await ColumnCellArray.map((e) =>
      getOneJoinDataFromMongoDB(CellModel, e.CellId)
    );
    console.log(
      "At ColumnControllers/getAllColumnCells the allColumnCellsArray:",
      allColumnCellsArray
    );
    //wait for all promises to resolve and stor the values
    const allColumnCells = await Promise.all(
      allColumnCellsArray.map(async (promise) => await promise)
    );
    console.log(
      "At ColumnControllers/getAllColumnCells the allColumnCells:",
      allColumnCells
    );

    const extractedResponses = allColumnCells.map((e) => e.response);
    console.log(
      "At ColumnControllers/getAllColumnCells the extractedResponses:",
      extractedResponses
    );

    res.send({ ok: true, ColumnCellsData: extractedResponses });
  } catch (error) {
    console.error(error);
    res.status(500).send({ ok: false, error: error.message });
  }
} //

//!delete
//delete the Column's Cells and join - An empty Column remains
export async function deleteColumnsCells(req: any, res: any) {
  try {
    const columnID = req.params.columnID;

    if (!columnID) {
      return res.status(400).json({
        message: "at deleteColumn - not found params",
      });
    }

    const ColumnCells = await getAllColumnsCells(columnID, res);
    if (!ColumnCells.ok) throw new Error("failed getting Column's Cells");
    console.log(
      "At ColumnControllers/deleteColumn the ColumnCells is:",
      ColumnCells
    );

    const ok = await deleteManyDataFromMongoDB(ColumnsCellsModel, columnID);

    const ok2 = await ColumnCells.map((e) =>
      deleteOneDataFromMongoDB(CellModel, e.CellId)
    );

    if (ok && ok2.ok) {
      res.send({
        ok: true,
        massage: "the Column's Cell and the join deleted from DB",
      });
    } else {
      res.send({
        ok: false,
        massage: "problem in deleted Column or data or join from DB",
      });
    }
  } catch (error) {
    console.error(error, "at ColumnControllers/deleteColumn - deleted failed");
  }
} //
