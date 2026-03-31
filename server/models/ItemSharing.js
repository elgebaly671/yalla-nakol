import {sequelize} from '../config/database.js'
import { DataTypes } from 'sequelize'

const ItemSharing = sequelize.define("ItemSharing", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemId: {
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
}, { tableName: 'itemsharing', timestamps: false })

export default ItemSharing