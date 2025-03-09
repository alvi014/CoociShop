require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Crear la aplicación de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// 📌 Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// =========================
// 📌 Definir modelos de MongoDB
// =========================

// Esquema de Productos
const productoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    precio: Number,
    descripcion: String,
    imagen: String,
    categoria: String
});
const Producto = mongoose.model('Producto', productoSchema);

// Esquema de Pedidos
const pedidoSchema = new mongoose.Schema({
    nombreCliente: String,
    sucursal: String,
    comprobantePago: String,
    productos: [
        {
            id: Number,
            nombre: String,
            precio: Number,
            cantidad: Number
        }
    ],
    total: Number,
    estado: { type: String, default: 'Pendiente' },
    fecha: { type: Date, default: Date.now }
});
const Pedido = mongoose.model('Pedido', pedidoSchema);

// =========================
// 📌 Rutas de Productos
// =========================

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findOne({ id: parseInt(req.params.id) });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// =========================
// 📌 Rutas de Pedidos
// =========================

// Crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
    try {
        const nuevoPedido = new Pedido(req.body);
        await nuevoPedido.save();
        
        // Enviar correo al administrador
        enviarCorreoAdmin(nuevoPedido);
        
        res.status(201).json({ mensaje: 'Pedido registrado correctamente', pedido: nuevoPedido });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el pedido' });
    }
});

// Obtener todos los pedidos (Para el administrador)
app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
});

// =========================
// 📌 Función para enviar correo al administrador
// =========================

const enviarCorreoAdmin = (pedido) => {
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
            <p>📎 <strong>Comprobante:</strong> ${pedido.comprobantePago}</p>
        `
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
// 📌 Iniciar el Servidor
// =========================

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
