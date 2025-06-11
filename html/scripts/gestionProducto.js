// 📁 scripts/gestionProductos.js - Script para gestión de productos en el panel admin

const API_URL = "https://coocishop.onrender.com/api";
const tablaBody = document.getElementById("productos-body");
const formContainer = document.getElementById("formulario-container");
const filtroCategoria = document.getElementById("filtro-categoria");
let productosOriginales = [];
let categoriasUnicas = [];

// Inicializa la carga de productos y eventos al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  if (filtroCategoria) filtroCategoria.addEventListener("change", filtrarPorCategoria);
});

// Muestra mensaje de estado al usuario (éxito o error)
function mostrarMensaje(texto, tipo = "success") {
  let mensajeEstado = document.getElementById("estado-mensaje");
  if (!mensajeEstado) {
    mensajeEstado = document.createElement("div");
    mensajeEstado.id = "estado-mensaje";
    mensajeEstado.className = "mt-3";
    formContainer.appendChild(mensajeEstado);
  }
  mensajeEstado.textContent = texto;
  mensajeEstado.className = `alert alert-${tipo} mt-3`;
  mensajeEstado.style.display = "block";
  setTimeout(() => mensajeEstado.style.display = "none", 3000);
}

// Carga todos los productos del backend y renderiza el DOM
async function cargarProductos() {
  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();
    productosOriginales = productos;
    categoriasUnicas = [...new Set(productos.map(p => (p.categoria || "").trim()))];
    renderizarSelectCategorias();
    renderizarProductos(productos);
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
  }
}

// Dibuja la tabla con los productos
function renderizarProductos(lista) {
  tablaBody.innerHTML = "";
  lista.forEach(prod => {
    tablaBody.innerHTML += `
      <tr>
        <td>${prod.id}</td>
        <td>${prod.nombre}</td>
        <td>${prod.descripcion || "-"}</td>
        <td>₡${prod.precio}</td>
        <td>${prod.stock}</td>
        <td>${prod.categoria || "-"}</td>
        <td><img src="${prod.imagen}" width="60" /></td>
      </tr>
    `;
  });
}

// Llena el select de categorías
function renderizarSelectCategorias() {
  if (!filtroCategoria) return;
  filtroCategoria.innerHTML = `<option value="">TODAS</option>`;
  categoriasUnicas.forEach(cat => {
    filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// Filtra la tabla por categoría seleccionada
function filtrarPorCategoria() {
  const categoria = filtroCategoria.value.trim();
  if (!categoria) return renderizarProductos(productosOriginales);

  const filtrados = productosOriginales.filter(p => {
    const prodCat = (p.categoria || "").toUpperCase().trim();
    const filtroCat = categoria.toUpperCase();
    return prodCat === filtroCat;
  });

  renderizarProductos(filtrados);
}

// Muestra formularios dinámicos según tipo
function mostrarFormulario(tipo) {
  if (tipo === "agregar") window.mostrarFormularioAgregar();
  else if (tipo === "editar") window.mostrarFormularioEditar();
  else if (tipo === "eliminar") window.mostrarFormularioEliminar();
}

// Formulario para agregar producto
function mostrarFormularioAgregar() {
  formContainer.innerHTML = `...`;
  document.getElementById("form-agregar-producto").addEventListener("submit", agregarProducto);
}

// Envía producto nuevo al backend
async function agregarProducto(e) {
  e.preventDefault();

  const nuevaCategoria = document.getElementById("prod-categoria-nueva").value.trim();
  const seleccionCategoria = document.getElementById("prod-categoria-select").value.trim();
  const imagenNombre = document.getElementById("prod-imagen").value.trim();

  const producto = {
    id: parseInt(document.getElementById("prod-id").value),
    nombre: document.getElementById("prod-nombre").value.trim(),
    descripcion: document.getElementById("prod-descripcion").value.trim(),
    precio: parseFloat(document.getElementById("prod-precio").value),
    stock: parseInt(document.getElementById("prod-stock").value),
    categoria: nuevaCategoria || seleccionCategoria,
    imagen: `https://coocishop.netlify.app/img/${imagenNombre}`,
  };

  if (!producto.categoria || !imagenNombre) {
    mostrarMensaje("❌ Debes ingresar una categoría e imagen válida.", "danger");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/admin/producto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await res.json();
    if (!res.ok) return mostrarMensaje(`❌ Error: ${data.error || data.message}`, "danger");

    mostrarMensaje("✅ Producto agregado correctamente");
    await cargarProductos();
    limpiarInputs();
  } catch (err) {
    console.error("❌ Error al agregar producto:", err);
    mostrarMensaje("❌ Error de red al agregar producto", "danger");
  }
}

// Similar para editar/eliminar (omitido por brevedad)

window.mostrarFormulario = mostrarFormulario;
window.mostrarFormularioAgregar = mostrarFormularioAgregar;
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.mostrarFormularioEliminar = mostrarFormularioEliminar;
window.filtrarPorCategoria = filtrarPorCategoria;
window.actualizarPreviewImagen = actualizarPreviewImagen;
window.agregarProducto = agregarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
