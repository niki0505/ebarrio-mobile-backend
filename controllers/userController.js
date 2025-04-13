import User from "../models/Users.js";
import Resident from "../models/Residents.js";

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userID });
    if (!user) {
      return res.json({ message: "Account not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
