import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";

const CityModel = sequelize.define('CityModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Cameroun'
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'cities',
    timestamps: true
})

export default CityModel