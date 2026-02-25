<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'prayer_times_db');

// ------------------------------
// 1) MYSQLI CONNECTION (your website already uses $conn)
// ------------------------------
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8");

} catch (Exception $e) {
    die("Database error (mysqli): " . $e->getMessage());
}

// ------------------------------
// 2) PDO CONNECTION (new system uses $db)
// ------------------------------
try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database error (PDO): " . $e->getMessage());
}

// ------------------------------
// Other settings
// ------------------------------
date_default_timezone_set('Europe/Sofia');

define('BASE_URL', 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']));
?>
