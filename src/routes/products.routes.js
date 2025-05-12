import { Router } from "express";

import {
    findProducts, 
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct
} from "../services/product.service.js";

const router = Router();

router.get("/products", findProducts);

router.get("/products/:id", findProduct);

router.post("/products", createProduct);

router.put("/products/:id", updateProduct);

router.delete("/products/:id", deleteProduct);

router.patch("/products/:id", restoreProduct);

export default router;