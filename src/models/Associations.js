import { sequelize } from "../db.js";
import { Order } from "./Order.js";
import { Product } from "./Products.js";
import { OrderProduct } from "./OrderProduct.js";
import { User } from "./User.js";

User.hasMany(Order, { foreignKey: "clientId", as: "orders" });
Order.belongsTo(User, { foreignKey: "clientId", as: "client" });

Order.hasMany(OrderProduct, { foreignKey: "orderId", as: "orderProducts" });
OrderProduct.belongsTo(Order, { foreignKey: "orderId" });

OrderProduct.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(OrderProduct, { foreignKey: "productId", as: "orderProducts" });

Order.belongsToMany(Product, {
    through: OrderProduct,
    foreignKey: "orderId",
    otherKey: "productId",
    as: "products"
});

Product.belongsToMany(Order, {
    through: OrderProduct,
    foreignKey: "productId",
    otherKey: "orderId",
    as: "orders"
});

export {
    sequelize,
    Order,
    Product,
    OrderProduct
};
