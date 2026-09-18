import sequelize from '../../config/sequelize_app.js';
import {DataTypes} from "sequelize";
import {hashPassword} from "../helper/password.js";
import {ROLES} from "../../config/app.js";

const UserModel = sequelize.define('UserModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        unique: true,
        type: DataTypes.INTEGER,
    },
    lastname: {
            type: DataTypes.STRING,
            allowNull: false
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false

    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'M'
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {isEmail: true},
        unique: true
    },
    status:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    verified:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    phone:{
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
    },
    code:{
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    roles: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'users',
    defaultScope: {
        attributes: {
            exclude: ['password', 'code', 'expiredAt']
        },
    },
    scopes: {
        withPassword: {attributes: {include: ['password']}},
        withCode: {attributes: {include: ['code', 'expiredAt']}}
    },
    hooks:{
        beforeCreate: async (user, options) => {
            user.password = await hashPassword(user.password)
        },
        beforeUpdate: async (user, options) => {
            if (user && user.password && user.changed('password')) user.password = await hashPassword (user.password)
        },
        afterCreate(user, options) {
            if (user && user.dataValues.password) delete user.dataValues.password
            if (user && user.dataValues.code) delete user.dataValues.code
            if (user && user.dataValues.expiredAt) delete user.dataValues.expiredAt
        },
    }
})

export default UserModel;
