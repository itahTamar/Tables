import mongoose, { Schema, Model } from 'mongoose';

interface SchemaField {
  name: string;
  type: string; // e.g., 'String', 'Number', 'Boolean', etc.
  required?: boolean;
  default?: any;
}

export const createNewSchema = (
  schemaName: string,
  fields: SchemaField[]
): Model<any> => {
  const schemaDefinition: Record<string, any> = {};

  fields.forEach((field) => {
    const { name, type, required, default: defaultValue } = field;

    // Dynamically assign the field type and other properties
    schemaDefinition[name] = {
      type: (mongoose.Schema.Types as any)[type],
      required: required || false,
    };

    if (defaultValue !== undefined) {
      schemaDefinition[name].default = defaultValue;
    }
  });

  // Create a new schema
  const newSchema = new Schema(schemaDefinition);

  // Register the schema with Mongoose
  return mongoose.model(schemaName, newSchema);
};

    //! Example usage
        // const userSchemaFields: SchemaField[] = [
        //     { name: 'username', type: 'String', required: true },
        //     { name: 'email', type: 'String', required: true },
        //     { name: 'age', type: 'Number' },
        //     { name: 'isActive', type: 'Boolean', default: true },
        // ];
        // const UserModel = createNewSchema('User', userSchemaFields);

export const dropCollection = async (collectionName: string): Promise<void> => {
    try {
      const connection = mongoose.connection;
  
      if (connection.collections[collectionName]) {
        await connection.collections[collectionName].drop(); //Drops the collection from MongoDB
        console.log(`Collection ${collectionName} dropped successfully.`);
      } else {
        console.log(`Collection ${collectionName} does not exist.`);
      }
    } catch (error) {
      console.error(`Failed to drop collection: ${error.message}`);
    }
  };
  
  export const deleteModel = (modelName: string): void => {
    if (mongoose.models[modelName]) {
      delete mongoose.models[modelName]; //Deregisters the model from Mongoose
      console.log(`Model ${modelName} deleted from Mongoose.`);
    } else {
      console.log(`Model ${modelName} does not exist.`);
    }
  };
  
  export const clearCollection = async (modelName: string): Promise<void> => {
    try {
      const model = mongoose.models[modelName];
      if (model) {
        await model.deleteMany({});
        console.log(`All documents in ${modelName} collection have been deleted.`);
      } else {
        console.log(`Model ${modelName} does not exist.`);
      }
    } catch (error) {
      console.error(`Failed to clear collection: ${error.message}`);
    }
  };

  export const removeModelAndDropCollection = async (modelName: string, collectionName: string): Promise<void> => {
    try {
      // Remove the model from Mongoose
      deleteModel(modelName);
  
      // Drop the collection
      dropCollection(collectionName);

    } catch (error) {
        console.error(`Failed to remove model and drop collection: ${error.message}`);
      }
  };

  
  