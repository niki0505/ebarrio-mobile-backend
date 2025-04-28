import EmergencyHotline from "../models/EmergencyHotlines.js";

export const getEmergencyHotlines = async (req, res) => {
  try {
    const emergency = await EmergencyHotline.find();
    return res.status(200).json(emergency);
  } catch (error) {
    console.error("Error in fetching emergency hotlines:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
