import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import {COMPANY_STATUSES} from "../../config/app.js";

const CompanyModel = sequelize.define('CompanyModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
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
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    taxId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {isIn: [COMPANY_STATUSES]}
    }
}, {
    tableName: 'companies',
    timestamps: true
})

export default CompanyModel