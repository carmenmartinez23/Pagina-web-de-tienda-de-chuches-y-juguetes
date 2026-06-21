<?php

$nombre = $_POST['nombre'];
$email = $_POST['email'];
$mensaje = $_POST['mensaje'];

$para = "kioskolahormiga@gmail.com";
$asunto = "Nuevo mensaje de Pagina web La Hormiga de La Algaba";

$contenido =
"Nombre: $nombre\n".
"Email: $email\n\n".
"Mensaje:\n$mensaje";

mail($para, $asunto, $contenido);

echo "Formulario enviado correctamente.";

?>