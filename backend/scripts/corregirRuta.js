// archivo: corregirRutasParciales.js
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import Producto from '../models/Producto.js';

// Emula __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const NETLIFY_URL = 'https://coocishop.netlify.app';

async function urlExiste(url) {
  return new Promise(resolve => {
    https.get(url, res => resolve(res.statusCode === 200)).on('error', () => resolve(false));
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const productos = await Producto.find({ imagen: { $regex: '^/img/' } });
    console.log(`🔍 Productos con ruta parcial: ${productos.length}`);

    for (const producto of productos) {
      const nuevaURL = NETLIFY_URL + producto.imagen;
      const existe = await urlExiste(nuevaURL);

      if (!existe) {
        console.warn(`⚠️ Imagen no encontrada: ${nuevaURL} (${producto.nombre})`);
        continue;
      }

      producto.imagen = nuevaURL;
      await producto.save();
      console.log(`✅ Actualizado: ${producto.nombre} -> ${producto.imagen}`);
    }

    console.log('🏁 Rutas parciales corregidas con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
})();
