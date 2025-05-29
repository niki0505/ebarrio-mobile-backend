import Announcement from "../models/Announcements.js";
import { getAnnouncementsUtils } from "../utils/collectionUtils.js";
import Notification from "../models/Notifications.js";
import { sendNotificationUpdate } from "../utils/collectionUtils.js";
import Resident from "../models/Residents.js";
import User from "../models/Users.js";
import ActivityLog from "../models/ActivityLogs.js";

export const unheartAnnouncement = async (req, res) => {
  try {
    const { announcementID } = req.params;
    const userID = req.user.userID;
    const announcement = await Announcement.findById(announcementID);

    announcement.hearts = announcement.hearts - 1;
    announcement.heartedby = announcement.heartedby.filter(
      (id) => !id.equals(userID)
    );

    await announcement.save();

    const resident = await Resident.findOne({ userID: userID }).select(
      "firstname lastname"
    );
    const io = req.app.get("socketio");

    const user = await User.findOne({ empID: announcement.uploadedby });

    await Notification.deleteOne({
      announcementID: announcement._id,
      message: `${resident.firstname} ${resident.lastname} liked your post`,
    });

    sendNotificationUpdate(user._id.toString(), io);

    await ActivityLog.insertOne({
      userID: userID,
      action: "Announcements",
      description: `User unliked ${announcement.title} post`,
    });

    res.status(200).json({ message: "Announcement unliked successfully" });
  } catch (error) {
    console.error("Error in unliking announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const heartAnnouncement = async (req, res) => {
  try {
    const { announcementID } = req.params;
    const userID = req.user.userID;
    const announcement = await Announcement.findById(announcementID);

    announcement.hearts = announcement.hearts + 1;
    announcement.heartedby.push(userID);

    await announcement.save();

    const resident = await Resident.findOne({ userID: userID }).select(
      "firstname lastname"
    );

    const user = await User.findOne({ empID: announcement.uploadedby });

    const io = req.app.get("socketio");

    io.to(user._id).emit("announcement", {
      title: `❤️ ${announcement.title}`,
      message: `${resident.firstname} ${resident.lastname} liked your post`,
      timestamp: announcement.updatedAt,
    });

    const notification = {
      userID: user._id,
      title: `❤️ ${announcement.title}`,
      message: `${resident.firstname} ${resident.lastname} liked your post`,
      redirectTo: "/announcements",
      announcementID: announcement._id,
    };

    await Notification.insertOne(notification);
    sendNotificationUpdate(user._id.toString(), io);

    await ActivityLog.insertOne({
      userID: userID,
      action: "Announcements",
      description: `User liked ${announcement.title} post`,
    });

    res.status(200).json({ message: "Announcement liked successfully" });
  } catch (error) {
    console.error("Error in liking announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const formattedAnnouncement = await getAnnouncementsUtils();
    res.status(200).json(formattedAnnouncement);
  } catch (error) {
    console.error("Error in fetching announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
