import { Router } from "express";

import {
    findProducts, 
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
} from "../services/product.service.js";
import { verifyToken } from "../utils/auth.js";

const router = Router();

router.get("/products",verifyToken, findProducts);

router.get("/products/:id",verifyToken, findProduct);

router.post("/products",verifyToken, createProduct);

router.put("/products/:id",verifyToken, updateProduct);

router.delete("/products/:id",verifyToken, deleteProduct);

router.patch("/products/:id",verifyToken, restoreProduct);

export default router;