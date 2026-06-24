<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = strip_tags(trim($_POST['nombre']));
    $email = strip_tags(trim($_POST['email']));
    $mensaje = strip_tags(trim($_POST['mensaje']));

    $para = "kioskolahormiga@gmail.com";
    $asunto = "Nuevo mensaje de Pagina web La Hormiga de La Algaba";

    $contenido = "Nombre: $nombre\nContacto: $email\n\nMensaje:\n$mensaje";

    $headers = "From: no-reply@lahormiga.com\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Intentar enviar a MailHog
    mail($para, $asunto, $contenido, $headers);
    
    // Esto obligará a la página a avisarte que funcionó y recargarse
    echo "<script>alert('¡PHP ejecutado con éxito! Revisa MailHog.'); window.location.href='contacto.php';</script>";
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">    
    <link rel="shortcut icon" href="imagenes/logo.png" type="image/x-icon">
    <script src="script.js"></script>
    <link rel="stylesheet" href="styles.css">
    <title>Contacta con Nosotros - Kiosko La Hormiga</title>
    <style>
        :root { --azul: #0076bd; --rosa: #ff66b2; --rojo: #ff4d4d; --amarillo: #ffcc00; --blanco: #ffffff; --gris-oscuro: #333333; }
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
        nav { background-color: var(--blanco); box-shadow: 0 2px 10px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 1000; display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; }
        .nav-logo-container { display: flex; align-items: center; gap: 10px; }
        .nav-logo-mini { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--rojo); background-color: var(--amarillo); }
        .nav-title { font-weight: bold; color: var(--azul); font-size: 1.1rem; }
        .menu-links { display: flex; gap: 15px; list-style: none; margin: 0; padding: 0; }
        .menu-links a { text-decoration: none; color: var(--gris-oscuro); font-weight: 600; font-size: 0.95rem; padding: 8px 12px; border-radius: 8px; }
        .menu-links a:hover, .menu-links a.active { background-color: var(--azul); color: var(--blanco); }
        .menu-toggle { display: none; flex-direction: column; gap: 5px; cursor: pointer; }
        .menu-toggle span { width: 25px; height: 3px; background-color: var(--azul); }

        main { max-width: 600px; margin: 50px auto; padding: 0 20px; }
        .formulario-contacto { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-top: 5px solid var(--azul); }
        h1 { color: var(--azul); margin-bottom: 25px; text-align: center; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; }
        input, textarea { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; font-family: inherit; }
        input:focus, textarea:focus { border-color: var(--rosa); outline: none; }
        button { background-color: var(--rojo); color: white; border: none; padding: 12px 25px; font-weight: bold; border-radius: 25px; cursor: pointer; font-size: 1rem; width: 100%; transition: background 0.3s; }
        button:hover { background-color: var(--azul); }
        footer { text-align: center; padding: 20px; background-color: var(--gris-oscuro); color: var(--blanco); margin-top: 50px; }
        @media (max-width: 900px) { .menu-toggle { display: flex; } .menu-links { display: none; flex-direction: column; position: absolute; top: 60px; right: 20px; background-color: var(--blanco); box-shadow: 0 4px 15px rgba(0,0,0,0.15); border-radius: 8px; padding: 15px; width: 200px; } .menu-links.active { display: flex; } }
    </style>
</head>
<body>
<main>
    <div class="formulario-contacto">
        <h1>Cuéntanos qué necesitas</h1>
        <form action="contacto.php" method="POST">
            <div class="form-group">
                <label>Tu Nombre</label>
                <input type="text" name="nombre" required placeholder="Escribe tu nombre">
            </div>
            <div class="form-group">
                <label>Correo Electrónico o Teléfono</label>
                <input type="text" name="email" required placeholder="Cómo contactarte">
            </div>
            <div class="form-group">
                <label>¿Qué te gustaría decirnos?</label>
                <textarea name="mensaje" rows="5" required placeholder="Escribe aquí tu duda o encargo de productos..."></textarea>
            </div>
            <button type="submit">Enviar Mensaje</button>
        </form>
    </div>
</main>

<footer><p>&copy; 2026 Kiosko La Hormiga de La Algaba</p></footer>
<script>document.getElementById('mobile-menu').addEventListener('click', () => document.getElementById('nav-links').classList.toggle('active'));</script>
</body>
</html>
