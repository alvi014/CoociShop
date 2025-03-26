require("dotenv").config();
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

const resetearPassword = async () => {
    const email = "alvarovictor06@gmail.com";
    const nuevaPassword = "alvi014";

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log("❌ Admin no encontrado");
            return mongoose.connection.close();
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        console.log("🔐 Nuevo hash:", hashedPassword); // ✅ Aquí adentro

        admin.password = hashedPassword;

        await admin.save();
        console.log("✅ Contraseña reseteada correctamente");
    } catch (err) {
        console.error("❌ Error al resetear:", err);
    } finally {
        console.log("📛 Base de datos conectada:", mongoose.connection.name);
        mongoose.connection.close();
    }
};

resetearPassword();
