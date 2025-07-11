import { Router } from "express";
import { changeUserRole, 
    checkRole, 
    getAllUsers, 
    loginUser, 
    registerUser, 
    userDelete, 
    userRecover } from '../services/user.service.js';
import { verifyToken } from "../utils/auth.js";

const router = Router();

router.get('/users', verifyToken, checkRole("sysadmin"), getAllUsers)

router.post('/register', registerUser)

router.post('/admin/register',verifyToken, checkRole('sysadmin'), registerUser)

router.post('/login', loginUser)

router.put('/users', verifyToken, checkRole("sysadmin"), changeUserRole)

router.delete('/users/modify-state', verifyToken, checkRole("sysadmin"), userDelete)

router.put('/users/modify-state', verifyToken, checkRole("sysadmin"), userRecover)

export default router;