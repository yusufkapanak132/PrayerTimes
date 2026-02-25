<?php
ob_start(); 

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'includes/config.php'; 

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$allowed_roles = ['admin', 'Admin', 'Administrator'];
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], $allowed_roles)) {
    die("Достъп отказан. Вашата текуща роля е: " . htmlspecialchars($_SESSION['role'] ?? 'Няма') . ". Изисква се администратор.");
}

$message = '';
$error = '';

// --- ИЗТРИВАНЕ НА ПОТРЕБИТЕЛ (PRG) ---
if (isset($_GET['delete_id'])) {
    $id = intval($_GET['delete_id']);
    
    if ($id == $_SESSION['user_id']) {
        $error_msg = "Не можете да изтриете собствения си профил!";
        header('Location: manage-users.php?error=' . urlencode($error_msg));
        exit;
    } else {
        try {
            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $message_msg = "Потребителят беше изтрит успешно.";
            header('Location: manage-users.php?message=' . urlencode($message_msg));
            exit;
        } catch (PDOException $e) {
            $error_msg = "Грешка при изтриване: " . $e->getMessage();
            header('Location: manage-users.php?error=' . urlencode($error_msg));
            exit;
        }
    }
}

// --- ДОБАВЯНЕ / РЕДАКТИРАНЕ (PRG) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $role = $_POST['role']; 
    $password = $_POST['password'];
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0; 
    $custom_user_id = trim($_POST['custom_user_id']); 

    if (empty($name) || empty($email) || empty($custom_user_id)) {
        $error = "Името, имейлът и потребителското ID са задължителни.";
    } else {
        try {
            if ($_POST['action'] === 'add') {
                if (empty($password)) {
                    throw new Exception("Паролата е задължителна за нови потребители.");
                }
                
                // Проверка за съществуващи потребители
                $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR user_id = ?");
                $stmt->execute([$email, $custom_user_id]);
                if ($stmt->fetch()) {
                    throw new Exception("Този имейл или потребителско ID вече съществува.");
                }

                // 1. ДОБАВЯНЕ НА ПОТРЕБИТЕЛ В ТАБЛИЦАТА users
                $hashed_pass = password_hash($password, PASSWORD_DEFAULT);
                $sql = "INSERT INTO users (name, email, role, password, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
                
                $stmt = $db->prepare($sql);
                $stmt->execute([$name, $email, $role, $hashed_pass, $custom_user_id]);
                
                // !!! --- КЛЮЧОВАТА ПРОМЯНА: ИЗПОЛЗВАМЕ $custom_user_id --- !!!
                $user_settings_fk = $custom_user_id;

                // 2. ДОБАВЯНЕ НА НАСТРОЙКИ ПО ПОДРАЗБИРАНЕ
                // Предполагаме, че таблицата е `settings`, а не `user_settings`, както беше преди.
                
                // Задаваме настройки по подразбиране:
                $default_contrast = 0;
                $default_large_text = 0;
                // Стойността 0 за daltonism, както в регистрационния код
                $default_daltonism = 0; 
                $default_city = 'София';
                $default_language = 'bg';

                $sql_settings = "
                    INSERT INTO settings 
                    (user_id, contrast, large_text, daltonism, city, language) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ";
                
                $stmt_settings = $db->prepare($sql_settings);
                $stmt_settings->execute([
                    $user_settings_fk, // ИЗПОЛЗВАМЕ user_id ОТ ФОРМУЛЯРА, което се вкарва в users.user_id
                    $default_contrast, 
                    $default_large_text, 
                    $default_daltonism, 
                    $default_city, 
                    $default_language
                ]);
                
                // !!! ----------------------------------------- !!!

                $message_msg = "Потребителят и настройките са добавени успешно!";

            // РЕДАКТИРАНЕ (EDIT)
            } elseif ($_POST['action'] === 'edit') {
                
                if (!empty($password)) {
                    $hashed_pass = password_hash($password, PASSWORD_DEFAULT);
                    $sql = "UPDATE users SET name = ?, email = ?, role = ?, password = ?, user_id = ? WHERE id = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$name, $email, $role, $hashed_pass, $custom_user_id, $id]);
                } else {
                    $sql = "UPDATE users SET name = ?, email = ?, role = ?, user_id = ? WHERE id = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$name, $email, $role, $custom_user_id, $id]);
                }
                $message_msg = "Данните са обновени!";
            }
            
            header('Location: manage-users.php?message=' . urlencode($message_msg));
            exit;
            
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
    }
}

if (isset($_GET['message'])) {
    $message = htmlspecialchars($_GET['message']);
}
if (isset($_GET['error'])) {
    $error = htmlspecialchars($_GET['error']);
}
?>

