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
import {
  getReservations,
  sendReservationReq,
} from "../controllers/courtCountroller.js";
import { sendBlotter } from "../controllers/blotterController.js";
import { getWeather } from "../controllers/weatherController.js";
import { getAllResidents } from "../controllers/residentsController.js";

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
router.post("/getreservations", authMiddleware, getReservations);

//Blotter Reports
router.post("/sendblotter", authMiddleware, sendBlotter);

//Emergency Hotlines
router.get("/getemergencyhotlines", authMiddleware, getEmergencyHotlines);

//WEATHER
router.get("/getweather", getWeather);

//RESIDENTS
router.get("/getresidents", getAllResidents);

export default router;
