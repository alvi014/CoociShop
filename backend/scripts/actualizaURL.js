// actualizaURL.js
import path from "path";
import https from "https";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Producto from "../models/Producto.js";

// Para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const NETLIFY_URL = 'https://coocishop.netlify.app/img/';
const RENDER_URL = 'https://coocishop.onrender.com/img/';

async function urlExiste(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const productos = await Producto.find({ imagen: { $regex: RENDER_URL } });
    console.log(`📦 Productos a actualizar: ${productos.length}`);

    for (const producto of productos) {
      const nombreArchivo = path.basename(producto.imagen); // sin toLowerCase()
      const nuevaURL = NETLIFY_URL + nombreArchivo;

      const existe = await urlExiste(nuevaURL);
      if (!existe) {
        console.warn(`⚠️ Imagen no encontrada en Netlify: ${nuevaURL}`);
        continue;
      }

      producto.imagen = nuevaURL;
      await producto.save();
      console.log(`✅ Actualizado: ${producto.nombre} -> ${producto.imagen}`);
    }

    console.log('🏁 Actualización completada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    process.exit(1);
  }
})();
