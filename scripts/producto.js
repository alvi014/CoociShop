document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductosPorCategoria();
    actualizarCarritoNavbar(); // Actualiza el contador del carrito en la navbar
});

// 📌 Cargar productos por categoría desde el backend
async function cargarProductosPorCategoria() {
    try {
        const params = new URLSearchParams(window.location.search);
        const categoriaSeleccionada = params.get("categoria") || "TODOS";

        // Obtener productos del backend
        let response = await fetch("http://localhost:5000/api/productos");
        let productos = await response.json();

        if (!Array.isArray(productos)) {
            throw new Error("La respuesta del servidor no es un array válido.");
        }

        // Filtrar por categoría si no es "TODOS"
        const productosFiltrados = (categoriaSeleccionada === "TODOS") 
            ? productos 
            : productos.filter(producto => producto.categoria === categoriaSeleccionada);

        generarProductos(productosFiltrados);
    } catch (error) {
        console.error("❌ Error al cargar productos:", error);
    }
}

// 📌 Mostrar productos en la página
function generarProductos(productos) {
    const contenedor = document.getElementById('product-container');
    contenedor.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card col-md-4 col-lg-3 mb-4';
        card.dataset.productId = producto.id;
        card.innerHTML = `
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body text-center">
                <h5 class="card-title">${producto.nombre}</h5>
                <p class="card-text">${producto.descripcion}</p>
                <p class="card-text"><strong>Precio: ₡${producto.precio}</strong></p>
                <button class="btn btn-primary ver-detalle" data-id="${producto.id}">Ver Detalle</button>
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

// 📌 Mostrar el modal con la vista previa del producto
async function mostrarVistaPrevia(productoId) {
    try {
        let response = await fetch(`http://localhost:5000/api/productos/${productoId}`);
        let producto = await response.json();

        if (!producto) {
            mostrarNotificacion("error", "Producto no encontrado.");
            return;
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

// función de agregar al carrito
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

    fetch(`http://localhost:5000/api/productos/${productoId}`)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo obtener el producto.");
            return response.json();
        })
        .then(producto => {
            if (!producto || !producto.id) {
                mostrarNotificacion("error", "Producto no encontrado o ID inválido.");
                return;
            }

            // ✅ Validar stock aquí
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
        })
        .catch(error => {
            console.error("❌ Error al agregar al carrito:", error);
            mostrarNotificacion("error", error.message);
        });
}



// 📌 Mostrar notificación visual
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

// 📌 Actualizar el contador del carrito en la navbar
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");
    
    if (contadorCarrito) {
        contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}

// 📌 Agregar contenedor para las notificaciones
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML("beforeend", '<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
}
