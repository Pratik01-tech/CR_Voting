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
    $fullName = trim($_POST['full_name'] ?? '');
    $mobileNumber = trim($_POST['mobile_number'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Input validation
    if (empty($fullName) || strlen($fullName) < 2) {
        throw new Exception('Full name must be at least 2 characters long');
    }
    
    if (empty($mobileNumber) || !preg_match('/^[0-9]{10,15}$/', $mobileNumber)) {
        throw new Exception('Please enter a valid mobile number');
    }
    
    if (empty($password) || strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }
    
    if ($password !== $confirmPassword) {
        throw new Exception('Passwords do not match');
    }
    
    // Check if mobile number already exists
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT id FROM users WHERE mobile_number = ?");
    $stmt->execute([$mobileNumber]);
    
    if ($stmt->fetch()) {
        throw new Exception('Mobile number already registered');
    }
    
    // Handle file upload
    $voterCardImage = null;
    if (isset($_FILES['voter_card_image']) && $_FILES['voter_card_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/voter_cards/';
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileInfo = pathinfo($_FILES['voter_card_image']['name']);
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (!in_array(strtolower($fileInfo['extension']), $allowedExtensions)) {
            throw new Exception('Only JPG, PNG, and GIF images are allowed');
        }
        
        if ($_FILES['voter_card_image']['size'] > 5 * 1024 * 1024) { // 5MB limit
            throw new Exception('File size must be less than 5MB');
        }
        
        $fileName = uniqid() . '_' . time() . '.' . $fileInfo['extension'];
        $uploadPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['voter_card_image']['tmp_name'], $uploadPath)) {
            $voterCardImage = 'uploads/voter_cards/' . $fileName;
        } else {
            throw new Exception('Failed to upload file');
        }
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user into database
    $stmt = $conn->prepare("
        INSERT INTO users (full_name, mobile_number, password_hash, voter_card_image, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    if ($stmt->execute([$fullName, $mobileNumber, $passwordHash, $voterCardImage])) {
        // Update total users count
        $stmt = $conn->prepare("UPDATE system_settings SET setting_value = setting_value + 1 WHERE setting_key = 'total_users'");
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful! You can now login.',
            'redirect' => '../index.php'
        ]);
    } else {
        throw new Exception('Failed to create user account');
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
