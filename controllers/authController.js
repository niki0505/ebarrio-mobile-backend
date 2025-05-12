import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import axios from "axios";
import { rds } from "../index.js";

configDotenv();
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const getMobileNumber = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username })
      .populate({
        path: "empID",
        select: "resID",
        populate: {
          path: "resID",
          select: "mobilenumber",
        },
      })
      .populate({
        path: "resID",
        select: "mobilenumber",
      });

    if (!user) {
      return res.status(404).json({ message: "Username not found!" });
    }

    return res.status(200).json({
      mobilenumber: user.empID?.resID.mobilenumber || user.resID?.mobilenumber,
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { username, OTP } = req.body;

    rds.get(`username_${username}`, (err, storedOTP) => {
      if (err) {
        console.error("Error retrieving OTP from Redis:", err);
        return res.status(500).json({ message: "Failed to verify OTP" });
      }

      if (!storedOTP) {
        return res
          .status(400)
          .json({ message: "OTP has expired or does not exist" });
      }

      if (storedOTP === OTP.toString()) {
        return res.status(200).json({ message: "OTP verified successfully!" });
      } else {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { username, mobilenumber } = req.body;
    const response = await axios.post("https://api.semaphore.co/api/v4/otp", {
      apikey: "46d791fbe4e880554fcad1ee958bbf33",
      number: mobilenumber,
      message:
        "Your one time password is {otp}. Please use it within 5 minutes.",
    });
    rds.setex(`username_${username}`, 300, response.data[0]?.code.toString());
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshAccessToken = (req, res) => {
  const refreshToken = req.header("Authorization")?.split(" ")[1];

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decodedRefresh) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
        const newAccessToken = jwt.sign(
          {
            userID: decodedRefresh.userID,
            resID: decodedRefresh.resID,
            role: decodedRefresh.role,
            name: decodedRefresh.name,
            picture: decodedRefresh.picture,
          },
          process.env.ACCESS_SECRET,
          {
            expiresIn: "15m",
          }
        );
        console.log("Access token refreshed");
        return res.status(200).json({
          message: "Access token refreshed",
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
};

export const checkRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    console.log("Got Refresh Token", refreshToken);
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
        return res.status(200).json({
          message: "Refresh token is still valid",
          decoded,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkResident = async (req, res) => {
  try {
    const { username, firstname, lastname, mobilenumber } = req.body;

    const resident = await Resident.findOne({
      firstname,
      lastname,
      mobilenumber,
      empID: { $exists: false },
    });

    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    if (resident.userID && resident) {
      return res
        .status(409)
        .json({ message: "Resident already has an account" });
    }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return res.status(200).json({
      message: "Resident found",
      resID: resident._id,
    });
  } catch (error) {
    console.error("Error in checking resident:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { username, password, resID, securityquestions } = req.body;

    const resident = await Resident.findOne({ _id: resID });

    const user = new User({
      username,
      password,
      resID,
      securityquestions,
    });

    await user.save();

    resident.userID = user._id;

    await resident.save();
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  const { userID } = req.body;
  try {
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "Inactive";
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ Account not found");
      return res.status(404).json({
        message: "Account not found",
      });
    }
    if (user.status === "Deactivated") {
      console.log("❌ Account is deactivated");
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    if (user.status === "Password Not Set") {
      rds.get(`userID_${user._id}`, (err, storedToken) => {
        if (err) {
          console.error("Error retrieving token from Redis:", err);
          return res.status(500).json({ message: "Failed to verify token" });
        }

        if (!storedToken) {
          return res
            .status(400)
            .json({ message: "Token has expired or does not exist" });
        }

        if (storedToken === password) {
          return res
            .status(200)
            .json({ message: "Token verified successfully!" });
        } else {
          return res.status(400).json({ message: "Invalid token" });
        }
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect Password");
      return res.status(403).json({
        message: "Incorrect password",
      });
    }
    return res.status(200).json({
      message: "Credentials verified",
    });
  } catch (error) {
    console.error("Error in checking credentials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username }).populate("resID");

    const accessToken = jwt.sign(
      {
        userID: user._id.toString(),
        // resID: user.resID._id.toString(),
        // role: user.role,
        // name: `${user.resID.firstname} ${user.resID.lastname}`,
        // picture: user.resID.picture,
      },
      ACCESS_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        userID: user._id.toString(),
        // resID: user.resID._id.toString(),
        // role: user.role,
        // name: `${user.resID.firstname} ${user.resID.lastname}`,
        // picture: user.resID.picture,
      },
      REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const decoded = jwt.decode(refreshToken);

    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      user: decoded,
    });
  } catch (error) {
    console.error("Error in logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
