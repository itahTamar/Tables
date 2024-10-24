import mongoose from 'mongoose';
import { userSchema } from './userModel';
import { WordSchema } from './words/wordModel';

const User = mongoose.model('User', userSchema);
const Word = mongoose.model('Word', WordSchema);

//general function to add a field to my DB

export async function addFieldToUsers(fieldName, defaultValue) {
  try {
    const result = await User.updateMany({}, { $set: { [fieldName]: defaultValue } });
    console.log(`${result.modifiedCount} documents were updated with ${fieldName}.`);
  } catch (err) {
    console.error(`Error updating documents with ${fieldName}:`, err);
  }
}

export async function addFieldToWords(fieldName, defaultValue) {
  try {
    const result = await Word.updateMany({}, { $set: { [fieldName]: defaultValue } });
    console.log(`${result.modifiedCount} documents were updated with ${fieldName}.`);
  } catch (err) {
    console.error(`Error updating documents with ${fieldName}:`, err);
  }
}