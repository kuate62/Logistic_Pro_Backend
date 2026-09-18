import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";

export const PARTNER_REQUEST_STATUSES = ['pending', 'approved', 'rejected'];

const PartnerRequestModel = sequelize.define('PartnerRequestModel', {
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
    companyName: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    companySigle: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    rccm: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    contribuable: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {isEmail: true}
    },
    website: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'Cameroun'
    },
    managerFirstName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    managerLastName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    managerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    managerEmail: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    managerRole: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    agencyCount: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    employeeCount: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    source: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    plan: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'free'
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        validate: {isIn: [PARTNER_REQUEST_STATUSES]}
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reviewedBy: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'partner_requests',
    timestamps: true
})

export default PartnerRequestModel
