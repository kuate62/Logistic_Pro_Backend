import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import UserModel from "./UserModel.js";
import {CLIENT_STATUSES} from "../../config/app.js";

const ClientModel = sequelize.define('ClientModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        references: {
            model: UserModel,
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: CompanyModel,
            key: 'id'
        }
    },
    clientCode: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
            isEmailOrEmpty(value) {
                if (value && value.trim() !== '') {
                    if (!/\S+@\S+\.\S+/.test(value.trim())) {
                        throw new Error('Adresse email invalide');
                    }
                }
            }
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    idType: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    idNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    preferredAgencyId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {isIn: [CLIENT_STATUSES]}
    },
    memberSince: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'clients',
    timestamps: true
})

export default ClientModel