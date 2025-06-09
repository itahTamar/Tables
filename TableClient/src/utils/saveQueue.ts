// src/utils/saveQueue.ts
let queue: (() => Promise<void>)[] = [];
let isSaving = false;

export const addToSaveQueue = (saveFn: () => Promise<void>) => {
  queue.push(saveFn);
  processQueue();
};

const processQueue = async () => {
  if (isSaving || queue.length === 0) return;

  isSaving = true;
  const nextSave = queue.shift();
  if (nextSave) {
    try {
      await nextSave();
    } catch (err) {
      console.error("Error in save queue:", err);
    }
  }
  isSaving = false;
  processQueue(); // Continue with next
};
