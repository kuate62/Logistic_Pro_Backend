import express from "express";
import {
    getParcels,
    getParcel,
    getParcelHistory,
    getParcelPayments,
    updateParcelStatus,
    deleteParcel
} from "../controller/parcelController.js";
import {getParcelTracking} from "../controller/shipmentController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {updateParcelStatusSchema} from "../schema/shipmentSchema.js";
import {ROLES} from "../../config/app.js";

const parcelRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

parcelRoutes.get("/parcels/tracking", getParcelTracking)
parcelRoutes.get("/parcels", authenticate, getParcels)
parcelRoutes.get("/parcels/:id/history", authenticate, getParcelHistory)
parcelRoutes.get("/parcels/:id/payments", authenticate, getParcelPayments)
parcelRoutes.get("/parcels/:id", authenticate, getParcel)
parcelRoutes.patch("/parcels/:id/status", authenticate, validate(updateParcelStatusSchema), updateParcelStatus)
parcelRoutes.delete("/parcels/:id", authenticate, adminOnly, deleteParcel)

export default parcelRoutes;
