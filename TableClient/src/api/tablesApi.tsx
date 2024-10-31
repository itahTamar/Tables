import axios from "axios";

export const fetchTables = async (serverUrl: string) => {
  try {
    const response = await axios.get(`${serverUrl}/api/tables/getAllTables`);
    console.log("at tablesApi/fetchTables the response is:", response);
    if (!response.data.data.ok) throw new Error("No response in fetchTables");
    return response.data.data.response;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
}; //work ok

export const addNewTable = async (
  serverUrl: string,
  tableSubject: string,
  creator: string
) => {
  try {
    const response = await axios.post(`${serverUrl}/api/tables/addNewTable`, {
      fieldOfInterest: tableSubject,
      creator,
    });
    console.log("at tablesApi/addNewTable the response is:", response);
    if (!response.data.data.ok) throw new Error("No response in addNewTable");
    return response.data.data.ok;
  } catch (error) {
    console.error("Error addNewTable:", error);
    return [];
  }
}; //work ok
