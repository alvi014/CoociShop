require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// ✅ Importar modelos
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');

// ✅ Inicializar app
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Servir archivos estáticos
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// 🌍 Mostrar entorno
console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);

// 🔐 Validar URI
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no encontrada. Verifica tu .env o variables en Render");
  process.exit(1);
}
console.log("🔐 MONGO_URI cargada correctamente desde entorno");

// 📌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Conexión a MongoDB Atlas exitosa'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// 📤 Configurar multer para subir imágenes en /img
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'img'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// 🌐 Configuración de CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://coocishop.onrender.com"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS bloqueado para:", origin);
      callback(new Error("CORS no permitido"));
    }
  },
  credentials: true
}));

// 🔧 Middleware para parsear JSON
app.use(express.json());

// 🔌 Rutas principales
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// 📤 Endpoint para subir imágenes (usado en productos)
app.post('/api/admin/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

  const url = `https://coocishop.onrender.com/img/${req.file.filename}`;
  res.status(200).json({ url });
});

// ✅ Ping para verificar estado del servidor
app.get("/api/ping", (req, res) => {
  res.json({ message: "🟢 Backend en línea" });
});

// 🏠 Página principal
app.get('/', (req, res) => {
  res.send("✅ Backend de CoociShop funcionando. Usa /api/productos para ver los productos.");
});

// 📦 Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    console.log(`✅ Productos obtenidos (${productos.length})`);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
  }
});

// 🔍 Obtener producto por ID
app.get('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido, debe ser un número.' });
  }
  try {
    const producto = await Producto.findOne({ id });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener el producto:", error);
    res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
  }
});

// 📧 Enviar correos de pedidos
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
      content: comprobante.buffer,
      cid: "comprobanteAdjunto"
    }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('❌ Error al enviar el correo:', error);
    else console.log('📩 Correo enviado:', info.response);
  });
};

// 🧾 Guardar pedidos con comprobante y actualizar stock
app.post('/api/pedidos', upload.single('comprobantePago'), async (req, res) => {
  try {
    console.log("📩 Pedido recibido:", req.body);

    const productos = JSON.parse(req.body.productos);

    for (let p of productos) {
      const prodDB = await Producto.findOne({ id: p.id });
      if (!prodDB) {
        return res.status(404).json({ error: `Producto con ID ${p.id} no encontrado.` });
      }
      if (prodDB.stock < p.cantidad) {
        return res.status(400).json({
          error: `❌ Stock insuficiente para "${prodDB.nombre}". Disponible: ${prodDB.stock}`
        });
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
    console.log("📤 Preparando envío de correo...");

    res.status(201).json({ mensaje: '✅ Pedido registrado correctamente', pedido: nuevoPedido });
  } catch (error) {
    console.error("❌ Error al registrar el pedido:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
});

// ❌ Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
  