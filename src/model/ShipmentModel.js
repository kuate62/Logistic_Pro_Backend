import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import ClientModel from "./ClientModel.js";
import EmployeeModel from "./EmployeeModel.js";
import RouteModel from "./RouteModel.js";
import {SHIPMENT_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES} from "../../config/app.js";

const ShipmentModel = sequelize.define('ShipmentModel', {
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
        allowNull: false,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    destinationAgencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    routeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: RouteModel,
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
    origin: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    destination: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sender: {
        type: DataTypes.JSON,
        allowNull: true
    },
    recipient: {
        type: DataTypes.JSON,
        allowNull: true
    },
    packageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    totalWeight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    paidAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    paymentMethod: {
        type: DataTypes.STRING(30),
        allowNull: true,
        validate: {isIn: [PAYMENT_METHODS]}
    },
    paymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {isIn: [PAYMENT_STATUSES]}
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'validated',
        validate: {isIn: [SHIPMENT_STATUSES]}
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedDeliveryDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'shipments',
    timestamps: true
})

export default ShipmentModel