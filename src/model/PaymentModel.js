import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import ClientModel from "./ClientModel.js";
import ShipmentModel from "./ShipmentModel.js";
import EmployeeModel from "./EmployeeModel.js";
import {PAYMENT_STATUSES, PAYMENT_METHODS} from "../../config/app.js";

const PaymentModel = sequelize.define('PaymentModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    reference: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    shipmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ShipmentModel,
            key: 'id'
        }
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ClientModel,
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
    agencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    agentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: EmployeeModel,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    method: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'cash',
        validate: {isIn: [PAYMENT_METHODS]}
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {isIn: [PAYMENT_STATUSES]}
    },
    transactionId: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    history: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'payments',
    timestamps: true
})

export default PaymentModel