import { Op } from 'sequelize';
import NotificationModel from '../model/NotificationModel.js';

export const getNotifications = async (req, res) => {
    try {
        const { type, unread, page = 1, limit = 50 } = req.query;

        const where = {};
        // If user is superadmin (ROLE_ROOT), show broadcast (userId=null) + user notifications
        if (req.user.roles === 'ROLE_ROOT') {
            where[Op.or] = [
                { userId: null },
                { userId: req.user.id }
            ];
        } else {
            where.userId = req.user.id;
        }

        if (type) where.type = type;
        if (unread === 'true') where.read = false;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await NotificationModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ notifications: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const createNotification = async (req, res) => {
    try {
        const notification = await NotificationModel.create(req.body);
        return res.status(201).json({ notification, message: 'Notification créée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notification = await NotificationModel.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification introuvable' });

        await notification.update({ read: true });
        return res.status(200).json({ notification, message: 'Notification marquée comme lue' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const where = {};
        if (req.user.roles === 'ROLE_ROOT') {
            where[Op.or] = [{ userId: null }, { userId: req.user.id }];
        } else {
            where.userId = req.user.id;
        }

        await NotificationModel.update({ read: true }, { where });
        return res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
