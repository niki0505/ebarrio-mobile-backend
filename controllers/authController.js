import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import axios from "axios";

configDotenv();
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const sendOTP = async (req, res) => {
  try {
    const { mobilenumber } = req.body;
    const response = await axios.post("https://api.semaphore.co/api/v4/otp", {
      apikey: "46d791fbe4e880554fcad1ee958bbf33",
      number: mobilenumber,
      message:
        "Your one time password is {otp}. Please use it within 5 minutes.",
    });
    res.status(200).json({ otp: response.data[0]?.code });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Refresh Access token
export const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body; // Assuming the refresh token is in the body

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    // Verify the refresh token (ensure it's a string)
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Issue new access token here
    const newAccessToken = jwt.sign(
      { userID: decoded.userID },
      process.env.ACCESS_SECRET,
      { expiresIn: "10s" }
    );
    console.log("New Access Token:", newAccessToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

// 🔹 Check if resident exists
export const checkResident = async (req, res) => {
  try {
    console.log("🔍 Checking if resident exists...", req.body);
    const { firstname, lastname, mobilenumber } = req.body;

    const resident = await Resident.findOne({
      firstname,
      lastname,
      mobilenumber,
    });

    if (!resident) {
      console.log("❌ Resident not found");
      return res.json({ exists: false });
    }

    console.log("✅ Resident found");
    if (resident.userID && resident) {
      console.log("❌ Resident already have an account");
      return res.json({ hasAccount: true, exists: true });
    }

    return res.json({
      exists: true,
      resID: resident._id,
      hasAccount: false,
    });
  } catch (error) {
    console.error("Error in checkResident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Check if username is taken
export const checkUsername = async (req, res) => {
  try {
    console.log("🔍 Checking if username exists...", req.body);
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      console.log("❌ Username is already taken");
      return res.json({ usernameExists: true });
    }

    console.log("✅ Username is not found");
    return res.json({ usernameExists: false });
  } catch (error) {
    console.error("Error in checkResident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Register a new user
export const registerUser = async (req, res) => {
  try {
    console.log("🔵 Register request:", req.body);
    const { username, password, resID } = req.body;

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log("❌ Username already exists");
      return res.json({ usernameExists: true });
    }

    const resident = await Resident.findOne({ _id: resID });

    const user = new User({
      username,
      password,
      resID,
    });

    await user.save();

    resident.userID = user._id;
    await resident.save();
    console.log("✅ User registered successfully");
    return res.json({ exists: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Log in user
export const loginUser = async (req, res) => {
  try {
    console.log("🔵 Login request:", req.body);
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ Account not found");
      return res.json({ exists: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect Password");
      return res.json({ exists: true, correctPassword: false });
    }

    console.log("✅ Account found, generating token...");
    const accessToken = jwt.sign(
      { userID: user._id.toString() },
      ACCESS_SECRET,
      {
        expiresIn: "10s",
      }
    );

    const refreshToken = jwt.sign(
      { userID: user._id.toString() },
      REFRESH_SECRET,
      {
        expiresIn: "20s",
      }
    );

    return res.json({
      exists: true,
      correctPassword: true,
      accessToken,
      refreshToken,
      user: user.userID,
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
