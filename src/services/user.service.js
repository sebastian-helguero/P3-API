import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";

import { validateEmail, validatePassword } from "../utils/validations.js";


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
    if (!user.userState)
        return res.status(403).send({ message: "El usuario está dado de baja y no puede iniciar sesión" });

    const comparison = await bcrypt.compare(userPassword, user.userPassword);

    if (!comparison)
        return res.status(401).send({ message: "Contraseña incorrecto" });

    const secretKey = 'programacion-2025';
    const token = jwt.sign({ email, userRole: user.userRole,userId: user.userId }, secretKey, { expiresIn: '1h' });

    return res.json({token, userRole: user.userRole});
}

const validateLoginUser = ({ email, userPassword }) => {
    if (!validateEmail(email))
        return false;
    else if (!validatePassword(userPassword, 6, 20, true))
        return false;

    return true;
}

export const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.userRole)) {
    return res.status(403).json({ message: "Acceso denegado: no tiene el rol para acceder a esta funcion" });
  }
  next();
};

export const changeUserRole = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.userRole !== "user") {
      return res.status(400).json({ error: "Solo se puede cambiar el rol de usuarios comunes ('user')." });
    }

    user.userRole = "admin";
    await user.save();

    res.json({ message: "El usuario con email ${email} ahora es admin." });
  } catch (err) {
    res.status(500).json({ error: "Error al cambiar el rol del usuario." });
  }
};

export const userDelete = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.userRole === "sysadmin") {
      return res.status(403).json({ error: "No se puede dar de baja a un usuario con rol 'sysadmin'." });
    }

    if (!user.userState) {
      return res.status(400).json({ error: "El usuario ya está dado de baja." });
    }

    user.userState = false;
    await user.save();

    res.json({ mensaje: "Usuario con email ${email} ha sido dado de baja." });
  } catch (error) {
    res.status(500).json({ error: "Error al dar de baja al usuario." });
  }
};

export const userRecover = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.userState) {
      return res.status(400).json({ error: "El usuario ya ha sido recuperado." });
    }

    user.userState = true;
    await user.save();

    res.json({ message: "Usuario con email ${email} ha sido recuperado." });
  } catch (error) {
    res.status(500).json({ error: "Error al recuperar al usuario." });
  }
};
