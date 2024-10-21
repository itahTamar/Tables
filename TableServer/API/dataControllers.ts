import {getAllDataFromMongoDB } from "../CRUD/mongoCRUD"
import { DataModel } from './dataModel';

export async function getAllData(req: any, res: any) {
    try {
        console.log("getAllData function")
        const dataDB = await getAllDataFromMongoDB<any>(DataModel);
        console.log("At getAllData dataDB:", dataDB)
        res.send({massage: dataDB})
    } catch (error) {
        console.error(error)
    }
  }