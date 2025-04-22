import mongoose from 'mongoose';

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

// Tercer parámetro asegura la colección 'productos'
const Producto = mongoose.model('Producto', ProductoSchema, 'productos');
export default Producto;
