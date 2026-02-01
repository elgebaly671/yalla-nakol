import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Session = sequelize.define("Session", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalExpenses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'sessions',
    timestamps: true,
})
export default Session;