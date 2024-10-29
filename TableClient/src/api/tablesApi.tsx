import axios from "axios";

export const fetchTables = async (serverUrl: string) => {
    try {
      const response = await axios.get(`${serverUrl}/api/user/tables/getAllTables`); 
      if (!response) throw new Error("no response in fetchTables")
      return (response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };