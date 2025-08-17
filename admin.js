// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initAdminDashboard();
});

function initAdminDashboard() {
    setupActionButtons();
    setupRealTimeUpdates();
}

// Action Button Setup
function setupActionButtons() {
    // Add loading states and click handlers
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.classList.contains('loading')) {
                e.preventDefault();
                return;
            }
            
            // Add loading state
            this.classList.add('loading');
            this.querySelector('.btn-title').textContent = 'PROCESSING...';
        });
    });
}

// Start Voting
function startVoting() {
    const btn = document.querySelector('.action-btn.start-voting');
    
    fetch('actions/start_voting.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            updateVotingStatus('Active');
            btn.classList.add('success');
            setTimeout(() => btn.classList.remove('success'), 3000);
        } else {
            showNotification(data.message, 'error');
            btn.classList.add('error');
            setTimeout(() => btn.classList.remove('error'), 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while starting voting', 'error');
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 3000);
    })
    .finally(() => {
        btn.classList.remove('loading');
        btn.querySelector('.btn-title').textContent = 'START VOTING';
    });
}

// End Voting
function endVoting() {
    const btn = document.querySelector('.action-btn.end-voting');
    
    if (!confirm('Are you sure you want to end voting? This will disable the voting system.')) {
        return;
    }
    
    fetch('actions/end_voting.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            updateVotingStatus('Inactive');
            btn.classList.add('success');
            setTimeout(() => btn.classList.remove('success'), 3000);
        } else {
            showNotification(data.message, 'error');
            btn.classList.add('error');
            setTimeout(() => btn.classList.remove('error'), 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while ending voting', 'error');
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 3000);
    })
    .finally(() => {
        btn.classList.remove('loading');
        btn.querySelector('.btn-title').textContent = 'END VOTING';
    });
}

// Show Results
function showResults() {
    const btn = document.querySelector('.action-btn.show-results');
    
    fetch('actions/show_results.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            updateCurrentWinner(data.winner);
            btn.classList.add('success');
            setTimeout(() => btn.classList.remove('success'), 3000);
        } else {
            showNotification(data.message, 'error');
            btn.classList.add('error');
            setTimeout(() => btn.classList.remove('error'), 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while showing results', 'error');
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 3000);
    })
    .finally(() => {
        btn.classList.remove('loading');
        btn.querySelector('.btn-title').textContent = 'SHOW RESULTS';
    });
}

// View Users
function viewUsers() {
    const btn = document.querySelector('.action-btn.view-users');
    
    // Redirect to users page
    window.location.href = 'users.php';
}

// Reset System
function resetSystem() {
    const btn = document.querySelector('.action-btn.reset-system');
    
    if (!confirm('Are you sure you want to reset the voting system? This will clear all votes and start a new round.')) {
        return;
    }
    
    fetch('actions/reset_system.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            updateMetrics();
            btn.classList.add('success');
            setTimeout(() => btn.classList.remove('success'), 3000);
        } else {
            showNotification(data.message, 'error');
            btn.classList.add('error');
            setTimeout(() => btn.classList.remove('error'), 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while resetting the system', 'error');
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 3000);
    })
    .finally(() => {
        btn.classList.remove('loading');
        btn.querySelector('.btn-title').textContent = 'RESET VOTING SYSTEM';
    });
}

// View History
function viewHistory() {
    const btn = document.querySelector('.action-btn.voting-history');
    
    // Redirect to history page
    window.location.href = 'history.php';
}

// Add Candidate
function addCandidate() {
    const btn = document.querySelector('.action-btn.add-candidate');
    
    // Redirect to add candidate page
    window.location.href = 'add_candidate.php';
}

// Clear All Data
function clearAllData() {
    const btn = document.querySelector('.action-btn.clear-data');
    
    if (!confirm('WARNING: This will delete ALL data including users, votes, and candidates. This action cannot be undone. Are you absolutely sure?')) {
        return;
    }
    
    if (!confirm('Final confirmation: This will permanently delete everything. Type "DELETE" to confirm.')) {
        return;
    }
    
    const confirmation = prompt('Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') {
        showNotification('Operation cancelled', 'warning');
        return;
    }
    
    fetch('actions/clear_all_data.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            updateMetrics();
            btn.classList.add('success');
            setTimeout(() => btn.classList.remove('success'), 3000);
        } else {
            showNotification(data.message, 'error');
            btn.classList.add('error');
            setTimeout(() => btn.classList.remove('error'), 3000);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while clearing data', 'error');
        btn.classList.add('error');
        setTimeout(() => btn.classList.remove('error'), 3000);
    })
    .finally(() => {
        btn.classList.remove('loading');
        btn.querySelector('.btn-title').textContent = 'CLEAR ALL DATA';
    });
}

// Update Functions
function updateVotingStatus(status) {
    const statusElement = document.querySelector('.metric-value');
    if (statusElement && statusElement.previousElementSibling.textContent === 'ACTIVE ROUND') {
        statusElement.textContent = status;
    }
}

function updateCurrentWinner(winner) {
    const winnerElement = document.querySelector('.metric-value');
    if (winnerElement && winnerElement.previousElementSibling.textContent === 'CURRENT WINNER') {
        winnerElement.textContent = winner;
    }
}

function updateMetrics() {
    // Refresh the page to get updated metrics
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Update metrics every 30 seconds
    setInterval(() => {
        updateMetricsFromServer();
    }, 30000);
}

function updateMetricsFromServer() {
    fetch('actions/get_metrics.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateMetricDisplay('total_users', data.metrics.total_users);
            updateMetricDisplay('total_votes', data.metrics.total_votes);
            updateMetricDisplay('current_winner', data.metrics.current_winner);
            updateMetricDisplay('voting_active', data.metrics.voting_active ? 'Active' : 'Inactive');
        }
    })
    .catch(error => {
        console.error('Metrics update error:', error);
    });
}

function updateMetricDisplay(metricType, value) {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '_');
        if (title === metricType) {
            const valueElement = card.querySelector('.metric-value');
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    // Set notification styles based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #2ed573, #7bed9f)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #ff4757, #ff6b7a)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #ffa502, #ffb142)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #4facfe, #00f2fe)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to start voting
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        startVoting();
    }
    
    // Ctrl/Cmd + E to end voting
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        endVoting();
    }
    
    // Ctrl/Cmd + R to show results
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        showResults();
    }
    
    // Ctrl/Cmd + U to view users
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        viewUsers();
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .action-btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
        pointer-events: none;
    }
    
    .action-btn.loading .btn-title {
        opacity: 0.5;
    }
    
    .action-btn.success {
        border-color: #2ed573 !important;
        background: rgba(46, 213, 115, 0.1) !important;
    }
    
    .action-btn.error {
        border-color: #ff4757 !important;
        background: rgba(255, 71, 87, 0.1) !important;
    }
`;
document.head.appendChild(style);
