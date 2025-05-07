// scripts/gestionProductos.js

const API_URL = "https://coocishop.onrender.com/api";
const tablaBody = document.getElementById("productos-body");
const formContainer = document.getElementById("formulario-container");
const filtroCategoria = document.getElementById("filtro-categoria");
let productosOriginales = [];
let categoriasUnicas = [];

window.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();
  if (filtroCategoria) filtroCategoria.addEventListener("change", filtrarPorCategoria);
});

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

function renderizarSelectCategorias() {
  if (!filtroCategoria) return;
  filtroCategoria.innerHTML = `<option value="">TODAS</option>`;
  categoriasUnicas.forEach(cat => {
    filtroCategoria.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

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

function mostrarFormulario(tipo) {
  if (tipo === "agregar") mostrarFormularioAgregar();
  else if (tipo === "editar") mostrarFormularioEditar();
  else if (tipo === "eliminar") mostrarFormularioEliminar();
}

function actualizarPreviewImagen() {
  const input = document.getElementById("prod-imagen");
  const preview = document.getElementById("preview-imagen");
  const url = input.value.trim();
  if (url) {
    preview.src = `https://coocishop.netlify.app/img/${url}`;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}

function limpiarInputs() {
  formContainer.querySelectorAll("input[type='text'], input[type='number']").forEach(input => {
    input.value = "";
  });
  const preview = document.getElementById("preview-imagen");
  if (preview) preview.style.display = "none";
}

async function agregarProducto(e) {
  e.preventDefault();
  limpiarInputs();

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
    return mostrarMensaje("❌ Debes ingresar una categoría e imagen válida.", "danger");
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

async function editarProducto(e) {
  e.preventDefault();
  limpiarInputs();
  const id = parseInt(document.getElementById("edit-id").value);

  const nuevaCategoria = document.getElementById("edit-categoria-nueva").value.trim();
  const seleccionCategoria = document.getElementById("edit-categoria").value.trim();

  const imagenNombre = document.getElementById("edit-imagen").value.trim();
  const body = {
    nombre: document.getElementById("edit-nombre").value.trim(),
    descripcion: document.getElementById("edit-descripcion").value.trim(),
    precio: parseFloat(document.getElementById("edit-precio").value),
    stock: parseInt(document.getElementById("edit-stock").value),
    categoria: nuevaCategoria || seleccionCategoria,
    imagen: imagenNombre ? `https://coocishop.netlify.app/img/${imagenNombre}` : undefined,
  };
  Object.keys(body).forEach(key => { if (!body[key]) delete body[key]; });

  try {
    const res = await fetch(`${API_URL}/admin/producto/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return mostrarMensaje(`❌ Error: ${data.error || data.message}`, "danger");

    mostrarMensaje("✅ Producto actualizado correctamente");
    await cargarProductos();
    limpiarInputs();
  } catch (err) {
    console.error("❌ Error al editar producto:", err);
    mostrarMensaje("❌ Error al editar producto", "danger");
  }
}

async function eliminarProducto(e) {
  e.preventDefault();
  limpiarInputs();
  const id = parseInt(document.getElementById("del-id").value);

  if (!confirm(`¿Seguro que deseas eliminar el producto #${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/admin/producto/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      mode: "cors"
    });
    const data = await res.json();
    if (!res.ok) return mostrarMensaje(`❌ Error: ${data.error || data.message}`, "danger");

    mostrarMensaje("✅ Producto eliminado correctamente");
    await cargarProductos();
    limpiarInputs();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    mostrarMensaje("❌ Error al eliminar producto", "danger");
  }
}

window.mostrarFormulario = mostrarFormulario;
window.mostrarFormularioAgregar = mostrarFormularioAgregar;
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.mostrarFormularioEliminar = mostrarFormularioEliminar;
window.filtrarPorCategoria = filtrarPorCategoria;
window.actualizarPreviewImagen = actualizarPreviewImagen;
window.agregarProducto = agregarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
