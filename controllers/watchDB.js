import mongoose from "mongoose";
import {
  findUserIDByResID,
  getAnnouncementsUtils,
  getServicesUtils,
} from "../utils/collectionUtils.js";

export const watchAllCollectionsChanges = (io) => {
  const db = mongoose.connection.db;

  // STATUS

  // // COURT RESERVATIONS
  // const reservationsChangeStream = db
  //   .collection("courtreservations")
  //   .watch([], { fullDocument: "updateLookup" });

  // reservationsChangeStream.on("change", async (change) => {
  //   console.log("CourtReservation change detected:", change);

  //   if (
  //     change.operationType === "update" ||
  //     change.operationType === "insert"
  //   ) {
  //     const changedDoc = change.fullDocument;
  //     if (!changedDoc) return;

  //     const userID = await findUserIDByResID(changedDoc.resID);
  //     if (!userID) return;

  //     const services = await getServicesUtils(userID);
  //     io.to(userID).emit("dbChange", {
  //       type: "services",
  //       data: services,
  //     });
  //     console.log(
  //       `🔁 Emitting reservation service update to userID: ${userID}`
  //     );
  //   }
  // });

  // // BLOTTERS
  // const blotterChangeStream = db
  //   .collection("blotters")
  //   .watch([], { fullDocument: "updateLookup" });

  // blotterChangeStream.on("change", async (change) => {
  //   console.log("Blotter change detected:", change);

  //   if (
  //     change.operationType === "update" ||
  //     change.operationType === "insert"
  //   ) {
  //     const changedDoc = change.fullDocument;
  //     if (!changedDoc) return;

  //     const userID = await findUserIDByResID(changedDoc.complainantID);
  //     if (!userID) return;

  //     const services = await getServicesUtils(userID);
  //     io.to(userID).emit("dbChange", {
  //       type: "services",
  //       data: services,
  //     });
  //     console.log(`🔁 Emitting blotter service update to userID: ${userID}`);
  //   }
  // });

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
        try {
          io.to(userID).emit("dbChange", {
            type: "services",
            data: services,
          });
          console.log(`Successfully emitted dbChange to userID: ${userID}`);
        } catch (err) {
          console.error(`Failed to emit dbChange to userID: ${userID}`, err);
        }
      } else if (change.operationType === "delete") {
        const userID = await findUserIDByResID(change.documentKey.resID);
        if (!userID) return;
        io.to(userID).emit("dbChange", {
          type: "services",
          deleted: true,
          id: change.documentKey._id,
        });
      }
    } catch (err) {
      console.error("Error handling certificates change event:", err);
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
      io.emit("dbChange", {
        type: "announcements",
        data: announcements,
      });
    } else if (change.operationType === "delete") {
      io.emit("dbChange", {
        type: "announcements",
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });

  announcementsChangeStream.on("error", (error) => {
    console.error("Error in change stream:", error);
  });

  console.log("Watching all collections for changes...");
};
