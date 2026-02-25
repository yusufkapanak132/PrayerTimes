<?php
// manage-orders.php

ob_start(); 

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'includes/config.php'; 

// --- СИГУРНОСТ ---
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$allowed_roles = ['admin', 'Admin', 'Administrator'];
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowed_roles)) {
    die("Достъп отказан. Изисква се администратор.");
}
// -----------------

$message = '';
$error = '';
$orders = [];

// --- ДЕФИНИРАНИ СТАТУСИ ЗА ПОКАЗВАНЕ И ФИЛТРИРАНЕ ---
// Промяна: Одобрена -> Потвърдена
$status_options = ['Потвърдена', 'Изпратена', 'Доставена', 'Получена', 'Анулирана'];
$valid_statuses_sql = "'" . implode("','", $status_options) . "'";
// -----------------------------------------------------

// --- ОБРАБОТКА НА СЪОБЩЕНИЯ (след PRG) ---
if (isset($_GET['message'])) {
    $message = htmlspecialchars($_GET['message']);
}
if (isset($_GET['error'])) {
    $error = htmlspecialchars($_GET['error']);
}

// --- ИЗТРИВАНЕ НА ПОРЪЧКА ---
if (isset($_GET['delete_id'])) {
    $id = intval($_GET['delete_id']);
    
    try {
        $stmt = $db->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $message_msg = "Поръчка №" . $id . " беше изтрита успешно.";
        header('Location: manage-orders.php?message=' . urlencode($message_msg));
        exit;
    } catch (PDOException $e) {
        $error_msg = "Грешка при изтриване: " . $e->getMessage();
        header('Location: manage-orders.php?error=' . urlencode($error_msg));
        exit;
    }
}

