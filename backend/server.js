// 📌 Cargar variables de entorno
require('dotenv').config();
console.log("🔍 URI de MongoDB:", process.env.MONGO_URI || "❌ No encontrado");

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');

// 📌 Verificar variables de entorno antes de continuar
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: No se encontró MONGO_URI en el archivo .env");
    process.exit(1);
}

// 📌 Conectar a MongoDB antes de importar modelos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error al conectar a MongoDB:', err);
        process.exit(1);
    });

// 📌 Importar modelos después de la conexión
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');

// 📌 Crear la aplicación de Express
const app = express();
const PORT = process.env.PORT || 5000;

// 📌 Configurar `multer` para manejar archivos
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Importar rutas de autenticación y administración
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");

// 📌 Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

app.use(express.json());
const allowedOrigins = [
    "http://localhost:5500",         // si usas Live Server
    "http://127.0.0.1:5500",         // acceso directo
    "https://coocishop.onrender.com" // producción (opcional)
  ];
  
 

// 📌 Usar rutas de autenticación
app.use("/api/auth", authRoutes); 


// 📌 Usar rutas protegidas para administradores
app.use("/api/admin", adminRoutes);


app.get("/api/ping", (req, res) => {
    res.json({ message: "🟢 Backend en línea" });
  });
  

// =========================
// 📌 Rutas de Productos
// =========================
app.get('/', (req, res) => {
    res.send("✅ Backend de CoociShop funcionando. Usa /api/productos para ver los productos.");
});

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find();
        console.log(`✅ Productos obtenidos (${productos.length})`);
        res.json(productos);
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
    }
});

// 📌 Ruta para obtener un producto por ID personalizado
app.get('/api/productos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido, debe ser un número.' });
    }

    try {
        const producto = await Producto.findOne({ id: id });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error("❌ Error al obtener el producto:", error);
        res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
    }
});


// =========================
// 📌 Función para enviar correos
// =========================
const enviarCorreoAdmin = (pedido, comprobante) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADMIN,
            pass: process.env.EMAIL_PASS
        }
    });

    let productosHTML = pedido.productos.map(p => `
        <tr>
            <td><img src="${p.imagen}" alt="${p.nombre}" width="100" style="border-radius: 8px;"></td>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>₡${p.precio}</td>
            <td>₡${p.cantidad * p.precio}</td>
        </tr>
    `).join('');

    let comprobanteHTML = "";
    if (comprobante) {
        const fileExtension = comprobante.originalname.split('.').pop().toLowerCase();
        if (["jpg", "jpeg", "png"].includes(fileExtension)) {
            const imageBase64 = comprobante.buffer.toString('base64');
            comprobanteHTML = `<p><strong>📎 Comprobante:</strong> <br>
                <img src="data:image/${fileExtension};base64,${imageBase64}" width="300" style="border:1px solid #ddd; border-radius: 8px;">
            </p>`;
        } else {
            comprobanteHTML = `<p><strong>📎 Comprobante:</strong> <br>
                <a href="cid:comprobanteAdjunto" download="${comprobante.originalname}">Descargar Comprobante</a>
            </p>`;
        }
    }

    const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: process.env.EMAIL_ADMIN,
        subject: '📦 Nuevo Pedido en CoociShop',
        html: `
            <h2 style="color: #333;">📦 Nuevo Pedido Recibido</h2>
            <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
            <p><strong>Sucursal:</strong> ${pedido.sucursal}</p>
            <p><strong>Total:</strong> <span style="color: green; font-size: 18px;">₡${pedido.total}</span></p>
            
            <h3>🛒 Productos:</h3>
            <table style="border-collapse: collapse; width: 100%; text-align: left;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th>Imagen</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            ${comprobanteHTML}
        `,
        attachments: comprobante ? [{
            filename: comprobante.originalname,
            content: comprobante.buffer,
            cid: "comprobanteAdjunto"
        }] : []
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error al enviar el correo:', error);
        } else {
            console.log('📩 Correo enviado:', info.response);
        }
    });
};

