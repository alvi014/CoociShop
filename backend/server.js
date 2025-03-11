// 📌 Cargar variables de entorno
require('dotenv').config();
console.log("🔍 URI de MongoDB:", process.env.MONGO_URI || "❌ No encontrado");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');

const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');

const app = express();
const PORT = process.env.PORT || 5000;

// 📌 Middleware
app.use(express.json());
app.use(cors());

// 📌 Configurar `multer` para manejar archivos
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Verificar variables de entorno
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: No se encontró MONGO_URI en el archivo .env");
    process.exit(1);
}

// 📌 Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
    });

// =========================
// 📌 Rutas de Productos
// =========================
app.get('/', (req, res) => {
    res.send("✅ Backend de CoociShop funcionando. Usa /api/productos para ver los productos.");
});

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        console.log(`✅ Productos obtenidos (${productos.length})`);
        res.json(productos);
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
    }
});

// 📌 Ruta para obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error("❌ Error al obtener el producto:", error);
        res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
    }
});

// =========================
// 📌 Función para enviar correos
// =========================
const enviarCorreoAdmin = (pedido, comprobante) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: process.env.EMAIL_ADMIN,
        subject: '📦 Nuevo Pedido en CoociShop',
        html: `
            <h2>Nuevo Pedido Recibido</h2>
            <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
            <p><strong>Sucursal:</strong> ${pedido.sucursal}</p>
            <p><strong>Total:</strong> ₡${pedido.total}</p>
            <h3>Productos:</h3>
            <ul>
                ${pedido.productos.map(p => `<li>${p.cantidad} x ${p.nombre} - ₡${p.precio}</li>`).join('')}
            </ul>
            <p>📎 <strong>Comprobante:</strong> ${comprobante ? 'Adjunto' : 'No adjunto'}</p>
        `,
        attachments: comprobante ? [{
            filename: comprobante.originalname,
            content: comprobante.buffer
        }] : []
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error al enviar el correo:', error);
        } else {
            console.log('📩 Correo enviado:', info.response);
        }
    });
};

// =========================
// 📌 Ruta para registrar pedidos
// =========================
app.post('/api/pedidos', upload.single('comprobantePago'), async (req, res) => {
    try {
        console.log("📩 Pedido recibido en el backend:", req.body);

        // 📌 Validar si `productos` viene como JSON string y convertirlo a objeto
        let productos;
        try {
            productos = JSON.parse(req.body.productos);
        } catch (error) {
            console.error("❌ Error al procesar los productos:", error);
            return res.status(400).json({ error: "Formato incorrecto en los productos" });
        }

        const nuevoPedido = new Pedido({
            nombreCliente: req.body.nombreCliente,
            sucursal: req.body.sucursal,
            productos: productos,
            total: req.body.total,
            comprobantePago: req.file ? req.file.originalname : null
        });

        await nuevoPedido.save();
        
        // 📌 Enviar notificación al administrador
        enviarCorreoAdmin(nuevoPedido, req.file);

        console.log("✅ Pedido guardado y correo enviado.");
        res.status(201).json({ mensaje: 'Pedido registrado correctamente', pedido: nuevoPedido });
    } catch (error) {
        console.error("❌ Error al registrar el pedido:", error);
        res.status(500).json({ error: 'Error al registrar el pedido', detalle: error.message });
    }
});

// =========================
// 📌 Middleware para manejar rutas no encontradas (404)
// =========================
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// =========================
// 📌 Iniciar el Servidor
// =========================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
