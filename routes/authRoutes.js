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
import { sendCertReq } from "../controllers/formController.js";

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

export default router;
