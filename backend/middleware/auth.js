// 📁 middleware/auth.js - Middleware de autenticación para administrador

const jwt = require("jsonwebtoken");

// Middleware para proteger rutas administrativas
const verifyAdmin = (req, res, next) => {
    const token = req.headers["authorization"];

    // Verificación de presencia del token en el header
    if (!token) return res.status(403).json({ message: "Acceso denegado" });

    try {
        // Se espera formato "Bearer token", por lo tanto se elimina el prefijo
        const decoded = jwt.verify(token.replace("Bearer ", ""), "secreto_admin");

        // Se guarda el payload decodificado en req.user para el siguiente middleware/controlador
        req.user = decoded;
        next();
    } catch (error) {
        // Token malformado o expirado
        res.status(401).json({ message: "Token inválido" });
    }
};

module.exports = { verifyAdmin };
