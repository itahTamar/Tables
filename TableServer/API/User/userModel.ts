import { Document, Model, Schema, model } from 'mongoose';
import mongoose from 'mongoose';

// Define the User interface
export interface IUser extends Document {
  password: string;
  role: string;
  email: string;
}
export class User {
  password: string;
  role: string;
  id: string;
  email: string;

  constructor({ userName, password}: { userName: string, password: string }) {
    this.password = password;
    this.role = "user";
    this.email = "none"
  }

  setRole(role: string) {
    this.role = role;
  }
}

//define a schema (It is like interface in typescript)
export const userSchema = new mongoose.Schema<IUser>({
  password: { type: String, required: true },
  role: {type: String, default: "user"},
  email: {type: String, default: "none", unique: true}
});

// Create the UserModel and extend it with custom methods
export interface IUserModel extends Model<IUser> {
  findOneAndUpdateDataOnMongoDB(filter: Record<string, any>, update: Record<string, any>): Promise<any>;
}

export const UserModel = model<IUser, IUserModel>("users", userSchema)

export const users: User[] = [];

//"users" is the name of the collection in the DB
