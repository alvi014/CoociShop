// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

// ✅ Agregar producto
router.post("/producto", async (req, res) => {
  try {
    const { id, nombre, descripcion, precio, stock, categoria, imagen } = req.body;

    if (!id || !nombre || !precio || !stock || !categoria || !imagen) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const existente = await Producto.findOne({ id });
    if (existente) return res.status(400).json({ error: "Ya existe un producto con ese ID" });

    const nuevoProducto = new Producto({ id, nombre, descripcion, precio, stock, categoria, imagen });
    await nuevoProducto.save();

    res.status(201).json({ message: "Producto agregado correctamente", producto: nuevoProducto });
  } catch (err) {
    console.error("❌ Error al agregar producto:", err);
    res.status(500).json({ error: "Error al agregar producto", detalle: err.message });
  }
});

// ✅ Editar producto
router.put("/producto/:id", async (req, res) => {
  const idNum = parseInt(req.params.id);
  if (isNaN(idNum)) {
    return res.status(400).json({ error: "ID inválido, debe ser numérico" });
  }

  try {
    const actualizado = await Producto.findOneAndUpdate(
      { id: idNum },
      req.body,
      { new: true }
    );

    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto actualizado", producto: actualizado });
  } catch (err) {
    console.error("❌ Error al editar producto:", err);
    res.status(500).json({ error: "Error al editar producto", detalle: err.message });
  }
});


// ✅ Eliminar producto
router.delete("/producto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const eliminado = await Producto.findOneAndDelete({ id: parseInt(id) });
    if (!eliminado) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto eliminado", producto: eliminado });
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto", detalle: err.message });
  }
});

module.exports = router;
