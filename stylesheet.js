// 1. VARIABLES GLOBALES Y CONFIGURACIÓN
const EXCEL_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUgMPgD5ukTRTXZTpat3oy7muRP9O3Ko2G5AdGeaCN39GC7UAWjgObhK4Z5eJEPwiY1bMIK3yK7l2t/pub?output=csv';
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carritoHormiga')) || [];

// 2. INICIO DE LA APLICACIÓN
window.onload = function() {
    obtenerProductosDesdeExcel();
    if (document.getElementById('resumen-pago')) {
        mostrarTotalPago();
    }
};

// 3. CARGA DE DATOS (EXCEL)
async function obtenerProductosDesdeExcel() {
    try {
        const respuesta = await fetch(EXCEL_URL);
        const data = await respuesta.text();
        const filas = data.split('\n').slice(1);

        productos = filas.map((fila, index) => {
            const columnas = fila.split(',');
            return {
                ID: index + 1,
                Nombre: columnas[1],
                Descripcion: columnas[2],
                Unidades: columnas[3],
                Precio: parseFloat(columnas[4]),
                /*img: columnas[4] ? columnas[4].trim() : 'https://via.placeholder.com/400'
           */ };
        });

        console.log("Productos cargados:", productos);
        cargarProductos();
    } catch (error) {
        console.error("Error al leer el Excel:", error);
    }
}

// 4. RENDERIZADO DE LA WEB
function cargarProductos() {
    // A. Grid de la tienda
    const grid = document.getElementById('grid-productos');
    if (grid) {
        grid.innerHTML = "";
        productos.forEach(p => {
            if (parseInt(p.Unidades) > 0) {
                const card = document.createElement('div');
                card.className = 'producto-card';
                card.innerHTML = `
                <img src="${p.img}" class="producto-img" alt="${p.Nombre}">
                <div class="producto-info">
                    <h3>${p.Nombre}</h3>
                    <p style="font-size: 0.8rem; color: #666;">${p.Descripcion}</p>
                    <p style="font-size: 0.7rem;">Stock: ${p.Unidades} uds.</p>
                    <p class="precio">${p.Precio.toFixed(2)} €</p>
                    <button class="btn-comprar" onclick="agregarAlCarrito(${p.id})">Añadir al Carrito</button>
                </div>`;
                grid.appendChild(card);
            }
        });
    }

    // B. Lista de edición (carrito.html)
    const container = document.getElementById('lista-edicion');
    if (container) {
        container.innerHTML = carrito.length === 0 ? '<p style="text-align:center; padding:20px;">Tu carrito está vacío.</p>' : '';
        carrito.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            const subtotal = item.precio * item.cantidad;
            let opciones = '';
            for(let i = 1; i <= 10; i++) {
                opciones += `<option value="${i}" ${item.cantidad === i ? 'selected' : ''}>${i}</option>`;
            }
            itemDiv.innerHTML = `
                <div class="item-info">
                    <strong>${item.nombre}</strong>
                    <div style="font-size: 0.9rem; color: #666;">Subtotal: ${subtotal.toFixed(2)} €</div>
                </div>
                <div class="controles">
                    <label>Cant:</label>
                    <select class="select-cantidad" onchange="cambiarCantidad(${index}, this.value)">
                        ${opciones}
                    </select>
                    <button class="btn-del" onclick="borrar(${index})">Eliminar</button>
                </div>`;
            container.appendChild(itemDiv);
        });
    }
    actualizarCarritoUI();
}

