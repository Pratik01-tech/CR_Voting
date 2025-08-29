// Global variables
let crMembers = JSON.parse(localStorage.getItem("crMembers") || "[]");
let votes = {};
let currentUser = null;
let hasVoted = false;
let isAdminLoggedIn = false;
let isVotingActive = localStorage.getItem("isVotingActive") === "true" || false;
let currentWinner = localStorage.getItem("currentWinner") || null;
let editingCRId = null;

// Initialize default CR members if none exist
if (crMembers.length === 0) {
    crMembers = [
        { id: 1, name: "Pratik", description: "Pratik - First Candidate" },
        { id: 2, name: "Jeeshu", description: "Jeeshu - Second Candidate" },
        { id: 3, name: "Abir", description: "Abir - Third Candidate" },
        { id: 4, name: "Yash", description: "Yash - Fourth Candidate" }
    ];
    localStorage.setItem("crMembers", JSON.stringify(crMembers));
}

// Initialize votes based on CR members
function initializeVotes() {
    votes = {};
    crMembers.forEach(cr => {
        votes[cr.name] = 0;
    });
    votes["Nota"] = 0;
}

// Initialize votes on page load
initializeVotes();

// Predefined admin credentials
const ADMIN_CREDENTIALS = {
    id: "admin123",
    password: "admin@2024"
};

// DOM elements
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");
const adminPanel = document.getElementById("adminPanel");
const adminDashboard = document.getElementById("adminDashboard");
const votingSystem = document.getElementById("votingSystem");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const userName = document.getElementById("userName");
const form = document.getElementById("votingForm");
const resultsDiv = document.getElementById("results");
const resultsList = document.getElementById("resultsList");
const winnerPage = document.getElementById("winnerPage");
const winnerText = document.getElementById("winnerText");
const lastWinnerSpan = document.getElementById("lastWinner");
const historyList = document.getElementById("historyList");
const winnersList = document.getElementById("winnersList");
const voteConfirmation = document.getElementById("voteConfirmation");
const chosenCandidateEl = document.getElementById("chosenCandidate");
const publicResultsSection = document.getElementById("publicResultsSection");
const publicResultsContent = document.getElementById("publicResultsContent");

// Load data from localStorage
let lastWinner = localStorage.getItem("lastWinner") || "None";
let winners = JSON.parse(localStorage.getItem("winners") || "[]");
let history = JSON.parse(localStorage.getItem("history") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");
let votedUsers = JSON.parse(localStorage.getItem("votedUsers") || "[]");
let userVotes = JSON.parse(localStorage.getItem("userVotes") || "{}");
let publicResults = JSON.parse(localStorage.getItem("publicResults") || "null");

// Check if user is already logged in
function checkLoggedInUser() {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
        currentUser = JSON.parse(loggedInUser);
        checkVotingStatus();
    }
}

// Check if current user has already voted
function checkVotingStatus() {
    if (currentUser) {
        hasVoted = votedUsers.includes(currentUser.mobile);
        
        // Check if voting has ended and show winner
        if (!isVotingActive && currentWinner) {
            // Stay on voter page and show results section instead of alerting/logging out
            showVotingSystem();
            renderPublicResults();
            return;
        }
        
        // If already voted in this round, keep user logged in and show confirmation view
        
        if (!isVotingActive) {
            alert("Voting is currently inactive. Please wait for the admin to start voting.");
            logout();
            return;
        }
        
        showVotingSystem();
        if (hasVoted) {
            showVoteConfirmation(userVotes[currentUser.mobile] || "");
        }
    }
}

// Initialize the app
checkLoggedInUser();
updateLastWinner();
updateWinnersList();
updateHistory();
renderPublicResults();

// Event Listeners
loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);
adminLoginForm.addEventListener("submit", handleAdminLogin);

// CR Form event listener
document.addEventListener("DOMContentLoaded", function() {
    const crForm = document.getElementById("crForm");
    if (crForm) {
        crForm.addEventListener("submit", handleCRFormSubmit);
    }
});

// Image upload removed from registration; no preview needed

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const mobile = formData.get("mobile");
    const password = formData.get("password");

    const user = users.find(u => 
        u.mobile === mobile && 
        u.password === password
    );

    if (user) {
        currentUser = user;
        localStorage.setItem("currentUser", JSON.stringify(user));
        checkVotingStatus();
        alert("Login successful!");
    } else {
        alert("Invalid credentials. Please check your mobile number and password.");
    }
}

