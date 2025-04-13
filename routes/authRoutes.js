import express from "express";
import {
  checkResident,
  registerUser,
  loginUser,
  refreshAccessToken,
  sendOTP,
  checkUsername,
} from "../controllers/authController.js";
import { getUserDetails } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/refresh", refreshAccessToken);
router.post("/checkresident", checkResident);
router.post("/register", registerUser);
router.post("/checkusername", checkUsername);
router.post("/login", loginUser);
router.post("/otp", sendOTP);
router.get("/userdetails", authMiddleware, getUserDetails);

export default router;
