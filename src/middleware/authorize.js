import { isGrantedAccess } from "./auth.js";

export const authorize = (...rolesAuthorized) => isGrantedAccess(rolesAuthorized);
