# CoociShop

Tienda Virtual de Coocique para socios, desarrollada como un sistema de compra de promocionales.

---

## 📋 Tabla de Contenidos

* [📦 Descripción General](#-descripción-general)
* [🛠 Instalación](#-instalación)
* [🚀 Uso](#-uso)
* [🌐 Frontend](#-frontend)
* [✨ Características](#-características)
* [🔐 Variables de Entorno](#-variables-de-entorno)
* [🧭 Arquitectura del Sistema](#-arquitectura-del-sistema)
* [🤝 Contribuciones](#-contribuciones)
* [📝 Licencia](#-licencia)
* [📬 Contacto](#-contacto)

---

## 📦 Descripción General

Este proyecto consiste en una tienda virtual donde los socios pueden adquirir productos promocionales de la cooperativa.

Está compuesto por:

* Un frontend estático (HTML/CSS/JS)
* Un backend construido con Node.js, Express y MongoDB

🔁 La comunicación entre clientes y administrador se refuerza con:

* Notificaciones por correo
* Autenticación con JWT
* Carga de comprobantes de pago

---

## 🛠 Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/alvi014/coocishop.git
cd coocishop
npm install
```

---

## 🚀 Uso

```bash
# Correr servidor en modo desarrollo
npm run dev
```

* El frontend puede desplegarse desde **Netlify**
* El backend se aloja en **Render** o se ejecuta localmente

---

## 🌐 Frontend

El frontend fue desarrollado con **HTML5, CSS3, Bootstrap y JavaScript**.
Cada vista HTML tiene su lógica en archivos JS correspondientes.

### 📁 Archivos HTML principales

```
├── index.html              # Portada con categorías
├── producto.html           # Lista dinámica de productos
├── carrito.html            # Carrito + formulario + comprobante
├── admin.html              # Login administrador
├── gestionProducto.html    # Gestión y CRUD de productos
├── contacto.html           # Información de contacto
├── comoComprar.html        # Guía paso a paso
├── navbar.html             # Barra de navegación reutilizable
```

---

## ✨ Características

* 🔐 Autenticación de administrador con JWT
* 🛍️ CRUD completo de productos
* 📎 Carga de comprobantes de pago
* 📧 Envío de correos automáticos con Nodemailer
* 📦 Control de stock por pedido
* 🔍 Filtros por categoría de producto
* 📱 Interfaz responsiva (Bootstrap)

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes claves:

```env
MONGO_URI=
PORT=3000
EMAIL_ADMIN=
EMAIL_PASS=
JWT_SECRET=
NODE_ENV=development
```

---

## 🧭 Arquitectura del Sistema

Diagrama representativo de los componentes del sistema:

![Diagrama de arquitectura](arquitectura_web.png)

```plaintext
🧑 Usuario (Navegador)
   ↓
🌐 Frontend (Netlify - HTML/JS/CSS)
   ↓
🔧 Backend API (Render - Express.js + Node.js)
   ↓
🌍 API externa o base de datos (si aplica)
```

---

## 🤝 Contribuciones

¡Contribuciones son bienvenidas!

* Abre un issue o PR con mejoras, bugs o documentación.

---

## 📝 Licencia

Este proyecto está licenciado bajo los términos de uso de Coocique.

---

## 📬 Contacto

* 👨‍💻 Desarrollador: [avictor@coocique.fi.cr](mailto:avictor@coocique.fi.cr)

> Proyecto creado para facilitar el acceso a promocionales de socios de Coocique.
