import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import {ROUTE_STATUSES} from "../../config/app.js";

const RouteModel = sequelize.define('RouteModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CompanyModel,
            key: 'id'
        }
    },
    originAgencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    destinationAgencyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'planned',
        validate: {isIn: [ROUTE_STATUSES]}
    },
    departureDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    vehicle: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    driver: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'routes',
    timestamps: true
})

export default RouteModel