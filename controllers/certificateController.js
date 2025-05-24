import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import Certificate from "../models/Certificates.js";
import mongoose from "mongoose";

export const cancelCertReq = async (req, res) => {
  try {
    const { certID } = req.params;

    const cert = await Certificate.findById(certID);

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    cert.status = "Cancelled";
    await cert.save();
    return res
      .status(200)
      .json({ message: "Certificate cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendCertReq = async (req, res) => {
  try {
    const { filteredData, userID } = req.body;

    const userIDAsObjectId = new mongoose.Types.ObjectId(userID);
    const user = await User.findById(userIDAsObjectId);

    const resident = await Resident.findById(user.resID).select(
      "firstname lastname"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const certificate = new Certificate({
      ...filteredData,
      resID: user.resID,
    });
    await certificate.save();

    const io = req.app.get("socketio");

    io.emit("certificates", {
      title: `${certificate.typeofcertificate} Request`,
      message: `${resident.firstname} ${
        resident.lastname
      } requested ${certificate.typeofcertificate.toLowerCase()}.`,
      timestamp: certificate.createdAt,
    });

    return res
      .status(200)
      .json({ message: "Certificate requested successfully!" });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
