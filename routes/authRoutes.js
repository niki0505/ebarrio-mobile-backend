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

//Emergency Hotlines
router.get("/getemergencyhotlines", authMiddleware, getEmergencyHotlines);

export default router;