// 5. LÓGICA DEL CARRITO
function agregarAlCarrito(id) {
    const pBase = productos.find(prod => prod.id === id);
    if (!pBase) return;
    const itemEnCarrito = carrito.find(item => item.id === id);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad += 1;
    } else {
        carrito.push({ ...pBase, cantidad: 1 });
    }
    actualizarStorage();
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const listado = document.getElementById('cart-items-list');
    const footer = document.getElementById('cart-footer');
    if (!listado) return;
    let totalItems = 0;
    let precioTotal = 0;

    if (carrito.length === 0) {
        listado.innerHTML = '<p style="text-align:center; color:#888;">Tu carrito está vacío</p>';
        if (footer) footer.style.display = 'none';
    } else {
        if (footer) footer.style.display = 'block';
        listado.innerHTML = '';
        carrito.forEach(item => {
            totalItems += item.cantidad;
            precioTotal += (item.Precio * item.cantidad);
            listado.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span>${item.Nombre} <b>x${item.cantidad}</b></span>
                    <span>${(item.Precio * item.cantidad).toFixed(2)} €</span>
                </div>`;
        });
        const totalElem = document.getElementById('total-price');
        if (totalElem) totalElem.innerText = precioTotal.toFixed(2) + " €";
    }
    const countElem = document.getElementById('cart-count');
    if (countElem) countElem.innerText = totalItems;
}

function cambiarCantidad(index, nuevaCantidad) {
    carrito[index].cantidad = parseInt(nuevaCantidad);
    actualizarStorage();
    actualizarCarritoUI();
    cargarProductos();
}

function borrar(index) {
    carrito.splice(index, 1);
    actualizarStorage();
    cargarProductos();
}

function actualizarStorage() {
    localStorage.setItem('carritoHormiga', JSON.stringify(carrito));
}

// 6. UI Y MENÚS
function toggleMenu(id) {
    const menu = document.getElementById(id);
    const otroId = id === 'dropdownMenu' ? 'dropdownCart' : 'dropdownMenu';
    const otroMenu = document.getElementById(otroId);
    if (otroMenu) otroMenu.classList.remove('show');
    if (menu) menu.classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.menu-icon') && !event.target.closest('.menu-container')) {
        const dM = document.getElementById('dropdownMenu');
        const dC = document.getElementById('dropdownCart');
        if (dM) dM.classList.remove('show');
        if (dC) dC.classList.remove('show');
    }
}

// 7. HEADER Y FOOTER DINÁMICO
function cargarHeader() {
    const headerHTML = `
        <header>
            <div class="menu-container">
                <div class="menu-icon" onclick="toggleMenu('dropdownMenu')">☰</div>
                <div id="dropdownMenu" class="menu-content">
                    <a href="index.html"> Inicio </a>
                    <a href="chucherias.html">🍬 Chucherías</a>
                    <a href="juguetes.html">🧸 Juguetes</a>
                    <a href="bebidas.html">🥤 Bebidas</a>
                    <a href="conocenos.html">🐜 Conócenos</a>
                    <a href="contactanos.html">📞 Contáctanos</a>
                </div>
            </div>
            <div class="logo">El Kiosko la Hormiga de la algaba</div>
            <div class="menu-container">
                <button class="btn-carrito" style="width: auto; padding: 10px 15px;" onclick="toggleMenu('dropdownCart')">
                    🛒 Carrito (<span id="cart-count">0</span>)
                </button>
                <div id="dropdownCart" class="menu-content" style="right: 0; left: auto; padding-left: 0; min-width: 280px;">
                    <div id="cart-items-list" style="padding: 15px; font-size: 16px;">
                        <p style="text-align:center; color:#888;">Tu carrito está vacío</p>
                    </div>
                    <div id="cart-footer" style="display: none; border-top: 1px solid #eee; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-bottom: 10px;">
                            <span>Total:</span>
                            <span id="total-price">0 €</span>
                        </div>
                        <button class="btn-comprar" onclick="window.location.href='carrito.html'">⚙️ Gestionar Pedido</button>
                    </div>
                </div>
            </div>
        </header>`;
    const footerHTML = `<footer><p>&copy; 2026 El Kiosko la Hormiga de la Algaba - Envíos a domicilio</p></footer>`;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('afterend', footerHTML);
    actualizarCarritoUI();
}
window.addEventListener('DOMContentLoaded', cargarHeader);

// 8. FUNCIONES DE PAGO
function mostrarDetalles(id) {
    document.querySelectorAll('.detalles-metodo').forEach(div => div.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function mostrarTotalPago() {
    const resumenElemento = document.getElementById('resumen-pago');
    if (resumenElemento) {
        let precioTotal = 0;
        carrito.forEach(item => { precioTotal += (item.precio * item.cantidad); });
        resumenElemento.innerText = `Total: ${precioTotal.toFixed(2)} €`;
    }
}

function procesarPedidoReal(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombre-cliente').value;
    const direccion = document.getElementById('direccion-cliente').value;
    const metodo = document.querySelector('input[name="pago"]:checked').value;

    if (metodo === 'bizum') {
        const telBizum = document.getElementById('telefono-bizum').value;
        enviarPedidoWhatsApp(nombre, direccion, "Bizum (" + telBizum + ")");
    } else if (metodo === 'tarjeta') {
        window.location.href = "https://buy.stripe.com/tu_enlace_de_pago";
    } else {
        window.location.href = "https://paypal.me/tu_usuario";
    }
}

function enviarPedidoWhatsApp(nombre, direccion, metodo) {
    let mensaje = `*NUEVO PEDIDO - LA HORMIGA*%0A*Cliente:* ${nombre}%0A*Dirección:* ${direccion}%0A*Pago:* ${metodo}%0A%0A*Productos:*%0A`;
    let totalPrecio = 0;
    carrito.forEach(item => {
        mensaje += `- ${item.nombre} x${item.cantidad} (${(item.precio * item.cantidad).toFixed(2)}€)%0A`;
        totalPrecio += (item.precio * item.cantidad);
    });
    mensaje += `%0A*Total: ${totalPrecio.toFixed(2)}€*`;
    window.open(`https://wa.me/34644481567?text=${mensaje}`, '_blank');
}
