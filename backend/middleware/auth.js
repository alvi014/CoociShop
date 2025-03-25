const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Acceso denegado" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), "secreto_admin");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
};

module.exports = { verifyAdmin };
