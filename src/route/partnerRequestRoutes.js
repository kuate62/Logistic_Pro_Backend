import express from "express";
import {
    createPartnerRequest,
    getPartnerRequests,
    getPartnerRequest,
    reviewPartnerRequest
} from "../controller/partnerRequestController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createPartnerRequestSchema,
    reviewPartnerRequestSchema
} from "../schema/partnerRequestSchema.js";

const partnerRequestRoutes = express.Router();

const rootOnly = isGrantedAccess([ROLES.ROOT]);

partnerRequestRoutes.post("/partner-requests", validate(createPartnerRequestSchema), createPartnerRequest)
partnerRequestRoutes.get("/partner-requests", authenticate, rootOnly, getPartnerRequests)
partnerRequestRoutes.get("/partner-requests/:id", authenticate, rootOnly, getPartnerRequest)
partnerRequestRoutes.patch("/partner-requests/:id/review", authenticate, rootOnly, validate(reviewPartnerRequestSchema), reviewPartnerRequest)

export default partnerRequestRoutes;
