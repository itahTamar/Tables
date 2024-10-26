//general function to add a field to DB and schema
import mongoose, { Model, Schema, UpdateQuery } from 'mongoose';

export async function addFieldToSchemaAndDB<T>(
  modelName: Model<T>,
  fieldName: keyof T ,
  defaultValue: any
): Promise<void> {
  try {
    // Check if the field already exists in the schema
    if (!(fieldName in modelName.schema.paths)) {
      // Dynamically add the field to the schema
      const newFieldSchema: Record<string, any> = {
        [fieldName as string]: { type: typeof defaultValue, default: defaultValue },
      };

       // Dynamically add the field to the model's schema
       modelName.schema.add(newFieldSchema as Schema<T>);
    }

    // Update all documents with the new field and default value
    const update: UpdateQuery<T> = { $set: { [fieldName as string]: defaultValue } } as unknown as UpdateQuery<T>;
    const result = await modelName.updateMany({}, update);
    console.log(`${result.modifiedCount} documents were updated with the field "${String(fieldName)}".`);
  } catch (err) {
    console.error(`Error updating documents with the field "${String(fieldName)}":`, err);
  }
}

