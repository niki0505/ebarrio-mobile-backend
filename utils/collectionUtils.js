import Announcement from "../models/Announcements.js";

export const getAnnouncementsUtils = async () => {
  try {
    const announcements = await Announcement.find().select(
      "hearts category title content status picture uploadedby heartedby createdAt eventStart eventEnd status"
    );

    const formattedAnnouncement = announcements.map((a) => ({
      ...a.toObject(),
      uploadedby: "Barangay Aniban 2",
    }));
    return formattedAnnouncement;
  } catch (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
};
