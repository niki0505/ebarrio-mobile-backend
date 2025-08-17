import SOS from "../models/SOS.js";

export const sendSOS = async (req, res) => {
  try {
    const { resID } = req.user;
    const { location } = req.body;

    const report = new SOS({
      location,
      resID,
    });

    await report.save();

    return res.status(200).json({ message: "SOS has been sent successfully." });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
