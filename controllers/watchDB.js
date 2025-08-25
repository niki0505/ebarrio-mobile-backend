import mongoose from "mongoose";
import {
  findUserIDByResID,
  getAllNotificationsUtils,
  getAnnouncementsUtils,
  getEmergencyHotlinesUtils,
  getServicesUtils,
  getUnreadNotifications,
  getUsersUtils,
} from "../utils/collectionUtils.js";

export const watchAllCollectionsChanges = (io) => {
  const db = mongoose.connection.db;

  // USERS (ACCOUNTS)
  const usersChangeStream = db.collection("users").watch();
  usersChangeStream.on("change", async (change) => {
    console.log("Users change detected:", change);
    if (
      change.operationType === "update" ||
      change.operationType === "insert"
    ) {
      const users = await getUsersUtils();
      io.emit("mobile-dbChange", {
        type: "users",
        data: users,
      });
    } else if (change.operationType === "delete") {
      io.emit("mobile-dbChange", {
        type: "users",
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });
  usersChangeStream.on("error", (error) => {
    console.error("Error in users change stream:", error);
  });

  // STATUS

  const certificatesChangeStream = db
    .collection("certificates")
    .watch([], { fullDocument: "updateLookup" });

  certificatesChangeStream.on("change", async (change) => {
    try {
      console.log("Certificates change detected:", change);

      if (
        change.operationType === "update" ||
        change.operationType === "insert"
      ) {
        const changedDoc = change.fullDocument;
        if (!changedDoc) {
          console.warn("No fullDocument found in change event.");
          return;
        }

        const userID = await findUserIDByResID(changedDoc.resID);
        if (!userID) {
          console.warn(`No userID found for resID: ${changedDoc.resID}`);
          return;
        }

        const services = await getServicesUtils(userID);
        console.log("Fetched services:", services);
        try {
          io.to(userID).emit("mobile-dbChange", {
            type: "services",
            data: services,
          });
          console.log(
            `Successfully emitted mobile-dbChange to userID: ${userID}`
          );
        } catch (err) {
          console.error(`Failed to emit dbChange to userID: ${userID}`, err);
        }
      } else if (change.operationType === "delete") {
        io.emit("mobile-dbChange", {
          type: "services",
          deleted: true,
          id: change.documentKey._id,
        });
      }
    } catch (err) {
      console.error("Error handling certificates change event:", err);
    }
  });

  const blotterChangeStream = db
    .collection("blotters")
    .watch([], { fullDocument: "updateLookup" });

  blotterChangeStream.on("change", async (change) => {
    try {
      console.log("Blotters change detected:", change);

      if (
        change.operationType === "update" ||
        change.operationType === "insert"
      ) {
        const changedDoc = change.fullDocument;
        if (!changedDoc) {
          console.warn("No fullDocument found in change event.");
          return;
        }

        const userID = await findUserIDByResID(changedDoc.resID);
        if (!userID) {
          console.warn(`No userID found for resID: ${changedDoc.resID}`);
          return;
        }

        const services = await getServicesUtils(userID);
        console.log("Fetched services:", services);
        try {
          io.emit("mobile-dbChange", {
            type: "services",
            data: services,
          });
          console.log(
            `Successfully emitted mobile-dbChange to userID: ${userID}`
          );
        } catch (err) {
          console.error(`Failed to emit dbChange to userID: ${userID}`, err);
        }
      } else if (change.operationType === "delete") {
        io.emit("mobile-dbChange", {
          type: "services",
          deleted: true,
          id: change.documentKey._id,
        });
      }
    } catch (err) {
      console.error("Error handling blotter change event:", err);
    }
  });

  const courtChangeStream = db
    .collection("courtreservations")
    .watch([], { fullDocument: "updateLookup" });

  courtChangeStream.on("change", async (change) => {
    try {
      console.log("Court reservations change detected:", change);

      if (
        change.operationType === "update" ||
        change.operationType === "insert"
      ) {
        const changedDoc = change.fullDocument;
        if (!changedDoc) {
          console.warn("No fullDocument found in change event.");
          return;
        }

        const userID = await findUserIDByResID(changedDoc.resID);
        if (!userID) {
          console.warn(`No userID found for resID: ${changedDoc.resID}`);
          return;
        }

        const services = await getServicesUtils(userID);
        console.log("Fetched services:", services);
        try {
          io.emit("mobile-dbChange", {
            type: "services",
            data: services,
          });
          console.log(
            `Successfully emitted mobile-dbChange to userID: ${userID}`
          );
        } catch (err) {
          console.error(`Failed to emit dbChange to userID: ${userID}`, err);
        }
      } else if (change.operationType === "delete") {
        io.emit("mobile-dbChange", {
          type: "services",
          deleted: true,
          id: change.documentKey._id,
        });
      }
    } catch (err) {
      console.error("Error handling court reservations change event:", err);
    }
  });

  // ANNOUNCEMENTS
  const announcementsChangeStream = db.collection("announcements").watch();

  announcementsChangeStream.on("change", async (change) => {
    console.log("Announcements change detected:", change);
    if (
      change.operationType === "update" ||
      change.operationType === "insert"
    ) {
      const announcements = await getAnnouncementsUtils();
      io.emit("mobile-dbChange", {
        type: "announcements",
        data: announcements,
      });
    } else if (change.operationType === "delete") {
      io.emit("mobile-dbChange", {
        type: "announcements",
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });

  announcementsChangeStream.on("error", (error) => {
    console.error("Error in change stream:", error);
  });

  // ANNOUNCEMENTS
  const emergencyhotlinesChangeStream = db
    .collection("emergencyhotlines")
    .watch();

  emergencyhotlinesChangeStream.on("change", async (change) => {
    console.log("Emergency hotlines change detected:", change);
    if (
      change.operationType === "update" ||
      change.operationType === "insert"
    ) {
      const emergencyhotlines = await getEmergencyHotlinesUtils();
      io.emit("mobile-dbChange", {
        type: "emergencyhotlines",
        data: emergencyhotlines,
      });
    } else if (change.operationType === "delete") {
      io.emit("mobile-dbChange", {
        type: "emergencyhotlines",
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });

  emergencyhotlinesChangeStream.on("error", (error) => {
    console.error("Error in change stream:", error);
  });

  // ANNOUNCEMENTS
  const notifChangeStream = db.collection("notifications").watch([], {
    fullDocument: "updateLookup",
  });

  notifChangeStream.on("change", async (change) => {
    console.log("Notifications change detected:", change);
    const changedDoc = change.fullDocument;
    if (
      change.operationType === "update" ||
      change.operationType === "insert"
    ) {
      const unreadnotifications = await getUnreadNotifications(
        changedDoc.userID
      );
      io.emit("mobile-dbChange", {
        type: "unreadnotifications",
        data: unreadnotifications,
      });
      const notifications = await getAllNotificationsUtils(changedDoc.userID);
      io.emit("mobile-dbChange", {
        type: "notifications",
        data: notifications,
      });
    } else if (change.operationType === "delete") {
      const unreadnotifications = await getUnreadNotifications(
        changedDoc.userID
      );
      io.emit("mobile-dbChange", {
        type: "unreadnotifications",
        data: unreadnotifications,
      });
      const notifications = await getAllNotificationsUtils(changedDoc.userID);
      io.emit("mobile-dbChange", {
        type: "notifications",
        data: notifications,
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });

  notifChangeStream.on("error", (error) => {
    console.error("Error in change stream:", error);
  });

  console.log("Watching all collections for changes...");
};
