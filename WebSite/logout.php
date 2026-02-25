<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
// Изчистваме всички сесийни променливи
$_SESSION = array();

// Унищожаваме сесията
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

// Пренасочваме към началната страница
header("Location: index.php?lang=bg");
exit;
?>