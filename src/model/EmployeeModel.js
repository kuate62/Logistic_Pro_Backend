import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import CompanyModel from "./CompanyModel.js";
import AgencyModel from "./AgencyModel.js";
import UserModel from "./UserModel.js";
import {EMPLOYEE_STATUSES, EMPLOYEE_ROLES} from "../../config/app.js";

const EmployeeModel = sequelize.define('EmployeeModel', {
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
        validate: {isEmail: true}
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'depot_agent',
        validate: {isIn: [EMPLOYEE_ROLES]}
    },
    counterId: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: {isIn: [EMPLOYEE_STATUSES]}
    }
}, {
    tableName: 'employees',
    timestamps: true
})

export default EmployeeModel