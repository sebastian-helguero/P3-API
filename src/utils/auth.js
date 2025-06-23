import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    const header = req.header("Authorization") || "";
    const token = header.split(" ")[1];

    if (!token)
        return res.status(401).send({ message: "No posee autorización requerida" });

    try {
        const decoded = jwt.verify(token, "programacion-2025");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ message: "No posee permisos correctos" })
    }

}