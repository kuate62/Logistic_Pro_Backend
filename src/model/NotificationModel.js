import sequelize from '../../config/sequelize_app.js';
import { DataTypes } from 'sequelize';
import UserModel from './UserModel.js';

export const NOTIFICATION_TYPES = ['info', 'warning', 'success', 'error'];

const NotificationModel = sequelize.define('NotificationModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // null = notification système / broadcast
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'info',
        validate: { isIn: [NOTIFICATION_TYPES] }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'notifications',
    timestamps: true
});

export default NotificationModel;
