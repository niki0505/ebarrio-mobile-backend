import express from "express";
import User from "../src/models/Users.js";
import Resident from "../src/models/Residents.js";
import bcrypt from "bcryptjs";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/time", (req, res) => {
  const serverTime = Date.now();
  res.json({ serverTime });
});

router.post("/checkresident", async (req, res) => {
  try {
    console.log("🔵 Received register request with body:", req.body);
    const { firstname, lastname } = req.body;
    console.log("Received request body:", req.body);

    console.log("🔍 Checking if resident exists...");
    const resident = await Resident.findOne({ firstname, lastname });

    if (!resident) {
      console.log("❌ Resident not found, returning exists: false");
      return res.json({ exists: false });
    }

    console.log("✅ Resident found, proceeding with user registration...");
    return res.json({ exists: true, resID: resident.resID });
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log("🔵 Received register request with body:", req.body);
    const { username, password, resID } = req.body;
    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      console.log("❌ Username already exists");
      return res.json({ usernameExists: true });
    }
    const user = new User({
      username,
      password,
      resID: resID,
    });

    await user.save();

    console.log("Sending response:", {
      message: "User registered successfully. Please log in.",
      exists: true,
    });
    return res.json({ exists: true });
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("🔵 Received register request with body:", req.body);
    const { username, password, remember } = req.body;
    console.log("Received request body:", req.body);
    console.log("🔍 Checking if account exists...");
    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ Account not found, returning exists: false");
      return res.json({ exists: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Incorrect Password");
      return res.json({ exists: true, correctPassword: false });
    }

    console.log("✅ Account found, generating token...");

    const accessToken = jwt.sign(
      { accID: user.accID },
      "mysecret",
      { expiresIn: remember ? "30d" : "1hr" } // Token expires in 15 seconds
    );

    const decoded = jwtDecode(accessToken);
    console.log(decoded);
    const expiryTime = decoded.exp * 1000;
    console.log(expiryTime);
    console.log(`Date: ${Date.now()}`);
    const timeRemaining = expiryTime - Date.now();
    console.log(Date.now());
    console.log(timeRemaining);
    console.log(
      `🛑 Calculated Time Remaining: ${timeRemaining} ms (${
        timeRemaining / 1000
      } s)`
    );

    const currentTime = Date.now();

    return res.json({
      exists: true,
      correctPassword: true,
      accessToken,
      currentTime,
    });
  } catch (error) {}
});

export default router;
