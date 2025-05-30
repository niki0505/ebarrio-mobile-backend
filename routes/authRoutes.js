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
  checkCredentials,
  checkUsername,
} from "../controllers/authController.js";
import {
  getUserDetails,
  resetPassword,
  setPushToken,
  viewDisaster,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  cancelCertReq,
  sendCertReq,
} from "../controllers/certificateController.js";
import { getEmergencyHotlines } from "../controllers/emergencyHotlines.js";
import {
  cancelReservationReq,
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
import {
  changeMobileNumber,
  changePassword,
  changeSecurityQuestions,
  changeUsername,
  checkPassword,
} from "../controllers/settingsController.js";
import {
  checkOTP,
  checkUser,
  limitOTP,
  newPassword,
  verifySecurityQuestion,
} from "../controllers/forgotPassController.js";
import { getServicesSubmitted } from "../controllers/statusController.js";
import {
  getAllNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/refresh", refreshAccessToken);
router.post("/checkresident", checkResident);
router.post("/register", registerUser);

//LOGIN
router.post("/login", loginUser);
router.get("/getmobilenumber/:username", getMobileNumber);
router.post("/checkcredentials", checkCredentials);
router.get("/getuserdetails", authMiddleware, getUserDetails);

router.post("/checkrefreshtoken", checkRefreshToken);
router.get("/refreshtoken", refreshAccessToken);
router.post("/logout", logoutUser);

//FORGOT PASSWORD
router.get("/checkuser/:username", checkUser);
router.post("/verifyquestion/:username", verifySecurityQuestion);
router.post("/newpassword/:username", newPassword);
router.get("/limitotp/:username", limitOTP);
router.get("/checkotp/:username", checkOTP);

//USERS
router.put("/resetpassword/:username", resetPassword);
router.post("/viewdisaster", authMiddleware, viewDisaster);

//OTP
router.post("/sendotp", sendOTP);
router.post("/verifyotp", verifyOTP);

//CERTIFICATE REQUESTS
router.post("/sendcertrequest", authMiddleware, sendCertReq);
router.put("/cancelcertrequest/:certID", authMiddleware, cancelCertReq);

//COURT RESERVATIONS
router.post("/sendreservationrequest", authMiddleware, sendReservationReq);
router.get("/getreservations", authMiddleware, getReservations);
router.put(
  "/cancelreservationrequest/:reservationID",
  authMiddleware,
  cancelReservationReq
);

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

//ACCOUNT SETTINGS
router.get("/checkusername/:username", authMiddleware, checkUsername);
router.put("/changeusername", authMiddleware, changeUsername);
router.put("/changepassword", authMiddleware, changePassword);
router.put("/changemobilenumber", authMiddleware, changeMobileNumber);
router.put("/changesecurityquestions", authMiddleware, changeSecurityQuestions);
router.post("/checkpassword", authMiddleware, checkPassword);

//STATUS
router.get("/getservices", authMiddleware, getServicesSubmitted);

//NOTIFICATIONS
router.put("/setpushtoken", authMiddleware, setPushToken);
router.get("/getnotifications", authMiddleware, getAllNotifications);
router.put("/readnotification/:notifID", authMiddleware, markAsRead);

export default router;
