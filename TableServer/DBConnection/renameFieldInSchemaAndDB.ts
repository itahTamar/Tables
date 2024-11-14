import mongoose, { Model, Schema, UpdateQuery } from 'mongoose';

export async function renameFieldInSchemaAndDB<T>(
  modelName: Model<T>,
  oldFieldName: keyof T,
  newFieldName: keyof T,
  defaultValue: any
): Promise<void> {
  try {
    // Check if the old field exists in the schema and the new one does not
    if (oldFieldName in modelName.schema.paths && !(newFieldName in modelName.schema.paths)) {
      
      // Step 1: Dynamically add the new field to the schema
      const newFieldSchema: Record<string, any> = {
        [newFieldName as string]: { type: typeof defaultValue, default: defaultValue },
      };
      modelName.schema.add(newFieldSchema as Schema<T>);
      
      // Step 2: Update documents by copying the data from oldFieldName to newFieldName
      const update: UpdateQuery<T> = {
        $set: { [newFieldName as string]: `$${oldFieldName as string}` },
      } as unknown as UpdateQuery<T>;
      
      // MongoDB aggregation to update using oldField value for each document
      const result = await modelName.updateMany({}, update);
      console.log(`${result.modifiedCount} documents were updated with the new field "${String(newFieldName)}".`);
      
      // Step 3: Remove the old field from the schema and documents
      modelName.schema.remove(oldFieldName as string); // Remove from schema
      const unsetUpdate = { $unset: { [oldFieldName as string]: "" } } as unknown as UpdateQuery<T>;
      await modelName.updateMany({}, unsetUpdate); // Remove from documents
      
      console.log(`Field "${String(oldFieldName)}" successfully renamed to "${String(newFieldName)}".`);
    } else {
      console.log(`Cannot rename: Either "${String(oldFieldName)}" does not exist or "${String(newFieldName)}" already exists in the schema.`);
    }
  } catch (err) {
    console.error(`Error renaming field from "${String(oldFieldName)}" to "${String(newFieldName)}":`, err);
  }
}
