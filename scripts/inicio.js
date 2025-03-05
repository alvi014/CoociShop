// js Barra de Navegación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la barra de navegación desde un archivo externo
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            actualizarCarritoNavbar(); // Llamar la función después de cargar la navbar
        })
        .catch(error => {
            console.error('Error al cargar la barra de navegación:', error);
        });

    // Función para actualizar el contador del carrito
    function actualizarCarritoNavbar() {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        let contadorCarrito = document.getElementById("cart-count");

        if (contadorCarrito) {
            contadorCarrito.textContent = carrito.length; // Muestra la cantidad de productos
        }
    }
});
