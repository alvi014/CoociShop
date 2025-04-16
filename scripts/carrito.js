// Lista de sucursales
const sucursales = [
    "Cuidad Quesada", "Sucursal NG", "Florencia", "Alajuela", "Heredia", "San José", "Cartago", "Tilarán", "Nicoya",
    "Zarcero", "San Ramón", "Orotina", "Naranjo", "Grecia", "La Tigra", "Fortuna", "Guatuso", "Santa Rosa", "Aguas Zarcas",
    "Venecia", "Pital", "Puerto Viejo", "Guapiles"
];

// Función para cargar las sucursales en el menú desplegable
function cargarSucursales() {
    const sucursalEnvio = document.getElementById('sucursal-envio');
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal;
        option.textContent = sucursal;
        sucursalEnvio.appendChild(option);
    });
}

// Función para mostrar los productos en el carrito
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

        productRow.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
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

    // Agregar eventos a los botones "Eliminar"
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            eliminarDelCarrito(productId);
        });
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEnCarrito = carrito.find(producto => producto.id == productId);

    if (productoEnCarrito) {
        if (productoEnCarrito.cantidad > 1) {
            productoEnCarrito.cantidad -= 1;
        } else {
            carrito = carrito.filter(producto => producto.id != productId);
        }

        // 📌 Actualizar localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // 📌 Refrescar la vista del carrito
        mostrarCarrito();

        // 📌 ACTUALIZAR EL CONTADOR EN LA NAVBAR
        actualizarCarritoNavbar();
    }
}


// Mostrar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    cargarSucursales();
});

// Función para enviar el pedido
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

    // Validar que los productos tengan datos válidos
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

    console.log("🛒 Productos recibidos:", pedido.productos);


    try {
        const response = await fetch("https://coocishop.onrender.com/api/pedidos", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Pedido enviado con éxito.");
            localStorage.removeItem('carrito');
            mostrarCarrito();
            document.getElementById('checkout-form').reset();
        } else {
            alert(`❌ Error al enviar pedido: ${data.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error("❌ Error al enviar pedido:", error);
        alert("❌ Hubo un problema con el servidor.");
    }

    actualizarCarritoNavbar();
});


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
