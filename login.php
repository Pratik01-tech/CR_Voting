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
    $mobileNumber = trim($_POST['mobile_number'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($mobileNumber) || empty($password)) {
        throw new Exception('Mobile number and password are required');
    }
    
    // Validate mobile number format
    if (!preg_match('/^[0-9]{10,15}$/', $mobileNumber)) {
        throw new Exception('Please enter a valid mobile number');
    }
    
    // Check if mobile number exists and verify password
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("
        SELECT id, full_name, mobile_number, password_hash, is_admin, is_verified 
        FROM users 
        WHERE mobile_number = ?
    ");
    $stmt->execute([$mobileNumber]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Invalid mobile number or password');
    }
    
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Invalid mobile number or password');
    }
    
    if (!$user['is_verified']) {
        throw new Exception('Account not verified. Please contact administrator.');
    }
    
    // Check if user has already voted
    $stmt = $conn->prepare("SELECT id FROM votes WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $hasVoted = $stmt->fetch();
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['mobile_number'] = $user['mobile_number'];
    $_SESSION['is_admin'] = $user['is_admin'];
    $_SESSION['has_voted'] = $hasVoted ? true : false;
    
    // Log login activity
    $stmt = $conn->prepare("
        INSERT INTO user_activity (user_id, activity_type, ip_address, created_at) 
        VALUES (?, 'login', ?, NOW())
    ");
    $stmt->execute([$user['id'], $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    
    if ($user['is_admin']) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin login successful!',
            'redirect' => '../admin/dashboard.php'
        ]);
    } else {
        if ($hasVoted) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful! You have already voted.',
                'redirect' => '../voting/results.php'
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful! You can now vote.',
                'redirect' => '../voting/vote.php'
            ]);
        }
    }
    
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
