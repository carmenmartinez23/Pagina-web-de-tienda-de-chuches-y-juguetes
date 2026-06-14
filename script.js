// 1. FUNCIÓN MÁGICA: Carga el menú y el carrito desde el archivo separado
async function incrustarHeader() {
    try {
        const respuesta = await fetch('header.html');
        const htmlHeader = await respuesta.text();
        document.getElementById('contenedor-header').innerHTML = htmlHeader;

        // Una vez cargado el menú, activamos los botones y controladores
        document.getElementById('mobile-menu').addEventListener('click', () => {
            document.getElementById('nav-links').classList.toggle('active');
        });

        const panelCarrito = document.getElementById('carrito-panel');
        document.getElementById('abrir-carrito').addEventListener('click', () => panelCarrito.classList.add('abierto'));
        document.getElementById('cerrar-carrito').addEventListener('click', () => panelCarrito.classList.remove('abierto'));

        document.getElementById('btn-checkout').addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('El carrito está vacío.');
                return;
            }
            window.location.href = 'checkout.html';
        });

        // Pintamos el estado actual del carrito
        actualizarInterfazCarrito();
    } catch (error) {
        console.error("Error al importar el menú superior:", error);
    }
}

// 2. Lógica de Google Sheets y gestión del Carrito
const urlGoogleSheets = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNw27IvTnQIMXfq6Q52uOp7CcYoIrb-h5K5yJbJQYTgAA6bWn3ZAx0jDvwp12CrbpbaC_tXPDYI4yM/pub?output=csv';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productosMemoria = [];

