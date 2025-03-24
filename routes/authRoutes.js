import express from "express";
import User from "../src/models/Users.js";
import Resident from "../src/models/Residents.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("🔵 Received register request with body:", req.body);
    const { firstname, lastname, username, password } = req.body;
    console.log("Received request body:", req.body);

    console.log("🔍 Checking if resident exists...");
    const resident = await Resident.findOne({ firstname, lastname });

    if (!resident) {
      console.log("❌ Resident not found, returning exists: false");
      return res.json({ exists: false });
    } else {
      console.log("✅ Resident found, proceeding with user registration...");

      const user = new User({
        username,
        password,
        resID: resident.resID,
      });

      await user.save();

      console.log("Sending response:", {
        message: "User registered successfully. Please log in.",
        exists: true,
      });
      return res.json({ exists: true });
    }
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("🔵 Received register request with body:", req.body);
    const { username, password } = req.body;
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
      { expiresIn: "15s" } // Token expires in 1 minutes
    );
    return res.json({ exists: true, correctPassword: true, accessToken });
  } catch (error) {}
});

export default router;
