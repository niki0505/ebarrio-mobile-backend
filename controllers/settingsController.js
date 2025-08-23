import Resident from "../models/Residents.js";
import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import ActivityLog from "../models/ActivityLogs.js";
import { rds } from "../index.js";

export const checkPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById({ _id: req.user.userID });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Hmm… that password didn’t work. Let’s try again." });
    }

    res.status(200).json({ message: "Correct password" });
  } catch (error) {
    console.log("Error changing mobile number", error);
    res.status(500).json({ message: "Failed to change mobile number" });
  }
};

export const changeMobileNumber = async (req, res) => {
  try {
    const { mobilenumber } = req.body;
    const { userID } = req.user;
    const user = await User.findById({ _id: userID }).populate({
      path: "empID",
      select: "resID",
    });
    let resID;

    if (user.empID) {
      resID = user.empID.resID;
    } else {
      resID = user.resID;
    }

    const resident = await Resident.findById(resID);

    resident.mobilenumber = mobilenumber;
    await resident.save();

    await ActivityLog.insertOne({
      userID: userID,
      action: "Account Settings",
      description: `User updated their mobile number.`,
    });

    res.status(200).json({ message: "Mobile number changed successfully!" });
  } catch (error) {
    console.log("Error changing mobile number", error);
    res.status(500).json({ message: "Failed to change mobile number" });
  }
};

export const changeSecurityQuestions = async (req, res) => {
  try {
    const { userID } = req.user;
    const { securityquestions, password } = req.body;

    const user = await User.findById({ _id: userID });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Hmm… that password didn’t work. Let’s try again." });
    }

    for (let i = 0; i < 2; i++) {
      if (securityquestions[i]) {
        const isSame = await bcrypt.compare(
          securityquestions[i].answer,
          user.securityquestions[i].answer || ""
        );
        if (isSame) {
          return res.status(400).json({
            message: `Answer for question ${
              i + 1
            } cannot be the same as before.`,
          });
        }
        user.securityquestions[i] = await bcrypt.hash(securityquestions[i], 10);
      }
    }
    await user.save();

    await ActivityLog.insertOne({
      userID: userID,
      action: "Account Settings",
      description: `User updated their security questions.`,
    });

    res
      .status(200)
      .json({ message: "Security questions changed successfully!" });
  } catch (error) {
    console.log("Error changing security questions", error);
    res.status(500).json({ message: "Failed to change securityquestions" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userID } = req.user;
    const { newpassword, password } = req.body;
    const user = await User.findById({ _id: userID });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Hmm… that password didn’t work. Let’s try again." });
    }

    user.password = newpassword;
    user.passwordchangedat = new Date();
    await user.save();

    await ActivityLog.insertOne({
      userID: userID,
      action: "Account Settings",
      description: `User updated their password.`,
    });

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.log("Error changing password", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

export const changeUsername = async (req, res) => {
  try {
    const { userID } = req.user;
    const { username, password } = req.body;
    const user = await User.findById({ _id: userID });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Hmm… that password didn’t work. Let’s try again." });
    }

    user.username = username;
    await user.save();
    await ActivityLog.insertOne({
      userID: userID,
      action: "Account Settings",
      description: `User updated their username.`,
    });

    await rds.setex(`limitUsernameChange_${userID}`, 2592000, "true");

    res.status(200).json({ message: "Username changed successfully!" });
  } catch (error) {
    console.log("Error changing username", error);
    res.status(500).json({ message: "Failed to change username" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID)
      .select("username role securityquestions empID")
      .populate({
        path: "empID",
        select: "resID",
        populate: { path: "resID" },
      });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error fetching user", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
