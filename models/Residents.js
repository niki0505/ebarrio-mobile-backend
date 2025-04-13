import mongoose from "mongoose";

const resSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    middlename: {
      type: String,
    },
    lastname: {
      type: String,
      required: true,
    },
    suffix: {
      type: String,
    },
    alias: {
      type: String,
    },
    salutation: {
      type: String,
    },
    sex: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
    },
    birthdate: {
      type: String,
      required: true,
    },
    birthplace: {
      type: String,
    },
    civilstatus: {
      type: String,
      required: true,
    },
    bloodtype: {
      type: String,
    },
    religion: {
      type: String,
    },
    nationality: {
      type: String,
      required: true,
    },
    voter: {
      type: String,
    },
    deceased: {
      type: String,
    },
    email: {
      type: String,
    },
    mobilenumber: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
    },
    facebook: {
      type: String,
    },
    emergencyname: {
      type: String,
      required: true,
    },
    emergencymobilenumber: {
      type: String,
      required: true,
    },
    emergencyaddress: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    HOAname: {
      type: String,
    },
    employmentstatus: {
      type: String,
    },
    occupation: {
      type: String,
    },
    monthlyincome: {
      type: String,
    },
    educationalattainment: {
      type: String,
    },
    typeofschool: {
      type: String,
    },
    course: {
      type: String,
    },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
);

const Resident = mongoose.model("Resident", resSchema);

export default Resident;