function handleAdminLogin(event) {
    event.preventDefault();
    const formData = new FormData(adminLoginForm);
    const adminId = formData.get("adminId");
    const adminPassword = formData.get("adminPassword");

    if (adminId === ADMIN_CREDENTIALS.id && adminPassword === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        showAdminDashboard();
        updateAdminStats();
        alert("Admin login successful!");
    } else {
        alert("Invalid admin credentials!");
    }
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = formData.get("name");
    const mobile = formData.get("mobile");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validation
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    if (users.some(u => u.mobile === mobile)) {
        alert("Mobile number already registered!");
        return;
    }

    const newUser = {
        name: name,
        mobile: mobile,
        password: password,
        role: "voter",
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    alert("Registration successful! Please login.");
    showLogin();
}

// UI Functions
function showLogin() {
    loginSection.classList.remove("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showRegister() {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showAdminPanel() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.add("hidden");
}

function showAdminDashboard() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    votingSystem.classList.add("hidden");
    
    // Display CR members and update voting candidates
    displayCRMembers();
    updateVotingCandidates();
}

function showVotingSystem() {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminDashboard.classList.add("hidden");
    votingSystem.classList.remove("hidden");
    userName.textContent = currentUser.name;
    
    // Update voting candidates display
    updateVotingCandidates();
    
    // Toggle sections depending on vote status
    if (hasVoted) {
        form.classList.add("hidden");
        if (voteConfirmation) voteConfirmation.classList.remove("hidden");
    } else {
        form.classList.remove("hidden");
        if (voteConfirmation) voteConfirmation.classList.add("hidden");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showLogin();
}

function adminLogout() {
    isAdminLoggedIn = false;
    showLogin();
}

// Admin Functions
function updateAdminStats() {
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalVotes").textContent = history.length;
    document.getElementById("currentWinner").textContent = currentWinner || lastWinner || "None";
    document.getElementById("activeRound").textContent = isVotingActive ? "Active" : "Inactive";
}

// Voting Control Functions
function startVoting() {
    if (confirm("Are you sure you want to start the voting system?")) {
        isVotingActive = true;
        localStorage.setItem("isVotingActive", "true");
        updateAdminStats();
        alert("Voting system is now ACTIVE! Voters can now cast their votes.");
    }
}

function endVoting() {
    if (confirm("Are you sure you want to end the voting system?")) {
        isVotingActive = false;
        localStorage.setItem("isVotingActive", "false");
        updateAdminStats();
        alert("Voting system is now INACTIVE! Voters cannot cast votes anymore.");
        // Trigger render on voter pages (they will read currentWinner/publicResults)
        renderPublicResults();
    }
}

function showVotingResults() {
    if (!isVotingActive && Object.values(votes).some(vote => vote > 0)) {
        // Calculate winner
        const maxVotes = Math.max(...Object.values(votes));
        const winners = Object.keys(votes).filter(candidate => votes[candidate] === maxVotes);
        const winner = winners.length === 1 ? winners[0] : "Tie";
        
        currentWinner = winner;
        localStorage.setItem("currentWinner", winner);
        lastWinner = winner;
        localStorage.setItem("lastWinner", winner);
        updateAdminStats();
        
        const adminResults = document.getElementById("adminResults");
        const adminResultsContent = document.getElementById("adminResultsContent");
        
        let content = "<h4>Voting Results:</h4>";
        content += "<div class='results-summary'>";
        content += `<h3>🏆 Winner: ${winner}</h3>`;
        content += "<ul>";
        
        // Show results for all CR members
        crMembers.forEach(cr => {
            content += `<li><strong>${cr.name}:</strong> ${votes[cr.name] || 0} vote(s)</li>`;
        });
        
        // Show NOTA results
        content += `<li><strong>Nota:</strong> ${votes["Nota"] || 0} vote(s)</li>`;
        content += "</ul>";
        content += "</div>";
        
        adminResultsContent.innerHTML = content;
        adminResults.classList.remove("hidden");

        // Publish results for voters page
        publicResults = { winner, votes: { ...votes } };
        localStorage.setItem("publicResults", JSON.stringify(publicResults));
        renderPublicResults();
    } else if (isVotingActive) {
        alert("Voting is still active. Please end voting first to see results.");
    } else {
        alert("No votes have been cast yet.");
    }
}

function resetVotingSystem() {
    if (confirm("Are you sure you want to reset the voting system? This will clear all votes and start a new round.")) {
        // Reset votes for all CR members
        votes = {};
        crMembers.forEach(cr => {
            votes[cr.name] = 0;
        });
        votes["Nota"] = 0;
        
        votedUsers = [];
        history = [];
        isVotingActive = false;
        currentWinner = null;
        localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
        localStorage.setItem("userVotes", JSON.stringify({}));
        localStorage.setItem("history", JSON.stringify(history));
        localStorage.setItem("isVotingActive", "false");
        localStorage.setItem("currentWinner", "");
        localStorage.removeItem("publicResults");
        publicResults = null;
        renderPublicResults();
        updateAdminStats();
        alert("Voting system has been reset!");
    }
}

function viewAllUsers() {
    const adminResults = document.getElementById("adminResults");
    const adminResultsContent = document.getElementById("adminResultsContent");
    
    let content = "<h4>Registered Users:</h4><ul>";
    users.forEach(user => {
        content += `<li><strong>${user.name}</strong> - ${user.mobile} (${user.role}) - Registered: ${new Date(user.registeredAt).toLocaleDateString()}</li>`;
    });
    content += "</ul>";
    
    adminResultsContent.innerHTML = content;
    adminResults.classList.remove("hidden");
}

function viewVotingHistory() {
    const adminResults = document.getElementById("adminResults");
    const adminResultsContent = document.getElementById("adminResultsContent");
    
    let content = "<h4>Voting History:</h4><ul>";
    history.forEach(vote => {
        content += `<li>${vote}</li>`;
    });
    content += "</ul>";
    
    adminResultsContent.innerHTML = content;
    adminResults.classList.remove("hidden");
}

function clearAllData() {
    if (confirm("WARNING: This will delete ALL data including users, votes, CR members, and history. This action cannot be undone. Are you sure?")) {
        users = [];
        crMembers = [];
        votes = {};
        votedUsers = [];
        history = [];
        winners = [];
        lastWinner = "None";
        isVotingActive = false;
        currentWinner = null;
        
        localStorage.clear();
        localStorage.setItem("lastWinner", "None");
        localStorage.setItem("isVotingActive", "false");
        localStorage.setItem("currentWinner", "");
        
        // Reinitialize with new default CR members
        crMembers = [
            { id: 1, name: "Pratik", description: "Pratik - First Candidate" },
            { id: 2, name: "Jeeshu", description: "Jeeshu - Second Candidate" },
            { id: 3, name: "Abir", description: "Abir - Third Candidate" },
            { id: 4, name: "Yash", description: "Yash - Fourth Candidate" }
        ];
        localStorage.setItem("crMembers", JSON.stringify(crMembers));
        
        // Initialize votes for new CR members
        initializeVotes();
        
        updateAdminStats();
        displayCRMembers();
        updateVotingCandidates();
        alert("All data has been cleared and new CR members have been set!");
    }
}

function closeResults() {
    document.getElementById("adminResults").classList.add("hidden");
}

// CR Management Functions
function handleCRFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const crName = formData.get("crName");
    
    if (editingCRId) {
        // Update existing CR member
        updateCRMember(editingCRId, crName);
    } else {
        // Add new CR member
        addCRMember(crName);
    }
}

function addCRMember(name) {
    // Check if name already exists
    if (crMembers.some(cr => cr.name === name)) {
        alert("A CR member with this name already exists!");
        return;
    }
    
    const newCR = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toISOString()
    };
    
    crMembers.push(newCR);
    localStorage.setItem("crMembers", JSON.stringify(crMembers));
    
    // Update votes
    votes[name] = 0;
    
    // Reset form and refresh display
    resetCRForm();
    displayCRMembers();
    updateVotingCandidates();
    updateAdminStats();
    
    alert("CR member added successfully!");
}

