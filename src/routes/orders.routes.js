import { Router } from "express";
import { createOrder, getAllOrders, getOrdersByUser, updateOrderState } from "../services/order.service.js";
import { verifyToken } from "../utils/auth.js";
import { checkRole } from "../services/user.service.js";

const router = Router();

router.post("/orders", verifyToken, createOrder)

router.get("/orders", verifyToken, checkRole("admin","sysadmin"), getAllOrders)

router.get("/user/orders", verifyToken, getOrdersByUser)

router.put("/orders", verifyToken, checkRole("admin","sysadmin"), updateOrderState)

export default router;