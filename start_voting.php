<?php
session_start();
require_once '../../config/database.php';

header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Update voting status to active
    $stmt = $conn->prepare("UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'voting_active'");
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Voting system has been activated successfully!'
        ]);
    } else {
        throw new Exception('Failed to activate voting system');
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
