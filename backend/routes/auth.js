// 📁 backend/routes/auth.js - Autenticación de administradores

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// Ruta: POST /api/auth/register (Para crear el primer admin o adicionales)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si ya existe
    const existe = await Admin.findOne({ email });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });

    const admin = new Admin({ email, password });
    await admin.save();

    res.status(201).json({ message: 'Administrador registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar administrador' });
  }
});

// Ruta: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Credenciales incorrectas' });

    // 2. Comparar contraseña
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).json({ error: 'Credenciales incorrectas' });

    // 3. Crear Token JWT
    const token = jwt.sign(
      { _id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'secreto_temporal',
      { expiresIn: '2h' }
    );

    res.json({ 
      message: 'Bienvenido',
      token,
      email: admin.email 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
