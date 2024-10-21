import mongoose from "mongoose";

const mongodb_uri = process.env.MONGO_URL;

const connectionMongo = mongoose
  .connect(mongodb_uri)
  .then(() => {
    console.info("MongoDB connected");
    // addFieldToUsers("role", "user");  //update my user DB with a new field
  })
  .catch((err) => {
    console.error(err);
  });

export default connectionMongo;