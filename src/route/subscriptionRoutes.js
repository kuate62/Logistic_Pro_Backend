import express from "express";
import {
    createSubscription,
    getSubscriptions,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscriptionUsage,
    getSubscriptionPayments,
    getSubscriptionInvoices
} from "../controller/subscriptionController.js";
import {
    createSubscriptionPayment,
    updateSubscriptionPaymentStatus
} from "../controller/subscriptionPaymentController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createSubscriptionSchema,
    updateSubscriptionSchema
} from "../schema/subscriptionSchema.js";
import {
    createSubscriptionPaymentSchema,
    updateSubscriptionPaymentSchema
} from "../schema/subscriptionPaymentSchema.js";

const subscriptionRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);
const rootOnly = isGrantedAccess([ROLES.ROOT]);

subscriptionRoutes.post("/subscriptions", authenticate, rootOnly, validate(createSubscriptionSchema), createSubscription)
subscriptionRoutes.get("/subscriptions", authenticate, getSubscriptions)
subscriptionRoutes.get("/subscriptions/:id", authenticate, getSubscription)
subscriptionRoutes.patch("/subscriptions/:id", authenticate, adminOnly, validate(updateSubscriptionSchema), updateSubscription)
subscriptionRoutes.delete("/subscriptions/:id", authenticate, rootOnly, deleteSubscription)

subscriptionRoutes.get("/subscriptions/:id/usage", authenticate, getSubscriptionUsage)
subscriptionRoutes.get("/subscriptions/:id/payments", authenticate, getSubscriptionPayments)
subscriptionRoutes.get("/subscriptions/:id/invoices", authenticate, getSubscriptionInvoices)
subscriptionRoutes.post("/subscriptions/:id/payments", authenticate, rootOnly, validate(createSubscriptionPaymentSchema), createSubscriptionPayment)
subscriptionRoutes.patch("/subscriptions/:id/payments/:paymentId/status", authenticate, rootOnly, validate(updateSubscriptionPaymentSchema), updateSubscriptionPaymentStatus)

export default subscriptionRoutes;
