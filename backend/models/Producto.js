const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    precio: Number,
    descripcion: String,
    imagen: String,
    categoria: String
});

// 📌 Exportar el modelo correctamente
module.exports = mongoose.model("Producto", ProductoSchema, "productos");
