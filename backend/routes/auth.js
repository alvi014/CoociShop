// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

console.log("📡 Auth router cargado correctamente");

// ✅ Ruta de prueba
router.get("/test", (req, res) => {
    res.json({ message: "Auth API funcionando ✅" });
});

// ✅ Registro
router.post("/register", async (req, res) => {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

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
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

module.exports = router;
