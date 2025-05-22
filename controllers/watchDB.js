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
    console.log("Certificates change detected:", change);
    if (
      change.operationType === "update" ||
      change.operationType === "insert"
    ) {
      const changedDoc = change.fullDocument;
      if (!changedDoc) return;

      const userID = await findUserIDByResID(changedDoc.resID);
      if (!userID) return;

      const services = await getServicesUtils(userID);
      io.to(userID).emit("dbChange", {
        type: "services",
        data: services,
      });
      console.log(`🔁 Emitting service update to userID: ${userID}`);
      console.log(`🔁 Updated services:`, services);
    } else if (change.operationType === "delete") {
      io.emit("dbChange", {
        type: "services",
        deleted: true,
        id: change.documentKey._id,
      });
    }
  });

  certificatesChangeStream.on("error", (error) => {
    console.error("Error in change certificates:", error);
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
