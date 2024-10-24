import { Document, Model, Schema, model } from "mongoose";
import mongoose from "mongoose";

// Define the User interface
export interface ITable extends Document {
  fieldOfInterest: string;
  dateCreated: string;
  creator: string;
}
export class Table {
  fieldOfInterest: string;
  dateCreated: string;
  creator: string;

  constructor({
    fieldOfInterest,
    creator,
  }: {
    fieldOfInterest: string;
    creator: string;
  }) {
    this.fieldOfInterest = fieldOfInterest;
    this.dateCreated = new Date().toISOString(); // Current time in ISO format
    this.creator = creator;
  }
}

//define a schema (It is like interface in typescript)
export const tableSchema = new mongoose.Schema<ITable>({
  fieldOfInterest: { type: String, required: true, unique: true },
  dateCreated: { type: String, required: true },
  creator: String,
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
