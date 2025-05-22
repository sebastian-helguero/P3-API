import { Router } from "express";
import { getUsers, loginUser, registerUser } from '../services/user.service.js';
import { verifyToken } from "../utils/auth.js";

const router = Router();

router.get('/users',verifyToken, getUsers);

router.post('/register', registerUser);

router.post('/login', loginUser);

export default router;