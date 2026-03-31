import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

const RequestJoin = sequelize.define("RequestJoin", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
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
    tableName: "requestjoin",
    timestamps: false
})

export default RequestJoin