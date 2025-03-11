// navbar.js: Cargar la navbar dinámicamente
document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html") // 🔥 Asegúrate de que la ruta sea correcta
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById("navbar-placeholder").innerHTML = html;

            // 📌 Esperar un pequeño tiempo para asegurar que el navbar está en el DOM
            setTimeout(() => {
                inicializarBootstrap();
                actualizarCarritoNavbar(); // ✅ Llamar después de que el navbar esté cargado
            }, 100);
        })
        .catch(error => console.error("Error al cargar la navbar:", error));
});

// 📌 Inicializa Bootstrap después de insertar el navbar
function inicializarBootstrap() {
    let dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown);
    });
}

// 📌 Actualizar el contador del carrito en la navbar
function actualizarCarritoNavbar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contadorCarrito = document.getElementById("cart-count");

    if (contadorCarrito) {
        let totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalCantidad;
        console.log("✅ Contador actualizado:", totalCantidad); // 🚀 Depuración
    } else {
        console.log("⚠️ No se encontró el elemento con id 'cart-count'");
    }
}

// 📌 Asegurar que el contador también se actualiza cuando se elimina un producto
document.addEventListener("carritoActualizado", actualizarCarritoNavbar);
