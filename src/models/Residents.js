//USER ACCOUNTS SCHEMA
import mongoose from "mongoose";

const resSchema = new mongoose.Schema(
  {
    resID: {
      type: Number,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
      unique: true,
    },
    lastname: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

const Resident = mongoose.model("Resident", resSchema);

export default Resident;
