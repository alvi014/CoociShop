// 📁 backend/server.js - Versión ESM comentada profesionalmente

import dotenv from 'dotenv';
dotenv.config(); // Carga las variables de entorno desde .env

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Importación de rutas
import pedidosRoutes from './routes/pedidos.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';

// Modelos para operaciones directas
import Producto from './models/Producto.js';
import Pedido from './models/Pedido.js';

// Cálculo del __dirname para entornos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración CORS
const corsOptions = {
  origin: ['https://coocishop.netlify.app'],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
};
app.use(cors(corsOptions));

// Middleware para parsear body de peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Encabezados adicionales para CORS (compatibilidad extendida)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://coocishop.netlify.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Montaje de rutas
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Servir imágenes estáticas desde /img
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// Validación y conexión con MongoDB
console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no encontrada. Verifica tu .env o variables en Render");
  process.exit(1);
}
console.log("🔐 MONGO_URI cargada correctamente desde entorno");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conexión a MongoDB Atlas exitosa'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Configuración de almacenamiento de imágenes con Multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'img'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // nombre único basado en timestamp
  }
});
const upload = multer({ storage });

// Endpoint para subir imágenes desde el panel admin
app.post('/api/admin/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });
  const url = `https://coocishop.onrender.com/img/${req.file.filename}`;
  res.status(200).json({ url });
});

// Ruta básica para monitoreo
app.get("/api/ping", (req, res) => {
  res.json({ message: "🟢 Backend en línea" });
});

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.send("✅ Backend de CoociShop funcionando. Usa /api/productos para ver los productos.");
});

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    console.log(`✅ Productos obtenidos (${productos.length})`);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
  }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const producto = await Producto.findOne({ id });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
});

// Función para enviar correo al admin tras un pedido
const enviarCorreoAdmin = (pedido, comprobante) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADMIN,
      pass: process.env.EMAIL_PASS
    }
  });

  const productosHTML = pedido.productos.map(p => `
    <tr>
      <td><img src="${p.imagen}" alt="${p.nombre}" width="100"></td>
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>₡${p.precio}</td>
      <td>₡${p.cantidad * p.precio}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to: process.env.EMAIL_ADMIN,
    subject: '📦 Nuevo Pedido en CoociShop',
    html: `
      <h2>📦 Nuevo Pedido Recibido</h2>
      <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
      <p><strong>Sucursal:</strong> ${pedido.sucursal}</p>
      <p><strong>Total:</strong> <span style="color: green; font-size: 18px;">₡${pedido.total}</span></p>
      <h3>🛒 Productos:</h3>
      <table>${productosHTML}</table>
    `,
    attachments: comprobante ? [{
      filename: comprobante.originalname,
      content: fs.readFileSync(path.join(__dirname, 'img', comprobante.filename)),
      cid: "comprobanteAdjunto"
    }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('❌ Error al enviar el correo:', error);
    else console.log('📩 Correo enviado:', info.response);
  });
};

// Registro de pedido: valida stock, descuenta inventario, guarda y notifica
app.post('/api/pedidos', upload.single('comprobantePago'), async (req, res) => {
  try {
    console.log("📩 Pedido recibido:", req.body);
    const productos = JSON.parse(req.body.productos);

    for (let p of productos) {
      const prodDB = await Producto.findOne({ id: p.id });
      if (!prodDB) return res.status(404).json({ error: `Producto con ID ${p.id} no encontrado.` });
      if (prodDB.stock < p.cantidad) {
        return res.status(400).json({ error: `❌ Stock insuficiente para '${prodDB.nombre}'. Disponible: ${prodDB.stock}` });
      }
    }

    for (let p of productos) {
      await Producto.updateOne({ id: p.id }, { $inc: { stock: -p.cantidad } });
      console.log(`🧾 Stock actualizado (ID ${p.id}): -${p.cantidad}`);
    }

    const nuevoPedido = new Pedido({
      nombreCliente: req.body.nombreCliente,
      sucursal: req.body.sucursal,
      productos,
      total: req.body.total,
      comprobantePago: req.file ? req.file.originalname : null
    });

    await nuevoPedido.save();
    enviarCorreoAdmin(nuevoPedido, req.file);
    res.status(201).json({ mensaje: '✅ Pedido registrado correctamente', pedido: nuevoPedido });
  } catch (error) {
    console.error("❌ Error al registrar el pedido:", error.message);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
});

// Middleware para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
