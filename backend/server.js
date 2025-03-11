// 📌 Cargar variables de entorno
require('dotenv').config();
console.log("🔍 URI de MongoDB:", process.env.MONGO_URI || "❌ No encontrado"); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 📌 Importar modelos
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');

// 📌 Crear la aplicación de Express
const app = express();
const PORT = process.env.PORT || 5000;

// 📌 Middleware
app.use(express.json());
app.use(cors());

// 📌 Verificar que MONGO_URI está definido
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

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        console.log(`✅ Productos obtenidos (${productos.length})`); // 🚀 Depuración
        res.json(productos);
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
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
        console.error("❌ Error al obtener el producto:", error);
        res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
    }
});

// =========================
// 📌 Middleware para manejar rutas no encontradas (404)
// =========================
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// 📌 Mostrar rutas registradas en Express

console.log("📌 Rutas registradas en Express:");
app._router.stack.forEach(layer => {
    if (layer.route) {
        console.log(`➡ Ruta: ${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
    }
});


// =========================
// 📌 Iniciar el Servidor
// =========================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// 📌 Mostrar rutas registradas en Express
console.log("📌 Rutas registradas en Express:");
console.log(app._router.stack
    .map(r => r.route && r.route.path)
    .filter(Boolean)
);
