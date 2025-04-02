// backend/scripts/gestionProductos.js
require("dotenv").config();
console.log("🌐 URI detectada:", process.env.MONGO_URI);

const mongoose = require("mongoose");
const Producto = require("../models/Producto");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  });

// 🧪 Crear un producto manualmente
// Esta función se puede ejecutar una sola vez para crear un producto inicial
// y luego comentarla para evitar duplicados.
async function crearProducto() {
    const productos = [
      {
        id: 20,
        nombre: "Bolsa de Yute Azul",
        descripcion: "Ideal para llevar tus compras y cuidar el medio ambiente.",
        precio: 4000,
        imagen: "/img/BolsadeYuteAzul.PNG",
        categoria: "COOCIQUE",
        stock: 150
      }
    ];
  
    const resultado = await Producto.insertMany(productos);
    console.log("✅ Productos creados:\n", resultado);
  }
  

// 🧪 Actualizar stock
async function actualizarStock(id, nuevoStock) {
  const producto = await Producto.findOne({ id });
  if (!producto) return console.log("❌ Producto no encontrado");
  producto.stock = nuevoStock;
  await producto.save();
  console.log("🔁 Stock actualizado:", producto);
}

// 🧪 Eliminar producto
async function eliminarProducto(id) {
  const eliminado = await Producto.findOneAndDelete({ id });
  if (eliminado) {
    console.log("🗑️ Producto eliminado:", eliminado);
  } else {
    console.log("❌ Producto no encontrado para eliminar");
  }
}

// =======================
// Ejecutar función deseada
// =======================
(async () => {
   await crearProducto();
  // await actualizarStock(999, 50);
  // await eliminarProducto(999);

  mongoose.connection.close();
})();
