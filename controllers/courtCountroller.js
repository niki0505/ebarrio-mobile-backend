import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import CourtReservation from "../models/CourtReservations.js";
import mongoose from "mongoose";

export const sendReservationReq = async (req, res) => {
  try {
    const { reservationForm } = req.body;
    const reservation = new CourtReservation({
      ...reservationForm,
    });
    await reservation.save();
    return res
      .status(200)
      .json({ message: "Court reservation requested successfully!" });
  } catch (error) {
    console.error("Error submitting court reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
