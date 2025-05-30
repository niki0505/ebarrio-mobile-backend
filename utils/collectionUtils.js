import Announcement from "../models/Announcements.js";
import CourtReservation from "../models/CourtReservations.js";
import Blotter from "../models/Blotters.js";
import User from "../models/Users.js";
import Certificate from "../models/Certificates.js";
import axios from "axios";
import Notification from "../models/Notifications.js";
import mongoose from "mongoose";

function processAnnouncements(announcements) {
  return announcements
    .filter((a) => a.status !== "Archived" && a.eventStart && a.eventEnd)
    .map((a) => ({
      title: a.title,
      start: new Date(a.eventStart),
      end: new Date(a.eventEnd),
    }));
}

export const sendEventNotification = async () => {
  const db = mongoose.connection.db;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysEvents = await db
    .collection("announcements")
    .find({
      status: { $ne: "Archived" },
      eventStart: { $lt: tomorrow },
      eventEnd: { $gt: today },
    })
    .toArray();

  const processedEvents = processAnnouncements(todaysEvents);
  if (processedEvents.length === 0) return;

  const users = await db
    .collection("users")
    .find({ pushtoken: { $exists: true } })
    .toArray();

  for (const user of users) {
    console.log("Push token", user.pushtoken);
    await sendPushNotification(
      user.pushtoken,
      "📅 Today's Events",
      `The barangay have ${processedEvents.length} event(s) today!`,
      "BrgyCalendar"
    );
  }
  console.log(`Notified users of ${processedEvents.length} event(s) today.`);
};

export const sendNotificationUpdate = async (userID, io) => {
  const notifications = await Notification.find({ userID });
  io.to(userID).emit("notificationUpdate", notifications);
};

export const sendPushNotification = async (pushtoken, title, body, screen) => {
  if (!pushtoken?.startsWith("ExponentPushToken")) {
    console.error("Invalid Expo push token:", pushtoken);
    return;
  }

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: pushtoken,
      sound: "default",
      title,
      body,
      data: { screen: screen },
    });
    console.log("✅ Push notification sent! Response:", response.data);
  } catch (error) {
    console.error("❌ Failed to send push notification:", error.message);
  }
};

export const findUserIDByResID = async (resID) => {
  const user = await User.findOne({ resID: resID });
  if (!user) return null;
  return user._id;
};

export const getServicesUtils = async (userID) => {
  try {
    const user = await User.findById(userID);
    const resID = user.resID;

    const certificates = await Certificate.find(
      { resID: resID },
      { certID: 0 }
    );

    const reservations = await CourtReservation.find({ resID: resID });

    const blotters = await Blotter.find({ complainantID: resID })
      .populate({
        path: "subjectID",
        select: "firstname lastname address",
      })
      .populate({ path: "witnessID", select: "firstname lastname" });

    const certificatesWithType = certificates.map((c) => ({
      ...c.toObject(),
      type: "Certificate",
    }));
    const reservationsWithType = reservations.map((r) => ({
      ...r.toObject(),
      type: "Reservation",
    }));
    const blottersWithType = blotters.map((b) => ({
      ...b.toObject(),
      type: "Blotter",
    }));

    const combined = [
      ...certificatesWithType,
      ...reservationsWithType,
      ...blottersWithType,
    ];

    return combined;
  } catch (error) {
    throw new Error("Error fetching services: " + error.message);
  }
};

export const getAnnouncementsUtils = async () => {
  try {
    const announcements = await Announcement.find().populate({
      path: "uploadedby",
      select: "position",
      populate: {
        path: "resID",
        select: "firstname middlename lastname picture",
      },
    });

    return announcements;
  } catch (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
};
