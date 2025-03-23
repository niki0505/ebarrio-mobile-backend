import express from "express";
import User from "../src/models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = new User({
      username,
      password,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully. Please log in.",
      user: {
        username: user.username,
        password: user.password,
      },
    });
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  res.send("login");
});

export default router;
