const express = require("express");
const { verifyAdmin } = require("../middleware/auth"); // Middleware para proteger rutas

const router = express.Router();

// 📌 Ruta protegida: Panel de administración
router.get("/dashboard", verifyAdmin, (req, res) => {
    res.json({ message: "Bienvenido al panel de administración", user: req.user });
});

// 📌 Ruta protegida: Obtener lista de pedidos
router.get("/pedidos", verifyAdmin, async (req, res) => {
    try {
        const pedidos = await Pedido.find();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener pedidos", error });
    }
});

// 📌 Ruta protegida: Crear un nuevo producto
router.post("/productos", verifyAdmin, async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json({ message: "Producto creado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el producto", error });
    }
});

// 📌 Ruta protegida: Eliminar un producto
router.delete("/productos/:id", verifyAdmin, async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto", error });
    }
});

module.exports = router;
