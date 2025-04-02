// backend/scripts/agregarStockFaltante.js
require("dotenv").config();

const mongoose = require("mongoose");
const Producto = require("../models/Producto");

const uri = process.env.MONGO_URI;
console.log("🧪 URI detectada:", uri);

mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error al conectar:", err);
    process.exit(1);
  });

(async () => {
  try {
    const productosSinStock = await Producto.find({ stock: { $exists: false } });

    if (productosSinStock.length === 0) {
      console.log("📦 Todos los productos ya tienen stock.");
      return;
    }

    console.log(`🔍 Productos sin stock: ${productosSinStock.length}`);

    for (const producto of productosSinStock) {
      producto.stock = 100;
      await producto.save();
      console.log(`✅ Stock asignado (ID ${producto.id}): 100 unidades`);
    }

    console.log("🎉 Todos los productos actualizados con stock.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
})();