<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление на потребители</title>
    <link rel="stylesheet" href="css/manage-users.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        #usersTableBody {
            transition: opacity 0.3s ease;
        }
        #usersTableBody.loading {
            opacity: 0.5;
            pointer-events: none;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header-flex">
        <div>
            <h1>Управление на потребители</h1>
            <a href="admin-dashboard.php" class="btn btn-back" style="margin-top: 5px;">
                <i class="fas fa-arrow-left"></i> Обратно към таблото
            </a>
        </div>
        <button class="btn btn-add" onclick="openModal('add')">
            <i class="fas fa-plus"></i> Добави нов
        </button>
    </div>

    <?php if ($message): ?>
        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <?php echo htmlspecialchars($message); ?>
        </div>
    <?php endif; ?>
    <?php if ($error): ?>
        <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>
    
    <div class="search-form" style="margin-bottom: 20px;">
        <input type="text" id="searchNameInput" placeholder="Търсене по име в реално време..." 
               style="padding: 10px; width: 400px; border: 1px solid #ccc; border-radius: 4px;">
    </div>

    <div style="overflow-x: auto;">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Потребителско ID</th>
                    <th>Име (Name)</th>
                    <th>Email</th>
                    <th>Роля</th>
                    <th>Парола (Хеширана)</th>
                    <th>Създаден на</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody id="usersTableBody">
                <tr><td colspan='8' style="text-align: center;">Зареждане на потребители...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<div id="userModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h2 id="modalTitle">Добави потребител</h2>
        
        <form method="POST" action="manage-users.php">
            <input type="hidden" name="id" id="userId">
            <input type="hidden" name="action" id="formAction" value="add">

            <div class="form-group">
                <label>Потребителско ID (User ID):</label>
                <input type="text" name="custom_user_id" id="userCustomId" required>
            </div>

            <div class="form-group">
                <label>Име (Name):</label>
                <input type="text" name="name" id="userName" required>
            </div>

            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" id="userEmail" required>
            </div>

            <div class="form-group">
                <label>Роля:</label>
                <select name="role" id="userRole">
                    <option value="User">User (Потребител)</option>
                    <option value="Administrator">Administrator (Администратор)</option>
                </select>
            </div>

            <div class="form-group">
                <label id="passwordLabel">Парола:</label>
                <input type="password" name="password" id="userPassword" placeholder="Въведи парола">
                <small id="passwordHelp" style="color: #666; display:none;">Остави празно, за да запазиш текущата.</small>
            </div>

            <div class="modal-footer">
                <button type="submit" class="btn btn-save">Запиши</button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('userModal');
    const formAction = document.getElementById('formAction');
    const modalTitle = document.getElementById('modalTitle');
    
    const recordIdInput = document.getElementById('userId'); 
    const customIdInput = document.getElementById('userCustomId'); 
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const roleInput = document.getElementById('userRole');
    const passwordInput = document.getElementById('userPassword');
    const passwordHelp = document.getElementById('passwordHelp');

    function openModal(mode, data = null) {
        modal.style.display = "block";
        
        if (mode === 'add') {
            modalTitle.innerText = "Добави нов потребител";
            formAction.value = "add";
            
            recordIdInput.value = "";
            customIdInput.value = "";
            nameInput.value = "";
            emailInput.value = "";
            roleInput.value = "User";
            
            passwordInput.value = "";
            passwordInput.required = true;
            passwordInput.placeholder = "Въведи парола";
            passwordHelp.style.display = "none";
            
        } else if (mode === 'edit') {
            modalTitle.innerText = "Редактирай потребител";
            formAction.value = "edit";
            
            recordIdInput.value = data.id;
            customIdInput.value = data.custom_user_id;
            nameInput.value = data.name; 
            emailInput.value = data.email;
            roleInput.value = data.role;
            
            passwordInput.value = "";
            passwordInput.required = false;
            passwordInput.placeholder = "Нова парола (опционално)";
            passwordHelp.style.display = "block";
        }
    }

    function closeModal() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
    
    const searchInput = document.getElementById('searchNameInput');
    const tableBody = document.getElementById('usersTableBody');
    let searchTimeout;

    function fetchUsers(searchTerm = '') {
        tableBody.classList.add('loading');
        
        // ДОБАВЕН: &t= + времеви отпечатък за избягване на кеширането
        const url = 'fetch-users.php?search=' + encodeURIComponent(searchTerm) + '&t=' + new Date().getTime();
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Проблем при комуникацията със сървъра: ' + response.statusText);
                }
                return response.text();
            })
            .then(html => {
                tableBody.innerHTML = html;
            })
            .catch(error => {
                console.error('AJAX грешка:', error);
                tableBody.innerHTML = `<tr><td colspan='8'>Грешка при зареждане на данни: ${error.message}</td></tr>`;
            })
            .finally(() => {
                tableBody.classList.remove('loading');
            });
    }

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            fetchUsers(this.value);
        }, 300); 
    });

    document.addEventListener('DOMContentLoaded', () => {
        fetchUsers();
    });
</script>

</body>
</html>