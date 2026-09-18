import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import {AGENCY_STATUSES} from "../../config/app.js";

const AgencyModel = sequelize.define('AgencyModel', {
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
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {isEmail: true}
    },
    manager: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    hours: {
        type: DataTypes.JSON,
        allowNull: true
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {isIn: [AGENCY_STATUSES]}
    }
}, {
    tableName: 'agencies',
    timestamps: true
})

export default AgencyModel