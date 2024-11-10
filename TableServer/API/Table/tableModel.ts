import { Document, Model, Schema, model } from "mongoose";
import mongoose from "mongoose";

// Define the User interface
export interface ITable extends Document {
  fieldOfInterest: string;
  dateCreated: Date;
  creator: string;
  fieldsOrder: string[];
}
export class Table {
  fieldOfInterest: string;
  dateCreated: Date;
  creator: string;
  fieldsOrder: string[];

  constructor({
    fieldOfInterest,
    creator,
    fieldsOrder = ["index", "dateCreated", "details", "dataLink", "price"],
  }: {
    fieldOfInterest: string;
    creator: string;
    fieldsOrder: string[];
  }) {
    this.fieldOfInterest = fieldOfInterest;
    this.dateCreated = new Date();
    this.creator = creator;
    this.fieldsOrder = fieldsOrder;
  }
}

//define a schema (It is like interface in typescript)
export const tableSchema = new mongoose.Schema<ITable>({
  fieldOfInterest: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now }, //set the current date
  creator: String,
  fieldsOrder: {
    type: [String],
    default: ["index", "dateCreated", "details", "dataLink", "price"],
  },
});

// Create the TableModel and extend it with custom methods
export interface ITableModel extends Model<ITable> {
  findOneAndUpdateDataOnMongoDB(
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<any>;
}

export const TableModel = model<ITable, ITableModel>("tables", tableSchema);

export const tables: Table[] = [];
