import Resident from "../models/Residents.js";
export const getProfile = async (req, res) => {
  try {
    const { resID } = req.user;
    const resident = await Resident.findById(resID)
      .select("-empID")
      .populate("empID")
      .populate("householdno")
      .exec();
    res.status(200).json(resident);
  } catch (error) {
    console.log("Error fetching profile", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
