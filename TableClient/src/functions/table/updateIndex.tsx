import { DocumentRestAPIMethods } from "../../api/docApi";
import { CellData } from "../../types/cellType";
import { TableData } from "../../types/tableType";

//regular function to update the indexes in the given array
interface updateIndexesProp {
  currentIndex: number;
  arr: CellData[] | TableData[];
  indexType: keyof CellData | keyof TableData; // Ensures indexType exists in both types // e.g., 'tableIndex', 'cellIndex', 'columnIndex'
  serverUrl: string;
  action: string; //= Addition || subtraction
}

export const updateIndexes = async ({
  serverUrl,
  arr,
  currentIndex,
  indexType,
  action,
}: updateIndexesProp): Promise<boolean | undefined> => {
  try {
    // Ensure the array is not empty
    if (!arr.length) {
      console.log("Array is empty.");
      return true; //nothing to update
    }

    // Ensure currentIndex is within bounds
    if (currentIndex < 0 || currentIndex >= arr.length) {
      console.log("Invalid currentIndex.");
      return false; // invalid index
    }
console.log("At updateIndexes the currentIndex:", currentIndex)

    // Filter and update items with indexType > currentValue
    const updates = arr
      //@ts-ignore
      .filter((item) => item[indexType as keyof typeof item] > currentIndex)
      .map(async (item) => {
        const oldIndex = item[indexType as keyof typeof item] as number;
        console.log("At updateIndexes updates the oldIndex:", oldIndex)
        // Calculate newIndex based on action
        const newIndex = action === "subtraction" ? oldIndex - 1 : oldIndex + 1;
        console.log("At updateIndexes updates the newIndex:", newIndex)
        // Update the item in the array
        //@ts-ignore
        item[indexType as keyof (CellData | TableData)] = newIndex as any;

        // Prepare query and update objects for the database
        const query = { _id: item._id }; // Use the unique document ID as the query
        const update = { [indexType]: newIndex };

        // Send the update to the database
        return DocumentRestAPIMethods.update(
          serverUrl,
          "tables",
          query,
          update
        );
      });

    // Wait for all updates to complete
    const results = await Promise.all(updates);

    // Check if all updates were successful
    if (results.every((res) => res)) {
      console.log("All indexes updated successfully in the database.");
      return true;
    } else {
      console.error("Some updates failed.");
      return false;
    }
  } catch (error) {
    console.log("updateIndexes caught an error");
    console.error("Error in updateIndexes:", error);
    return undefined;
  }
};
