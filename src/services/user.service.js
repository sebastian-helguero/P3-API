import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";

import { validateEmail, validatePassword } from "../utils/validations.js";
import { Op } from "sequelize";


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["userPassword"] },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener la lista de usuarios" });
  }
};

export const registerUser = async (req, res) => {
  const { fullName, birthDate, email, phone, areaCode, city, address, username, userPassword } = req.body;
  
  let { userRole, userState } = req.body;

  if (!userPassword) {
    return res.status(400).json({ message: "La contraseña es requerida" });
  }

  const userExists = await User.findOne({
    where: {
      [Op.or]: [{ email }, { username }]
    }
  });

  if (userExists) {
    return res.status(400).json({ message: "Usuario existente" });
  }

  userRole = userRole || "user";
  userState = typeof userState === "boolean" ? userState : true;

  if (req.user?.userRole !== "sysadmin") {
    userRole = "user";
    userState = true;
  }

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
    userState,
    userRole,
  });

  res.json(newUser.userId);
};

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
    const { userId, newRole } = req.body;

    if (!["user", "admin"].includes(newRole)) {
      return res.status(400).json({ error: "Rol no válido. Debe ser 'user' o 'admin'." });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.userRole === newRole) {
      return res.status(400).json({ error: `El usuario ya tiene el rol "${newRole}".` });
    }

    user.userRole = newRole;
    await user.save();

    res.json({ message: `El usuario con id ${userId} ahora es "${newRole}".` });
  } catch (err) {
    res.status(500).json({ error: "Error al cambiar el rol del usuario." });
  }
};

export const userDelete = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);

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

    res.json({ message: `Usuario con ID ${userId} ha sido dado de baja.` });
  } catch (error) {
    res.status(500).json({ error: "Error al dar de baja al usuario." });
  }
};

export const userRecover = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.userState) {
      return res.status(400).json({ error: "El usuario ya está activo." });
    }

    user.userState = true;
    await user.save();

    res.json({ message: `Usuario con ID ${userId} ha sido recuperado.` });
  } catch (error) {
    res.status(500).json({ error: "Error al recuperar al usuario." });
  }
};