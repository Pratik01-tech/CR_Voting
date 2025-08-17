// Voting Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initVotingPage();
});

function initVotingPage() {
    setupCandidateSelection();
    setupVotingForm();
    setupClearWinners();
}

// Candidate Selection
function setupCandidateSelection() {
    const candidateCards = document.querySelectorAll('.candidate-card');
    
    candidateCards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        const label = card.querySelector('label');
        
        // Add click handler to the entire card
        card.addEventListener('click', function() {
            // Unselect all other candidates
            candidateCards.forEach(c => {
                c.classList.remove('selected');
                c.querySelector('input[type="radio"]').checked = false;
            });
            
            // Select this candidate
            this.classList.add('selected');
            radio.checked = true;
            
            // Add visual feedback
            addSelectionEffect(this);
        });
        
        // Radio button change handler
        radio.addEventListener('change', function() {
            if (this.checked) {
                candidateCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                addSelectionEffect(card);
            }
        });
    });
}

function addSelectionEffect(card) {
    // Add pulse animation
    card.style.animation = 'pulse 0.6s ease';
    
    // Remove animation after it completes
    setTimeout(() => {
        card.style.animation = '';
    }, 600);
}

// Voting Form
function setupVotingForm() {
    const votingForm = document.getElementById('votingForm');
    
    if (votingForm) {
        votingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const selectedCandidate = document.querySelector('input[name="candidate_id"]:checked');
            
            if (!selectedCandidate) {
                showNotification('Please select a candidate to vote for', 'error');
                return;
            }
            
            // Confirm vote
            if (confirmVote()) {
                submitVote(selectedCandidate.value);
            }
        });
    }
}

function confirmVote() {
    const selectedCandidate = document.querySelector('input[name="candidate_id"]:checked');
    const candidateName = selectedCandidate.nextElementSibling.textContent;
    
    return confirm(`Are you sure you want to vote for ${candidateName}?\n\nThis action cannot be undone.`);
}

function submitVote(candidateId) {
    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    
    // Show loading state
    const submitBtn = document.querySelector('.vote-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;
    
    fetch('submit_vote.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Update session
            sessionStorage.setItem('hasVoted', 'true');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'results.php';
            }, 2000);
        } else {
            showNotification(data.message, 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while submitting your vote. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Clear Winners Functionality
function setupClearWinners() {
    const clearBtn = document.querySelector('.clear-winners-btn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the winners list? This action cannot be undone.')) {
                clearWinners();
            }
        });
    }
}

function clearWinners() {
    // Show loading state
    const clearBtn = document.querySelector('.clear-winners-btn');
    const originalText = clearBtn.textContent;
    clearBtn.textContent = 'CLEARING...';
    clearBtn.disabled = true;
    
    fetch('clear_winners.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            
            // Update the display
            updateWinnersDisplay();
            
            // Reset button
            clearBtn.textContent = originalText;
            clearBtn.disabled = false;
        } else {
            showNotification(data.message, 'error');
            clearBtn.textContent = originalText;
            clearBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while clearing winners. Please try again.', 'error');
        clearBtn.textContent = originalText;
        clearBtn.disabled = false;
    });
}

function updateWinnersDisplay() {
    const winnerName = document.querySelector('.winner-name');
    const winnersList = document.querySelector('.winners-list');
    
    if (winnerName) {
        winnerName.textContent = 'None';
    }
    
    if (winnersList) {
        winnersList.innerHTML = '<p>No winners yet.</p>';
    }
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

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .candidate-card.selected {
        border-color: #4facfe !important;
        background: rgba(79, 172, 254, 0.1) !important;
        box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3) !important;
    }
    
    .candidate-card.selected label {
        color: #4facfe !important;
        font-weight: 600 !important;
    }
    
    .vote-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
    }
    
    .clear-winners-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
    }
`;
document.head.appendChild(style);

// Real-time updates (optional)
function setupRealTimeUpdates() {
    // Check for voting status updates every 30 seconds
    setInterval(() => {
        checkVotingStatus();
    }, 30000);
}

function checkVotingStatus() {
    fetch('check_status.php')
    .then(response => response.json())
    .then(data => {
        if (data.voting_active === false) {
            // Redirect to results page if voting is disabled
            window.location.href = 'results.php';
        }
    })
    .catch(error => {
        console.error('Status check error:', error);
    });
}

// Initialize real-time updates
document.addEventListener('DOMContentLoaded', function() {
    setupRealTimeUpdates();
});
