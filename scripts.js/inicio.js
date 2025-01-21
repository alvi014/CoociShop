// js Barra de Navegación
document.addEventListener('DOMContentLoaded', function() {
    // Seleccionamos la barra de navegación del archivo 'inicio.html'
    fetch('inicio.html')
        .then(response => response.text())
        .then(data => {
            // Extraemos solo el código del nav (puedes ajustar esto si lo necesitas)
            let nav = data.match(/<nav[^>]*>([\s\S]*?)<\/nav>/);

            if (nav) {
                // Insertamos el nav extraído dentro del div con id "navbar"
                document.getElementById('navbar').innerHTML = nav[0];
            }
        })
        .catch(error => {
            console.error('Error al cargar la barra de navegación:', error);
        });
});
