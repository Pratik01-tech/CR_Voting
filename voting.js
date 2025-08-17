document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const voterData = sessionStorage.getItem('voterData');
    if (!voterData) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user has already voted using localStorage
    const voterInfo = JSON.parse(voterData);
    const hasVoted = checkIfVoterHasVoted(voterInfo.mobile);
    if (hasVoted) {
        // User has already voted, redirect to login
        sessionStorage.removeItem('voterData');
        alert('You have already voted. You cannot vote again.');
        window.location.href = 'index.html';
        return;
    }

    // Initialize the voting page
    initializeVotingPage();
});

function initializeVotingPage() {
    const voterData = JSON.parse(sessionStorage.getItem('voterData'));
    
    // Populate header with voter information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${voterData.name}!`;
    document.getElementById('voterName').textContent = voterData.name;
    document.getElementById('voterMobile').textContent = voterData.mobile || '+1234567890';
    
    // Set voter card image
    const voterCardImage = document.getElementById('voterCardImage');
    if (voterData.voter_card_image) {
        voterCardImage.src = `uploads/${voterData.voter_card_image}`;
    } else {
        voterCardImage.src = 'images/default-avatar.jpg';
    }

    // Load candidates
    loadCandidates();

    // Set up event listeners
    setupEventListeners();
}

function loadCandidates() {
    // Try to get candidates from admin panel (localStorage)
    let candidates = [];
    const storedCandidates = localStorage.getItem('candidates');
    
    if (storedCandidates) {
        candidates = JSON.parse(storedCandidates);
    } else {
        // Fallback to default candidates if none from admin
        candidates = [
            { id: 1, name: 'Pratik', position: 'President', description: 'Experienced leader with strong communication skills' },
            { id: 2, name: 'Jeeshu', position: 'Vice President', description: 'Dedicated team player with excellent organizational skills' },
            { id: 3, name: 'Abir', position: 'Secretary', description: 'Detail-oriented professional with strong writing abilities' },
            { id: 4, name: 'Yash', position: 'Treasurer', description: 'Finance expert with proven track record' }
        ];
    }

    displayCandidates(candidates);
}

function displayCandidates(candidates) {
    const candidatesGrid = document.getElementById('candidatesGrid');
    
    if (candidates.length === 0) {
        candidatesGrid.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 18px;">No candidates available for voting.</p>';
        return;
    }
    
    candidatesGrid.innerHTML = candidates.map(candidate => `
        <div class="candidate-card" data-candidate-id="${candidate.id}" data-candidate-name="${candidate.name}" data-candidate-position="${candidate.position}">
            <div class="candidate-radio"></div>
            <div class="candidate-name">${candidate.name}</div>
            <div class="candidate-position">${candidate.position}</div>
        </div>
    `).join('');

    // Add click event listeners to candidate cards
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
        card.addEventListener('click', function() {
            selectCandidate(this);
        });
    });
}

function selectCandidate(selectedCard) {
    // Clear previous selection
    clearSelection();
    
    // Mark this candidate as selected
    selectedCard.classList.add('selected');
    
    // Show vote confirmation modal
    const candidateName = selectedCard.getAttribute('data-candidate-name');
    const candidatePosition = selectedCard.getAttribute('data-candidate-position');
    document.getElementById('selectedCandidateName').textContent = `${candidateName} (${candidatePosition})`;
    
    // Show the modal
    document.getElementById('voteModal').style.display = 'block';
}

function clearSelection() {
    const selectedCards = document.querySelectorAll('.candidate-card.selected');
    selectedCards.forEach(card => card.classList.remove('selected'));
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutVoter').addEventListener('click', logoutVoter);
    
    // Modal buttons
    document.getElementById('confirmVote').addEventListener('click', castVote);
    document.getElementById('cancelVote').addEventListener('click', closeVoteModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('voteModal');
        if (event.target === modal) {
            closeVoteModal();
        }
    });
}

function castVote() {
    const selectedCard = document.querySelector('.candidate-card.selected');
    if (!selectedCard) {
        alert('Please select a candidate first');
        return;
    }

    const candidateId = selectedCard.getAttribute('data-candidate-id');
    const candidateName = selectedCard.getAttribute('data-candidate-name');
    const candidatePosition = selectedCard.getAttribute('data-candidate-position');
    const voterData = JSON.parse(sessionStorage.getItem('voterData'));

    // Show loading state
    const confirmBtn = document.getElementById('confirmVote');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Casting Vote...';
    confirmBtn.disabled = true;

    // Simulate vote casting (in real app, this would send to server)
    setTimeout(() => {
        // Close modal
        closeVoteModal();
        
        // Mark user as having voted in localStorage
        markVoterAsVoted(voterData.mobile);
        
        // Store vote data in localStorage
        const voteData = {
            voterId: voterData.mobile, // Using mobile as unique identifier
            voterName: voterData.name,
            candidateId: candidateId,
            candidateName: candidateName,
            candidatePosition: candidatePosition,
            timestamp: new Date().toISOString()
        };
        
        // Store vote in localStorage
        storeVoteInLocalStorage(voteData);
        
        // Send vote data to admin panel via sessionStorage
        sessionStorage.setItem('voteCast', JSON.stringify(voteData));
        
        // Show success message briefly
        showVotingMessage(`Thank you for voting! Your vote for ${candidateName} (${candidatePosition}) has been recorded.`, 'success');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
            // Clear voter data and redirect
            sessionStorage.removeItem('voterData');
            sessionStorage.removeItem('voteCast');
            window.location.href = 'index.html';
        }, 3000);
        
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }, 2000);
}

function closeVoteModal() {
    document.getElementById('voteModal').style.display = 'none';
    clearSelection();
}

function logoutVoter() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('voterData');
        window.location.href = 'index.html';
    }
}

function showVotingMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.voting-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} voting-message`;
    messageDiv.textContent = message;
    
    // Insert at the top of the voting container
    const votingContainer = document.querySelector('.voting-container');
    votingContainer.insertBefore(messageDiv, votingContainer.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to candidate cards
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.2)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            }
        });
    });
});

// Listen for changes in candidates from admin panel
window.addEventListener('storage', function(e) {
    if (e.key === 'candidates') {
        // Reload candidates when they're updated from admin panel
        loadCandidates();
    }
});

// ===== LOCAL STORAGE FUNCTIONS =====

// Check if a voter has already voted
function checkIfVoterHasVoted(voterId) {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    return votes.some(vote => vote.voterId === voterId);
}

// Mark a voter as having voted
function markVoterAsVoted(voterId) {
    const voters = JSON.parse(localStorage.getItem('voters') || '[]');
    if (!voters.includes(voterId)) {
        voters.push(voterId);
        localStorage.setItem('voters', JSON.stringify(voters));
    }
}

// Store vote data in localStorage
function storeVoteInLocalStorage(voteData) {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    votes.push(voteData);
    localStorage.setItem('votes', JSON.stringify(votes));
    
    // Update total votes count
    const votingData = JSON.parse(localStorage.getItem('votingData') || '{}');
    votingData.totalVotes = votes.length;
    localStorage.setItem('votingData', JSON.stringify(votingData));
}
