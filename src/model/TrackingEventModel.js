import sequelize from "../../config/sequelize_app.js";
import {DataTypes} from "sequelize";
import ParcelModel from "./ParcelModel.js";

const TrackingEventModel = sequelize.define('TrackingEventModel', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    parcelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ParcelModel,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    agentName: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'tracking_events',
    timestamps: false
})

export default TrackingEventModel