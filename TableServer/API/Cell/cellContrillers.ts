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
  
  //!create
  // add cell with no connection (no join)
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
  } //
  
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
  
  // get all cells (from all DB!)
  export async function getAllCells(req: any, res: any) {
    try {
      console.log("getAllCells function");
      const dataDB = await getAllDataFromMongoDB<any>(CellModel);
      console.log("At getAllCells dataDB:", dataDB);
      res.send({ data: dataDB }); //send to client the tables information: id, fieldOdInterest, creator, fieldsOrder, dataCreated
    } catch (error) {
      console.error(error);
    }
  } //
  
  //!update
  export async function updateCellFieldsValue(req: any, res: any) {
    try {
      const { oldValues, newValues } = req.body;
      if (!oldValues || !newValues) throw new Error("please fill all");
      console.log("At updateCellFieldsValue the oldValues:", oldValues);
      console.log("At updateCellFieldsValue the newValues:", newValues);
  
      const updatedCell = await updateDataOnMongoDB(
        CellModel,
        { filter: oldValues }, //search the doc by the oldValue
        {
          //update the newValues
          update: newValues,
        }
      );
      console.log("At updateCellFieldsValue the updatedCell:", updatedCell);
  
      res.send({ ok: true, updatedCell });
    } catch (error) {
      console.error(error);
      res.send({ error });
    }
  } //
  
  //!delete
  //delete cell and its join by id
  export async function deleteCell(req: any, res: any) {
    // try {
    //   const cellID = req.params.cellId;
  
    //   if (!cellID) {
    //     return res.status(400).json({
    //       message: "at deleteCell - not found params",
    //     });
    //   }
  
    //   const tableCells = await getAllTablesCells(tableID, res);
    //   if (!tableCells.ok) throw new Error("failed getting table's cells");
    //   console.log(
    //     "At deleteCell the tableCells is:",
    //     tableCells
    //   );
  
    //   const ok =
    //     (await deleteManyDataFromMongoDB(TableCellModel, tableID)) &&
    //     (await deleteOneDataFromMongoDB(TableModel, tableID));
  
    //   const ok2 = await tableCells.map((e) =>
    //     deleteOneDataFromMongoDB(CellModel, e.cellId)
    //   );
  
    //   if (ok && ok2.ok) {
    //     res.send({
    //       ok: true,
    //       massage: "the table and her cell and the join deleted from DB",
    //     });
    //   } else {
    //     res.send({
    //       ok: false,
    //       massage: "problem in deleted table or data or join from DB",
    //     });
    //   }
    // } catch (error) {
    //   console.error(error, "at tableControllers/deleteTable - deleted failed");
    // }
  } //
  
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
  