import Announcement from "../models/Announcements.js";
import CourtReservation from "../models/CourtReservations.js";
import Blotter from "../models/Blotters.js";
import User from "../models/Users.js";
import Certificate from "../models/Certificates.js";

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
