import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import CourtReservation from "../models/CourtReservations.js";
import mongoose from "mongoose";

export const cancelReservationReq = async (req, res) => {
  try {
    const { reservationID } = req.params;

    const reservation = await CourtReservation.findById(reservationID);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = "Cancelled";
    await reservation.save();
    return res
      .status(200)
      .json({ message: "Reservation cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling Reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservation = await CourtReservation.find().populate("resID");
    return res.status(200).json(reservation);
  } catch (error) {
    console.error("Error in fetching court reservations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
