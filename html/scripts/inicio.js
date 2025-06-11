// js Barra de Navegación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la barra de navegación desde un archivo externo
    fetch('navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            
            // ⚠️ Espera a que el DOM de la navbar cargue antes de actualizar el contador
            setTimeout(() => {
                actualizarCarritoNavbar();
            }, 100);
        })
        .catch(error => {
            console.error('Error al cargar la barra de navegación:', error);
        });

    //  Función para actualizar el contador del carrito
    function actualizarCarritoNavbar() {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        //  Esperar a que el elemento exista antes de modificarlo
        let contadorCarrito = document.querySelector("#cart-count");
        if (!contadorCarrito) {
            setTimeout(actualizarCarritoNavbar, 100);
            return;
        }

        // 🛒 Sumar todas las cantidades en el carrito
        let totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalCantidad;
    }
});
