import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import { rds } from "../index.js";

export const resetPassword = async (req, res) => {
  try {
    const { username } = req.params;
    const { password, securityquestions } = req.body;
    const user = await User.findOne({ username: username });

    user.password = password;
    user.securityquestions = securityquestions;
    user.status = "Inactive";

    await user.save();

    rds.del(`userID_${user._id}`, (err, response) => {
      if (err) {
        console.error("Error deleting from Redis:", err);
      } else {
        console.log(`Deleted ${response} key from Redis`);
      }
    });

    console.log("✅ User reset password successfully!");
    return res
      .status(200)
      .json({ exists: true, message: "User reset password successfully" });
  } catch (error) {
    console.error("Error in resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
