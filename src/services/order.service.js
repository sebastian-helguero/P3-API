import { sequelize } from "../db.js";
import { Order } from "../models/Order.js";
import { OrderProduct } from "../models/OrderProduct.js";
import { Product } from "../models/Products.js";


export const createOrder = async (req, res) => {
  const { paymentMethod, orderFinalPrice, products } = req.body;
  const clientId = req.user?.userId;

  if (!clientId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  if (!paymentMethod || !orderFinalPrice || !products?.length) {
    return res.status(400).json({ message: "Faltan datos de la orden" });
  }

  const productIds = products.map(p => p.productId);
  const hasDuplicates = new Set(productIds).size !== productIds.length;
  if (hasDuplicates) {
    return res.status(400).json({ message: "Productos duplicados en la orden" });
  }

  try {
    for (const item of products) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.productStock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para el producto ID ${item.productId}` });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({ message: `Cantidad inválida para el producto ID ${item.productId}` });
      }
    }

    const result = await sequelize.transaction(async (t) => {
      const newOrder = await Order.create({
        paymentMethod,
        orderFinalPrice,
        clientId
      }, { transaction: t });

      for (const item of products) {
        const product = await Product.findByPk(item.productId, { transaction: t });

        product.productStock -= item.quantity;
        await product.save({ transaction: t });

        await OrderProduct.create({
          orderId: newOrder.orderId,
          productId: item.productId,
          quantity: item.quantity,
          orderSubtotalPrice: item.orderSubtotalPrice
        }, { transaction: t });
      }

      return newOrder;
    });

    res.status(201).json({ message: "Orden creada con éxito", orderId: result.orderId });

  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({ message: error.message || "Error al crear la orden" });
  }
};