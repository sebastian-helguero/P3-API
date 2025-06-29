import { sequelize } from "../db.js";
import { Order } from "../models/Order.js";
import { OrderProduct } from "../models/OrderProduct.js";
import { Product } from "../models/Products.js";
import { User } from "../models/User.js";


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

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "client",
          attributes: ["userId", "fullName", "email"]
        },
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity", "orderSubtotalPrice"] }
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las órdenes" });
  }
};

export const getOrdersByUser = async (req, res) => {
  const userId = req.user.userId;
  try {
    const orders = await Order.findAll({
      where: { clientId: userId },
      include: [
        {
          model: OrderProduct,
          as: "orderProducts",
          include: [{model:Product, as:"product"}]
        },
        {
          model: User,
          as: "client",
          attributes: ['userId', 'fullName', 'email']
        }
      ]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las órdenes del usuario" });
  }
};

export const updateOrderState = async (req, res) => {
  const { orderId, newState } = req.body;

  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ['quantity'] }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (!["completed", "cancelled"].includes(newState)) {
      return res.status(400).json({ error: "Solo se puede cambiar el estado a 'completed' o 'cancelled'" });
    }

    if (newState === "cancelled" && order.orderState === "pending") {
      for (const product of order.products) {
        const quantityToRestore = product.orderProduct.quantity;
        product.productStock += quantityToRestore;
        await product.save();
      }
    }

    order.orderState = newState;
    await order.save();

    res.json({ message: `Estado de la orden actualizado a "${newState}"`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el estado de la orden" });
  }
};