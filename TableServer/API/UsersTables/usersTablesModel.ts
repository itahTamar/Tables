import mongoose, { Document, Model, Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { TableModel } from "../Table/tableModel";
import { UserModel } from "../User/userModel";

export interface IUsersTablesDocument extends Document {
  _id: mongoose.Types.ObjectId;
  usersId: ObjectId;
  tablesId: ObjectId;
}

export interface MyDocument<T extends Document> extends Document<any, any, T> {}

export interface MyUsersTablesJoinCollection<
  T extends MyDocument<IUsersTablesDocument>
> extends Document<any, any, T> {
  _doc: IUsersTablesDocument;
}
const UsersTablesSchema = new mongoose.Schema({
  usersId: { type: Schema.Types.ObjectId, ref: TableModel },
  tablesId: { type: Schema.Types.ObjectId, ref: UserModel },
});

export const UsersTablesModel: Model<
  MyUsersTablesJoinCollection<MyDocument<IUsersTablesDocument>>
> = model<MyUsersTablesJoinCollection<MyDocument<IUsersTablesDocument>>>(
  "UsersTables",
  UsersTablesSchema
);
