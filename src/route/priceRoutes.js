import express from "express";
import {
    createPrice,
    getPrices,
    getPrice,
    updatePrice,
    deletePrice
} from "../controller/priceController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createPriceSchema,
    updatePriceSchema
} from "../schema/priceSchema.js";

const priceRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

priceRoutes.post("/prices", authenticate, adminOnly, validate(createPriceSchema), createPrice)
priceRoutes.get("/prices", authenticate, getPrices)
priceRoutes.get("/prices/:id", authenticate, getPrice)
priceRoutes.patch("/prices/:id", authenticate, adminOnly, validate(updatePriceSchema), updatePrice)
priceRoutes.delete("/prices/:id", authenticate, adminOnly, deletePrice)

export default priceRoutes;
