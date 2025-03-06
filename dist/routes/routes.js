"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const child_auth_1 = require("../controllers/child.auth");
const hospital_auth_1 = require("../controllers/hospital.auth");
const addChildRecord_1 = require("../controllers/addChildRecord");
const addChildByParent_1 = require("../controllers/addChildByParent");
const router = express_1.default.Router();
exports.router = router;
// Child Auth Routes
router.post("/childSignup", child_auth_1.childSignup);
router.post("/verifyOtpController", child_auth_1.verifyOtpController);
router.post("/resendOtp", child_auth_1.resendOtp);
router.post("/childSignup", child_auth_1.childSignin);
router.post("/forgot-password", child_auth_1.forgotPassword);
router.post("/verify-reset-otp", child_auth_1.verifyResetOtp);
router.post("/reset-password", child_auth_1.resetPassword);
// Hospital Auth Routes
router.post("/hospitalSignup", hospital_auth_1.hospitalSignup);
router.post("/verifyOtpControllerhospital", hospital_auth_1.verifyOtpControllerhospital);
router.post("/hospitalSignin", hospital_auth_1.hospitalSignin);
router.post("/resendOtphospital", hospital_auth_1.resendOtphospital);
// Add Child By Parent Route
router.post("/addChild/:parentId", addChildByParent_1.addChildByParent);
// Add Child Record Route
router.post("/addChildRecord", addChildRecord_1.addChildRecord);
