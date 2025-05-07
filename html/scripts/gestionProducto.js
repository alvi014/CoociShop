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

function mostrarFormularioAgregar() {
  formContainer.innerHTML = `
    <h3>➕ Agregar Producto</h3>
    <form onsubmit="window.agregarProducto(event)">
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
      <input class="form-control mb-2" type="text" placeholder="Nombre del archivo de imagen (ej. producto.png)" id="prod-imagen" oninput="actualizarPreviewImagen()" required />
      <img id="preview-imagen" src="" style="display:none; width:80px;" />
      <button type="submit" class="btn btn-success">Guardar</button>
    </form>
  `;
}

function mostrarFormularioEditar() {
  formContainer.innerHTML = `
    <h3>✏️ Editar Producto</h3>
    <form onsubmit="window.editarProducto(event)">
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
}

function mostrarFormularioEliminar() {
  formContainer.innerHTML = `
    <h3>🗑️ Eliminar Producto</h3>
    <form onsubmit="window.eliminarProducto(event)">
      <input class="form-control mb-2" type="number" placeholder="ID del producto a eliminar" id="del-id" required />
      <button type="submit" class="btn btn-danger">Eliminar</button>
    </form>
  `;
}

window.mostrarFormulario = mostrarFormulario;
window.mostrarFormularioAgregar = mostrarFormularioAgregar;
window.mostrarFormularioEditar = mostrarFormularioEditar;
window.mostrarFormularioEliminar = mostrarFormularioEliminar;
window.filtrarPorCategoria = filtrarPorCategoria;
