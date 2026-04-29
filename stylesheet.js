function cargarHeader() {
    const headerHTML = `

        <!-- HEADER -->
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
        
            <!-- BOTON CARRITO (HEADER)  -->
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
        </header>
    `;
    const footerHTML = `
    <!-- FOOTER -->
    <footer>
        <p>&copy; 2026 El Kiosko la Hormiga de la Algaba - Envíos a domicilio</p>
    </footer>
    `;
// Insertamos el header al principio del body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('afterend', footerHTML);

    // Llamamos a la función para actualizar el numerito del carrito al cargar
    actualizarCarritoUI();
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', cargarHeader);

// Usamos localStorage para que el carrito persista entre páginas
let carrito = JSON.parse(localStorage.getItem('carritoHormiga')) || [];

function toggleMenu(id) {
    const menu = document.getElementById(id);
    const otroId = id === 'dropdownMenu' ? 'dropdownCart' : 'dropdownMenu';
    document.getElementById(otroId).classList.remove('show');
    menu.classList.toggle("show");
}

// Cerrar si clicamos fuera
window.onclick = function(event) {
    if (!event.target.matches('.menu-icon') && !event.target.closest('.menu-container')) {
        document.getElementById('dropdownMenu').classList.remove('show');
        document.getElementById('dropdownCart').classList.remove('show');
    }
}

const productos = [
    { id: 1, nombre: "Pack Mega Chuches", precio: 12.50, img: "https://images.unsplash.com/photo-1582050058244-4e1804c21e75?w=400" },
    { id: 2, nombre: "Peluche Hormiga", precio: 15.99, img: "https://images.unsplash.com/photo-1559449132-bf85a49083d9?w=400" },
    { id: 3, nombre: "Granizado de Fresa", precio: 3.50, img: "https://images.unsplash.com/photo-1553106972-e9119588521c?w=400" }
];

function cargarProductos() {
    // 1. Lógica para la GRID de ventas (Index, Chucherías, etc.)
    const grid = document.getElementById('grid-productos');
    if (grid) {
        grid.innerHTML = "";
        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <img src="${p.img}" class="producto-img" alt="producto">
                <div class="producto-info">
                    <h3>${p.nombre}</h3>
                    <p class="precio">${p.precio.toFixed(2)} €</p>
                    <button class="btn-comprar" onclick="agregarAlCarrito(${p.id})">Añadir al Carrito</button>
                </div>`;
            grid.appendChild(card);
        });
    }

    // 2. Lógica para la LISTA DE EDICIÓN (Solo en carrito.html)
    const container = document.getElementById('lista-edicion');
    if (container) {
        container.innerHTML = carrito.length === 0 ? '<p style="text-align:center; padding:20px;">Tu carrito está vacío.</p>' : '';

        carrito.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            // --- CÁLCULO DEL PRECIO TOTAL POR PRODUCTO ---
            const subtotal = item.precio * item.cantidad;

            let opciones = '';
            for(let i = 1; i <= 10; i++) {
                opciones += `<option value="${i}" ${item.cantidad === i ? 'selected' : ''}>${i}</option>`;
            }

            itemDiv.innerHTML = `
                <div class="item-info">
                    <strong>${item.nombre}</strong>
                    <div style="font-size: 0.9rem; color: #666;">
                        Subtotal: ${subtotal.toFixed(2)} €
                    </div>
                </div>
                <div class="controles">
                    <label>Cant:</label>
                    <select class="select-cantidad" onchange="cambiarCantidad(${index}, this.value)">
                        ${opciones}
                    </select>
                    <button class="btn-del" onclick="borrar(${index})">Eliminar</button>
                </div>
            `;
            container.appendChild(itemDiv);
        });
    }

    // Siempre actualizamos el numerito del header
    actualizarCarritoUI();
}

function agregarAlCarrito(id) {
    const pBase = productos.find(prod => prod.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad += 1;
    } else {
        carrito.push({ ...pBase, cantidad: 1 });
    }

    localStorage.setItem('carritoHormiga', JSON.stringify(carrito));
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const listado = document.getElementById('cart-items-list');
    const footer = document.getElementById('cart-footer');
    let totalItems = 0;
    let precioTotal = 0;

    if (carrito.length === 0) {
        listado.innerHTML = '<p style="text-align:center; color:#888;">Tu carrito está vacío</p>';
        footer.style.display = 'none';
    } else {
        footer.style.display = 'block';
        listado.innerHTML = '';
        carrito.forEach(item => {
            totalItems += item.cantidad;
            precioTotal += (item.precio * item.cantidad);
            listado.innerHTML += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span>${item.nombre} <b>x${item.cantidad}</b></span>
                        <span>${(item.precio * item.cantidad).toFixed(2)} €</span>
                    </div>`;
        });
        document.getElementById('total-price').innerText = precioTotal.toFixed(2) + " €";
    }
    document.getElementById('cart-count').innerText = totalItems;
}

// Función para actualizar la cantidad cuando se elige en el menú
function cambiarCantidad(index, nuevaCantidad) {
    carrito[index].cantidad = parseInt(nuevaCantidad);
    actualizarStorage();
    actualizarCarritoUI();
    cargarProductos();
}
function borrar(index) {
    carrito.splice(index, 1);
    actualizarStorage();
    cargarProductos(); // Volvemos a dibujar la lista
}

function actualizarStorage() {
    localStorage.setItem('carritoHormiga', JSON.stringify(carrito));
}

window.onload = cargarProductos;

function mostrarDetalles(id) {
    // Ocultamos todos los detalles primero
    document.querySelectorAll('.detalles-metodo').forEach(div => {
        div.classList.remove('active');
    });
    // Mostramos solo el que nos interesa
    document.getElementById(id).classList.add('active');
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
        // Aquí pondrías tu enlace de Stripe real
        window.location.href = "https://buy.stripe.com/tu_enlace_de_pago";
    } else {
        alert("Redirigiendo a PayPal...");
        window.location.href = "https://paypal.me/tu_usuario";
    }
}

function enviarPedidoWhatsApp(nombre, direccion, metodo) {
    let mensaje = `*NUEVO PEDIDO - LA HORMIGA*%0A`;
    mensaje += `*Cliente:* ${nombre}%0A`;
    mensaje += `*Dirección:* ${direccion}%0A`;
    mensaje += `*Pago:* ${metodo}%0A%0A`;
    mensaje += `*Productos:*%0A`;

    // Asumimos que tienes la variable 'carrito' cargada de localStorage
    carrito.forEach(item => {
        mensaje += `- ${item.nombre} x${item.cantidad} (${(item.precio * item.cantidad).toFixed(2)}€)%0A`;
    });

    const total = document.getElementById('resumen-pago').innerText;
    mensaje += `%0A*${total}*`;

    window.open(`https://wa.me/34644481567?text=${mensaje}`, '_blank');
}
