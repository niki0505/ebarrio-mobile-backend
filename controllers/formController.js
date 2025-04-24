import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import Certificate from "../models/Certificates.js";
import mongoose from "mongoose";

export const sendCertReq = async (req, res) => {
  try {
    const { filteredData, userID } = req.body;

    const userIDAsObjectId = new mongoose.Types.ObjectId(userID);
    const user = await User.findById(userIDAsObjectId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const certificate = new Certificate({
      ...filteredData,
      resID: user.resID,
    });
    await certificate.save();
    return res
      .status(200)
      .json({ message: "Certificate requested successfully!" });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
