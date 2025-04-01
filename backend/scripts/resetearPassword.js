// backend/scripts/resetearPassword.js

require("dotenv").config({ path: "../.env" });

console.log("🧪 MONGO_URI DETECTADO:", process.env.MONGO_URI);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    resetearPassword();
  })
  .catch(err => {
    console.error("❌ Error en conexión:", err);
    process.exit(1);
  });

async function resetearPassword() {
  const email = "alvarovictor06@gmail.com";
  const nuevaPassword = "alvaro4605".trim();

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("❌ Admin no encontrado");
      return mongoose.connection.close();
    }

    console.log("🆔 Documento encontrado:", admin._id);
    console.log("🔒 Hash ANTERIOR:", admin.password);

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    console.log("🔐 Nuevo hash generado:", hashedPassword);
    console.log("✅ Contraseña actualizada correctamente");

    // Verificar con bcrypt
    const refreshed = await Admin.findOne({ email });
    const test = await bcrypt.compare(nuevaPassword, refreshed.password);

    console.log("📦 Documento luego de guardar:", refreshed);
    console.log("🔍 Comparando:", nuevaPassword);
    console.log("🔑 Hash guardado en DB:", refreshed.password);
    console.log("🧪 Resultado bcrypt.compare:", test); // ✅ true esperado
  } catch (err) {
    console.error("❌ Error al resetear:", err);
  } finally {
    mongoose.connection.close();
  }
}