function updateCRMember(id, name) {
    const crIndex = crMembers.findIndex(cr => cr.id === id);
    if (crIndex === -1) {
        alert("CR member not found!");
        return;
    }
    
    // Check if name already exists (excluding current member)
    if (crMembers.some(cr => cr.id !== id && cr.name === name)) {
        alert("A CR member with this name already exists!");
        return;
    }
    
    const oldName = crMembers[crIndex].name;
    
    crMembers[crIndex] = {
        ...crMembers[crIndex],
        name: name,
        updatedAt: new Date().toISOString()
    };
    
    updateCRMemberData(oldName, name);
}

function updateCRMemberData(oldName, newName) {
    // Update votes if name changed
    if (oldName !== newName) {
        if (votes[oldName] !== undefined) {
            votes[newName] = votes[oldName];
            delete votes[oldName];
        }
    }
    
    localStorage.setItem("crMembers", JSON.stringify(crMembers));
    
    // Reset form and refresh display
    resetCRForm();
    displayCRMembers();
    updateVotingCandidates();
    updateAdminStats();
    
    alert("CR member updated successfully!");
}

function deleteCRMember(id) {
    if (confirm("Are you sure you want to delete this CR member?")) {
        const crIndex = crMembers.findIndex(cr => cr.id === id);
        if (crIndex === -1) {
            alert("CR member not found!");
            return;
        }
        
        const crName = crMembers[crIndex].name;
        
        // Remove from crMembers
        crMembers.splice(crIndex, 1);
        localStorage.setItem("crMembers", JSON.stringify(crMembers));
        
        // Remove from votes
        if (votes[crName] !== undefined) {
            delete votes[crName];
        }
        
        // Refresh display
        displayCRMembers();
        updateVotingCandidates();
        updateAdminStats();
        
        alert("CR member deleted successfully!");
    }
}

