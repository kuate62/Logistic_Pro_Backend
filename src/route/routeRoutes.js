import express from "express";
import {
    createRoute,
    getRoutes,
    getRoute,
    updateRoute,
    deleteRoute
} from "../controller/routeController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createRouteSchema,
    updateRouteSchema
} from "../schema/routeSchema.js";

const routeRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

routeRoutes.post("/routes", authenticate, adminOnly, validate(createRouteSchema), createRoute)
routeRoutes.get("/routes", authenticate, getRoutes)
routeRoutes.get("/routes/:id", authenticate, getRoute)
routeRoutes.patch("/routes/:id", authenticate, adminOnly, validate(updateRouteSchema), updateRoute)
routeRoutes.delete("/routes/:id", authenticate, adminOnly, deleteRoute)

export default routeRoutes;
