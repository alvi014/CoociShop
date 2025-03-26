require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error en la conexión:", err);
    process.exit(1);
});

const resetearPassword = async () => {
    const email = "alvarovictor06@gmail.com";
    const nuevaPassword = "alvaro4605";
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log("❌ Admin no encontrado");
            return mongoose.connection.close();
        }

        admin.password = hashedPassword;
        await admin.save();

        console.log("✅ Contraseña reseteada correctamente.");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error al resetear contraseña:", err);
        mongoose.connection.close();
    }
};

resetearPassword();
