import Announcement from "../models/Announcements.js";

export const unheartAnnouncement = async (req, res) => {
  try {
    const { announcementID } = req.params;
    const userID = req.user.userID;
    const announcement = await Announcement.findById(announcementID);

    announcement.hearts = announcement.hearts - 1;
    announcement.heartedby = announcement.heartedby.filter(
      (id) => id !== userID
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
    const announcements = await Announcement.find().select(
      "hearts category title content status picture uploadedby"
    );

    const formattedAnnouncement = announcements.map((a) => ({
      ...a.toObject(),
      uploadedby: "Barangay Aniban 2",
    }));
    res.status(200).json(formattedAnnouncement);
  } catch (error) {
    console.error("Error in fetching announcements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