function editCRMember(id) {
    const cr = crMembers.find(cr => cr.id === id);
    if (!cr) {
        alert("CR member not found!");
        return;
    }
    
    // Fill form with CR data
    document.getElementById("crName").value = cr.name;
    
    // Change form to update mode
    editingCRId = id;
    document.getElementById("updateCRBtn").classList.add("hidden");
    document.getElementById("cancelCRBtn").classList.remove("hidden");
    
    // Change submit button text
    const submitBtn = document.querySelector("#crForm button[type='submit']");
    submitBtn.innerHTML = '<span class="action-icon">✏️</span> Update CR Member';
}

function updateCRMode() {
    editingCRId = null;
    resetCRForm();
    document.getElementById("updateCRBtn").classList.remove("hidden");
    document.getElementById("cancelCRBtn").classList.add("hidden");
    
    const submitBtn = document.querySelector("#crForm button[type='submit']");
    submitBtn.innerHTML = '<span class="action-icon">➕</span> Add CR Member';
}

function cancelCRUpdate() {
    editingCRId = null;
    resetCRForm();
    document.getElementById("updateCRBtn").classList.remove("hidden");
    document.getElementById("cancelCRBtn").classList.add("hidden");
    
    const submitBtn = document.querySelector("#crForm button[type='submit']");
    submitBtn.innerHTML = '<span class="action-icon">➕</span> Add CR Member';
}

function resetCRForm() {
    document.getElementById("crForm").reset();
    const crImagePreview = document.getElementById("crImagePreview");
    if (crImagePreview) crImagePreview.innerHTML = "";
    editingCRId = null;
    document.getElementById("updateCRBtn").classList.remove("hidden");
    document.getElementById("cancelCRBtn").classList.add("hidden");
    
    const submitBtn = document.querySelector("#crForm button[type='submit']");
    submitBtn.innerHTML = '<span class="action-icon">➕</span> Add CR Member';
}

