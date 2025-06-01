import mongoose from "mongoose";

const certSchema = new mongoose.Schema(
  {
    certID: {
      _id: false,
      controlNumber: {
        type: String,
      },
      expirationDate: {
        type: String,
      },
      qrCode: {
        type: String,
      },
      qrToken: {
        type: String,
      },
    },
    resID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    typeofcertificate: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
    },
    businessname: {
      type: String,
    },
    lineofbusiness: {
      type: String,
    },
    locationofbusiness: {
      type: String,
    },
    amount: {
      type: String,
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Rejected",
        "Cancelled",
        "Collected",
        "Not Yet Collected",
      ],
      required: true,
      default: "Pending",
    },
  },
  { versionKey: false, timestamps: true }
);

const Certificate = mongoose.model("Certificate", certSchema);

export default Certificate;
