import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import Blotter from "../models/Blotters.js";
import mongoose from "mongoose";

export const sendBlotter = async (req, res) => {
  try {
    const { blotterForm } = req.body;
    const blotter = new Blotter({
      ...blotterForm,
    });
    await blotter.save();
    return res.status(200).json({ message: "Blotter submitted successfully!" });
  } catch (error) {
    console.error("Error submitting blotters:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
