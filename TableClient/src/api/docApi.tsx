import axios from "axios";

class DocumentRestAPIMethods {
  //add document
  static async add(
    serverUrl: string,
    collectionName: string,
    document: object, 
    path: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${serverUrl}/api/doc/${path}`, {
        collectionName,
        document
      }, {withCredentials: true});
      console.log("at DocumentRestAPIMethods.add the response is:", response);
      console.log(
        "at DocumentRestAPIMethods.add the response.data.acknowledged is:",
        response.data.acknowledged
      );
      if (!response.data.acknowledged)
        throw new Error("No response in DocumentRestAPIMethods.add");
      return true;
    } catch (error) {
      console.error("Error DocumentRestAPIMethods.add document");
      return false;
    }
  } //work ok

  //delete document
  static async delete(
    serverUrl: string,
    collectionName: string,
    query: object,
    path: string
  ): Promise<boolean> {
    try {
      const response = await axios.delete(`${serverUrl}/api/doc/${path}`, {
        data: { collectionName, query }, withCredentials: true
      });
      console.log("at DocumentRestAPIMethods.delete the response is:", response);
      console.log(
        "at DocumentRestAPIMethods.delete the response.data.acknowledged is:",
        response.data.acknowledged
      );
      if (!response.data.acknowledged)
        throw new Error("No response in DocumentRestAPIMethods.delete");
      return true;
    } catch (error) {
      console.error("Error DocumentRestAPIMethods.delete document");
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
      console.log("at DocumentRestAPIMethods.update the collectionName is:", collectionName);
      console.log("at DocumentRestAPIMethods.update the query is:", query);
      console.log("at DocumentRestAPIMethods.update the update is:", update);

      const response = await axios.patch(`${serverUrl}/api/doc/updateDocs`, {
        collectionName,
        query,
        update,
      }, {withCredentials: true});
      console.log("at DocumentRestAPIMethods.update the response is:", response);
      console.log(
        "at DocumentRestAPIMethods.update the response.data is:",
        response.data
      );
      if (!response.data)
        throw new Error("No document updated in DocumentRestAPIMethods.update");
      return true;
    } catch (error) {
      console.error("Error DocumentRestAPIMethods.update document");
      return false;
    }
  } //work ok

  //get documents
  static async get(
    serverUrl: string,
    collectionName: string,
    query: object,
    path: string
  ): Promise<any> {
    try {
      const response = await axios.get(`${serverUrl}/api/doc/${path}`, {
        params: { 
          collectionName, query: JSON.stringify(query)
         },
         withCredentials: true 
      });
      console.log("at DocumentRestAPIMethods.get the response is:", response);
      console.log(
        "at DocumentRestAPIMethods.get the response.data is:",
        response.data
      );
      if (!response.data)
        throw new Error("No response in DocumentRestAPIMethods.get");
      return response.data;
    } catch (error) {
      console.error("Error DocumentRestAPIMethods.get document");
      return [];
    }
  } //work ok

  //get Search In Table Cells documents
  static async getSearchInTableCells(
    serverUrl: string,
    collectionName: string,
    tableId: string | undefined,
    regexToSearch: any
  ): Promise<any> {
    try {
      const response = await axios.get(`${serverUrl}/api/doc/searchDocsAggPip`, {
        params: { collectionName, tableId, regexToSearch }, withCredentials: true
      });
      console.log("at DocumentRestAPIMethods.getSearchInTableCells the response is:", response);
      console.log("at DocumentRestAPIMethods.getSearchInTableCells the response.data is:",response.data);
      
      if (!response.data)
        throw new Error("No response in DocumentRestAPIMethods.getSearchInTableCells");
      return response.data;
    } catch (error) {
      console.error("Error DocumentRestAPIMethods.getSearchInTableCells document");
      return [];
    }
  } //work ok
}
export { DocumentRestAPIMethods };
