import { sequelize } from '../config/database.js'
import { DataTypes } from "sequelize"

const InSession = sequelize.define('InSession', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'insession',
    timestamps: false
})

export default InSession