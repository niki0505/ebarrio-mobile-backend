import express from "express";
import User from "../src/models/Users.js";
import Resident from "../src/models/Residents.js";

const router = express.Router();

// router.post("/checkresident", async (req, res) => {
//   try {
//     const { firstname, lastname } = req.body;

//     const resident = await Resident.findOne({ firstname, lastname });

//     if (resident) {
//       return res.json({ exists: true });
//     } else {
//       return res.json({ exists: false });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, username, password } = req.body;
    console.log("Received request body:", req.body);

    const resident = await Resident.findOne({ firstname, lastname });

    if (!resident) {
      return res.json({ exists: true });
    }

    const user = new User({
      username,
      password,
      resID: resident.resID,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully. Please log in.",
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