function displayCRMembers() {
    const crMembersList = document.getElementById("crMembersList");
    if (!crMembersList) return;
    
    if (crMembers.length === 0) {
        crMembersList.innerHTML = '<p style="text-align: center; color: #cccccc;">No CR members added yet.</p>';
        return;
    }
    
    let html = "";
    crMembers.forEach(cr => {
        html += `
            <div class="cr-member-card">
                <div class="cr-member-image" style="background: rgba(0, 212, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>
                <div class="cr-member-info">
                    <h4>${cr.name}</h4>
                    <div class="cr-member-actions">
                        <button onclick="editCRMember(${cr.id})" class="cr-action-btn edit-cr-btn">Edit</button>
                        <button onclick="deleteCRMember(${cr.id})" class="cr-action-btn delete-cr-btn">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    crMembersList.innerHTML = html;
}

function updateVotingCandidates() {
    const candidatesList = document.getElementById("candidatesList");
    if (!candidatesList) return;
    
    let html = "";
    crMembers.forEach(cr => {
        html += `
            <div class="candidate-card" onclick="selectCandidate('${cr.name}')">
                <input type="radio" name="candidate" value="${cr.name}" required style="display: none;">
                <div class="candidate-image" style="background: rgba(0, 212, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 2rem;">👤</div>
                <div class="candidate-info">
                    <h4>${cr.name}</h4>
                </div>
            </div>
        `;
    });
    
    candidatesList.innerHTML = html;
}

function selectCandidate(candidateName) {
    // Remove previous selection
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Remove NOTA selection visual feedback
    const notaOption = document.querySelector('.nota-option');
    if (notaOption) {
        notaOption.classList.remove('selected');
    }
    
    // Select clicked candidate
    const selectedCard = Array.from(document.querySelectorAll('.candidate-card')).find(card => 
        card.querySelector('h4').textContent === candidateName
    );
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Set radio button value
    const radioBtn = document.querySelector(`input[value="${candidateName}"]`);
    if (radioBtn) {
        radioBtn.checked = true;
    }
    
    // Also uncheck NOTA if a candidate is selected
    const notaRadio = document.querySelector('input[value="Nota"]');
    if (notaRadio) {
        notaRadio.checked = false;
    }
}

function selectNota() {
    // Remove candidate selection
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add visual feedback to NOTA option
    const notaOption = document.querySelector('.nota-option');
    if (notaOption) {
        notaOption.classList.add('selected');
    }
    
    // Check NOTA radio button
    const notaRadio = document.querySelector('input[value="Nota"]');
    if (notaRadio) {
        notaRadio.checked = true;
    }
    
    // Uncheck all candidate radio buttons
    crMembers.forEach(cr => {
        const radioBtn = document.querySelector(`input[value="${cr.name}"]`);
        if (radioBtn) {
            radioBtn.checked = false;
        }
    });
}

// Voting System Functions
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Check if voting is active
    if (!isVotingActive) {
        alert("Voting is currently inactive. Please wait for the admin to start voting.");
        return;
    }
    
            // Check if user has already voted
        if (hasVoted) {
            alert("You have already voted in this round. Please wait for the winner to be announced.");
            if (typeof showVoteConfirmation === "function") {
                showVoteConfirmation(userVotes[currentUser.mobile] || "");
            } else {
                if (form) form.classList.add("hidden");
                if (resultsDiv) resultsDiv.classList.add("hidden");
                if (winnerPage) winnerPage.classList.add("hidden");
                if (voteConfirmation) voteConfirmation.classList.remove("hidden");
                if (chosenCandidateEl) chosenCandidateEl.textContent = (userVotes[currentUser.mobile] || "");
            }
            return;
        }
    
    const formData = new FormData(form);
    const selected = formData.get("candidate");
    if (selected && votes.hasOwnProperty(selected)) {
        votes[selected]++;
        addToHistory(selected);
        
        // Mark user as voted
        votedUsers.push(currentUser.mobile);
        localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
        hasVoted = true;
        
        // Show simple confirmation and keep user logged in
        if (typeof showVoteConfirmation === "function") {
            showVoteConfirmation(selected);
        } else {
            // Fallback inline if helper not found
            if (form) form.classList.add("hidden");
            if (resultsDiv) resultsDiv.classList.add("hidden");
            if (winnerPage) winnerPage.classList.add("hidden");
            if (voteConfirmation) voteConfirmation.classList.remove("hidden");
            if (chosenCandidateEl) chosenCandidateEl.textContent = selected || "";
        }
        
        // Winner reveal handled by admin flow
    }
});

function showResults() {
    // For voter flow, we hide any results to avoid showing counts
    if (form) form.classList.add("hidden");
    if (resultsDiv) resultsDiv.classList.add("hidden");
    if (winnerPage) winnerPage.classList.add("hidden");
}

function showWinner(winner) {
    form.classList.add("hidden");
    resultsDiv.classList.add("hidden");
    winnerPage.classList.remove("hidden");
    winnerText.textContent = `Winner: ${winner}! 🎉`;
    lastWinner = winner;
    currentWinner = winner;
    localStorage.setItem("lastWinner", winner);
    localStorage.setItem("currentWinner", winner);
    
    // Add winner to winners list
    addToWinnersList(winner);
    
    // Reset voted users for new round
    votedUsers = [];
    localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
    userVotes = {};
    localStorage.setItem("userVotes", JSON.stringify(userVotes));
    
    updateLastWinner();
    updateAdminStats();
    // Winner shown; keep public results visible until reset
}

window.resetVote = function() {
    form.reset();
    form.classList.remove("hidden");
    resultsDiv.classList.add("hidden");
    winnerPage.classList.add("hidden");
};

window.resetAll = function() {
    // Reset votes for all CR members
    votes = {};
    crMembers.forEach(cr => {
        votes[cr.name] = 0;
    });
    votes["Nota"] = 0;
    
    // Reset voted users for new round
    votedUsers = [];
    localStorage.setItem("votedUsers", JSON.stringify(votedUsers));
    userVotes = {};
    localStorage.setItem("userVotes", JSON.stringify(userVotes));
    window.resetVote();
};

function updateLastWinner() {
    if (lastWinnerSpan) {
        lastWinnerSpan.textContent = lastWinner;
    }
}

function addToWinnersList(winner) {
    const now = new Date();
    const winnerEntry = {
        name: winner,
        timestamp: now.toLocaleString(),
        date: now.toISOString()
    };
    winners.unshift(winnerEntry);
    localStorage.setItem("winners", JSON.stringify(winners));
    updateWinnersList();
}

function updateWinnersList() {
    if (!winnersList) return;
    winnersList.innerHTML = "";
    if (winners.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No winners yet.";
        li.className = "no-winners";
        winnersList.appendChild(li);
    } else {
        winners.forEach((winner, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${winner.name}</strong> - ${winner.timestamp}`;
            if (index === 0) {
                li.className = "latest-winner";
            }
            winnersList.appendChild(li);
        });
    }
}

