export const connectedUsers = new Map();
import User from "../models/Users.js";
async function markUserActive(userId) {
  await User.findByIdAndUpdate(userId, { status: "Active" });
}

async function markUserInactive(userId) {
  const user = await User.findById(userId);
  if (user.status === "Active") {
    user.status = "Inactive";
    await user.save();
  }
}

export const registerSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userID) => {
      connectedUsers.set(userID, socket.id);
      socket.userID = userID;
      markUserActive(userID);
      socket.join(userID);
      console.log(`Socket joined room: ${userID}`);
    });

    socket.on("unregister", (userID) => {
      socket.leave(userID);
      markUserInactive(userID);
      connectedUsers.delete(userID);
    });

    socket.on("join_announcements", () => {
      socket.join("announcements");
      console.log(`Socket ${socket.id} joined announcements room`);
    });

    socket.on("disconnect", () => {
      connectedUsers.forEach((id, userID) => {
        if (id === socket.id) {
          connectedUsers.delete(userID);
          markUserInactive(socket.userID);
          console.log(`User ${userID} removed from connectedUsers`);
        }
      });
    });
  });
};
