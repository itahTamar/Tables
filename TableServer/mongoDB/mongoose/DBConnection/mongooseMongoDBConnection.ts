import mongoose from "mongoose";

const mongodb_uri = process.env.MONGO_URL;

const connectionMongoWithMongoose = mongoose
  .connect(mongodb_uri)
  .then(() => {
    console.info("MongoDB connected with mongoose");
    // addFieldToSchemaAndMongoDB("field's name", "value");  //update a collection DB with a new field
  })
  .catch((err) => {
    console.error(err);
  });

export default connectionMongoWithMongoose;