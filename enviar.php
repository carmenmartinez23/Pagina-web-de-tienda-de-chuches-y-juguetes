<?php
// Validamos que el formulario haya sido enviado mediante método POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = strip_tags(trim($_POST['nombre']));
    $email = strip_tags(trim($_POST['email']));
    $mensaje = strip_tags(trim($_POST['mensaje']));

    $para = "kioskolahormiga@gmail.com";
    $asunto = "Nuevo mensaje de Pagina web La Hormiga de La Algaba";

    $contenido = "Nombre: $nombre\n";
    $contenido .= "Contacto: $email\n\n";
    $contenido .= "Mensaje:\n$mensaje";

    // Cabeceras para mejorar la entrega del correo
    $headers = "From: no-reply@lahormiga.com\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($para, $asunto, $contenido, $headers)) {
        echo "<script>alert('¡Mensaje enviado con éxito al Kiosko!'); window.location.href='contacto.php';</script>";
        exit;
    } else {
        echo "<script>alert('Error al enviar el mensaje. Inténtelo de nuevo.');</script>";
    }
}
?>