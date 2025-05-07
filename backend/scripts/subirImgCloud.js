// archivo: scripts/subirImgCloud.js
import cloudinary from './cloudinary.js'; // ⚡ Usa './cloudinary.js' EXACTAMENTE
import fs from 'fs/promises';
import path from 'path';

const imgDir = path.resolve('../html/img');


async function subirImagenes() {
  const files = await fs.readdir(imgDir);

  for (const file of files) {
    const filePath = path.join(imgDir, file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'coocishop',
        public_id: path.parse(file).name, // Sin extensión
        overwrite: true,
      });
      console.log(`✅ Subido: ${file} -> ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Error subiendo ${file}:`, error.message);
    }
  }
}

subirImagenes();
