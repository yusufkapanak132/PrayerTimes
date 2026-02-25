<?php
ob_start();

// --- ПРЕДОТВРАТЯВАНЕ НА КЕШИРАНЕТО ---
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
// -------------------------------------

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'includes/config.php'; 

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    die("Невалидна сесия.");
}

$allowed_roles = ['admin', 'Admin', 'Administrator'];
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowed_roles)) {
    http_response_code(403);
    die("Достъп отказан. Изисква се администратор.");
}

$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
$users = [];
$sql_query = "SELECT * FROM users";
$params = [];

if (!empty($search_term)) {
    $sql_query .= " WHERE name LIKE ?";
    $params[] = '%' . $search_term . '%';
}

$sql_query .= " ORDER BY id ASC";

try {
    $stmt = $db->prepare($sql_query);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "<tr><td colspan='8'>Грешка при зареждане: " . htmlspecialchars($e->getMessage()) . "</td></tr>";
    exit;
}

if (empty($users)) {
    echo "<tr><td colspan='8'>Няма намерени потребители.</td></tr>";
    exit;
}

foreach ($users as $user) {
    $role = $user['role'] ?? 'user';
    $isAdmin = in_array($role, ['admin', 'Admin', 'Administrator']);
    $badgeClass = $isAdmin ? 'badge-admin' : 'badge-user';
    $currentUserId = $_SESSION['user_id'] ?? 0;

    echo "<tr>";
    echo "<td>" . htmlspecialchars($user['id']) . "</td>";
    echo "<td>" . htmlspecialchars($user['user_id'] ?? 'N/A') . "</td>";
    echo "<td>" . htmlspecialchars($user['name']) . "</td>";
    echo "<td>" . htmlspecialchars($user['email']) . "</td>";
    echo "<td><span class='badge $badgeClass'>" . htmlspecialchars($role) . "</span></td>";
    
    echo "<td title='Хеширана парола' style='font-size: 10px; font-family: monospace; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;'>";
    echo htmlspecialchars($user['password'] ?? 'Няма хеш') . "</td>";
    
    echo "<td>" . (isset($user['created_at']) ? date('d.m.Y', strtotime($user['created_at'])) : '-') . "</td>";
    
    echo "<td>";
    echo "  <button class='btn btn-edit' onclick=\"openModal('edit', {";
    echo "      id: '" . htmlspecialchars($user['id']) . "',";
    echo "      custom_user_id: '" . htmlspecialchars($user['user_id'] ?? '', ENT_QUOTES) . "',";
    echo "      name: '" . htmlspecialchars($user['name'], ENT_QUOTES) . "',";
    echo "      email: '" . htmlspecialchars($user['email'], ENT_QUOTES) . "',";
    echo "      role: '" . htmlspecialchars($user['role'] ?? 'user') . "'";
    echo "  })\">";
    echo "    <i class='fas fa-edit'></i>";
    echo "  </button>";

    if ($user['id'] != $currentUserId) {
        echo "  <a href='manage-users.php?delete_id=" . htmlspecialchars($user['id']) . "' ";
        echo "     class='btn btn-delete' onclick=\"return confirm('Сигурни ли сте, че искате да изтриете този потребител?');\">";
        echo "    <i class='fas fa-trash'></i>";
        echo "  </a>";
    } else {
        echo "  <span style='font-size: 12px; color: #999;'>(Ти)</span>";
    }
    echo "</td>";
    echo "</tr>";
}
?>