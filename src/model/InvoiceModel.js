import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import SubscriptionModel from "./SubscriptionModel.js";
import SubscriptionPaymentModel from "./SubscriptionPaymentModel.js";
import CompanyModel from "./CompanyModel.js";

export const INVOICE_STATUSES = ['pending', 'paid', 'cancelled'];

const InvoiceModel = sequelize.define('InvoiceModel', {
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
    subscriptionPaymentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: SubscriptionPaymentModel,
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
    invoiceNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    taxRate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.18
    },
    taxAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {isIn: [INVOICE_STATUSES]}
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'invoices',
    timestamps: true
})

export default InvoiceModel
