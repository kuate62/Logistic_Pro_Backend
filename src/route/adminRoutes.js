import express from 'express';
import { getAdminStats } from '../controller/adminController.js';
import { authenticate, isGrantedAccess } from '../middleware/auth.js';
import { ROLES } from '../../config/app.js';

const adminRoutes = express.Router();
const rootOnly = isGrantedAccess([ROLES.ROOT]);

adminRoutes.get('/admin/stats', authenticate, rootOnly, getAdminStats);

export default adminRoutes;
