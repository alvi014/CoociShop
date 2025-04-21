// Lista de sucursales
const sucursales = [
    "Cuidad Quesada", "Sucursal NG", "Florencia", "Alajuela", "Heredia", "San José", "Cartago", "Tilarán", "Nicoya",
    "Zarcero", "San Ramón", "Orotina", "Naranjo", "Grecia", "La Tigra", "Fortuna", "Guatuso", "Santa Rosa", "Aguas Zarcas",
    "Venecia", "Pital", "Puerto Viejo", "Guapiles"
];
// 📦 Cargar las sucursales en el select
function cargarSucursales() {
    const sucursalEnvio = document.getElementById('sucursal-envio');
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        sucursalEnvio.appendChild(option);
    });
}
//
function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoContainer = document.getElementById('carrito-container');
    carritoContainer.innerHTML = '';

    let total = 0;

    carrito.forEach(producto => {
        const productRow = document.createElement('div');
        productRow.className = 'carrito-item';

        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        // ✅ Verificamos si la imagen empieza con /img y ajustamos para Netlify
        let imagenSrc = producto.imagen;
        if (imagenSrc?.startsWith('/img')) {
            imagenSrc = imagenSrc.replace('/img', 'img');
        }

        productRow.innerHTML = `
            <img src="${imagenSrc}" alt="${producto.nombre}">
            <div class="carrito-item-info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion}</p>
                <p><strong>Precio: ₡${producto.precio}</strong></p>
                <p><strong>Cantidad: ${producto.cantidad}</strong></p>
                <p><strong>Subtotal: ₡${subtotal}</strong></p>
            </div>
            <button class="btn-eliminar" data-product-id="${producto.id}">Eliminar</button>
        `;

        carritoContainer.appendChild(productRow);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'carrito-total';
    totalRow.innerHTML = `Total: ₡${total}`;
    carritoContainer.appendChild(totalRow);

    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            eliminarDelCarrito(productId);
        });
    });
}
// 📦 Agregar producto al carrito
function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(producto => producto.id == productId);

    if (productoEnCarrito) {
        if (productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad -= 1;
        } else {
            carrito = carrito.filter(producto => producto.id != productId);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarrito();
        actualizarCarritoNavbar();
    }
}
// 📦 Mostrar el carrito al cargar la página y cargar las sucursales
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    cargarSucursales();
});

// 📦 Enviar el pedido al backend
document.getElementById('checkout-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombreCompleto = document.getElementById('nombre-completo').value;
    const sucursalEnvio = document.getElementById('sucursal-envio').value;
    const comprobantePago = document.getElementById('comprobante-pago').files[0];

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        alert("❌ No hay productos en el carrito.");
        return;
    }

    const productosValidos = carrito.filter(producto =>
        producto.id && producto.nombre && !isNaN(Number(producto.precio)) && !isNaN(Number(producto.cantidad))
    );

    if (productosValidos.length === 0) {
        alert("❌ Hay productos inválidos en el carrito. Por favor elimínalos.");
        return;
    }

    const total = productosValidos.reduce((acc, producto) => {
        return acc + (Number(producto.precio) * Number(producto.cantidad));
    }, 0);

    const pedido = {
        nombreCliente: nombreCompleto,
        sucursal: sucursalEnvio,
        productos: productosValidos.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio),
            cantidad: Number(producto.cantidad)
        })),
        total
    };

    const formData = new FormData();
    formData.append('nombreCliente', pedido.nombreCliente);
    formData.append('sucursal', pedido.sucursal);
    formData.append('productos', JSON.stringify(pedido.productos));
    formData.append('total', pedido.total);
    formData.append('comprobantePago', comprobantePago);

    // ✅ Verificamos si el backend está listo
    try {
        const ping = await fetch("https://coocishop.onrender.com/api/ping", { cache: "no-store" });
        const result = await ping.json();
        console.log("⏱ Backend respondió:", result.message);
    } catch (pingErr) {
        alert("⚠️ El sistema está preparando el servidor. Inténtalo nuevamente en unos segundos.");
        return;
    }

    try {
        const response = await fetch("https://coocishop.onrender.com/api/pedidos", {
            method: "POST",
            body: formData
        });

        let data;
try {
    data = await response.json(); // solo si es JSON válido
} catch (err) {
    data = null;
}

if (response.ok) {
    mostrarNotificacion("success", "✅ Pedido enviado con éxito.");
    localStorage.removeItem('carrito');
    mostrarCarrito();
    document.getElementById('checkout-form').reset();
} else {
    alert(`❌ Error al enviar pedido: ${(data && data.error) || 'Error desconocido'}`);
}


    actualizarCarritoNavbar();
});

// 📌 Función para mostrar notificaciones
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");

    if (contadorCarrito) {
        contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}
// 📌 Crear el contenedor de notificaciones si no existe
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML("beforeend", '<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1050;"></div>');
}
// 📦 Mostrar notificación visual
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

// 📌 Agregar contenedor visual al HTML si no existe
if (!document.getElementById("toast-container")) {
    document.body.insertAdjacentHTML(
        "beforeend",
        `<div id="toast-container" class="position-fixed top-0 end-0 p-3" style="z-index: 1055;"></div>`
    );
}
