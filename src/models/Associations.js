import { sequelize } from "../db.js";
import { Order } from "./Order.js";
import { Product } from "./Products.js";
import { OrderProduct } from "./OrderProduct.js";


Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: "orderId",
    otherKey: "productId"
});

Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: "productId",
    otherKey: "orderId"
});

export {
    sequelize,
    Order,
    Product,
    OrderProduct
};
