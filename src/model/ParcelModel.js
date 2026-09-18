import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import ClientModel from "./ClientModel.js";
import ShipmentModel from "./ShipmentModel.js";
import {PARCEL_STATUSES, PARCEL_CATEGORIES} from "../../config/app.js";

const ParcelModel = sequelize.define('ParcelModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    trackingNumber: {
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
    originAgencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    dimensions: {
        type: DataTypes.JSON,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'standard',
        validate: {isIn: [PARCEL_CATEGORIES]}
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    declaredValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'registered',
        validate: {isIn: [PARCEL_STATUSES]}
    },
    origin: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    destination: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    collectedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'parcels',
    timestamps: true
})

export default ParcelModel