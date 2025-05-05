import express from "express";
import {
  checkResident,
  registerUser,
  loginUser,
  refreshAccessToken,
  sendOTP,
  checkUsername,
  checkRefreshToken,
  logoutUser,
} from "../controllers/authController.js";
import { getUserDetails } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendCertReq } from "../controllers/certificateController.js";
import { getEmergencyHotlines } from "../controllers/emergencyHotlines.js";
import { sendReservationReq } from "../controllers/courtCountroller.js";
import { sendBlotter } from "../controllers/blotterController.js";
import { getWeather } from "../controllers/weatherController.js";

const router = express.Router();

router.post("/refresh", refreshAccessToken);
router.post("/checkresident", checkResident);
router.post("/register", registerUser);
router.post("/checkusername", checkUsername);
router.post("/login", loginUser);
router.post("/otp", sendOTP);
router.post("/checkrefreshtoken", checkRefreshToken);
router.get("/refreshtoken", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/userdetails", authMiddleware, getUserDetails);

//Certificate Requests
router.post("/sendcertrequest", authMiddleware, sendCertReq);

//Court Reservations
router.post("/sendreservationrequest", authMiddleware, sendReservationReq);

//Blotter Reports
router.post("/sendblotter", authMiddleware, sendBlotter);

//Emergency Hotlines
router.get("/getemergencyhotlines", authMiddleware, getEmergencyHotlines);

//WEATHER
router.get("/getweather", getWeather);

export default router;
