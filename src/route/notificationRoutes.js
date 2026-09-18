import express from 'express';
import {
    getNotifications,
    createNotification,
    markNotificationRead,
    markAllNotificationsRead
} from '../controller/notificationController.js';
import { authenticate, isGrantedAccess } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createNotificationSchema } from '../schema/notificationSchema.js';
import { ROLES } from '../../config/app.js';

const notificationRoutes = express.Router();
const rootOnly = isGrantedAccess([ROLES.ROOT]);

notificationRoutes.get('/notifications', authenticate, getNotifications);
notificationRoutes.post('/notifications', authenticate, rootOnly, validate(createNotificationSchema), createNotification);
notificationRoutes.patch('/notifications/:id/read', authenticate, markNotificationRead);
notificationRoutes.post('/notifications/mark-all-read', authenticate, markAllNotificationsRead);

export default notificationRoutes;
