import express from "express";
import {
    createCity,
    getCities,
    getCity,
    updateCity,
    deleteCity
} from "../controller/cityController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    createCitySchema,
    updateCitySchema
} from "../schema/citySchema.js";

const cityRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

cityRoutes.post("/cities", authenticate, adminOnly, validate(createCitySchema), createCity)
cityRoutes.get("/cities", authenticate, getCities)
cityRoutes.get("/cities/:id", authenticate, getCity)
cityRoutes.patch("/cities/:id", authenticate, adminOnly, validate(updateCitySchema), updateCity)
cityRoutes.delete("/cities/:id", authenticate, adminOnly, deleteCity)

export default cityRoutes;
