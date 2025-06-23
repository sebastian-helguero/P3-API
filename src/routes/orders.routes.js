import { Router } from "express";
import { createOrder } from "../services/order.service.js";
import { verifyToken } from "../utils/auth.js";

const router = Router();

router.post("/orders", verifyToken, createOrder);

export default router;