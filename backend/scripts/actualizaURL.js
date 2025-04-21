const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Producto = require("../models/Producto");

// 🔁 Rutas a reemplazar
const NETLIFY_URL = 'https://coocishop.netlify.app/img/';
const RENDER_URL = 'https://coocishop.onrender.com/img/';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const productos = await Producto.find({ imagen: { $regex: RENDER_URL } });
    console.log(`📦 Productos a actualizar: ${productos.length}`);

    for (const producto of productos) {
      if (producto.imagen.startsWith(RENDER_URL)) {
        const nombreArchivo = producto.imagen.replace(RENDER_URL, '');
        producto.imagen = NETLIFY_URL + nombreArchivo;
        await producto.save();
        console.log(`✅ Actualizado: ${producto.nombre} -> ${producto.imagen}`);
      }
    }

    console.log('🏁 Actualización completada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    process.exit(1);
  }
})();
