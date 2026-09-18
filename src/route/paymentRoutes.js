import express from "express";
import {
    createPayment,
    getPayments,
    getPayment,
    getShipmentPayments,
    updatePaymentStatus
} from "../controller/paymentController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {createPaymentSchema, updatePaymentStatusSchema} from "../schema/paymentSchema.js";
import {ROLES} from "../../config/app.js";

const paymentRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

paymentRoutes.post("/payments", authenticate, validate(createPaymentSchema), createPayment)
paymentRoutes.get("/payments", authenticate, getPayments)
paymentRoutes.get("/payments/:id", authenticate, getPayment)
paymentRoutes.patch("/payments/:id/status", authenticate, adminOnly, validate(updatePaymentStatusSchema), updatePaymentStatus)

paymentRoutes.get("/shipments/:id/payments", authenticate, getShipmentPayments)

export default paymentRoutes;