// --- ИЗВЛИЧАНЕ НА ПОРЪЧКИТЕ (С ФИЛТРИРАНЕ И ОБРАТЕН РЕД) ---
try {
    // Филтриране само по желаните статуси и сортиране по ID във възходящ ред (най-старите първо)
    $sql_query = "SELECT * FROM orders WHERE status IN ($valid_statuses_sql) ORDER BY id ASC";
    
    $stmt = $db->prepare($sql_query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $error = "Грешка при зареждане на поръчките: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление на поръчки</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
        .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-back { background-color: #6c757d; color: white; }
        .btn-delete { background-color: #dc3545; color: white; margin-left: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #007bff; color: white; font-size: 14px; }
        td { font-size: 13px; vertical-align: top; }
        select.status-select { padding: 5px; border-radius: 3px; border: 1px solid #ccc; font-size: 13px; width: 120px; }
        .items-list { font-size: 11px; white-space: pre-wrap; max-width: 250px; }
        
        /* --- CSS СТАТУСИ (ОБНОВЕНИ) --- */
        .status-Потвърдена { background-color: #d1ecf1; color: #0c5460; font-weight: bold; }
        .status-Изпратена { background-color: #fff3cd; color: #856404; }
        .status-Доставена { background-color: #d4edda; color: #155724; }
        .status-Получена { background-color: #c3e6cb; color: #28a745; font-weight: bold; }
        .status-Анулирана { background-color: #f8d7da; color: #721c24; }
        /* ------------------------------- */

        .loading { opacity: 0.5; pointer-events: none; }
    </style>
</head>
<body>

<div class="container">
    <div class="header-flex">
        <div>
            <h1>Управление на поръчки</h1>
            <a href="admin-dashboard.php" class="btn btn-back" style="margin-top: 5px;">
                <i class="fas fa-arrow-left"></i> Обратно към таблото
            </a>
        </div>
    </div>

    <?php if ($message): ?>
        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <?php echo $message; ?>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <?php echo $error; ?>
        </div>
    <?php endif; ?>
    
    <div style="overflow-x: auto;">
        <table id="ordersTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Номер</th>
                    <th>Клиент</th>
                    <th>Email / Тел.</th>
                    <th>Адрес / Град</th>
                    <th>Метод</th>
                    <th>Продукти</th>
                    <th>Общо</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($orders)): ?>
                    <tr><td colspan='11' style="text-align: center;">Няма налични поръчки.</td></tr>
                <?php else: ?>
                    <?php foreach ($orders as $order): ?>
                        <tr id="row-<?php echo $order['id']; ?>">
                            <td><?php echo htmlspecialchars($order['id']); ?></td>
                            <td><?php echo htmlspecialchars($order['order_number']); ?></td>
                            <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                            <td>
                                <?php echo htmlspecialchars($order['email']); ?><br>
                                <?php echo htmlspecialchars($order['phone']); ?>
                            </td>
                            <td>
                                <?php echo htmlspecialchars($order['address']); ?><br>
                                **<?php echo htmlspecialchars($order['city']); ?>**
                            </td>
                            <td><?php echo htmlspecialchars($order['delivery_method']); ?></td>
                            <td>
                                <div class="items-list"><?php 
                                    $items = $order['items'];
                                    if (!empty($items) && is_string($items)) {
                                        $items_array = json_decode($items, true);
                                        if (json_last_error() === JSON_ERROR_NONE && is_array($items_array)) {
                                            $item_display = '';
                                            foreach ($items_array as $item) {
                                                $item_display .= htmlspecialchars($item['name'] ?? 'N/A') . ' x ' . htmlspecialchars($item['qty'] ?? 1) . " (" . number_format($item['price'] ?? 0, 2) . " евро)\n";
                                            }
                                            echo nl2br(trim($item_display));
                                        } else {
                                            echo htmlspecialchars($items);
                                        }
                                    } else {
                                        echo htmlspecialchars($items);
                                    }
                                ?></div>
                            </td>
                            <td>**<?php echo number_format($order['total'], 2); ?> евро**</td>
                            <td><?php echo date('d.m.Y H:i', strtotime($order['order_date'])); ?></td>
                            <td>
                                <select 
                                    class="status-select status-<?php echo str_replace(' ', '\\ ', htmlspecialchars($order['status'])); ?>" 
                                    data-order-id="<?php echo $order['id']; ?>"
                                    onchange="updateStatus(this)">
                                    <?php foreach ($status_options as $status): ?>
                                        <option value="<?php echo htmlspecialchars($status); ?>" 
                                                <?php echo ($order['status'] == $status) ? 'selected' : ''; ?>>
                                            <?php echo htmlspecialchars($status); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </td>
                            <td>
                                <a href='manage-orders.php?delete_id=<?php echo $order['id']; ?>' 
                                   class='btn btn-delete' 
                                   onclick="return confirm('Сигурни ли сте, че искате да изтриете поръчка №<?php echo $order['order_number']; ?>?');">
                                    <i class='fas fa-trash'></i>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<script>
    function updateStatus(selectElement) {
        const orderId = selectElement.getAttribute('data-order-id');
        const newStatus = selectElement.value;
        const tableRow = document.getElementById(`row-${orderId}`);

        if (!confirm(`Сигурни ли сте, че искате да промените статуса на поръчка №${orderId} на "${newStatus}"?`)) {
            location.reload(); 
            return;
        }

        if (tableRow) {
            tableRow.classList.add('loading');
        }
        
        fetch('update-order-status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `order_id=${encodeURIComponent(orderId)}&new_status=${encodeURIComponent(newStatus)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Статусът на поръчка №${orderId} е променен на: ${newStatus}`);
                
                selectElement.className = 'status-select'; 
                const safeStatusClass = 'status-' + newStatus.replace(/ /g, '\\ ');
                selectElement.classList.add('status-select', safeStatusClass);
                
            } else {
                alert('Грешка при актуализиране на статуса: ' + data.message);
                location.reload(); 
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            alert('Грешка при комуникация със сървъра.');
            location.reload();
        })
        .finally(() => {
            if (tableRow) {
                tableRow.classList.remove('loading');
            }
        });
    }
</script>
</body>
</html>