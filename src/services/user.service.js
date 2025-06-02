import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";

import { validateEmail, validatePassword, validateString } from "../utils/validations.js";


export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);  
    } catch (error) {
        console.error("Error fetching users:", error);  
    }
    
}


export const registerUser = async (req, res) => {
    
    const { fullName, birthDate, email, phone, areaCode, city, address, username, userPassword } = req.body;

    if (!userPassword) {
        return res.status(400).json({ message: "La contraseña es requerida" });
    }

    const user = await User.findOne({
        where: {
            email,
            username,
            }
        });

        if(user)
            return res.status(400).json({ message: "Usuario existente" });
    

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userPassword, salt);
    const newUser = await User.create({
        fullName,
        birthDate,
        email,
        phone,
        areaCode,
        city,
        address,
        username,
        userPassword: hashedPassword,
        userState: true,
        userRole: "user"
    });
    res.json(newUser.userId)
}


export const loginUser = async (req, res) => {
    if (!validateLoginUser(req.body))
        return res.status(400).send({ message: "Hubo un error en la solicitud" });

    const { email, userPassword } = req.body;

    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user)
        return res.status(401).send({ message: "Usuario no existente" });

    const comparison = await bcrypt.compare(userPassword, user.userPassword);

    if (!comparison)
        return res.status(401).send({ message: "Contraseña incorrecto" });

    const secretKey = 'programacion-2025';
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

    return res.json(token);
}

const validateLoginUser = ({ email, userPassword }) => {
    if (!validateEmail(email))
        return false;
    else if (!validatePassword(userPassword, 6, 20, true))
        return false;

    return true;
}