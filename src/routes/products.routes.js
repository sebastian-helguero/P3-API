import { Router } from "express";

import {
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    getProducts
} from "../services/product.service.js";

import { verifyToken } from "../utils/auth.js";
import { checkRole } from "../services/user.service.js";

const router = Router();

router.get("/products", getProducts);

router.get("/products/:id",verifyToken, findProduct);

router.post("/products",verifyToken,checkRole("admin","sysadmin"), createProduct);

router.put("/products/:id",verifyToken,checkRole("admin","sysadmin"), updateProduct);

router.delete("/products/:id",verifyToken,checkRole("admin","sysadmin"), deleteProduct);

router.patch("/products/:id",verifyToken,checkRole("admin","sysadmin"), restoreProduct);

export default router;