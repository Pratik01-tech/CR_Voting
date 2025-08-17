<?php
session_start();
require_once 'config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSONResponse(false, 'Invalid request method');
}

// Get form data
$mobile = isset($_POST['mobile']) ? sanitizeInput($_POST['mobile']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validate input
if (empty($mobile) || empty($password)) {
    sendJSONResponse(false, 'Please fill in all fields');
}

if (!validateMobile($mobile)) {
    sendJSONResponse(false, 'Please enter a valid mobile number');
}

try {
    $pdo = getDBConnection();
    if (!$pdo) {
        sendJSONResponse(false, 'Database connection failed');
    }

    // Check if voter exists
    $stmt = $pdo->prepare("SELECT id, full_name, mobile, password, voter_card_image FROM voters WHERE mobile = ?");
    $stmt->execute([$mobile]);
    $voter = $stmt->fetch();

    if (!$voter) {
        sendJSONResponse(false, 'Invalid mobile number or password');
    }

    // Verify password
    if (!password_verify($password, $voter['password'])) {
        sendJSONResponse(false, 'Invalid mobile number or password');
    }

    // Check if voting is active
    if (!isVotingActive()) {
        sendJSONResponse(false, 'Voting is currently not active. Please try again later.');
    }

    // Check if voter has already voted
    $stmt = $pdo->prepare("SELECT id FROM votes WHERE voter_id = ?");
    $stmt->execute([$voter['id']]);
    if ($stmt->fetch()) {
        sendJSONResponse(false, 'You have already voted in this election');
    }

    // Start session and store voter data
    $_SESSION['voter_id'] = $voter['id'];
    $_SESSION['voter_name'] = $voter['full_name'];
    $_SESSION['voter_mobile'] = $voter['mobile'];
    $_SESSION['voter_card_image'] = $voter['voter_card_image'];

    // Return success response with voter data
    sendJSONResponse(true, 'Login successful', [
        'voter' => [
            'id' => $voter['id'],
            'name' => $voter['full_name'],
            'mobile' => $voter['mobile'],
            'voter_card_image' => $voter['voter_card_image']
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendJSONResponse(false, 'An error occurred during login. Please try again.');
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendJSONResponse(false, 'An unexpected error occurred. Please try again.');
}
?>
