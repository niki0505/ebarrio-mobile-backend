import Announcement from "../models/Announcements.js";

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
