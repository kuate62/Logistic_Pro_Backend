import express from "express";
import {
    createPlan,
    getPlans,
    getPlan,
    updatePlan,
    deletePlan
} from "../controller/planController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createPlanSchema,
    updatePlanSchema
} from "../schema/planSchema.js";

const planRoutes = express.Router();

const rootOnly = isGrantedAccess([ROLES.ROOT]);

planRoutes.get("/plans", getPlans)
planRoutes.get("/plans/:id", getPlan)
planRoutes.post("/plans", authenticate, rootOnly, validate(createPlanSchema), createPlan)
planRoutes.patch("/plans/:id", authenticate, rootOnly, validate(updatePlanSchema), updatePlan)
planRoutes.delete("/plans/:id", authenticate, rootOnly, deletePlan)

export default planRoutes;