window.clearWinnersList = function() {
    if (confirm("Are you sure you want to clear the winners list?")) {
        winners = [];
        localStorage.setItem("winners", JSON.stringify(winners));
        updateWinnersList();
    }
};

function addToHistory(candidate) {
    const now = new Date();
    const entry = `${candidate} (${now.toLocaleString()})`;
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    updateHistory();
}

function updateHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    if (history.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No votes yet.";
        historyList.appendChild(li);
    } else {
        history.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            historyList.appendChild(li);
        });
    }
}

// Render results on voter page if admin has published them
function renderPublicResults() {
    if (!publicResultsSection || !publicResultsContent) return;
    // Prefer admin-published results; fall back to winner-only if available
    if (!isVotingActive && (publicResults || currentWinner)) {
        publicResultsSection.classList.remove("hidden");
        if (publicResults) {
            const { winner, votes: voteMap } = publicResults;
            let html = "";
            html += `<div class=\"public-winner\">🏆 Winner: <strong>${winner}</strong></div>`;
            html += "<ul class=\"public-results-list\">";
            crMembers.forEach(cr => {
                html += `<li>${cr.name}: ${voteMap[cr.name] || 0}</li>`;
            });
            html += `<li>Nota: ${voteMap["Nota"] || 0}</li>`;
            html += "</ul>";
            publicResultsContent.innerHTML = html;
        } else {
            publicResultsContent.innerHTML = `<div class=\"public-winner\">🏆 Winner: <strong>${currentWinner}</strong></div>`;
        }
    } else {
        publicResultsSection.classList.add("hidden");
        publicResultsContent.innerHTML = "";
    }
}

// Global functions for HTML onclick
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showAdminPanel = showAdminPanel;
window.logout = logout;
window.adminLogout = adminLogout;
window.resetVotingSystem = resetVotingSystem;
window.viewAllUsers = viewAllUsers;
window.viewVotingHistory = viewVotingHistory;
window.clearAllData = clearAllData;
window.closeResults = closeResults;
window.startVoting = startVoting;
window.endVoting = endVoting;
window.showVotingResults = showVotingResults;

// CR Management global functions
window.editCRMember = editCRMember;
window.deleteCRMember = deleteCRMember;
window.updateCRMode = updateCRMode;
window.cancelCRUpdate = cancelCRUpdate;
window.selectCandidate = selectCandidate;
window.selectNota = selectNota;

// Function to reset CR members to new defaults
function resetCRMembersToDefaults() {
    if (confirm("This will reset all CR members to the default names (Pratik, Jeeshu, Abir, Yash). Are you sure?")) {
        crMembers = [
            { id: 1, name: "Pratik", description: "Pratik - First Candidate" },
            { id: 2, name: "Jeeshu", description: "Jeeshu - Second Candidate" },
            { id: 3, name: "Abir", description: "Abir - Third Candidate" },
            { id: 4, name: "Yash", description: "Yash - Fourth Candidate" }
        ];
        localStorage.setItem("crMembers", JSON.stringify(crMembers));
        
        // Reset votes for new CR members
        initializeVotes();
        
        // Refresh displays
        displayCRMembers();
        updateVotingCandidates();
        
        alert("CR members have been reset to default names!");
    }
}

// Add to global window object
window.resetCRMembersToDefaults = resetCRMembersToDefaults; 