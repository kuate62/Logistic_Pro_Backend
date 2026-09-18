import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";

const PriceModel = sequelize.define('PriceModel', {
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
    agencyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: AgencyModel,
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'standard'
    },
    unit: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'kg'
    },
    ratePerKg: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    minWeight: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    maxWeight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    fixedFee: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'prices',
    timestamps: true
})

export default PriceModel