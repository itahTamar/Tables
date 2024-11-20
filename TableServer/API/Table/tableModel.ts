import { Document, Model, Schema, model } from "mongoose";
import mongoose from "mongoose";

// Define the User interface
export interface ITable extends Document {
  tableName: string;
  dateCreated: Date;
}
export class Table {
  tableName: string;
  dateCreated: Date;

  constructor({
    tableName,
  }: {
    tableName: string;
    creator: string;
  }) {
    this.tableName = tableName;
    this.dateCreated = new Date();
  }
}

//define a schema (It is like interface in typescript)
export const tableSchema = new mongoose.Schema<ITable>({
  tableName: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now }, 
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
