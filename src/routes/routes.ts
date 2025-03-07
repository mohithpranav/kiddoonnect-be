import express from "express";
import {
  childSignin,
  childSignup,
  forgotPassword,
  resendOtp,
  resetPassword,
  verifyOtpController,
  verifyResetOtp,
} from "../controllers/child.auth";
import {
  hospitalSignin,
  hospitalSignup,
  resendOtphospital,
  verifyOtpControllerhospital,
  getHospitalList,
} from "../controllers/hospital.auth";
import { addChildRecord } from "../controllers/addChildRecord";
import { addChildByParent } from "../controllers/addChildByParent";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Configure multer as needed

// Child Auth Routes
router.post("/childSignup", childSignup);
router.post("/verifyOtpController", verifyOtpController);
router.post("/resendOtp", resendOtp);
router.post("/childSignin", childSignin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Hospital Auth Routes
router.get("/hospitals", getHospitalList);
router.post("/hospitalSignup", hospitalSignup);
router.post("/verifyOtpControllerhospital", verifyOtpControllerhospital);
router.post("/hospitalSignin", hospitalSignin);
router.post("/resendOtphospital", resendOtphospital);

// Add Child By Parent Route
router.post("/addChild/:parentId", addChildByParent);

// Add Child Record Route with multer middleware
router.post("/addChildRecord", upload.single("file"), addChildRecord);

export { router };
