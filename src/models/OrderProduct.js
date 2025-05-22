import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Order } from "./Order.js";
import { Product } from "./Products.js";

export const OrderProduct = sequelize.define("orderProduct", {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: {Order},
            key: "orderId"
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: {Product},
            key: "productId"
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orderSubtotalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
    
}, { timestamps: false });