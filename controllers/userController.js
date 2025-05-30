import User from "../models/Users.js";
import ActivityLog from "../models/ActivityLogs.js";
import { rds } from "../index.js";

export const viewDisaster = async (req, res) => {
  try {
    const { action, description } = req.body;
    const { userID } = req.user;

    await ActivityLog.insertOne({
      userID: userID,
      action: { action },
      description: { description },
    });

    return res
      .status(200)
      .json({ message: "User logged activity successfully" });
  } catch (error) {
    console.error("Error in logging activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setPushToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userID);

    console.log("Push token", token);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.pushtoken === token) {
      return res
        .status(409)
        .json({ message: "User already has the push token" });
    }

    user.pushtoken = token;

    await user.save();

    console.log("✅ User push token created successfully!");
    return res
      .status(200)
      .json({ message: "User push token created successfully" });
  } catch (error) {
    console.error("Error in setting push token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
