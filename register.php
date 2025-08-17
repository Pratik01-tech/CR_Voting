<?php
session_start();
require_once 'config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(false, 'Invalid request method');
}

// Get form data
$fullName = isset($_POST['fullName']) ? sanitizeInput($_POST['fullName']) : '';
$mobile = isset($_POST['mobile']) ? sanitizeInput($_POST['mobile']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

// Validate input
if (empty($fullName) || empty($mobile) || empty($password) || empty($confirmPassword)) {
    sendJSONResponse(false, 'Please fill in all fields');
}

if (strlen($fullName) < 2) {
    sendJSONResponse(false, 'Full name must be at least 2 characters long');
}

if (!validateMobile($mobile)) {
    sendJSONResponse(false, 'Please enter a valid mobile number');
}

if (!validatePassword($password)) {
    sendJSONResponse(false, 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
}

if ($password !== $confirmPassword) {
    sendJSONResponse(false, 'Passwords do not match');
}

// Check if mobile number already exists
try {
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Database connection failed');
    }

    $stmt = $pdo->prepare("SELECT id FROM voters WHERE mobile = ?");
    $stmt->execute([$mobile]);
    if ($stmt->fetch()) {
        sendJSONResponse(false, 'Mobile number already registered');
    }

} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    sendJSONResponse(false, 'An error occurred during registration. Please try again.');
}

// Handle file upload
$voterCardImage = '';
if (isset($_FILES['voterCard']) && $_FILES['voterCard']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['voterCard'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        sendJSONResponse(false, 'Please upload a valid image file (JPEG, PNG, or GIF)');
    }
    
    // Validate file size (5MB limit)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendJSONResponse(false, 'Voter ID card image must be less than 5MB');
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'voter_' . time() . '_' . uniqid() . '.' . $extension;
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/voter_cards/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filepath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $voterCardImage = 'uploads/voter_cards/' . $filename;
    } else {
        sendJSONResponse(false, 'Failed to upload voter ID card image');
    }
} else {
    sendJSONResponse(false, 'Please upload your voter ID card image');
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    // Insert new voter
    $stmt = $pdo->prepare("INSERT INTO voters (full_name, mobile, password, voter_card_image) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$fullName, $mobile, $hashedPassword, $voterCardImage]);
    
    if ($result) {
        $voterId = $pdo->lastInsertId();
        
        // Log successful registration
        error_log("New voter registered: ID=$voterId, Mobile=$mobile, Name=$fullName");
        
        sendJSONResponse(true, 'Registration successful! You can now login with your mobile number and password');
    } else {
        sendJSONResponse(false, 'Registration failed. Please try again.');
    }
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    
    // Delete uploaded file if database insertion fails
    if ($voterCardImage && file_exists('../' . $voterCardImage)) {
        unlink('../' . $voterCardImage);
    }
    
    sendJSONResponse(false, 'An error occurred during registration. Please try again.');
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    
    // Delete uploaded file if registration fails
    if ($voterCardImage && file_exists('../' . $voterCardImage)) {
        unlink('../' . $voterCardImage);
    }
    
    sendJSONResponse(false, 'An unexpected error occurred. Please try again.');
}
?>
