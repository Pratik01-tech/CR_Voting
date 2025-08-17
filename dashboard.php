<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header('Location: ../index.php');
    exit;
}

// Get system statistics
$db = new Database();
$conn = $db->getConnection();
$stats = [];

try {
    // Get total users
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 0");
    $stmt->execute();
    $stats['total_users'] = $stmt->fetch()['count'];
    
    // Get total votes
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM votes");
    $stmt->execute();
    $stats['total_votes'] = $stmt->fetch()['count'];
    
    // Get current winner
    $stmt = $conn->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'current_winner'");
    $stmt->execute();
    $stats['current_winner'] = $stmt->fetch()['setting_value'] ?? 'None';
    
    // Get voting status
    $stmt = $conn->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'voting_active'");
    $stmt->execute();
    $stats['voting_active'] = $stmt->fetch()['setting_value'] ?? 'false';
    
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
} finally {
    $db->closeConnection();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Online Voting System</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/admin.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="admin-container">
        <!-- Header -->
        <div class="admin-header">
            <div class="header-left">
                <div class="user-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="header-text">
                    <h1>Admin Dashboard</h1>
                    <p>System Management & Analytics</p>
                </div>
            </div>
            <a href="../auth/logout.php" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                LOGOUT
            </a>
        </div>
        
        <!-- Metrics Overview -->
        <div class="metrics-section">
            <div class="metric-card">
                <div class="metric-icon users-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="metric-content">
                    <h3>TOTAL USERS</h3>
                    <div class="metric-value"><?php echo $stats['total_users']; ?></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon votes-icon">
                    <i class="fas fa-cube"></i>
                </div>
                <div class="metric-content">
                    <h3>TOTAL VOTES</h3>
                    <div class="metric-value"><?php echo $stats['total_votes']; ?></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon winner-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="metric-content">
                    <h3>CURRENT WINNER</h3>
                    <div class="metric-value"><?php echo htmlspecialchars($stats['current_winner']); ?></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-icon active-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="metric-content">
                    <h3>ACTIVE ROUND</h3>
                    <div class="metric-value"><?php echo $stats['voting_active'] === 'true' ? 'Active' : 'Inactive'; ?></div>
                </div>
            </div>
        </div>
        
        <!-- System Actions -->
        <div class="actions-section">
            <div class="section-header">
                <i class="fas fa-cogs"></i>
                <h2>SYSTEM ACTIONS</h2>
            </div>
            
            <div class="actions-grid">
                <!-- Row 1 -->
                <button class="action-btn start-voting" onclick="startVoting()">
                    <div class="btn-icon">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">START VOTING</div>
                        <div class="btn-subtitle">ACTIVATE VOTING SYSTEM</div>
                    </div>
                </button>
                
                <button class="action-btn end-voting" onclick="endVoting()">
                    <div class="btn-icon">
                        <i class="fas fa-stop"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">END VOTING</div>
                        <div class="btn-subtitle">DEACTIVATE VOTING SYSTEM</div>
                    </div>
                </button>
                
                <!-- Row 2 -->
                <button class="action-btn show-results" onclick="showResults()">
                    <div class="btn-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">SHOW RESULTS</div>
                        <div class="btn-subtitle">DISPLAY VOTING WINNER</div>
                    </div>
                </button>
                
                <button class="action-btn view-users" onclick="viewUsers()">
                    <div class="btn-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">VIEW ALL USERS</div>
                        <div class="btn-subtitle">SEE REGISTERED USERS</div>
                    </div>
                </button>
                
                <!-- Row 3 -->
                <button class="action-btn reset-system" onclick="resetSystem()">
                    <div class="btn-icon">
                        <i class="fas fa-undo"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">RESET VOTING SYSTEM</div>
                        <div class="btn-subtitle">START A NEW VOTING ROUND</div>
                    </div>
                </button>
                
                <button class="action-btn voting-history" onclick="viewHistory()">
                    <div class="btn-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">VOTING HISTORY</div>
                        <div class="btn-subtitle">COMPLETE VOTE RECORDS</div>
                    </div>
                </button>
                
                <!-- Row 4 -->
                <button class="action-btn add-candidate" onclick="addCandidate()">
                    <div class="btn-icon">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">ADD CR MEMBER</div>
                        <div class="btn-subtitle">REGISTER NEW CANDIDATE</div>
                    </div>
                </button>
                
                <!-- Bottom Row - Full Width -->
                <button class="action-btn clear-data" onclick="clearAllData()">
                    <div class="btn-icon">
                        <i class="fas fa-trash"></i>
                    </div>
                    <div class="btn-content">
                        <div class="btn-title">CLEAR ALL DATA</div>
                        <div class="btn-subtitle">DELETE EVERYTHING</div>
                    </div>
                </button>
            </div>
        </div>
    </div>

    <script src="../assets/js/admin.js"></script>
</body>
</html>
