import axios from "axios";

class DocumentAPIWrapper {

  //add document
  static async add(serverUrl: string, collectionName: string, document: object): Promise<boolean> {
    try {
        const response = await axios.post(`${serverUrl}/api/doc/addDoc`, {collectionName,document})
        console.log("at add the response is:", response);
        console.log("at add the response.data.ok is:", response.data.acknowledged);
        if (!response.data.acknowledged) throw new Error("No response in addNewTable");
        return true
    } catch (error) {
       console.error("Error adding document") 
       return false
    }
  }




}
export {DocumentAPIWrapper}