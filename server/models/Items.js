import {sequelize} from "../config/database.js"
import { DataTypes } from "sequelize"

const Items = sequelize.define('Items', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'items',
    timestamps: false
})

export default Items