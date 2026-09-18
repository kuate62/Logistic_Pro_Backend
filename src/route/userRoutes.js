import express from "express";
import {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
} from "../controller/userController.js";
import {authenticate, isGrantedAccess} from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {ROLES} from "../../config/app.js";
import {
    adminCreateUserSchema,
    adminUpdateUserSchema
} from "../schema/userSchema.js";

const userRoutes = express.Router();

const adminOnly = isGrantedAccess([ROLES.ADMIN, ROLES.ROOT]);

userRoutes.post("/users", authenticate, adminOnly, validate(adminCreateUserSchema), createUser)
userRoutes.get("/users", authenticate, adminOnly, getUsers)
userRoutes.get("/users/:id", authenticate, adminOnly, getUser)
userRoutes.patch("/users/:id", authenticate, adminOnly, validate(adminUpdateUserSchema), updateUser)
userRoutes.delete("/users/:id", authenticate, adminOnly, deleteUser)

export default userRoutes;
