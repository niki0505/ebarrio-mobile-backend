import express from "express";
import {
  checkResident,
  registerUser,
  loginUser,
  refreshAccessToken,
  sendOTP,
  checkRefreshToken,
  logoutUser,
  verifyOTP,
  getMobileNumber,
} from "../controllers/authController.js";
import { getUserDetails } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendCertReq } from "../controllers/certificateController.js";
import { getEmergencyHotlines } from "../controllers/emergencyHotlines.js";
import {
  getReservations,
  sendReservationReq,
} from "../controllers/courtCountroller.js";
import { sendBlotter } from "../controllers/blotterController.js";
import { getWeather } from "../controllers/weatherController.js";
import { getAllResidents } from "../controllers/residentsController.js";
import {
  getAnnouncements,
  heartAnnouncement,
  unheartAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/refresh", refreshAccessToken);
router.post("/checkresident", checkResident);
router.post("/register", registerUser);
// router.post("/checkusername", checkUsername);
router.post("/login", loginUser);
router.post("/getmobilenumber/:username", getMobileNumber);
router.post("/checkrefreshtoken", checkRefreshToken);
router.get("/refreshtoken", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/userdetails", authMiddleware, getUserDetails);

//OTP
router.post("/sendotp", sendOTP);
router.post("/verifyotp", verifyOTP);

//CERTIFICATE REQUESTS
router.post("/sendcertrequest", authMiddleware, sendCertReq);

//COURT RESERVATIONS
router.post("/sendreservationrequest", authMiddleware, sendReservationReq);
router.get("/getreservations", authMiddleware, getReservations);

//BLOTTER REPORTS
router.post("/sendblotter", authMiddleware, sendBlotter);

//EMERGENCY HOTLINES
router.get("/getemergencyhotlines", authMiddleware, getEmergencyHotlines);

//WEATHER
router.get("/getweather", getWeather);

//RESIDENTS
router.get("/getresidents", getAllResidents);

//ANNOUNCEMENTS
router.get("/getannouncements", getAnnouncements);
router.put(
  "/heartannouncement/:announcementID",
  authMiddleware,
  heartAnnouncement
);
router.put(
  "/unheartannouncement/:announcementID",
  authMiddleware,
  unheartAnnouncement
);

export default router;
