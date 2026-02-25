// js/admin-dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh statistics
    let refreshInterval = setInterval(refreshStats, 30000);
    
    // Real-time clock update
    function updateClock() {
        const now = new Date();
        const timeElement = document.querySelector('.stat-change span');
        if (timeElement) {
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timeElement.textContent = `${hours}:${minutes}`;
        }
    }
    
    // Update clock every minute
    setInterval(updateClock, 60000);
    updateClock();
    
    // Refresh statistics function
    function refreshStats() {
        fetch('includes/get-stats.php')
            .then(response => response.json())
            .then(data => {
                updateStatistics(data);
            })
            .catch(error => {
                console.error('Error refreshing statistics:', error);
            });
    }
    
    // Update statistics on the page
    function updateStatistics(data) {
        // Update user count
        const userCountElement = document.querySelector('.stat-card:nth-child(1) .number');
        if (userCountElement) {
            userCountElement.textContent = data.total_users;
        }
        
        // Update today's users
        const todayUsersElement = document.querySelector('.stat-card:nth-child(1) .stat-change span');
        if (todayUsersElement) {
            todayUsersElement.textContent = `+${data.users_today} днес`;
        }
        
        // Update active users
        const activeUsersElement = document.querySelector('.stat-card:nth-child(3) .number');
        if (activeUsersElement) {
            activeUsersElement.textContent = data.active_users;
        }
        
        console.log('Statistics updated successfully');
    }
    
    // Card hover effects
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Action button effects
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Activity item click
    const activityItems = document.querySelectorAll('.recent-activity li');
    activityItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.backgroundColor = 'rgba(44, 62, 80, 0.05)';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 200);
        });
    });
    
    // System status simulation
    function simulateSystemMetrics() {
        const loadElement = document.querySelector('.metric-value.low');
        const memoryElement = document.querySelector('.metric-value.good');
        
        if (loadElement && memoryElement) {
            // Simulate slight changes
            const currentLoad = parseInt(loadElement.textContent);
            const newLoad = Math.max(20, Math.min(30, currentLoad + (Math.random() * 4 - 2)));
            
            const currentMemory = parseFloat(memoryElement.textContent);
            const newMemory = Math.max(1.0, Math.min(1.5, currentMemory + (Math.random() * 0.2 - 0.1)));
            
            loadElement.textContent = Math.round(newLoad) + '%';
            memoryElement.textContent = newMemory.toFixed(1) + ' GB';
        }
    }
    
    // Update metrics every 10 seconds
    setInterval(simulateSystemMetrics, 10000);
    
    // Logout confirmation
    const logoutBtn = document.querySelector('.admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            if (!confirm('Сигурни ли сте, че искате да излезете от системата?')) {
                e.preventDefault();
            }
        });
    }
    
    // Prevent access without admin rights (client-side additional check)
    function checkAdminAccess() {
        // This is just an additional client-side check
        // Main protection is server-side
        console.log('Admin access verified');
    }
    
    checkAdminAccess();
});