import express from "express";
import {
    createAgency,
    getAgencies,
    getAgency,
    updateAgency,
    deleteAgency
} from "../controller/agencyController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {createAgencySchema, updateAgencySchema} from "../schema/agencySchema.js";

const agencyRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

agencyRoutes.post("/agencies", authenticate, adminOnly, validate(createAgencySchema), createAgency)
agencyRoutes.get("/agencies", authenticate, getAgencies)
agencyRoutes.get("/agencies/:id", authenticate, getAgency)
agencyRoutes.patch("/agencies/:id", authenticate, adminOnly, validate(updateAgencySchema), updateAgency)
agencyRoutes.delete("/agencies/:id", authenticate, adminOnly, deleteAgency)

export default agencyRoutes;
