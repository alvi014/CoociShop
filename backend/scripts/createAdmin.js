require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin"); 


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Conectado a MongoDB"))
.catch(err => console.error("Error en la conexión:", err));

const crearAdmin = async () => {
    try {
        const email = "avz@gmail.com";
        const password = "alvi014";
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminExistente = await Admin.findOne({ email });
        if (adminExistente) {
            console.log("El administrador ya existe");
            mongoose.connection.close();
            return;
        }

        const nuevoAdmin = new Admin({ email, password: hashedPassword });
        await nuevoAdmin.save();

        console.log("Administrador creado exitosamente.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error al crear el administrador:", error);
        mongoose.connection.close();
    }
};

crearAdmin();
