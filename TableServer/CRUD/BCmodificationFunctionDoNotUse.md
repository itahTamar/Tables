//help functions:

//function to add a new field to specific table's documents in the datas collection
export async function addFieldToSpecificTableDocuments(
  tableId: mongoose.Types.ObjectId, // The specific tableId to target
  newColumnName: string // The new field to add
): Promise<boolean> {
  try {
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the tableId:",
      tableId
    );
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the newColumnName:",
      newColumnName
    );

    // Step 1: Find all `dataId`s in `tabledatas` linked to the given `tableId`
    const tableDataRecords = await TableDataModel.find({ tableId }).select(
      "dataId"
    );
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the tableDataRecords:",
      tableDataRecords
    );

    //@ts-ignore
    const dataIds = tableDataRecords.map((record) => record.dataId);
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the dataIds:",
      dataIds
    );

    // Step 2: Update each `data` document with the new field, filtering by `dataId`
    const defaultValue = "";
    const update: UpdateQuery<any> = {
      $set: { [newColumnName as string]: defaultValue },
    } as unknown as UpdateQuery<any>;
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the update:",
      update
    );

    const result = await DataModel.updateMany(
      { _id: { $in: dataIds } },
      update,
      { writeConcern: { w: "majority" } }
    ); //set the writeConcern option to enforce an acknowledgment if MongoDB is configured with specific write concerns
    console.log(
      "at dataControllers/addFieldToSpecificTableDocuments the result:",
      result
    );
    if (!result.acknowledged)
      throw new Error(
        "at dataControllers/addFieldToSpecificTableDocuments fail to add new filed"
      );

    console.log(
      `${result.modifiedCount} documents were updated with the field "${newColumnName}" for the specified table.`
    );
    return true;
  } catch (err) {
    console.error(
      `Error updating documents with the field "${newColumnName}":`,
      err
    );
  }
} //

export async function renameFieldInSpecificTableDocuments(
  tableId: mongoose.Types.ObjectId, // The specific tableId to target
  oldFieldName: string, // The existing field to rename
  newFieldName: string // The new field name
): Promise<boolean> {
  try {
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments the tableId:",
      tableId
    );
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments the oldFieldName:",
      oldFieldName
    );
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments the newFieldName:",
      newFieldName
    );

    // Step 1: Find all `dataId`s in `tabledatas` linked to the given `tableId`
    const tableDataRecords = await TableDataModel.find({ tableId }).select(
      "dataId"
    );
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments the tableDataRecords:",
      tableDataRecords
    );

    // Extract the `dataId`s from the records
    //@ts-ignore
    const dataIds = tableDataRecords.map((record) => record.dataId);
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments the dataIds:",
      dataIds
    );

    // Step 2: Update each `data` document by copying data from `oldFieldName` to `newFieldName`
    const update: UpdateQuery<any> = {
      $set: { [newFieldName]: `$${oldFieldName}` },
    };
    const renameResult = await DataModel.updateMany(
      { _id: { $in: dataIds } },
      [update], // Use aggregation pipeline to perform field copy
      { writeConcern: { w: "majority" } }
    );
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments rename result:",
      renameResult
    );

    // Step 3: Remove the `oldFieldName` field from each document
    const unsetResult = await DataModel.updateMany(
      { _id: { $in: dataIds } },
      { $unset: { [oldFieldName]: "" } } as UpdateQuery<any>,
      { writeConcern: { w: "majority" } }
    );
    console.log(
      "at dataControllers/renameFieldInSpecificTableDocuments unset result:",
      unsetResult
    );

    console.log(
      `Field "${oldFieldName}" was successfully renamed to "${newFieldName}" for ${renameResult.modifiedCount} documents in the specified table.`
    );
    return true;
  } catch (err) {
    console.error(
      `Error renaming field "${oldFieldName}" to "${newFieldName}":`,
      err
    );
    return false;
  }
} //