// =========================
// 📌 Ruta para registrar pedidos
// =========================
app.post('/api/pedidos', upload.single('comprobantePago'), async (req, res) => {
    try {
        console.log("📩 Pedido recibido en el backend:", req.body);

        let productos;
        try {
            productos = JSON.parse(req.body.productos);
        } catch (error) {
            console.error("❌ Error al procesar los productos:", error);
            return res.status(400).json({ error: "Formato incorrecto en los productos" });
        }

        const nuevoPedido = new Pedido({
            nombreCliente: req.body.nombreCliente,
            sucursal: req.body.sucursal,
            productos: productos,
            total: req.body.total,
            comprobantePago: req.file ? req.file.originalname : null
        });

        await nuevoPedido.save();
        enviarCorreoAdmin(nuevoPedido, req.file);

        console.log("✅ Pedido guardado y correo enviado.");
        res.status(201).json({ mensaje: 'Pedido registrado correctamente', pedido: nuevoPedido });
    } catch (error) {
        console.error("❌ Error al registrar el pedido:", error);
        res.status(500).json({ error: 'Error al registrar el pedido', detalle: error.message });
    }
});

// =========================
// 📌 Middleware para manejar rutas no encontradas (404)
// =========================
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// =========================
// 📌 Iniciar el Servidor
// =========================
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


/// Por Implementar
// app.post('/api/productos', async (req, res) => {
//     try {
//         const { id, nombre, precio, descripcion, imagen, categoria } = req.body;

//         // Validar que todos los campos estén completos
//         if (!id || !nombre || !precio || !descripcion || !imagen || !categoria) {
//             return res.status(400).json({ error: "Todos los campos son obligatorios" });
//         }

//         const nuevoProducto = new Producto({
//             id,
//             nombre,
//             precio,
//             descripcion,
//             imagen,
//             categoria
//         });

//         await nuevoProducto.save();
//         res.status(201).json({ mensaje: "✅ Producto agregado con éxito", producto: nuevoProducto });
//     } catch (error) {
//         console.error("❌ Error al agregar producto:", error);
//         res.status(500).json({ error: "Error al agregar producto", detalle: error.message });
//     }
// });

// Probar la API con Postman o fetch
// fetch("https://coocishop.onrender.com/api/productos", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//         id: 99, // Asegúrate de que no se repita
//         nombre: "Producto Nuevo",
//         precio: 1500,
//         descripcion: "Descripción del nuevo producto",
//         imagen: "/img/nuevo_producto.png",
//         categoria: "Nueva Categoría"
//     })
// })
// .then(res => res.json())
// .then(data => console.log(data))
// .catch(err => console.error("Error:", err));

// // Eliminar un producto por ID
// app.delete('/api/productos/:id', async (req, res) => {
//     try {
//         const producto = await Producto.findOneAndDelete({ id: parseInt(req.params.id) });

//         if (!producto) {
//             return res.status(404).json({ error: "Producto no encontrado" });
//         }

//         res.json({ mensaje: "✅ Producto eliminado con éxito", producto });
//     } catch (error) {
//         console.error("❌ Error al eliminar producto:", error);
//         res.status(500).json({ error: "Error al eliminar producto", detalle: error.message });
//     }
// });
// //Como eliminar un producto con fetch|
// fetch("https://coocishop.onrender.com/api/productos/99", {
//     method: "DELETE"
// })
// .then(res => res.json())
// .then(data => console.log(data))
// .catch(err => console.error("Error:", err));


// //Editar un producto por ID
// app.put('/api/productos/:id', async (req, res) => {
//     try {
//         const productoActualizado = await Producto.findOneAndUpdate(
//             { id: parseInt(req.params.id) },
//             req.body, // Actualizar solo los datos enviados
//             { new: true }
//         );

//         if (!productoActualizado) {
//             return res.status(404).json({ error: "Producto no encontrado" });
//         }

//         res.json({ mensaje: "✅ Producto actualizado con éxito", producto: productoActualizado });
//     } catch (error) {
//         console.error("❌ Error al actualizar producto:", error);
//         res.status(500).json({ error: "Error al actualizar producto", detalle: error.message });
//     }
// });
// //Como editar un producto con put
// fetch("https://coocishop.onrender.com/api/productos/99", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//         nombre: "Producto Modificado",
//         precio: 2000
//     })
// })
// .then(res => res.json())
// .then(data => console.log(data))
// .catch(err => console.error("Error:", err));
