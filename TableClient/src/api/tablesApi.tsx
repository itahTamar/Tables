import axios from "axios";

export const fetchTables = async (serverUrl: string) => {
  try {
    const response = await axios.get(`${serverUrl}/api/tables/getAllTables`);
    console.log("at tablesApi/fetchTables the response is:", response)
    if (!response.data.data.ok) throw new Error("No response in fetchTables");
    return response.data.data.response;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};
