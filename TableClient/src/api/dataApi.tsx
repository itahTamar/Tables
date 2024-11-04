import axios from "axios";

export const getAllTableRowData = async (serverUrl: string, tableId: string) => {
    try {
      const response = await axios.get(`${serverUrl}/api/tables/getAllTableRowData/${tableId}`);
        console.log("at dataApi/getAllTableRowData the response is:", response);
        console.log("at dataApi/getAllTableRowData the response.data.ok is:", response.data.ok);
        console.log("at dataApi/getAllTableRowData the response.data.rowsData is:", response.data.rowsData);
      if (!response.data.ok) throw new Error("No response in getAllTableRowData");
      return response.data.rowsData;
    } catch (error) {
      console.error("Error getAllTableRowData:", error);
    }
  }; //work ok
  
  export const createNewRowData = async (
    serverUrl: string,
    tableId: string,
  ) => {
    try {
      const response = await axios.post(`${serverUrl}/api/data/addNewRowData/${tableId}`);
        console.log("at dataApi/createNewRowData the response is:", response);
        console.log("at dataApi/createNewRowData the response.data.ok is:", response.data.ok);
        console.log("at dataApi/createNewRowData the response.data.data is:", response.data.data);
      if (!response.data.ok) throw new Error("No response in createNewRowData");
      return response.data.data;  //to return the row-data 
    } catch (error) {
      console.error("Error createNewRowData:", error);
    }
  }; // work ok

  export const updateCellData = async (serverUrl: string, dataID:string ,field: string, updateData:string | number | boolean) => {
    try {
        const response = await axios.patch(`${serverUrl}/api/data/updateFieldByDataId/${dataID}`, {field, updateData}, //{ withCredentials: true }
          );
        console.log("at dataApi/updateCellData the response is:", response);
        
        
        const { ok, results } = response.data;

        if (ok) {
           return results
        } else {
            console.error("Error retrieving data:", response.data.error);
        }
    } catch (error) {
        console.error("Error:", (error as Error).message);
    }
};