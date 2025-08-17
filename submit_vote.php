<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['is_admin']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Check if user has already voted
if ($_SESSION['has_voted']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'You have already voted']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Validate input
    $candidateId = $_POST['candidate_id'] ?? '';
    
    if (empty($candidateId) || !is_numeric($candidateId)) {
        throw new Exception('Invalid candidate selection');
    }
    
    // Check if voting is active
    $db = new Database();
    $conn = $db->getConnection();
    
    $stmt = $conn->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'voting_active'");
    $stmt->execute();
    $votingActive = $stmt->fetch()['setting_value'] ?? 'false';
    
    if ($votingActive !== 'true') {
        throw new Exception('Voting is currently disabled');
    }
    
    // Check if candidate exists and is active
    $stmt = $conn->prepare("SELECT id, full_name FROM candidates WHERE id = ? AND is_active = 1");
    $stmt->execute([$candidateId]);
    $candidate = $stmt->fetch();
    
    if (!$candidate) {
        throw new Exception('Invalid candidate selected');
    }
    
    // Check if user has already voted (double-check)
    $stmt = $conn->prepare("SELECT id FROM votes WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    
    if ($stmt->fetch()) {
        throw new Exception('You have already voted');
    }
    
    // Begin transaction
    $conn->beginTransaction();
    
    try {
        // Insert vote
        $stmt = $conn->prepare("
            INSERT INTO votes (user_id, candidate_id, ip_address, voted_at) 
            VALUES (?, ?, ?, NOW())
        ");
        
        if (!$stmt->execute([$_SESSION['user_id'], $candidateId, $_SERVER['REMOTE_ADDR'] ?? 'unknown'])) {
            throw new Exception('Failed to record vote');
        }
        
        // Update total votes count
        $stmt = $conn->prepare("UPDATE system_settings SET setting_value = setting_value + 1 WHERE setting_key = 'total_votes'");
        $stmt->execute();
        
        // Update session
        $_SESSION['has_voted'] = true;
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Your vote has been recorded successfully!',
            'candidate' => $candidate['full_name']
        ]);
        
    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
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
