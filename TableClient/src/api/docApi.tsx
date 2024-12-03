import axios from "axios";

class DocumentAPIWrapper {
  //add document
  static async add(
    serverUrl: string,
    collectionName: string,
    document: object
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${serverUrl}/api/doc/addDoc`, {
        collectionName,
        document,
      });
      console.log("at add the response is:", response);
      console.log(
        "at add the response.data.acknowledged is:",
        response.data.acknowledged
      );
      if (!response.data.acknowledged) throw new Error("No response in add");
      return true;
    } catch (error) {
      console.error("Error adding document");
      return false;
    }
  } //work ok

  //delete document
  static async delete(
    serverUrl: string,
    collectionName: string,
    query: object
  ): Promise<boolean> {
    try {
      const response = await axios.delete(`${serverUrl}/api/doc/deleteDoc`, {
        data: { collectionName, query },
      });
      console.log("at delete the response is:", response);
      console.log(
        "at delete the response.data.acknowledged is:",
        response.data.acknowledged
      );
      if (!response.data.acknowledged) throw new Error("No response in delete");
      return true;
    } catch (error) {
      console.error("Error delete document");
      return false;
    }
  } //work ok

  //update document
  static async update(
    serverUrl: string,
    collectionName: string,
    query: object,
    update: object
  ): Promise<boolean> {
    try {
      console.log("at update the collectionName is:", collectionName);
      console.log("at update the query is:", query);
      console.log("at update the update is:", update);

      const response = await axios.patch(`${serverUrl}/api/doc/updateDoc`, {
        collectionName,
        query,
        update,
      });
      console.log("at update the response is:", response);
      console.log(
        "at update the response.data.acknowledged is:",
        response.data.acknowledged
      );
      if (!response.data.acknowledged) throw new Error("No response in update");
      return true;
    } catch (error) {
      console.error("Error update document");
      return false;
    }
  } //work ok

  //get document
  static async get(
    serverUrl: string,
    collectionName: string,
    query: object
  ): Promise<any> {
    try {
      const response = await axios.get(`${serverUrl}/api/doc/getDoc`, {
        params: { collectionName, query: JSON.stringify(query) },
      });
      console.log("at get the response is:", response);
      console.log(
        "at get the response.data is:",
        response.data
      );
      if (!response.data) throw new Error("No response in delete");
      return response.data;
    } catch (error) {
      console.error("Error get document");
      return [];
    }
  } //work ok
}
export { DocumentAPIWrapper };
