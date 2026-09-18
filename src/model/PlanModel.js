import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";

export const PLAN_STATUSES = ['active', 'inactive'];

const PlanModel = sequelize.define('PlanModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    code: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'FCFA'
    },
    billingCycle: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'monthly'
    },
    maxAgencies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1
    },
    maxUsers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1
    },
    maxStorage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    maxShipments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: -1
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {isIn: [PLAN_STATUSES]}
    }
}, {
    tableName: 'plans',
    timestamps: true
})

export default PlanModel
