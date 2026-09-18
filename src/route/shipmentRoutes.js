import express from "express";
import {
    createShipment,
    getShipments,
    getShipment,
    updateShipment,
    deleteShipment,
    updateShipmentStatus,
    getShipmentHistory,
    getShipmentStats
} from "../controller/shipmentController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createShipmentSchema,
    updateShipmentStatusSchema,
    updateShipmentSchema
} from "../schema/shipmentSchema.js";

const shipmentRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

shipmentRoutes.post("/shipments", authenticate, validate(createShipmentSchema), createShipment)
shipmentRoutes.get("/shipments", authenticate, getShipments)
shipmentRoutes.get("/shipments/stats", authenticate, getShipmentStats)
shipmentRoutes.get("/shipments/:id/history", authenticate, getShipmentHistory)
shipmentRoutes.get("/shipments/:id", authenticate, getShipment)
shipmentRoutes.patch("/shipments/:id", authenticate, adminOnly, validate(updateShipmentSchema), updateShipment)
shipmentRoutes.delete("/shipments/:id", authenticate, adminOnly, deleteShipment)
shipmentRoutes.patch("/shipments/:id/status", authenticate, validate(updateShipmentStatusSchema), updateShipmentStatus)

export default shipmentRoutes;
