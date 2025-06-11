// 📌 Variables globales
let productosGlobal = [];

//  Inicializar Bootstrap tooltips
document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductosPorCategoria();
    actualizarCarritoNavbar();

    const buscadores = document.querySelectorAll('.buscador-productos');
    buscadores.forEach(input => {
        input.addEventListener('input', function () {
            const termino = this.value.toLowerCase().trim();
            const productosFiltrados = productosGlobal.filter(producto =>
                producto.nombre.toLowerCase().includes(termino)
            );
            generarProductos(productosFiltrados);
        });
    });
});

const BASE_URL = location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://coocishop.onrender.com";
  
//  Cargar productos por categoría desde el backend
async function cargarProductosPorCategoria() {
    try {
        const params = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = params.get("categoria") || "TODOS";

        let response = await fetch(`${BASE_URL}/api/productos`);
        let productos = await response.json();

        productosGlobal = productos;

        productos = productos.map(producto => {
            if (producto.imagen?.startsWith("/img/")) {
                producto.imagen = `img/${producto.imagen.split("/").pop()}`;
            }
            return producto;
        });

        if (!Array.isArray(productos)) {
            throw new Error("La respuesta del servidor no es un array válido.");
        }

        const productosFiltrados = (categoriaSeleccionada === "TODOS") 
            ? productos 
            : productos.filter(producto => producto.categoria === categoriaSeleccionada);

        generarProductos(productosFiltrados);
    } catch (error) {
        console.error("❌ Error al cargar productos:", error);
        const contenedor = document.getElementById('product-container');
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" role="alert">
                ❌ No se pudieron cargar los productos. Intente nuevamente más tarde.
            </div>
        `;
    }
}
//  Mostrar productos en la página
function generarProductos(productos) {
    const contenedor = document.getElementById('product-container');
    contenedor.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card col-md-4 col-lg-3 mb-4 position-relative';
        card.dataset.productId = producto.id;
        card.innerHTML = `
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body text-center">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text"><strong>Precio: ₡${producto.precio}</strong></p>
                <button class="btn btn-primary ver-detalle" data-id="${producto.id}">Ver Detalle</button>
            </div>
            <div class="add-animation-check position-absolute top-0 end-0 p-2" style="display:none;">
              <span class="bg-success text-white rounded-circle p-2">✔️</span>
            </div>
        `;
        contenedor.appendChild(card);
    });

    document.querySelectorAll('.ver-detalle').forEach(boton => {
        boton.addEventListener("click", function () {
            mostrarVistaPrevia(parseInt(this.dataset.id));
        });
    });
}
//  Mostrar vista previa del producto
async function mostrarVistaPrevia(productoId) {
    try {
        let response = await fetch(`${BASE_URL}/api/productos/${productoId}`);
        let producto = await response.json();

        if (!producto) {
            mostrarNotificacion("error", "Producto no encontrado.");
            return;
        }

        if (producto.imagen?.startsWith("/img/")) {
            producto.imagen = `img/${producto.imagen.split("/").pop()}`;
        }

        document.getElementById('productModalLabel').textContent = producto.nombre;
        document.getElementById('productModalBody').innerHTML = `
            <img src="${producto.imagen}" class="img-fluid mb-3" alt="${producto.nombre}">
            <p><strong>${producto.descripcion}</strong></p>
            <p><strong>Precio: ₡${producto.precio}</strong></p>
            <p>Stock Disponible: ${producto.stock}</p>
            <div class="mb-3">
                <label for="cantidadProducto" class="form-label">Cantidad:</label>
                <input type="number" id="cantidadProducto" class="form-control" value="1" min="1" max ="${producto.stock}">
            </div>
            <button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        `;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        console.error("❌ Error al mostrar el modal:", error);
    }
}
//  Agregar producto al carrito
function agregarAlCarrito(productoId) {
    if (!productoId || isNaN(productoId)) {
        mostrarNotificacion("error", "ID de producto inválido.");
        return;
    }

    const cantidadInput = document.getElementById('cantidadProducto');
    const cantidad = parseInt(cantidadInput?.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarNotificacion("error", "Ingrese una cantidad válida.");
        return;
    }
 //  Verificamos si la imagen empieza con /img y ajustamos para Netlify
    fetch(`${BASE_URL}/api/productos/${productoId}`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo obtener el producto.");
            return response.json();
        })
        .then(producto => {
            if (!producto || !producto.id) {
                mostrarNotificacion("error", "Producto no encontrado o ID inválido.");
                return;
            }

            if (cantidad > producto.stock) {
                mostrarNotificacion("error", `Solo hay ${producto.stock} unidades disponibles.`);
                return;
            }

            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            let productoEnCarrito = carrito.find(p => p.id === producto.id);

            if (productoEnCarrito) {
                productoEnCarrito.cantidad += cantidad;
            } else {
                carrito.push({ ...producto, cantidad });
            }

            localStorage.setItem("carrito", JSON.stringify(carrito));
            actualizarCarritoNavbar();
            mostrarNotificacion("success", "Producto agregado al carrito.");

            const modalElement = document.getElementById('productModal');
            bootstrap.Modal.getInstance(modalElement).hide();

           
            const card = document.querySelector(`[data-product-id='${producto.id}']`);
            const check = card?.querySelector('.add-animation-check');
            if (check) {
              check.style.display = 'block';
              check.style.opacity = '1';
              setTimeout(() => check.style.opacity = '0', 1000);
              setTimeout(() => check.style.display = 'none', 1500);
            }
        })
        .catch(error => {
            console.error("❌ Error al agregar al carrito:", error);
            mostrarNotificacion("error", error.message);
        });
}
//  Mostrar notificación visual      
function mostrarNotificacion(tipo, mensaje) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${tipo} border-0 show`;
    toast.role = "alert";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensaje}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}
//   Actualizar el contador del carrito en la navbar
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");

    if (contadorCarrito) {
        contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}
//  Crear el contenedor de notificaciones si no existe
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML("beforeend", '<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
}
