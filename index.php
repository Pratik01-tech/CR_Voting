<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Voting System</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Online Voting System</h1>
        </div>
        
        <div class="panels-container">
            <!-- Register Panel -->
            <div class="panel">
                <h2>Register</h2>
                <form id="registerForm" action="auth/register.php" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="fullName">FULL NAME</label>
                        <input type="text" id="fullName" name="full_name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="mobileNumber">MOBILE NUMBER</label>
                        <input type="tel" id="mobileNumber" name="mobile_number" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">PASSWORD</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">CONFIRM PASSWORD</label>
                        <input type="password" id="confirmPassword" name="confirm_password" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="voterCard">VOTER CARD IMAGE</label>
                        <div class="file-input-wrapper">
                            <input type="file" id="voterCard" name="voter_card_image" accept="image/*">
                            <span class="file-text">No file chosen</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">REGISTER</button>
                </form>
            </div>
            
            <!-- Login Panel -->
            <div class="panel">
                <h2>Login</h2>
                <form id="loginForm" action="auth/login.php" method="POST">
                    <div class="form-group">
                        <label for="loginMobile">MOBILE NUMBER</label>
                        <input type="tel" id="loginMobile" name="mobile_number" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="loginPassword">PASSWORD</label>
                        <input type="password" id="loginPassword" name="password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">LOGIN</button>
                </form>
                
                <div class="footer-link">
                    <p>Don't have an account? <a href="#" onclick="showPanel('register')">Register here</a></p>
                </div>
            </div>
            
            <!-- Admin Panel -->
            <div class="panel">
                <div class="admin-icon">
                    <i class="fas fa-user-shield"></i>
                </div>
                <h2>Admin Panel</h2>
                <form id="adminForm" action="auth/admin_login.php" method="POST">
                    <div class="form-group">
                        <label for="adminId">ADMIN ID</label>
                        <input type="text" id="adminId" name="admin_id" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="adminPassword">ADMIN PASSWORD</label>
                        <input type="password" id="adminPassword" name="admin_password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">LOGIN TO ADMIN PANEL</button>
                </form>
                
                <div class="footer-link">
                    <a href="#" onclick="showPanel('login')"><i class="fas fa-arrow-left"></i> Back to User Login</a>
                </div>
            </div>
        </div>
    </div>

    <script src="assets/js/main.js"></script>
</body>
</html>
