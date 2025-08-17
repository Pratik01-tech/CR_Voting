<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Validate input data
    $adminId = trim($_POST['admin_id'] ?? '');
    $adminPassword = $_POST['admin_password'] ?? '';
    
    if (empty($adminId) || empty($adminPassword)) {
        throw new Exception('Admin ID and password are required');
    }
    
    // Check if admin credentials are valid
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("
        SELECT id, full_name, mobile_number, password_hash, is_admin 
        FROM users 
        WHERE (mobile_number = ? OR id = ?) AND is_admin = 1
    ");
    $stmt->execute([$adminId, $adminId]);
    $admin = $stmt->fetch();
    
    if (!$admin) {
        throw new Exception('Invalid admin credentials');
    }
    
    if (!password_verify($adminPassword, $admin['password_hash'])) {
        throw new Exception('Invalid admin credentials');
    }
    
    // Set admin session variables
    $_SESSION['user_id'] = $admin['id'];
    $_SESSION['full_name'] = $admin['full_name'];
    $_SESSION['mobile_number'] = $admin['mobile_number'];
    $_SESSION['is_admin'] = true;
    $_SESSION['admin_login_time'] = time();
    
    // Log admin login activity
    $stmt = $conn->prepare("
        INSERT INTO user_activity (user_id, activity_type, ip_address, created_at) 
        VALUES (?, 'admin_login', ?, NOW())
    ");
    $stmt->execute([$admin['id'], $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Admin login successful!',
        'redirect' => '../admin/dashboard.php'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again later.'
    ]);
} finally {
    if (isset($conn)) {
        $db->closeConnection();
    }
}
?>
