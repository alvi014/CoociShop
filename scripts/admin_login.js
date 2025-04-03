document.getElementById("admin-login-form").addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    try {
      const response = await fetch("https://coocishop.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
      console.log("🔁 Respuesta login:", data);
  
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/gestionProducto.html";
      } else {
        alert(`❌ ${data.message || "Credenciales incorrectas"}`);
      }
    } catch (error) {
      console.error("❌ Error en el login:", error);
      alert("❌ No se pudo conectar con el servidor.");
    }
  });
  