const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// ✅ Ruta de prueba
router.get("/test", (req, res) => {
    res.json({ message: "Auth API funcionando ✅" });
});

// ✅ Registro
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ message: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        admin = new Admin({ email, password: hashedPassword });

        await admin.save();
        res.status(201).json({ message: "Administrador registrado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// ✅ Login
router.post("/login", async (req, res) => {
    console.log("✅ POST /api/auth/login llamado");

    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log("❌ Usuario no encontrado:", email);
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        console.log("🔒 Password hash en DB:", admin.password);
        console.log("🔑 Password ingresada:", password);

        const isMatch = await bcrypt.compare(password, admin.password);
        console.log("🔁 Resultado bcrypt.compare:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            "secreto_admin",
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

module.exports = router;
