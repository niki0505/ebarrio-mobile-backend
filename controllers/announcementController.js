import Announcement from "../models/Announcements.js";
import { getAnnouncementsUtils } from "../utils/collectionUtils.js";

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
