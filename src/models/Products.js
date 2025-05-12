import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
export const Product = sequelize.define("product", {

    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productYear: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    productImage: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    productCountry: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productPrice: {
        type: DataTypes.INTEGER,
        allowNull: false       
    },
    productStock: {
        type: DataTypes.INTEGER,
        allowNull: false       
    },
    productState: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,   
    }
}, { timestamps: false });

