
//Modelo de producto para la base de datos MongoDB
// Este modelo define la estructura de los documentos de producto en la colección "productos"
const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    precio: Number,
    descripcion: String,
    imagen: String,
    categoria: String,
    stock: {
        type: Number,
        default: 0
    }
});
// ProductoSchema.index({ nombre: 'text', descripcion: 'text', categoria: 'text' });
module.exports = mongoose.model("Producto", ProductoSchema, "productos");
