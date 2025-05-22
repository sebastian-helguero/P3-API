import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.js";


export const Order = sequelize.define("order", {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    paymentMathod: {
        type: DataTypes.ENUM("credit card", "debit card", "bank transfer"),
        allowNull: false,
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    orderFinalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orderState: {
        type: DataTypes.ENUM("pending", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
    },
    clientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model:{User},
            key: "userId"
        }
    }
}, { timestamps: false });

