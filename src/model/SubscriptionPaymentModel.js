import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import SubscriptionModel from "./SubscriptionModel.js";
import CompanyModel from "./CompanyModel.js";

export const SUBSCRIPTION_PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'];

const SubscriptionPaymentModel = sequelize.define('SubscriptionPaymentModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    subscriptionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SubscriptionModel,
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CompanyModel,
            key: 'id'
        }
    },
    reference: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    receiptNumber: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'FCFA'
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {isIn: [SUBSCRIPTION_PAYMENT_STATUSES]}
    },
    periodStart: {
        type: DataTypes.DATE,
        allowNull: true
    },
    periodEnd: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'subscription_payments',
    timestamps: true
})

export default SubscriptionPaymentModel
