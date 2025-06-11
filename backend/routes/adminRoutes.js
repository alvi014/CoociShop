// 📁 backend/routes/adminRoutes.js - Rutas para gestión de productos por administrador

import express from 'express';
import Producto from '../models/Producto.js';

const router = express.Router();

// Crear un nuevo producto
router.post("/producto", async (req, res) => {
  try {
    const { id, nombre, descripcion, precio, stock, categoria, imagen } = req.body;

    // Validación de campos obligatorios
    if (!id || !nombre || !precio || !stock || !categoria || !imagen) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verifica si ya existe un producto con ese ID
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

// Actualizar un producto existente
router.put("/producto/:id", async (req, res) => {
  const idNum = parseInt(req.params.id);
  if (isNaN(idNum)) {
    return res.status(400).json({ error: "ID inválido, debe ser numérico" });
  }

  try {
    // Actualiza usando los nuevos campos enviados en req.body
    const actualizado = await Producto.findOneAndUpdate(
      { id: idNum },
      req.body,
      { new: true } // Retorna el documento modificado
    );

    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: "Producto actualizado", producto: actualizado });
  } catch (err) {
    console.error("❌ Error al editar producto:", err);
    res.status(500).json({ error: "Error al editar producto", detalle: err.message });
  }
});

// Eliminar un producto
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

export default router;
