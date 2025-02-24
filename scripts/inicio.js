// js Barra de Navegación
document.addEventListener('DOMContentLoaded', function() {
    // Cargar la barra de navegación desde un archivo externo
    fetch('navbar.html') 
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
        })
        .catch(error => {
            console.error('Error al cargar la barra de navegación:', error);
        });

    // Redirección al hacer clic en categorías (texto o imagen)
    document.querySelectorAll('.filtro-categoria').forEach(elemento => {
        elemento.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = e.target.closest("[data-categoria]")?.getAttribute("data-categoria");
            if (categoria) {
                window.location.href = `producto.html?categoria=${encodeURIComponent(categoria)}`;
            }
        });
    });
});
