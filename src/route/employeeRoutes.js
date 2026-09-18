import express from "express";
import {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    uploadEmployeeAvatar,
    deleteEmployee
} from "../controller/employeeController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {uploadAvatarImage} from "../middleware/avatarUpload.js";
import {ROLES} from "../../config/app.js";
import {
    createEmployeeSchema,
    updateEmployeeSchema
} from "../schema/employeeSchema.js";

const employeeRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

employeeRoutes.post("/employees", authenticate, adminOnly, validate(createEmployeeSchema), createEmployee)
employeeRoutes.get("/employees", authenticate, getEmployees)
employeeRoutes.get("/employees/:id", authenticate, getEmployee)
employeeRoutes.patch("/employees/:id", authenticate, adminOnly, validate(updateEmployeeSchema), updateEmployee)
employeeRoutes.post("/employees/:id/avatar", authenticate, adminOnly, uploadAvatarImage, uploadEmployeeAvatar)
employeeRoutes.delete("/employees/:id", authenticate, adminOnly, deleteEmployee)

export default employeeRoutes;
