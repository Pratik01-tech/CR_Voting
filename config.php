<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'voting_system');

// Create database connection
function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return false;
    }
}

// Initialize database tables
function initializeDatabase() {
    $pdo = getDBConnection();
    if (!$pdo) {
        return false;
    }

    try {
        // Create voters table
        $pdo->exec("CREATE TABLE IF NOT EXISTS voters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            mobile VARCHAR(15) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            voter_card_image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");

        // Create candidates table
        $pdo->exec("CREATE TABLE IF NOT EXISTS candidates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            position VARCHAR(100) NOT NULL,
            image VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Create votes table
        $pdo->exec("CREATE TABLE IF NOT EXISTS votes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            voter_id INT NOT NULL,
            candidate_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (voter_id) REFERENCES voters(id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(id),
            UNIQUE KEY unique_vote (voter_id)
        )");

        // Create voting_sessions table
        $pdo->exec("CREATE TABLE IF NOT EXISTS voting_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            status ENUM('active', 'inactive') DEFAULT 'inactive',
            start_time TIMESTAMP NULL,
            end_time TIMESTAMP NULL,
            duration_minutes INT DEFAULT 60,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Create system_settings table
        $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");

        // Insert default admin user
        $stmt = $pdo->prepare("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)");
        $stmt->execute(['admin_username', 'admin']);
        $stmt->execute(['admin_password', password_hash('admin123', PASSWORD_DEFAULT)]);

        // Insert sample candidates if table is empty
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM candidates");
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            $sampleCandidates = [
                ['John Doe', 'President', 'Experienced leader with strong communication skills'],
                ['Jane Smith', 'Vice President', 'Dedicated team player with excellent organizational skills'],
                ['Mike Johnson', 'Secretary', 'Detail-oriented professional with strong writing abilities'],
                ['Sarah Wilson', 'Treasurer', 'Finance expert with proven track record'],
                ['David Brown', 'General Member', 'Creative thinker with innovative ideas'],
                ['Emily Davis', 'General Member', 'Passionate advocate for student welfare']
            ];

            $stmt = $pdo->prepare("INSERT INTO candidates (name, position, description) VALUES (?, ?, ?)");
            foreach ($sampleCandidates as $candidate) {
                $stmt->execute($candidate);
            }
        }

        return true;
    } catch(PDOException $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Helper function to send JSON response
function sendJSONResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Helper function to validate mobile number
function validateMobile($mobile) {
    return preg_match('/^[0-9]{10,15}$/', $mobile);
}

// Helper function to validate password strength
function validatePassword($password) {
    return strlen($password) >= 8 && 
           preg_match('/[A-Z]/', $password) && 
           preg_match('/[a-z]/', $password) && 
           preg_match('/[0-9]/', $password) && 
           preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password);
}

// Helper function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

// Helper function to check if voting is active
function isVotingActive() {
    $pdo = getDBConnection();
    if (!$pdo) return false;

    try {
        $stmt = $pdo->prepare("SELECT status FROM voting_sessions WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute();
        $result = $stmt->fetch();
        return $result && $result['status'] === 'active';
    } catch(PDOException $e) {
        error_log("Error checking voting status: " . $e->getMessage());
        return false;
    }
}

// Initialize database when this file is included
if (php_sapi_name() === 'cli' || isset($_GET['init'])) {
    initializeDatabase();
}
?>
