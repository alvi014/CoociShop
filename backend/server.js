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

// 📌 Importar modelos
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');

// 📌 Crear la app de Express
const app = express();
const PORT = process.env.PORT || 3000;

// 📌 Configurar multer
const upload = multer({ storage: multer.memoryStorage() });

// 📌 Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://coocishop.onrender.com"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS bloqueado para:", origin);
      callback(new Error("CORS no permitido"));
    }
  },
  credentials: true
}));

app.use(express.json());

// 📌 Rutas
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// 📌 Ping
app.get("/api/ping", (req, res) => {
  res.json({ message: "🟢 Backend en línea" });
});

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

app.get('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido, debe ser un número.' });
  }
  try {
    const producto = await Producto.findOne({ id });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener el producto:", error);
    res.status(500).json({ error: 'Error al obtener el producto', detalle: error.message });
  }
});

// 📌 Enviar correos
const enviarCorreoAdmin = (pedido, comprobante) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADMIN,
      pass: process.env.EMAIL_PASS
    }
  });

  const productosHTML = pedido.productos.map(p => `
    <tr>
      <td><img src="${p.imagen}" alt="${p.nombre}" width="100"></td>
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>₡${p.precio}</td>
      <td>₡${p.cantidad * p.precio}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_ADMIN,
    to: process.env.EMAIL_ADMIN,
    subject: '📦 Nuevo Pedido en CoociShop',
    html: `
      <h2>📦 Nuevo Pedido Recibido</h2>
      <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
      <p><strong>Sucursal:</strong> ${pedido.sucursal}</p>
      <p><strong>Total:</strong> <span style="color: green; font-size: 18px;">₡${pedido.total}</span></p>
      <h3>🛒 Productos:</h3>
      <table>${productosHTML}</table>
    `,
    attachments: comprobante ? [{
      filename: comprobante.originalname,
      content: comprobante.buffer,
      cid: "comprobanteAdjunto"
    }] : []
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('❌ Error al enviar el correo:', error);
    else console.log('📩 Correo enviado:', info.response);
  });
};

// 📌 Guardar pedidos
// 📌 Guardar pedidos con validación y actualización de stock
app.post('/api/pedidos', upload.single('comprobantePago'), async (req, res) => {
  try {
    console.log("📩 Pedido recibido:", req.body);

    const productos = JSON.parse(req.body.productos);

    // 🔍 Verificar stock disponible por cada producto
    for (let p of productos) {
      const prodDB = await Producto.findOne({ id: p.id });

      if (!prodDB) {
        return res.status(404).json({ error: `Producto con ID ${p.id} no encontrado.` });
      }

      if (prodDB.stock < p.cantidad) {
        return res.status(400).json({
          error: `❌ Stock insuficiente para "${prodDB.nombre}". Disponible: ${prodDB.stock}`
        });
      }
    }

    // ➖ Descontar stock por cada producto
    for (let p of productos) {
      await Producto.updateOne({ id: p.id }, { $inc: { stock: -p.cantidad } });
      console.log(`🧾 Stock actualizado (ID ${p.id}): -${p.cantidad}`);
    }

    // 💾 Guardar el pedido en MongoDB
    const nuevoPedido = new Pedido({
      nombreCliente: req.body.nombreCliente,
      sucursal: req.body.sucursal,
      productos,
      total: req.body.total,
      comprobantePago: req.file ? req.file.originalname : null
    });

    await nuevoPedido.save();

    // 📬 Enviar correo
    enviarCorreoAdmin(nuevoPedido, req.file);

    res.status(201).json({ mensaje: '✅ Pedido registrado correctamente', pedido: nuevoPedido });

  } catch (error) {
    console.error("❌ Error al registrar el pedido:", error);
    res.status(500).json({ error: 'Error al registrar el pedido', detalle: error.message });
  }
});


// 📌 Middleware 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
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
// force deploy
