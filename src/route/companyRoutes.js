import express from "express";
import {
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    getCompanyDashboardStats
} from "../controller/companyController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {createCompanySchema, updateCompanySchema} from "../schema/companySchema.js";

const companyRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);
const rootOnly = isGrantedAccess([ROLES.ROOT]);

companyRoutes.post("/companies", authenticate, rootOnly, validate(createCompanySchema), createCompany)
companyRoutes.get("/companies", authenticate, getCompanies)
companyRoutes.get("/companies/:id/dashboard", authenticate, adminOnly, getCompanyDashboardStats)
companyRoutes.get("/companies/:id", authenticate, getCompany)
companyRoutes.patch("/companies/:id", authenticate, adminOnly, validate(updateCompanySchema), updateCompany)
companyRoutes.delete("/companies/:id", authenticate, rootOnly, deleteCompany)

export default companyRoutes;
