require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Crear la aplicación de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());



// Definir el esquema de productos
const productoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    precio: Number,
    descripcion: String,
    imagen: String,
    categoria: String
});

// Crear el modelo
const Producto = mongoose.model('Producto', productoSchema);

// 📌 Ruta para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find(); // 🔥 Obtiene productos desde MongoDB
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// 📌 Ruta para obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Producto.findOne({ id: parseInt(req.params.id) }); // 🔥 Busca un producto por ID
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// 📌 Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
