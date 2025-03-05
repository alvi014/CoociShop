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

        // Filtrar por categoría si no es "TODOS"
        const productosFiltrados = (categoriaSeleccionada === "TODOS") 
            ? productos 
            : productos.filter(producto => producto.categoria === categoriaSeleccionada);

        generarProductos(productosFiltrados);
    } catch (error) {
        console.error("Error al cargar productos:", error);
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

    // Agregar evento a los botones "Ver Detalle"
    document.querySelectorAll('.ver-detalle').forEach(boton => {
        boton.addEventListener("click", function () {
            const productoId = parseInt(this.dataset.id);
            mostrarVistaPrevia(productoId);
        });
    });
}

// 📌 Mostrar el modal con la vista previa del producto
async function mostrarVistaPrevia(productoId) {
    try {
        let response = await fetch("http://localhost:5000/api/productos");
        let productos = await response.json();
        const producto = productos.find(p => p.id === productoId);

        if (!producto) {
            alert("Producto no encontrado.");
            return;
        }

        // Actualiza el contenido del modal
        const modalLabel = document.getElementById('productModalLabel');
        const modalBody = document.getElementById('productModalBody');
        modalLabel.textContent = producto.nombre;
        modalBody.innerHTML = `
            <img src="${producto.imagen}" class="img-fluid mb-3" alt="${producto.nombre}">
            <p>${producto.descripcion}</p>
            <p><strong>Precio: ₡${producto.precio}</strong></p>
            <div class="mb-3">
                <label for="cantidadProducto" class="form-label">Cantidad:</label>
                <input type="number" id="cantidadProducto" class="form-control" value="1" min="1">
            </div>
        `;

        // Crear el botón y asignarle el evento para agregar al carrito
        const agregarBtn = document.createElement('button');
        agregarBtn.className = "btn btn-primary";
        agregarBtn.textContent = "Agregar al carrito";
        agregarBtn.addEventListener("click", function() {
            const cantidad = parseInt(document.getElementById('cantidadProducto').value);
            if (cantidad > 0) {
                agregarAlCarrito(producto.id, cantidad);
            } else {
                mostrarNotificacion("error", "Ingrese una cantidad válida.");
            }
        });
        modalBody.appendChild(agregarBtn);

        // Mostrar el modal
        const modalElement = document.getElementById('productModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error("Error al mostrar el modal:", error);
    }
}

// 📌 Agregar producto al carrito
function agregarAlCarrito(productoId, cantidad) {
    fetch("http://localhost:5000/api/productos")
        .then(response => response.json())
        .then(productos => {
            const producto = productos.find(p => p.id === productoId);
            if (!producto) {
                mostrarNotificacion("error", "Producto no encontrado.");
                return;
            }

            // Obtener carrito del localStorage
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

            // Verificar si el producto ya está en el carrito
            const productoEnCarrito = carrito.find(p => p.id === productoId);
            if (productoEnCarrito) {
                productoEnCarrito.cantidad += cantidad;
            } else {
                carrito.push({ 
                    id: producto.id, 
                    nombre: producto.nombre, 
                    precio: producto.precio, 
                    cantidad: cantidad,
                    imagen: producto.imagen,
                    descripcion: producto.descripcion
                });
            }

            // Guardar en localStorage
            localStorage.setItem("carrito", JSON.stringify(carrito));

            // Actualizar el icono del carrito en la navbar
            actualizarCarritoNavbar();
            mostrarNotificacion("success", "Producto agregado al carrito.");

            // Ocultar el modal después de agregar
            const modalElement = document.getElementById('productModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        })
        .catch(error => console.error("Error al agregar al carrito:", error));
}

// 📌 Notificación visual en lugar de alert
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

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 📌 Actualizar el contador del carrito en la navbar
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");

    if (contadorCarrito) {
        let totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalCantidad;
    }
}

// 📌 Agregar contenedor para los toasts en el HTML
document.body.insertAdjacentHTML("beforeend", '<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
