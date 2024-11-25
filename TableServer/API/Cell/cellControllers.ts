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
  import { CellModel } from "./cellModel";
import { ColumnsCellsModel } from "../Table/ColumnJoins/ColumnsCells/columnsCellsModel";
  
  //!create
  // add cell with no connection (no join) - useless
  export async function addCell(req: any, res: any) {
    try {
      console.log("addCell:");
      
      // Create the new Cell document
      const newCell = new CellModel();
  
      console.log("At addCell the newCell:", newCell);
  
      // Save the new Table to MongoDB
      const response = await addDataToMongoDB(newCell);
      console.log("At addCell the response:", response);
      if (!response.ok)
        throw new Error(
          "at addCell Fails to save the Table in Table-db"
        );
      const cellId = response.response._id;
      console.log("At addCell the tableId is:", cellId);
  
      res.send({ ok: true });
    } catch (error) {
      console.error("Error in addCell:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } // not in use
  
  export async function addCellField(req: any, res: any) {
    try {
      const { fieldName } = req.body.fieldName;
      if (!fieldName) throw new Error("At addUserField no fieldName found");
  
      await addFieldToSchemaAndMongoDB(CellModel, fieldName, " ");
      res.send({ ok: true, massage: "documents were updated with the field" });
    } catch (error) {
      console.error(error);
      res.send({ error });
    }
  } //
  
  //!read
  //get one cell by id
  export async function getCell(req: any, res: any) {
    try {
      const cellId = req.params.cellId;
      if (!cellId) throw new Error("at getCell no cellId found");
  
      const cell = await getOneDataFromMongoDB(CellModel, cellId);
  
      if (cell.ok) {
        res.send(cell.response); //return the table data
      } else {
        res.send(cell.ok); //return false
      }
    } catch (error) {
      console.error(error);
    }
  } //
  
  // get all cells (from all DB!) - useless
  export async function getAllCells(req: any, res: any) {
    try {
      console.log("getAllCells function");
      const dataDB = await getAllDataFromMongoDB<any>(CellModel);
      console.log("At getAllCells dataDB:", dataDB);
      res.send({ data: dataDB }); //send to client the tables information: id, fieldOdInterest, creator, fieldsOrder, dataCreated
    } catch (error) {
      console.error(error);
    }
  } // not in use
  
  //!update
  export async function updateCellFieldsValue(req: any, res: any) {
    try {
      const dataID = req.params.cellID;
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
        CellModel,
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
  //delete cell and its join by id -useless
  export async function deleteCell(req: any, res: any) {
    try {
      const cellID = req.params.cellId;
  
      if (!cellID) {
        return res.status(400).json({
          message: "at deleteCell - not found params",
        });
      }
  
      const ok =
        (await deleteOneDataFromMongoDB(ColumnsCellsModel, cellID)) &&
        (await deleteOneDataFromMongoDB(CellModel, cellID));
    
      if (ok) {
        res.send({
          ok: true,
          massage: "the cell and it join deleted from DB",
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
  } // not in use
  
  export async function deleteCellsField(req: any, res: any) {
    try {
      const { fieldName } = req.body.fieldName;
      if (!fieldName) throw new Error("At addUserField no fieldName found");
  
      await deleteFieldFromSchemaAndMongoDB(CellModel, fieldName);
      res.send({
        ok: true,
        massage: "field successfully deleted from all documents",
      });
    } catch (error) {
      console.error(error);
      res.send({ error });
    }
  } //
  