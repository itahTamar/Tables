import mongoose from "mongoose";

const mongodb_uri = process.env.MONGO_URL;

const connectMongo = async () => {
    try {
        await mongoose.connect(mongodb_uri)
        .then(() => {
          console.info("MongoDB connected successfully");
          // addFieldToUsers("role", "user");  //update my user DB with a new field
         })
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit process with failure 
    }
}

export default connectMongo;