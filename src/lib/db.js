import mongoose from "mongoose";

const connectionString =
  "mongodb+srv://knicole:admin1234@cluster0.l40pk.mongodb.net/eBarrio?retryWrites=true&w=majority&appName=Cluster0";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(connectionString);
    console.log(`Database connected ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to database", error);
    process.exit(1);
  }
};
