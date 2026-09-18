import express from "express";
import {
    forgotPassword,
    login,
    register,
    resetPassword,
    verifyEmail,
    verifyResetCode,
    getCurrentUser,
    regenerateCode,
    logout,
    changePassword
} from "../controller/authController.js";
import {authenticate} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {registerSchema, forgotPasswordSchema, verifyResetCodeSchema, resetPasswordSchema, loginSchema, changePasswordSchema} from "../schema/userSchema.js";

const authRoutes = express.Router();

authRoutes.post("/auth/register", validate(registerSchema), register)
authRoutes.post("/auth/login", validate(loginSchema), login)
authRoutes.post("/auth/logout", authenticate, logout)
authRoutes.post("/auth/forgot-password", validate(forgotPasswordSchema), forgotPassword)
authRoutes.post("/auth/verify-reset-code", validate(verifyResetCodeSchema), verifyResetCode)
authRoutes.post("/auth/reset-password", validate(resetPasswordSchema()), resetPassword)
authRoutes.post("/auth/verify-email", authenticate, verifyEmail)
authRoutes.post("/auth/change-password", authenticate, validate(changePasswordSchema), changePassword)
authRoutes.post("/auth/regenerate-code", authenticate, regenerateCode)
authRoutes.get("/auth/me", authenticate, getCurrentUser)

export default authRoutes;
