import User from "../models/Users.js";
import Resident from "../models/Residents.js";

export const getUserDetails = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.user.userID })
      .select("username role securityquestions empID resID")
      .populate({
        path: "empID",
        populate: {
          path: "resID",
        },
      })
      .populate("resID");

    if (!user) {
      return res.json({ message: "Account not found" });
    }

    const filteredUser = {
      username: user.username,
      role: user.role,
      securityquestions: user.securityquestions.map((q) => ({
        question: q.question,
      })),
      empID: user.empID || undefined,
      resID: user.empID ? undefined : user.resID || undefined,
    };

    return res.status(200).json(filteredUser);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
