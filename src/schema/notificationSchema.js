import Joi from 'joi';
import { NOTIFICATION_TYPES } from '../model/NotificationModel.js';

export const createNotificationSchema = Joi.object({
    userId: Joi.number().integer().positive().allow(null).optional(),
    type: Joi.string().valid(...NOTIFICATION_TYPES).default('info'),
    title: Joi.string().max(255).required(),
    message: Joi.string().required()
});