async function cargarProductos() {
    try {
        const respuesta = await fetch(urlGoogleSheets);
        const datosTexto = await respuesta.text();
        const lineas = datosTexto.split(/\r?\n/);
        const contenedor = document.getElementById('contenedor-productos');
        
        if (document.getElementById('loading')) {
            document.getElementById('loading').style.display = 'none';
        }
        
        if (!contenedor) return; // Si no estamos en index.html, salimos
        contenedor.innerHTML = '';
        productosMemoria = [];

        for (let i = 1; i < lineas.length; i++) {
            if (lineas[i].trim() === '') continue;
            const columnas = lineas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // Mapeo exacto de tus columnas de Excel: id, nombre, categoria, precio, imagen, nuevo, descripcion
            const producto = {
                id: columnas[0]?.replace(/"/g, '').trim(),
                nombre: columnas[1]?.replace(/"/g, '').trim(),
                categoria: columnas[2]?.replace(/"/g, '').trim(),
                precio: columnas[3]?.replace(/"/g, '').trim(),
                imagen: columnas[4]?.replace(/"/g, '').trim(),
                nuevo: columnas[5]?.replace(/"/g, '').trim().toLowerCase(),
                descripcion: columnas[6]?.replace(/"/g, '').trim() || "Sin descripción disponible por el momento."
            };

            productosMemoria.push(producto);
            // --- VALIDACIÓN DEL FILTRO ---
            // Comparamos la categoría del Excel con la página en la que estamos
            let debeMostrar = false;

            if (paginaActual === 'index.html' || paginaActual === '') {
                // En el inicio se muestra absolutamente todo
                debeMostrar = true;
            } else if (paginaActual === 'chucherias.html') {
                // Muestra si la categoría es chuches, chucherias, chuches y snacks, o snacks
                if (producto.categoria.includes('chuches') || producto.categoria.includes('snack')) {
                    debeMostrar = true;
                }
            } else if (paginaActual === 'juguetes.html') {
                if (producto.categoria.includes('Juguetes')) debeMostrar = true;
            } else if (paginaActual === 'bebidas.html') {
                if (producto.categoria.includes('bebidas')) debeMostrar = true;
            } else if (paginaActual === 'cartas.html') {
                if (producto.categoria.includes('cartas') || producto.categoria.includes('pokemon')) debeMostrar = true;
            } else if (paginaActual === 'papeleria.html') {
                if (producto.categoria.includes('papeleria')) debeMostrar = true;
            } else {
                // Por si tienes otras páginas secundarias, por defecto mostramos todo
                debeMostrar = true;
            }

            // Si el producto no pertenece a esta sección, saltamos al siguiente sin dibujarlo
            if (!debeMostrar) continue;

            const card = document.createElement('div');
            card.className = 'producto-card';

            let badgeNuevoHTML = '';
            if (producto.nuevo === 'si' || producto.nuevo === 'sí' || producto.nuevo === 'yes' || producto.nuevo === 'true') {
                badgeNuevoHTML = `<span class="badge-nuevo">¡Nuevo!</span>`;
            }

            const imgUrl = producto.imagen ? producto.imagen : 'https://via.placeholder.com/300x220?text=Sin+Imagen';

            // Hemos añadido onclick="verDetalleProducto('${producto.id}')" en la imagen y el título
            card.innerHTML = `
                ${badgeNuevoHTML}
                <div class="producto-img-container" onclick="verDetalleProducto('${producto.id}')">
                    <img src="${imgUrl}" alt="${producto.nombre}" class="producto-img" onerror="this.src='https://via.placeholder.com/300x220?text=Error+Imagen'">
                </div>
                <div class="producto-info">
                    <span class="producto-categoria">${producto.categoria}</span>
                    <h3 class="producto-nombre" onclick="verDetalleProducto('${producto.id}')">${producto.nombre}</h3>
                    <div class="producto-precio-accion">
                        <span class="producto-precio">${producto.precio}</span>
                        <button class="btn-anadir" onclick="anadirAlCarrito('${producto.id}')">Añadir</button>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        }
    } catch (error) {
        console.error(error);
        if (document.getElementById('loading')) {
            document.getElementById('loading').innerText = 'Error al conectar con el kiosko.';
        }
    }
}

// --- NUEVA FUNCIÓN: Abre la propia página/vista de especificaciones del producto ---
function verDetalleProducto(id) {
    const producto = productosMemoria.find(p => p.id === id);
    if (!producto) return;

    // Asignamos los datos del Excel a los elementos correspondientes de la ventana modal
    const modalImg = document.getElementById('modal-img-destino');
    const modalCat = document.getElementById('modal-cat-destino');
    const modalNom = document.getElementById('modal-nom-destino');
    const modalPre = document.getElementById('modal-pre-destino');
    const modalDesc = document.getElementById('modal-desc-destino');

    if (modalImg) modalImg.src = producto.imagen ? producto.imagen : 'https://via.placeholder.com/300x220?text=Sin+Imagen';
    if (modalImg) modalImg.alt = producto.nombre;
    if (modalCat) modalCat.innerText = producto.categoria;
    if (modalNom) modalNom.innerText = producto.nombre;
    if (modalPre) modalPre.innerText = producto.precio;
    if (modalDesc) modalDesc.innerText = producto.descripcion;

    // Abrimos el modal añadiendo la clase 'activo' que maneja la opacidad en tu CSS
    const modal = document.getElementById('modal-producto');
    if (modal) modal.classList.add('activo');
}

// --- NUEVA FUNCIÓN: Escucha los clics para cerrar la ficha del producto ---
function configurarCierreModal() {
    const modal = document.getElementById('modal-producto');
    const btnCerrar = document.getElementById('cerrar-modal');

    if (modal && btnCerrar) {
        // Cerrar pulsando la '✕'
        btnCerrar.addEventListener('click', () => {
            modal.classList.remove('activo');
        });

        // Cerrar pulsando en el fondo gris translúcido fuera de la tarjeta
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('activo');
            }
        });
    }
}

function anadirAlCarrito(id) {
    const prodMatch = productosMemoria.find(p => p.id === id);
    if (!prodMatch) return;

    const existe = carrito.find(item => item.id === id);
    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ ...prodMatch, cantidad: 1 });
    }

    guardarYActualizar();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarYActualizar();
}

function guardarYActualizar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarInterfazCarrito();
}

function actualizarInterfazCarrito() {
    const contenedorItems = document.getElementById('carrito-items');
    const contador = document.getElementById('contador-carrito');
    const totalSpan = document.getElementById('total-precio');

    // Si el menú dinámico aún no ha cargado en la página, esperamos
    if (!contenedorItems || !contador || !totalSpan) return;

    contenedorItems.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    carrito.forEach(item => {
        const precioNumerico = parseFloat(item.precio.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (!isNaN(precioNumerico)) {
            total += (precioNumerico * item.cantidad);
        }
        totalItems += item.cantidad;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.innerHTML = `
            <div class="carrito-item-info">
                <h4>${item.nombre}</h4>
                <small>${item.cantidad}x - ${item.precio}</small>
            </div>
            <button class="btn-eliminar-item" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
        `;
        contenedorItems.appendChild(itemDiv);
    });

    contador.innerText = totalItems;
    totalSpan.innerText = total.toFixed(2) + '€';
}

// --- 3. ARRANCAR PROCESOS ---
window.addEventListener('DOMContentLoaded', async () => {
    await incrustarHeader();       // Trae el menú y carrito común
    await cargarProductos();       // Trae e inicializa los productos desde Google Sheets
    configurarCierreModal();       // Enciende la escucha del botón cerrar del modal
});
