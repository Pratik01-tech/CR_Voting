document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminLogin = document.getElementById('adminLogin');
    const logoutAdmin = document.getElementById('logoutAdmin');
    const toggleAdminPassword = document.getElementById('toggleAdminPassword');
    const adminPasswordField = document.getElementById('adminPassword');
    const addCRMemberModal = document.getElementById('addCRMemberModal');
    const addCRMemberForm = document.getElementById('addCRMemberForm');
    const closeCRModal = document.getElementById('closeCRModal');

    // Initialize data from localStorage or use defaults
    initializeData();

    // Toggle admin password visibility
    toggleAdminPassword.addEventListener('click', function() {
        const type = adminPasswordField.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPasswordField.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Admin login form submission
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const adminId = document.getElementById('adminId').value.trim();
        const adminPassword = adminPasswordField.value;

        // Basic validation
        if (!adminId || !adminPassword) {
            showAdminMessage('Please fill in all fields', 'error');
            return;
        }

        // For demo purposes, use hardcoded credentials
        // In production, this should be validated against a secure database
        if (adminId === 'admin' && adminPassword === 'admin123') {
            // Show success message and switch to dashboard
            showAdminMessage('Login successful!', 'success');
            setTimeout(() => {
                adminLogin.style.display = 'none';
                adminDashboard.style.display = 'block';
                loadDashboardData();
            }, 1000);
        } else {
            showAdminMessage('Invalid admin credentials', 'error');
        }
    });

    // Logout functionality
    logoutAdmin.addEventListener('click', function() {
        adminDashboard.style.display = 'none';
        adminLogin.style.display = 'block';
        adminLoginForm.reset();
        
        // Clear any stored admin data
        sessionStorage.removeItem('adminLoggedIn');
    });

    // Handle action card clicks
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleAdminAction(action);
        });
    });

    // CR Member Modal Management
    closeCRModal.addEventListener('click', function() {
        addCRMemberModal.style.display = 'none';
        addCRMemberForm.reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addCRMemberModal) {
            addCRMemberModal.style.display = 'none';
            addCRMemberForm.reset();
        }
    });

    // Add CR Member Form Submission
    addCRMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const candidateName = document.getElementById('candidateName').value.trim();
        const candidatePosition = document.getElementById('candidatePosition').value;
        const candidateDescription = document.getElementById('candidateDescription').value.trim();

        if (!candidateName || !candidatePosition) {
            showAdminMessage('Please fill in all required fields', 'error');
            return;
        }

        // Add new CR member
        const newMember = {
            id: Date.now(), // Simple ID generation
            name: candidateName,
            position: candidatePosition,
            description: candidateDescription || 'No description provided'
        };

        // Add to localStorage
        addCRMember(newMember);
        
        // Update display
        displayCRMembers();
        
        // Update voting page candidates (store in sessionStorage for voting page access)
        sessionStorage.setItem('candidates', JSON.stringify(getCRMembers()));
        
        // Also store in localStorage for direct access
        localStorage.setItem('candidates', JSON.stringify(getCRMembers()));
        
        // Show success message
        showAdminMessage(`CR Member "${candidateName}" added successfully!`, 'success');
        
        // Close modal and reset form
        addCRMemberModal.style.display = 'none';
        addCRMemberForm.reset();
        
        // Update stats
        updateStats();
    });

    // Function to handle admin actions
    function handleAdminAction(action) {
        switch(action) {
            case 'startVoting':
                startVoting();
                break;
                
            case 'endVoting':
                endVoting();
                break;
                
            case 'showResults':
                showVotingResults();
                break;
                
            case 'viewUsers':
            case 'viewUsers2':
                showAdminMessage('Loading user list...', 'success');
                // In a real app, this would load user data
                break;
                
            case 'resetSystem':
                if (confirm('Are you sure you want to reset the voting system? This will clear all current votes.')) {
                    resetVotingSystem();
                }
                break;
                
            case 'votingHistory':
                showAdminMessage('Loading voting history...', 'success');
                // In a real app, this would load history data
                break;
                
            case 'addCRMember':
                addCRMemberModal.style.display = 'block';
                break;
                
            case 'clearAllData':
                if (confirm('WARNING: This will delete ALL data including users, votes, and candidates. Are you absolutely sure?')) {
                    clearAllData();
                }
                break;
                
            default:
                showAdminMessage('Action not implemented yet', 'info');
        }
    }

    // Function to start voting
    function startVoting() {
        setVotingStatus(true);
        updateVotingStatus('Active');
        showAdminMessage('Voting system activated!', 'success');
        
        // Update stats
        updateStats();
    }

    // Function to end voting
    function endVoting() {
        setVotingStatus(false);
        updateVotingStatus('Inactive');
        showAdminMessage('Voting system deactivated!', 'success');
        
        // Show final results
        showVotingResults();
        
        // Update stats
        updateStats();
    }

    // Function to show voting results
    function showVotingResults() {
        displayVotingResults();
        showAdminMessage('Voting results displayed!', 'success');
    }

    // Function to reset voting system
    function resetVotingSystem() {
        clearVotingData();
        setVotingStatus(false);
        updateVotingStatus('Inactive');
        updateStats();
        displayVotingResults();
        
        showAdminMessage('Voting system reset!', 'success');
    }

    // Function to clear all data
    function clearAllData() {
        clearVotingData();
        clearCRMembers();
        setVotingStatus(false);
        updateVotingStatus('Inactive');
        updateStats();
        displayVotingResults();
        displayCRMembers();
        
        sessionStorage.removeItem('candidates');
        localStorage.removeItem('candidates'); // Also clear from localStorage
        showAdminMessage('All data cleared!', 'success');
    }

    // Function to display CR members
    function displayCRMembers() {
        const crMembersContainer = document.getElementById('currentCRMembers');
        const crMembers = getCRMembers();
        
        if (crMembers.length === 0) {
            crMembersContainer.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7);">No CR members added yet.</p>';
            return;
        }

        crMembersContainer.innerHTML = crMembers.map(member => `
            <div class="cr-member-card">
                <div class="cr-member-header">
                    <div>
                        <div class="cr-member-name">${member.name}</div>
                        <div class="cr-member-position">${member.position}</div>
                    </div>
                    <button class="btn btn-danger" onclick="removeCRMember(${member.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cr-member-description">${member.description}</div>
                <div class="cr-member-actions">
                    <button class="btn btn-secondary" onclick="editCRMember(${member.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Function to display voting results
    function displayVotingResults() {
        const votingResultsContainer = document.getElementById('votingResults');
        const crMembers = getCRMembers();
        
        if (crMembers.length === 0) {
            votingResultsContainer.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7);">No candidates available for voting.</p>';
            return;
        }

        // Calculate vote counts for each candidate
        const candidateVotes = {};
        crMembers.forEach(member => {
            candidateVotes[member.id] = 0;
        });

        // Count votes from localStorage
        const votes = getVotes();
        votes.forEach(vote => {
            if (candidateVotes[vote.candidateId] !== undefined) {
                candidateVotes[vote.candidateId]++;
            }
        });

        // Find winner
        let maxVotes = 0;
        let winner = null;
        Object.keys(candidateVotes).forEach(candidateId => {
            if (candidateVotes[candidateId] > maxVotes) {
                maxVotes = candidateVotes[candidateId];
                winner = candidateId;
            }
        });

        // Calculate percentages
        const totalVotes = votes.length;
        
        votingResultsContainer.innerHTML = crMembers.map(member => {
            const voteCount = candidateVotes[member.id] || 0;
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
            const isWinner = member.id == winner && voteCount > 0;
            
            return `
                <div class="voting-result-card ${isWinner ? 'winner' : ''}">
                    <div class="voting-result-header">
                        <div>
                            <div class="voting-result-name">${member.name}</div>
                            <div class="voting-result-position">${member.position}</div>
                        </div>
                    </div>
                    
                    <div class="voting-result-stats">
                        <div class="voting-result-stat">
                            <div class="voting-result-stat-label">Votes Received</div>
                            <div class="voting-result-stat-value">${voteCount}</div>
                        </div>
                        <div class="voting-result-stat">
                            <div class="voting-result-stat-label">Percentage</div>
                            <div class="voting-result-stat-value">${percentage}%</div>
                        </div>
                    </div>
                    
                    <div class="voting-result-percentage">
                        <div class="voting-result-percentage-label">Vote Share</div>
                        <div class="voting-result-percentage-value">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add total votes summary
        if (totalVotes > 0) {
            const totalSection = document.createElement('div');
            totalSection.className = 'voting-result-total';
            totalSection.innerHTML = `
                <div class="voting-result-total-label">Total Votes Cast</div>
                <div class="voting-result-total-value">${totalVotes}</div>
            `;
            votingResultsContainer.appendChild(totalSection);
        }
    }

    // Function to remove CR member
    window.removeCRMember = function(memberId) {
        if (confirm('Are you sure you want to remove this CR member?')) {
            removeCRMemberFromStorage(memberId);
            displayCRMembers();
            sessionStorage.setItem('candidates', JSON.stringify(getCRMembers()));
            localStorage.setItem('candidates', JSON.stringify(getCRMembers())); // Also update localStorage
            displayVotingResults();
            showAdminMessage('CR member removed successfully!', 'success');
        }
    };

    // Function to edit CR member (placeholder for future implementation)
    window.editCRMember = function(memberId) {
        showAdminMessage('Edit functionality coming soon!', 'info');
    };

    // Function to update voting status
    function updateVotingStatus(status) {
        const activeRoundElement = document.getElementById('activeRound');
        if (activeRoundElement) {
            activeRoundElement.textContent = status;
        }
    }

    // Function to update statistics
    function updateStats() {
        const totalUsersElement = document.getElementById('totalUsers');
        const totalVotesElement = document.getElementById('totalVotes');
        const currentWinnerElement = document.getElementById('currentWinner');
        const crMembers = getCRMembers();
        const votes = getVotes();
        
        if (totalUsersElement) totalUsersElement.textContent = crMembers.length;
        if (totalVotesElement) totalVotesElement.textContent = votes.length;
        
        // Find current winner
        if (votes.length > 0) {
            const candidateVotes = {};
            crMembers.forEach(member => {
                candidateVotes[member.id] = 0;
            });
            
            votes.forEach(vote => {
                if (candidateVotes[vote.candidateId] !== undefined) {
                    candidateVotes[vote.candidateId]++;
                }
            });
            
            let maxVotes = 0;
            let winnerName = 'None';
            Object.keys(candidateVotes).forEach(candidateId => {
                if (candidateVotes[candidateId] > maxVotes) {
                    maxVotes = candidateVotes[candidateId];
                    const winner = crMembers.find(m => m.id == candidateId);
                    winnerName = winner ? winner.name : 'None';
                }
            });
            
            if (currentWinnerElement) currentWinnerElement.textContent = winnerName;
        } else {
            if (currentWinnerElement) currentWinnerElement.textContent = 'None';
        }
    }

    // Function to load dashboard data
    function loadDashboardData() {
        // Mark admin as logged in
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Display CR members
        displayCRMembers();
        
        // Display voting results
        displayVotingResults();
        
        // Store candidates in sessionStorage for voting page access
        sessionStorage.setItem('candidates', JSON.stringify(getCRMembers()));
        
        // Also store in localStorage for direct access
        localStorage.setItem('candidates', JSON.stringify(getCRMembers()));
        
        // Update stats
        updateStats();
        
        // Add some interactive effects
        actionCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Function to show admin messages
    function showAdminMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.admin-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} admin-message`;
        messageDiv.textContent = message;
        
        // Insert at the top of the dashboard
        const dashboard = document.getElementById('adminDashboard');
        dashboard.insertBefore(messageDiv, dashboard.firstChild);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // Check if admin is already logged in
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (adminLoggedIn) {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        loadDashboardData();
    }

    // Add some visual feedback for action cards
    actionCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        // Add click effect
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Listen for voting events from other pages
    window.addEventListener('storage', function(e) {
        if (e.key === 'voteCast') {
            const voteData = JSON.parse(e.newValue);
            if (voteData) {
                // Add new vote to localStorage
                addVote(voteData);
                
                // Update display
                updateStats();
                displayVotingResults();
                
                // Clear the vote data
                sessionStorage.removeItem('voteCast');
            }
        }
    });
});

// ===== LOCAL STORAGE FUNCTIONS =====

// Initialize data with defaults if not exists
function initializeData() {
    // Initialize CR members if not exists
    if (!localStorage.getItem('crMembers')) {
        const defaultMembers = [
            { id: 1, name: 'Pratik', position: 'President', description: 'Experienced leader with strong communication skills' },
            { id: 2, name: 'Jeeshu', position: 'Vice President', description: 'Dedicated team player with excellent organizational skills' },
            { id: 3, name: 'Abir', position: 'Secretary', description: 'Detail-oriented professional with strong writing abilities' },
            { id: 4, name: 'Yash', position: 'Treasurer', description: 'Finance expert with proven track record' }
        ];
        localStorage.setItem('crMembers', JSON.stringify(defaultMembers));
    }

    // Initialize voting data if not exists
    if (!localStorage.getItem('votingData')) {
        const defaultVotingData = {
            isActive: false,
            totalVotes: 0
        };
        localStorage.setItem('votingData', JSON.stringify(defaultVotingData));
    }

    // Initialize votes array if not exists
    if (!localStorage.getItem('votes')) {
        localStorage.setItem('votes', JSON.stringify([]));
    }

    // Initialize voters array if not exists
    if (!localStorage.getItem('voters')) {
        localStorage.setItem('voters', JSON.stringify([]));
    }
}

// CR Members functions
function getCRMembers() {
    return JSON.parse(localStorage.getItem('crMembers') || '[]');
}

function addCRMember(member) {
    const members = getCRMembers();
    members.push(member);
    localStorage.setItem('crMembers', JSON.stringify(members));
}

function removeCRMemberFromStorage(memberId) {
    const members = getCRMembers();
    const filteredMembers = members.filter(member => member.id !== memberId);
    localStorage.setItem('crMembers', JSON.stringify(filteredMembers));
}

function clearCRMembers() {
    localStorage.setItem('crMembers', JSON.stringify([]));
}

// Voting functions
function getVotingStatus() {
    const data = JSON.parse(localStorage.getItem('votingData') || '{}');
    return data.isActive || false;
}

function setVotingStatus(status) {
    const data = JSON.parse(localStorage.getItem('votingData') || '{}');
    data.isActive = status;
    localStorage.setItem('votingData', JSON.stringify(data));
}

function getVotes() {
    return JSON.parse(localStorage.getItem('votes') || '[]');
}

function addVote(vote) {
    const votes = getVotes();
    votes.push(vote);
    localStorage.setItem('votes', JSON.stringify(votes));
    
    // Update total votes count
    const votingData = JSON.parse(localStorage.getItem('votingData') || '{}');
    votingData.totalVotes = votes.length;
    localStorage.setItem('votingData', JSON.stringify(votingData));
}

function clearVotingData() {
    localStorage.setItem('votes', JSON.stringify([]));
    localStorage.setItem('voters', JSON.stringify([]));
    
    const votingData = JSON.parse(localStorage.getItem('votingData') || '{}');
    votingData.totalVotes = 0;
    localStorage.setItem('votingData', JSON.stringify(votingData));
}

// Voter functions
function getVoters() {
    return JSON.parse(localStorage.getItem('voters') || '[]');
}

function addVoter(voter) {
    const voters = getVoters();
    voters.push(voter);
    localStorage.setItem('voters', JSON.stringify(voters));
}

function hasVoterVoted(voterId) {
    const votes = getVotes();
    return votes.some(vote => vote.voterId === voterId);
}
