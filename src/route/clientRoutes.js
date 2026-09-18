import express from "express";
import {
    createClient,
    getClients,
    getMe,
    getClient,
    updateClient,
    updateMe,
    uploadAvatar,
    deleteClient
} from "../controller/clientController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {createClientSchema, updateClientSchema} from "../schema/clientSchema.js";
import {uploadAvatarImage} from "../middleware/avatarUpload.js";

const clientRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

clientRoutes.post("/clients", authenticate, validate(createClientSchema), createClient)
clientRoutes.get("/clients", authenticate, getClients)
clientRoutes.get("/clients/me", authenticate, getMe)
clientRoutes.patch("/clients/me", authenticate, validate(updateClientSchema), updateMe)
clientRoutes.post("/clients/me/avatar", authenticate, uploadAvatarImage, uploadAvatar)
clientRoutes.get("/clients/:id", authenticate, getClient)
clientRoutes.patch("/clients/:id", authenticate, adminOnly, validate(updateClientSchema), updateClient)
clientRoutes.delete("/clients/:id", authenticate, adminOnly, deleteClient)

export default clientRoutes;
