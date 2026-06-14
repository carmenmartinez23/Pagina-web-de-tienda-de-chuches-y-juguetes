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
        
        // MEDIDA DE SEGURIDAD: Si la página actual no tiene el contenedor de productos,
        // guardamos los productos en memoria igualmente (para el carrito) pero no intentamos pintarlos.
        // Esto evita que páginas como conocenos.html o contactanos.html se queden en blanco.
        let tieneContenedor = true;
        if (!contenedor) {
            tieneContenedor = false;
        } else {
            contenedor.innerHTML = '';
        }
        
        productosMemoria = [];

        // Detectamos el nombre del archivo actual (ej: 'chucherias.html')
        const pathname = window.location.pathname;
        const paginaActual = pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase();

        for (let i = 1; i < lineas.length; i++) {
            if (lineas[i].trim() === '') continue;
            
            // CORREGIDO: Expresión regular correcta para respetar las comillas del CSV
            const columnas = lineas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            // Mapeo exacto de tus columnas de Excel: id, nombre, categoria, precio, imagen, nuevo, descripcion
            const producto = {
                id: columnas[0]?.replace(/"/g, '').trim(),
                nombre: columnas[1]?.replace(/"/g, '').trim(),
                categoria: columnas[2]?.replace(/"/g, '').trim() || "General", 
                precio: columnas[3]?.replace(/"/g, '').trim(),
                imagen: columnas[4]?.replace(/"/g, '').trim(),
                nuevo: columnas[5]?.replace(/"/g, '').trim().toLowerCase(),
                descripcion: columnas[6]?.replace(/"/g, '').trim() || "Sin descripción disponible por el momento."
            };

            productosMemoria.push(producto);

            // Si la página no dibuja productos, saltamos el renderizado visual pero seguimos guardando en memoria
            if (!tieneContenedor) continue;

            // --- VALIDACIÓN DEL FILTRO DE CATEGORÍAS ---
            let debeMostrar = false;
            const catMinuscula = producto.categoria.toLowerCase();

            if (paginaActual === 'index.html' || paginaActual === '' || paginaActual === 'inicio.html') {
                debeMostrar = true; // El inicio muestra todo
            } else if (paginaActual === 'chucherias.html') {
                if (catMinuscula.includes('chuch') || catMinuscula.includes('snack') || catMinuscula.includes('chuche')) {
                    debeMostrar = true;
                }
            } else if (paginaActual === 'juguetes.html') {
                if (catMinuscula.includes('juguete')) debeMostrar = true;
            } else if (paginaActual === 'bebidas.html') {
                if (catMinuscula.includes('bebida') || catMinuscula.includes('refresco')) debeMostrar = true;
            } else if (paginaActual === 'cartas.html') {
                if (catMinuscula.includes('carta') || catMinuscula.includes('pokemon')) debeMostrar = true;
            } else if (paginaActual === 'papeleria.html') {
                if (catMinuscula.includes('papeleria')) debeMostrar = true;
            } else {
                debeMostrar = true; 
            }

            if (!debeMostrar) continue;

            // Creamos la tarjeta visual
            const card = document.createElement('div');
            card.className = 'producto-card';

            let badgeNuevoHTML = '';
            if (producto.nuevo === 'si' || producto.nuevo === 'sí' || producto.nuevo === 'yes' || producto.nuevo === 'true') {
                badgeNuevoHTML = `<span class="badge-nuevo">¡Nuevo!</span>`;
            }

            const imgUrl = producto.imagen ? producto.imagen : 'https://via.placeholder.com/300x220?text=Sin+Imagen';

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
        console.error("Error crítico en la carga:", error);
        if (document.getElementById('loading')) {
            document.getElementById('loading').innerText = 'Error al conectar con el kiosko.';
        }
    }
}

// --- FUNCIÓN: Abre la propia página/vista de especificaciones del producto ---
function verDetalleProducto(id) {
    const producto = productosMemoria.find(p => p.id === id);
    if (!producto) return;

    const modalImg = document.getElementById('modal-img-destino');
    const modalCat = document.getElementById('modal-cat-destino');
    const modalNom = document.getElementById('modal-nom-destino');
    const modalPre = document.getElementById('modal-pre-destino');
    const modalDesc = document.getElementById('modal-desc-destino');

    if (modalImg) modalImg.src = producto.imagen ? producto.imagen : 'https://via.placeholder.com/300x220?text=Sin+Imagen';
    if (modalImg) modalImg.alt = producto.nombre;
    if (modalCat) modalCat.innerText = producto.categoria.toUpperCase();
    if (modalNom) modalNom.innerText = producto.nombre;
    if (modalPre) modalPre.innerText = producto.precio;
    if (modalDesc) modalDesc.innerText = producto.descripcion;

    const modal = document.getElementById('modal-producto');
    if (modal) modal.classList.add('activo');
}

// --- FUNCIÓN: Escucha los clics para cerrar la ficha del producto ---
function configurarCierreModal() {
    const modal = document.getElementById('modal-producto');
    const btnCerrar = document.getElementById('cerrar-modal');

    if (modal && btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            modal.classList.remove('activo');
        });

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
        carrito.push({ ...prodMatch, bandwidth: 1, cantidad: 1 });
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
    await incrustarHeader();       
    await cargarProductos();       
    configurarCierreModal();       
});
