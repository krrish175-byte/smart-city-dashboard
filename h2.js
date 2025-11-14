// State
let isLoginMode = true;
let currentCarouselIndex = 0;
let chatMessageId = 0;
let communityMessageId = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initDateTime();
    initSparklines();
    initCharts();
    initServiceTabs();
    initModals();
    initLoginPage();
    initChatbot();
    initCommunityChat();
    initComplaintForm();
    initAnimations();
});

// Date and Time
function initDateTime() {
    function updateDateTime() {
        const now = new Date();
        
        // Date
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
        
        // Time
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Sparkline Charts
function initSparklines() {
    const sparklineData = [
        [35, 38, 40, 42, 45, 43, 42],
        [55, 60, 65, 70, 68, 72, 68],
        [88, 90, 89, 91, 92, 93, 92],
        [1200, 1220, 1210, 1230, 1250, 1240, 1247]
    ];
    
    sparklineData.forEach((data, index) => {
        const canvas = document.getElementById(`sparkline${index + 1}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const colors = ['#0891b2', '#ec4899', '#059669', '#a855f7'];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data: data,
                    borderColor: colors[index],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
    });
}

// Main Charts
function initCharts() {
    // Pollution Chart
    const pollutionCtx = document.getElementById('pollutionChart');
    if (pollutionCtx) {
        new Chart(pollutionCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'PM2.5',
                        data: [35, 38, 42, 40, 45, 38, 35],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 3,
                        tension: 0.4
                    },
                    {
                        label: 'PM10',
                        data: [45, 48, 52, 50, 55, 48, 45],
                        borderColor: '#a855f7',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderWidth: 3,
                        tension: 0.4
                    },
                    {
                        label: 'NO2',
                        data: [28, 30, 35, 32, 38, 30, 28],
                        borderColor: '#ec4899',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                        borderWidth: 3,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Traffic Chart
    const trafficCtx = document.getElementById('trafficChart');
    if (trafficCtx) {
        const trafficData = [45, 72, 95, 88, 65, 58, 70, 68, 62, 75, 85, 98, 92, 70];
        
        new Chart(trafficCtx, {
            type: 'bar',
            data: {
                labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
                datasets: [{
                    data: trafficData,
                    backgroundColor: trafficData.map(value => {
                        if (value > 80) return '#ec4899';
                        if (value > 60) return '#a855f7';
                        return '#06b6d4';
                    }),
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Service Tabs
function initServiceTabs() {
    const tabs = document.querySelectorAll('.service-tab');
    const tabContent = document.getElementById('tabContent');
    
    const serviceData = {
        waste: {
            title: 'Waste Management',
            stats: [
                { label: 'Collection Rate', value: '94%' },
                { label: 'Recycling Rate', value: '67%' },
                { label: 'Next Collection', value: 'Tomorrow 7AM' }
            ]
        },
        water: {
            title: 'Water Usage',
            stats: [
                { label: 'Daily Consumption', value: '2.4M gal' },
                { label: 'Water Quality', value: 'Excellent' },
                { label: 'Pressure Level', value: '85 PSI' }
            ]
        },
        transport: {
            title: 'Public Transport',
            stats: [
                { label: 'Active Buses', value: '342' },
                { label: 'On-time Rate', value: '89%' },
                { label: 'Daily Riders', value: '127K' }
            ]
        },
        health: {
            title: 'Health Services',
            stats: [
                { label: 'Hospitals Available', value: '12' },
                { label: 'Avg Wait Time', value: '18 min' },
                { label: 'Emergency Response', value: '6 min' }
            ]
        },
        parking: {
            title: 'Parking Availability',
            stats: [
                { label: 'Available Spots', value: '1,247' },
                { label: 'Occupancy Rate', value: '68%' },
                { label: 'Avg Hourly Rate', value: '$4.50' }
            ]
        },
        events: {
            title: 'City Events',
            stats: [
                { label: "Today's Events", value: '7' },
                { label: 'This Week', value: '23' },
                { label: 'Next Major Event', value: 'Music Fest - Sat' }
            ]
        }
    };
    
    function updateTabContent(tabName) {
        const data = serviceData[tabName];
        const statsHTML = data.stats.map(stat => `
            <div class="stat-card">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `).join('');
        
        tabContent.innerHTML = `
            <h4 class="tab-title">${data.title}</h4>
            ${statsHTML}
            <div class="tip-box">
                <div class="tip-title">💡 Quick Tip</div>
                <p class="tip-text">Monitor real-time updates and receive alerts for any changes in city services.</p>
            </div>
        `;
        
        // Animate content
        anime({
            targets: '.stat-card',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            easing: 'easeOutQuad',
            duration: 500
        });
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateTabContent(tab.dataset.tab);
        });
    });
    
    // Initialize first tab
    updateTabContent('waste');
}

// Modals
function initModals() {
    // Avatar button - show login popup
    document.getElementById('avatarBtn').addEventListener('click', () => {
        openModal('loginPopup');
    });
    
    // Go to login button
    document.getElementById('goToLogin').addEventListener('click', () => {
        closeModal('loginPopup');
        showLoginPage();
    });
    
    // FAB buttons
    document.getElementById('chatbotBtn').addEventListener('click', () => {
        openModal('chatbotModal');
    });
    
    document.getElementById('communityBtn').addEventListener('click', () => {
        openModal('communityModal');
        loadCommunityMessages();
    });
    
    document.getElementById('complaintBtn').addEventListener('click', () => {
        openModal('complaintModal');
    });
    
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.modal);
        });
    });
    
    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    anime({
        targets: modal.querySelector('.modal-content'),
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    
    anime({
        targets: modal.querySelector('.modal-content'),
        scale: [1, 0.9],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuad',
        complete: () => {
            modal.classList.remove('active');
        }
    });
}

// Login Page
function initLoginPage() {
    // Back to dashboard
    document.getElementById('backToDashboard').addEventListener('click', () => {
        hideLogi nPage();
    });
    
    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    });
    
    // Toggle form mode
    document.getElementById('toggleFormMode').addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        const usernameField = document.getElementById('usernameField');
        const forgotPassword = document.getElementById('forgotPassword');
        const submitBtn = document.querySelector('.login-submit');
        const toggleText = document.getElementById('toggleFormMode');
        const toggleMsg = toggleText.previousElementSibling;
        
        if (isLoginMode) {
            usernameField.style.display = 'none';
            forgotPassword.style.display = 'block';
            submitBtn.textContent = 'Log In';
            toggleMsg.textContent = "Don't have an account? ";
            toggleText.textContent = 'Sign up';
        } else {
            usernameField.style.display = 'block';
            forgotPassword.style.display = 'none';
            submitBtn.textContent = 'Sign Up';
            toggleMsg.textContent = 'Already have an account? ';
            toggleText.textContent = 'Log in';
        }
    });
    
    // Login form submit
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        hideLoginPage();
    });
    
    // Carousel
    startCarousel();
}

function showLoginPage() {
    document.getElementById('dashboardView').classList.remove('active');
    document.getElementById('loginView').classList.add('active');
    
    anime({
        targets: '.login-form-container',
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

function hideLoginPage() {
    anime({
        targets: '.login-form-container',
        translateX: [0, 50],
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
            document.getElementById('loginView').classList.remove('active');
            document.getElementById('dashboardView').classList.add('active');
            
            // Animate dashboard elements
            anime({
                targets: '.metric-card',
                translateY: [30, 0],
                opacity: [0, 1],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
    });
}

function startCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    setInterval(() => {
        slides[currentCarouselIndex].classList.remove('active');
        dots[currentCarouselIndex].classList.remove('active');
        
        currentCarouselIndex = (currentCarouselIndex + 1) % slides.length;
        
        slides[currentCarouselIndex].classList.add('active');
        dots[currentCarouselIndex].classList.add('active');
    }, 3000);
}

// Chatbot
function initChatbot() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    
    // Set initial message time
    const firstMessage = chatMessages.querySelector('.message-time');
    if (firstMessage) {
        firstMessage.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function sendMessage(text) {
        if (!text.trim()) return;
        
        // Add user message
        const userMsg = createChatMessage(text, 'user');
        chatMessages.appendChild(userMsg);
        
        // Animate user message
        anime({
            targets: userMsg,
            translateX: [20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Bot response
        setTimeout(() => {
            const botResponse = generateBotResponse(text);
            const botMsg = createChatMessage(botResponse, 'bot');
            chatMessages.appendChild(botMsg);
            
            anime({
                targets: botMsg,
                translateX: [-20, 0],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    sendBtn.addEventListener('click', () => {
        sendMessage(chatInput.value);
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });
    
    // Quick actions
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.dataset.query);
        });
    });
}

function createChatMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    return div;
}

function generateBotResponse(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('route') || lowerQuery.includes('downtown')) {
        return "🗺️ The best route to downtown: Take Highway 101 South for 8 miles, then exit at Market Street. Current travel time is approximately 15 minutes with light traffic. Alternative route via Bay Street adds 5 minutes but avoids tolls.";
    } else if (lowerQuery.includes('restaurant')) {
        return "🍽️ Top restaurants near you:\n\n1. **The Golden Spoon** (0.5 mi) - Italian cuisine, 4.8★\n2. **Sushi Paradise** (0.7 mi) - Japanese, 4.7★\n3. **Café Monet** (0.3 mi) - French bistro, 4.9★\n\nAll are currently open and accepting reservations!";
    } else if (lowerQuery.includes('tourist') || lowerQuery.includes('attraction')) {
        return "🎯 Top attractions in San Francisco:\n\n1. Golden Gate Bridge\n2. Fisherman's Wharf\n3. Alcatraz Island\n4. Cable Car rides\n5. Pier 39\n\nAll locations have moderate crowd levels today. Perfect time to visit!";
    } else if (lowerQuery.includes('traffic')) {
        return "🚦 Current traffic update: Traffic is moderate across the city. Heavy congestion reported on Bay Bridge (68% congestion). Highway 101 is clear. Estimated delays: 10-15 minutes on major routes.";
    } else {
        return "I'm here to help with routing, restaurant recommendations, traffic updates, and city information. What would you like to know?";
    }
}

// Community Chat
function initCommunityChat() {
    const communityInput = document.getElementById('communityInput');
    const sendBtn = document.getElementById('sendCommunityMessage');
    const communityMessages = document.getElementById('communityMessages');
    
    function sendCommunityMessage(text) {
        if (!text.trim()) return;
        
        const msg = createCommunityMessage('You', text, '😊');
        communityMessages.appendChild(msg);
        
        anime({
            targets: msg,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        communityInput.value = '';
        communityMessages.scrollTop = communityMessages.scrollHeight;
    }
    
    sendBtn.addEventListener('click', () => {
        sendCommunityMessage(communityInput.value);
    });
    
    communityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendCommunityMessage(communityInput.value);
        }
    });
}

function loadCommunityMessages() {
    const communityMessages = document.getElementById('communityMessages');
    if (communityMessages.children.length > 0) return;
    
    const messages = [
        { username: 'Sarah Chen', message: 'Has anyone been to the new park on Market Street? How is it?', avatar: '👩', time: 5 },
        { username: 'Mike Johnson', message: "It's amazing! Lots of green space and they have a great playground for kids.", avatar: '👨', time: 4 },
        { username: 'Emily Rodriguez', message: 'Anyone know if the farmers market is open this weekend?', avatar: '👧', time: 3 },
        { username: 'David Park', message: 'Yes! Opens Saturday 8 AM at Union Square. Great fresh produce!', avatar: '🧑', time: 2 }
    ];
    
    messages.forEach((msg, index) => {
        setTimeout(() => {
            const msgEl = createCommunityMessage(msg.username, msg.message, msg.avatar);
            communityMessages.appendChild(msgEl);
            
            anime({
                targets: msgEl,
                translateY: [20, 0],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        }, index * 200);
    });
}

function createCommunityMessage(username, message, avatar) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div style="flex: 1;">
            <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span class="message-username">${username}</span>
                <span class="message-timestamp">${time}</span>
            </div>
            <div class="message-content" style="background: #f9fafb; border: 1px solid #e5e7eb; color: #1f2937;">
                <p style="font-size: 0.875rem;">${message}</p>
            </div>
        </div>
    `;
    
    return div;
}

// Complaint Form
function initComplaintForm() {
    const form = document.getElementById('complaintForm');
    const fileUpload = document.getElementById('fileUpload');
    const photoInput = document.getElementById('photoInput');
    const uploadContent = document.getElementById('uploadContent');
    
    fileUpload.addEventListener('click', () => {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadContent.innerHTML = `
                    <div class="file-preview">
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-file" onclick="removePhoto()">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showComplaintSuccess();
    });
}

function removePhoto() {
    const uploadContent = document.getElementById('uploadContent');
    const photoInput = document.getElementById('photoInput');
    photoInput.value = '';
    uploadContent.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <p>Click to upload photo</p>
        <span>PNG, JPG up to 10MB</span>
    `;
}

function showComplaintSuccess() {
    const complaintBody = document.getElementById('complaintBody');
    const trackingId = Math.floor(Math.random() * 10000);
    
    complaintBody.innerHTML = `
        <div class="success-state">
            <div class="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h3>Complaint Submitted!</h3>
            <p>
                Your complaint has been registered successfully.<br>
                Tracking ID: <span class="tracking-id">#SF${trackingId}</span>
            </p>
            <p style="font-size: 0.875rem; color: #6b7280;">You will receive updates via email.</p>
        </div>
    `;
    
    anime({
        targets: '.success-state',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad'
    });
    
    setTimeout(() => {
        closeModal('complaintModal');
        // Reset form
        setTimeout(() => {
            document.getElementById('complaintForm').reset();
            removePhoto();
            complaintBody.innerHTML = `<form id="complaintForm" class="complaint-form">...</form>`;
            initComplaintForm();
        }, 500);
    }, 3000);
}

// Animations
function initAnimations() {
    // Animate metric cards on load
    anime({
        targets: '.metric-card',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 300}),
        duration: 600,
        easing: 'easeOutQuad'
    });
    
    // Animate hero section
    anime({
        targets: '.hero-weather',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
    });
    
    // Animate charts
    anime({
        targets: '.chart-card',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(150, {start: 500}),
        duration: 600,
        easing: 'easeOutQuad'
    });
    
    // Animate FABs
    anime({
        targets: '.fab',
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 800}),
        duration: 400,
        easing: 'easeOutElastic(1, .5)'
    });
    
    // Hover animations for metric cards
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.02,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}
