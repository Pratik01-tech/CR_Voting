<?php
session_start();
require_once 'config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(false, 'Invalid request method');
}

// Check if user is logged in
if (!isset($_SESSION['voter_id'])) {
    sendJSONResponse(false, 'Please login to vote');
}

// Get form data
$candidateId = isset($_POST['candidate_id']) ? (int)$_POST['candidate_id'] : 0;
$voterId = $_SESSION['voter_id'];

// Validate input
if ($candidateId <= 0) {
    sendJSONResponse(false, 'Invalid candidate selected');
}

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Database connection failed');
    }

    // Check if voting is active
    if (!isVotingActive()) {
        sendJSONResponse(false, 'Voting is currently not active');
    }

    // Check if voter has already voted
    $stmt = $pdo->prepare("SELECT id FROM votes WHERE voter_id = ?");
    $stmt->execute([$voterId]);
    if ($stmt->fetch()) {
        sendJSONResponse(false, 'You have already voted in this election');
    }

    // Verify candidate exists
    $stmt = $pdo->prepare("SELECT id, name, position FROM candidates WHERE id = ?");
    $stmt->execute([$candidateId]);
    $candidate = $stmt->fetch();
    
    if (!$candidate) {
        sendJSONResponse(false, 'Invalid candidate selected');
    }

    // Begin transaction
    $pdo->beginTransaction();

    try {
        // Record the vote
        $stmt = $pdo->prepare("INSERT INTO votes (voter_id, candidate_id) VALUES (?, ?)");
        $result = $stmt->execute([$voterId, $candidateId]);
        
        if (!$result) {
            throw new Exception('Failed to record vote');
        }

        // Get voter information for logging
        $stmt = $pdo->prepare("SELECT full_name, mobile FROM voters WHERE id = ?");
        $stmt->execute([$voterId]);
        $voter = $stmt->fetch();

        // Log the vote
        error_log("Vote cast: Voter ID=$voterId, Name={$voter['full_name']}, Mobile={$voter['mobile']}, Candidate ID=$candidateId, Name={$candidate['name']}, Position={$candidate['position']}");

        // Commit transaction
        $pdo->commit();

        // Return success response
        sendJSONResponse(true, 'Vote cast successfully!', [
            'candidate' => [
                'id' => $candidate['id'],
                'name' => $candidate['name'],
                'position' => $candidate['position']
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $pdo->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    error_log("Vote casting error: " . $e->getMessage());
    sendJSONResponse(false, 'An error occurred while casting your vote. Please try again.');
} catch (Exception $e) {
    error_log("Vote casting error: " . $e->getMessage());
    sendJSONResponse(false, 'An unexpected error occurred. Please try again.');
}
?>
