import axios from "axios";

export const getAllTableRowData = async (
  serverUrl: string,
  tableId: string
) => {
  try {
    const response = await axios.get(
      `${serverUrl}/api/tables/getAllTableRowData/${tableId}`
    );
    console.log("at dataApi/getAllTableRowData the response is:", response);
    console.log(
      "at dataApi/getAllTableRowData the response.data.ok is:",
      response.data.ok
    );
    console.log(
      "at dataApi/getAllTableRowData the response.data.rowsData is:",
      response.data.rowsData
    );
    if (!response.data.ok) throw new Error("No response in getAllTableRowData");
    return response.data.rowsData;
  } catch (error) {
    console.error("Error getAllTableRowData:", error);
  }
}; //work ok

export const createNewRowData = async (serverUrl: string, tableId: string) => {
  try {
    const response = await axios.post(
      `${serverUrl}/api/data/addNewRowData/${tableId}`
    );
    console.log("at dataApi/createNewRowData the response is:", response);
    console.log(
      "at dataApi/createNewRowData the response.data.ok is:",
      response.data.ok
    );
    console.log(
      "at dataApi/createNewRowData the response.data.data is:",
      response.data.data
    );
    if (!response.data.ok) throw new Error("No response in createNewRowData");
    return response.data.data; //to return the row-data
  } catch (error) {
    console.error("Error createNewRowData:", error);
  }
}; // work ok

export const updateCellData = async (
  serverUrl: string,
  dataID: string,
  field: string,
  updateData: string | number | boolean
) => {
  try {
    const response = await axios.patch(
      `${serverUrl}/api/data/updateFieldByDataId/${dataID}`,
      { field, updateData } //{ withCredentials: true }
    );
    console.log("at dataApi/updateCellData the response is:", response);

    const { ok } = response.data;
    console.log("at dataApi/updateCellData the ok is:", ok);

    if (ok) {
      return ok;
    } else {
      console.error("response from server is:", ok);
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
};

//add new field to table's data
export const addNewColumn = async (
  serverUrl: string,
  tableId: string,
  newColumnName: string,
  newFieldsOrderArr: string[]  
) => {
  try {
    console.log("at dataApi/addNewColumn the newFieldsOrderArr:", newFieldsOrderArr)
    const response = await axios.patch(
      `${serverUrl}/api/data/addNewColumn/${tableId}`,
      { newFieldsOrderArr, newColumnName } //{ withCredentials: true }
    );
    console.log("at dataApi/addNewColumn the response is:", response); //get: updateTableFieldsOrder{ ok, response:{_id,fieldOfInterest,creator,fieldsOrder, dateCreated}, massage}

    const { ok } = response.data.updateTableFieldsOrder;
    console.log("at dataApi/addNewColumn the ok is:", ok);
    const {fieldsOrder} = response.data.updateTableFieldsOrder.response;
    console.log("at dataApi/addNewColumn the fieldsOrder is:", fieldsOrder);

    if (ok) {
      return {ok, fieldsOrder };
    } else {
      console.error("response from server is:", ok);
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}; //work ok

//update column rename
export const renameColumn = async (
  serverUrl: string,
  tableId: string,
  renameColumnName: string,
  oldFieldName: string,
  newFieldsOrderArr: string[]  
) => {
  try {
    console.log("at dataApi/renameColumn the newFieldsOrderArr:", newFieldsOrderArr)
    const response = await axios.patch(
      `${serverUrl}/api/data/renameColumn/${tableId}`,
      { newFieldsOrderArr, renameColumnName, oldFieldName } //{ withCredentials: true }
    );
    console.log("at dataApi/renameColumn the response is:", response); //get: updateTableFieldsOrder{ ok, response:{_id,fieldOfInterest,creator,fieldsOrder, dateCreated}, massage}

    const { ok } = response.data.updateTableFieldsOrder;
    console.log("at dataApi/renameColumn the ok is:", ok);
    const {fieldsOrder} = response.data.updateTableFieldsOrder.response;
    console.log("at dataApi/renameColumn the fieldsOrder is:", fieldsOrder);

    if (ok) {
      return {ok, fieldsOrder };
    } else {
      console.error("response from server is:", ok);
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
};