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
    <form onsubmit="agregarProducto(event)">
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
    input.value = input.value.trim();
  });
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
    return alert("❌ Debes ingresar una categoría e imagen válida.");
  }

  try {
    const res = await fetch(`${API_URL}/admin/producto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await res.json();
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto agregado correctamente");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al agregar producto:", err);
  }
}

function mostrarFormularioEditar() {
  formContainer.innerHTML = `
    <h3>✏️ Editar Producto</h3>
    <form onsubmit="editarProducto(event)">
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
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto actualizado");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al editar producto:", err);
  }
}

function mostrarFormularioEliminar() {
  formContainer.innerHTML = `
    <h3>🗑️ Eliminar Producto</h3>
    <form onsubmit="eliminarProducto(event)">
      <input class="form-control mb-2" type="number" placeholder="ID del producto a eliminar" id="del-id" required />
      <button type="submit" class="btn btn-danger">Eliminar</button>
    </form>
  `;
}

async function eliminarProducto(e) {
  e.preventDefault();
  limpiarInputs();
  const id = parseInt(document.getElementById("del-id").value);

  if (!confirm(`¿Seguro que deseas eliminar el producto #${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/admin/producto/${id}`, {
      method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto eliminado");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
  }
}
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
    <form onsubmit="agregarProducto(event)">
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
    input.value = input.value.trim();
  });
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
    return alert("❌ Debes ingresar una categoría e imagen válida.");
  }

  try {
    const res = await fetch(`${API_URL}/admin/producto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });

    const data = await res.json();
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto agregado correctamente");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al agregar producto:", err);
  }
}

function mostrarFormularioEditar() {
  formContainer.innerHTML = `
    <h3>✏️ Editar Producto</h3>
    <form onsubmit="editarProducto(event)">
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
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto actualizado");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al editar producto:", err);
  }
}

function mostrarFormularioEliminar() {
  formContainer.innerHTML = `
    <h3>🗑️ Eliminar Producto</h3>
    <form onsubmit="eliminarProducto(event)">
      <input class="form-control mb-2" type="number" placeholder="ID del producto a eliminar" id="del-id" required />
      <button type="submit" class="btn btn-danger">Eliminar</button>
    </form>
  `;
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
    if (!res.ok) return alert(`❌ Error: ${data.error || data.message}`);

    alert("✅ Producto eliminado");
    await cargarProductos();
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
  }
}