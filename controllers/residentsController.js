import Resident from "../models/Residents.js";
import Employee from "../models/Employees.js";

export const getAllResidents = async (req, res) => {
  try {
    const residents = await Resident.find()
      .select("-empID")
      .populate("empID")
      .exec();
    res.status(200).json(residents);
  } catch (error) {
    console.log("Error fetching residents", error);
    res.status(500).json({ message: "Failed to fetch residents" });
  }
};
