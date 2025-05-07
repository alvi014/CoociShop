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
  if (tipo === "agregar") window.mostrarFormularioAgregar();
  else if (tipo === "editar") window.mostrarFormularioEditar();
  else if (tipo === "eliminar") window.mostrarFormularioEliminar();
}

function mostrarFormularioAgregar() {
  formContainer.innerHTML = `
    <h3>➕ Agregar Producto</h3>
    <form id="form-agregar-producto">
      <input class="form-control mb-2" type="number" placeholder="ID" id="prod-id" required />
      <input class="form-control mb-2" type="text" placeholder="Nombre" id="prod-nombre" required />
      <input class="form-control mb-2" type="text" placeholder="Descripción" id="prod-descripcion" />
      <input class="form-control mb-2" type="number" placeholder="Precio" id="prod-precio" required />
      <input class="form-control mb-2" type="number" placeholder="Stock" id="prod-stock" required />
      <label class="form-label">Categoría:</label>
      <select class="form-select mb-2" id="prod-categoria-select">
        <option value="">Seleccionar existente</option>
        ${categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <input class="form-control mb-2" type="text" placeholder="O ingrese nueva categoría" id="prod-categoria-nueva" />
      <input class="form-control mb-2" type="text" placeholder="Nombre del archivo de imagen (ej. producto.png)" id="prod-imagen" oninput="window.actualizarPreviewImagen()" required />
      <img id="preview-imagen" src="" style="display:none; width:80px;" />
      <button type="submit" class="btn btn-success">Guardar</button>
    </form>
  `;
  document.getElementById("form-agregar-producto").addEventListener("submit", agregarProducto);
}
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
    limpiarInputs(); // 👈 ahora sí, se limpia después de éxito
  } catch (err) {
    console.error("❌ Error al agregar producto:", err);
    mostrarMensaje("❌ Error de red al agregar producto", "danger");
  }
}



function mostrarFormularioEditar() {
  formContainer.innerHTML = `
    <h3>✏️ Editar Producto</h3>
    <form id="form-editar-producto">
      <input class="form-control mb-2" type="number" placeholder="ID del producto" id="edit-id" required />
      <input class="form-control mb-2" type="text" placeholder="Nuevo nombre" id="edit-nombre" />
      <input class="form-control mb-2" type="text" placeholder="Nueva descripción" id="edit-descripcion" />
      <input class="form-control mb-2" type="number" placeholder="Nuevo precio" id="edit-precio" />
      <input class="form-control mb-2" type="number" placeholder="Nuevo stock" id="edit-stock" />
      <select class="form-select mb-2" id="edit-categoria">
        <option value="">Seleccionar existente</option>
        ${categoriasUnicas.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <input class="form-control mb-2" type="text" placeholder="O ingrese nueva categoría" id="edit-categoria-nueva" />
      <input class="form-control mb-2" type="text" placeholder="Nueva imagen (ej. producto.png)" id="edit-imagen" />
      <button type="submit" class="btn btn-warning">Actualizar</button>
    </form>
  `;
  document.getElementById("form-editar-producto").addEventListener("submit", editarProducto);
}

function mostrarFormularioEliminar() {
  formContainer.innerHTML = `
    <h3>🗑️ Eliminar Producto</h3>
    <form id="form-eliminar-producto">
      <input class="form-control mb-2" type="number" placeholder="ID del producto a eliminar" id="del-id" required />
      <button type="submit" class="btn btn-danger">Eliminar</button>
    </form>
  `;
  document.getElementById("form-eliminar-producto").addEventListener("submit", eliminarProducto);
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

window.mostrarFormulario = mostrarFormulario;
window.mostrarFormularioAgregar = mostrarFormularioAgregar;
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.mostrarFormularioEliminar = mostrarFormularioEliminar;
window.filtrarPorCategoria = filtrarPorCategoria;
window.actualizarPreviewImagen = actualizarPreviewImagen;
window.agregarProducto = agregarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
