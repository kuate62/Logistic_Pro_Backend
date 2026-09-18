import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";

const SubscriptionModel = sequelize.define('SubscriptionModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: CompanyModel,
            key: 'id'
        }
    },
    plan: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'free'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    autoRenew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'subscriptions',
    timestamps: true
})

export default SubscriptionModel