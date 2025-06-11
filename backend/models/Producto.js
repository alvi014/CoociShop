// 📁 models/Producto.js - Modelo de producto para la tienda

import mongoose from 'mongoose';

// Esquema que representa un producto dentro del inventario
const ProductoSchema = new mongoose.Schema({
  id: Number,               // ID único usado para búsqueda
  nombre: String,           // Nombre del producto
  precio: Number,           // Precio en colones
  descripcion: String,      // Descripción corta o detalle
  imagen: String,           // URL relativa de la imagen
  categoria: String,        // Categoría del producto (para filtrado)
  stock: {
    type: Number,
    default: 0              // Cantidad en inventario disponible
  }
});

// El tercer parámetro define explícitamente el nombre de la colección en MongoDB
const Producto = mongoose.model('Producto', ProductoSchema, 'productos');
export default Producto;
