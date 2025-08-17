<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['is_admin']) {
    header('Location: ../index.php');
    exit;
}

// Check if user has already voted
if ($_SESSION['has_voted']) {
    header('Location: results.php');
    exit;
}

// Get candidates
$db = new Database();
$conn = $db->getConnection();
$candidates = [];
$systemSettings = [];

try {
    // Get active candidates
    $stmt = $conn->prepare("SELECT * FROM candidates WHERE is_active = 1 ORDER BY full_name");
    $stmt->execute();
    $candidates = $stmt->fetchAll();
    
    // Get system settings
    $stmt = $conn->prepare("SELECT setting_key, setting_value FROM system_settings");
    $stmt->execute();
    $settings = $stmt->fetchAll();
    
    foreach ($settings as $setting) {
        $systemSettings[$setting['setting_key']] = $setting['setting_value'];
    }
    
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
} finally {
    $db->closeConnection();
}

$votingActive = $systemSettings['voting_active'] ?? 'false';
$currentWinner = $systemSettings['current_winner'] ?? 'None';
$totalVotes = $systemSettings['total_votes'] ?? '0';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote - Online Voting System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/voting.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="voting-container">
        <!-- Top Banner -->
        <div class="top-banner">
            <div class="welcome-text">
                Welcome, <?php echo htmlspecialchars($_SESSION['full_name']); ?>!
            </div>
            <a href="../auth/logout.php" class="logout-btn">LOGOUT</a>
        </div>
        
        <!-- Voting Section -->
        <div class="voting-section">
            <h2>Vote for your favorite candidate:</h2>
            
            <?php if ($votingActive === 'true'): ?>
                <form id="votingForm" action="submit_vote.php" method="POST">
                    <div class="candidates-list">
                        <?php foreach ($candidates as $candidate): ?>
                            <div class="candidate-card">
                                <input type="radio" 
                                       id="candidate_<?php echo $candidate['id']; ?>" 
                                       name="candidate_id" 
                                       value="<?php echo $candidate['id']; ?>" 
                                       required>
                                <label for="candidate_<?php echo $candidate['id']; ?>">
                                    <?php echo htmlspecialchars($candidate['full_name']); ?>
                                </label>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <button type="submit" class="vote-btn">SUBMIT VOTE</button>
                </form>
            <?php else: ?>
                <div class="voting-disabled">
                    <i class="fas fa-clock"></i>
                    <p>Voting is currently disabled. Please wait for the administrator to start voting.</p>
                </div>
            <?php endif; ?>
        </div>
        
        <!-- Last Winner Section -->
        <div class="winner-section">
            <div class="winner-card">
                <h3>Last Winner:</h3>
                <div class="winner-name"><?php echo htmlspecialchars($currentWinner); ?></div>
            </div>
        </div>
        
        <!-- Winners List Section -->
        <div class="winners-section">
            <div class="winners-card">
                <h3>Winners List:</h3>
                <div class="winners-list">
                    <?php if ($currentWinner !== 'None'): ?>
                        <div class="winner-item">
                            <i class="fas fa-trophy"></i>
                            <span><?php echo htmlspecialchars($currentWinner); ?></span>
                        </div>
                    <?php else: ?>
                        <p>No winners yet.</p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <!-- Action Button -->
        <div class="action-section">
            <button class="clear-winners-btn" onclick="clearWinners()">
                CLEAR WINNERS LIST
            </button>
        </div>
    </div>

    <script src="../assets/js/voting.js"></script>
</body>
</html>
