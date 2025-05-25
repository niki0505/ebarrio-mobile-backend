import User from "../models/Users.js";
import Resident from "../models/Residents.js";
import CourtReservation from "../models/CourtReservations.js";
import mongoose from "mongoose";
import Notification from "../models/Notifications.js";
import { sendNotificationUpdate } from "../utils/collectionUtils.js";

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

    const resident = await Resident.findById(reservation.resID);

    const io = req.app.get("socketio");

    io.emit("courtreservations", {
      title: `📅 Court Reservation Request`,
      message: `${resident.firstname} ${resident.lastname} requested court reservation.`,
      timestamp: reservation.createdAt,
    });

    const allUsers = await User.find(
      {
        status: { $in: ["Active", "Inactive"] },
        role: { $in: ["Secretary", "Clerk"] },
        _id: { $ne: resident.userID },
      },
      "_id"
    );

    const notifications = allUsers.map((user) => ({
      userID: user._id,
      title: `📅 Court Reservation Request`,
      message: `${resident.firstname} ${resident.lastname} requested court reservation.`,
      redirectTo: "/court-reservations",
    }));

    await Notification.insertMany(notifications);

    notifications.forEach((notif) => {
      sendNotificationUpdate(notif.userID.toString(), io);
    });

    return res
      .status(200)
      .json({ message: "Court reservation requested successfully!" });
  } catch (error) {
    console.error("Error submitting court reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
