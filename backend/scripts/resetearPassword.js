require("dotenv").config({ path: "../.env" }); // si tu script está en backend/scripts

console.log("🧪 MONGO_URI DETECTADO:", process.env.MONGO_URI); // <-- esta línea

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error en conexión:", err);
    process.exit(1);
});

console.log("🔍 MONGO_URI usado:", process.env.MONGO_URI);

const resetearPassword = async () => {
    const email = "alvarovictor06@gmail.com";
    const nuevaPassword = "alvaro4605".trim();
const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

  
    try {
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        console.log("❌ Admin no encontrado");
        return mongoose.connection.close();
      }
  
      console.log("🆔 Documento encontrado:", admin._id);
      console.log("🔒 Hash ANTERIOR:", admin.password);
  
      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
      console.log("🔐 Nuevo hash generado:", hashedPassword);
  
      admin.password = hashedPassword;
      await admin.save();
  
      console.log("✅ Contraseña actualizada correctamente");
  
      // 🧪 Validación inmediata
      const refreshed = await Admin.findOne({ email });
      console.log("📦 Documento luego de guardar:", refreshed);
      
      console.log("🔍 Comparando:", nuevaPassword);
      console.log("🔑 Contra en DB:", refreshed.password);
      
      const test = await bcrypt.compare(nuevaPassword.trim(), refreshed.password.trim());
      console.log("🧪 Resultado bcrypt.compare:", test); // debe ser true
      
  
    } catch (err) {
      console.error("❌ Error al resetear:", err);
    } finally {
      mongoose.connection.close();
    }
  };
  

resetearPassword();
