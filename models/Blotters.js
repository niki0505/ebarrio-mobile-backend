import mongoose from "mongoose";

const bSchema = new mongoose.Schema(
  {
    resID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Settled", "Rejected"],
      required: true,
      default: "Pending",
    },
    remarks: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const Blotter = mongoose.model("Blotter", bSchema);

export default Blotter;
