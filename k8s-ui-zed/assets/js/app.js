// CloudK8s Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupSearchFunctionality();
    setupNotifications();
    setupUserMenu();
    setupCharts();
    setupRealTimeUpdates();
    setupModals();
    setupFilters();
    setupDeploymentControls();
    setupClusterActions();
}

// Tab Navigation System
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all nav items and tab contents
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding tab
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.classList.add('fade-in');
            }
            
            // Update URL hash without scrolling
            history.pushState(null, null, '#' + targetTab);
            
            // Load tab-specific data
            loadTabData(targetTab);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const navItem = document.querySelector(`[data-tab="${hash}"]`);
            if (navItem) {
                navItem.click();
            }
        }
    });
    
    // Initialize from URL hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        const initialNavItem = document.querySelector(`[data-tab="${initialHash}"]`);
        if (initialNavItem) {
            initialNavItem.click();
        }
    }
}

// Search Functionality
function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        } else {
            clearSearchResults();
        }
    });
    
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value.trim());
        }
    });
}

function performSearch(query) {
    console.log('Searching for:', query);
    // Implement search logic here
    // This would typically make an API call to search clusters, pods, services, etc.
}

function clearSearchResults() {
    // Clear any visible search results
}

// Notification System
function setupNotifications() {
    const notificationBell = document.querySelector('.notification-bell');
    if (!notificationBell) return;
    
    notificationBell.addEventListener('click', function() {
        toggleNotificationDropdown();
    });
    
    // Check for new notifications periodically
    setInterval(checkForNotifications, 30000); // Every 30 seconds
}

function toggleNotificationDropdown() {
    // Create or toggle notification dropdown
    let dropdown = document.querySelector('.notification-dropdown');
    
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    dropdown = document.createElement('div');
    dropdown.className = 'notification-dropdown';
    dropdown.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="mark-all-read">Mark all read</button>
        </div>
        <div class="notification-list">
            <div class="notification-item unread">
                <div class="notification-icon warning">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="notification-content">
                    <p><strong>High CPU Usage</strong></p>
                    <p>Production cluster CPU usage at 85%</p>
                    <span class="notification-time">5 minutes ago</span>
                </div>
            </div>
            <div class="notification-item unread">
                <div class="notification-icon error">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="notification-content">
                    <p><strong>Pod Failure</strong></p>
                    <p>web-frontend-3 failed to start</p>
                    <span class="notification-time">12 minutes ago</span>
                </div>
            </div>
            <div class="notification-item">
                <div class="notification-icon success">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="notification-content">
                    <p><strong>Deployment Success</strong></p>
                    <p>api-service v2.1.0 deployed successfully</p>
                    <span class="notification-time">1 hour ago</span>
                </div>
            </div>
        </div>
        <div class="notification-footer">
            <a href="#alerts">View all alerts</a>
        </div>
    `;
    
    document.querySelector('.notification-bell').appendChild(dropdown);
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.notification-bell')) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function checkForNotifications() {
    // This would make an API call to check for new notifications
    // For demo purposes, we'll simulate receiving notifications
    const badge = document.querySelector('.notification-badge');
    if (badge && Math.random() > 0.8) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        badge.style.display = 'block';
    }
}

// User Menu
function setupUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;
    
    userMenu.addEventListener('click', function() {
        toggleUserDropdown();
    });
}

function toggleUserDropdown() {
    let dropdown = document.querySelector('.user-dropdown');
    
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
        <div class="user-dropdown-header">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MjY2RjEiLz4KPHR3eCB4PSIxMCIgeT0iMTUiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" alt="User">
            <div>
                <h4>John Smith</h4>
                <p>john.smith@company.com</p>
            </div>
        </div>
        <div class="user-dropdown-menu">
            <a href="#profile"><i class="fas fa-user"></i> Profile Settings</a>
            <a href="#account"><i class="fas fa-cog"></i> Account</a>
            <a href="#billing"><i class="fas fa-credit-card"></i> Billing</a>
            <a href="#support"><i class="fas fa-life-ring"></i> Support</a>
            <hr>
            <a href="#logout" class="logout"><i class="fas fa-sign-out-alt"></i> Sign Out</a>
        </div>
    `;
    
    document.querySelector('.user-menu').appendChild(dropdown);
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.user-menu')) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

// Charts Setup (using Chart.js placeholder)
function setupCharts() {
    // Resource Usage Chart
    const resourceChart = document.getElementById('resourceChart');
    if (resourceChart) {
        // Placeholder for Chart.js implementation
        resourceChart.style.background = '#f0f0f0';
        resourceChart.style.borderRadius = '8px';
        resourceChart.style.display = 'flex';
        resourceChart.style.alignItems = 'center';
        resourceChart.style.justifyContent = 'center';
        resourceChart.textContent = 'Resource Usage Chart';
    }
    
    // Cost Chart
    const costChart = document.getElementById('costChart');
    if (costChart) {
        costChart.style.background = '#f0f0f0';
        costChart.style.borderRadius = '8px';
        costChart.style.display = 'flex';
        costChart.style.alignItems = 'center';
        costChart.style.justifyContent = 'center';
        costChart.textContent = 'Cost Breakdown Chart';
    }
    
    // Monitoring Charts
    const monitoringCharts = ['cpuChart', 'memoryChart', 'networkChart'];
    monitoringCharts.forEach(chartId => {
        const chart = document.getElementById(chartId);
        if (chart) {
            chart.style.background = '#f0f0f0';
            chart.style.borderRadius = '8px';
            chart.style.display = 'flex';
            chart.style.alignItems = 'center';
            chart.style.justifyContent = 'center';
            chart.textContent = 'Monitoring Chart';
        }
    });
}

// Real-time Updates
function setupRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(updateDashboardMetrics, 5000); // Every 5 seconds
    setInterval(updateClusterStatus, 10000); // Every 10 seconds
}

function updateDashboardMetrics() {
    // Update CPU usage
    const cpuMetric = document.querySelector('.metric-value');
    if (cpuMetric && cpuMetric.textContent.includes('%')) {
        const currentValue = parseFloat(cpuMetric.textContent);
        const newValue = Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * 10));
        cpuMetric.textContent = newValue.toFixed(1) + '%';
    }
    
    // Update pod counts
    const podCounts = document.querySelectorAll('.metric-value');
    podCounts.forEach(metric => {
        if (metric.textContent.match(/^\d+$/)) {
            const currentCount = parseInt(metric.textContent);
            const change = Math.floor((Math.random() - 0.5) * 4);
            metric.textContent = Math.max(0, currentCount + change);
        }
    });
}

function updateClusterStatus() {
    // Simulate cluster status changes
    const clusterCards = document.querySelectorAll('.cluster-card');
    clusterCards.forEach(card => {
        const metrics = card.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            if (metric.textContent.includes('%')) {
                const currentValue = parseFloat(metric.textContent);
                const newValue = Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * 5));
                metric.textContent = newValue.toFixed(0) + '%';
            }
        });
    });
}

// Modal System
function setupModals() {
    // Create cluster modal
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn') && e.target.textContent.includes('Create Cluster')) {
            showCreateClusterModal();
        }
        
        if (e.target.closest('.btn') && e.target.textContent.includes('Deploy Workload')) {
            showDeployWorkloadModal();
        }
        
        if (e.target.closest('.btn') && e.target.textContent.includes('New Deployment')) {
            showNewDeploymentModal();
        }
    });
}

function showCreateClusterModal() {
    const modal = createModal('Create New Cluster', `
        <form class="cluster-form">
            <div class="form-group">
                <label>Cloud Provider</label>
                <select name="provider" required>
                    <option value="">Select Provider</option>
                    <option value="aws">Amazon Web Services (EKS)</option>
                    <option value="azure">Microsoft Azure (AKS)</option>
                    <option value="gcp">Google Cloud Platform (GKE)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Cluster Name</label>
                <input type="text" name="name" placeholder="Enter cluster name" required>
            </div>
            <div class="form-group">
                <label>Region</label>
                <select name="region" required>
                    <option value="">Select Region</option>
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Node Count</label>
                <input type="number" name="nodeCount" value="3" min="1" max="100" required>
            </div>
            <div class="form-group">
                <label>Instance Type</label>
                <select name="instanceType" required>
                    <option value="t3.medium">t3.medium (2 vCPU, 4 GB RAM)</option>
                    <option value="t3.large">t3.large (2 vCPU, 8 GB RAM)</option>
                    <option value="m5.large">m5.large (2 vCPU, 8 GB RAM)</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Cluster</button>
            </div>
        </form>
    `);
    
    modal.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle cluster creation
        console.log('Creating cluster...');
        closeModal();
        showNotification('Cluster creation started', 'success');
    });
}

function showDeployWorkloadModal() {
    const modal = createModal('Deploy New Workload', `
        <form class="workload-form">
            <div class="form-group">
                <label>Workload Type</label>
                <select name="type" required>
                    <option value="">Select Type</option>
                    <option value="deployment">Deployment</option>
                    <option value="statefulset">StatefulSet</option>
                    <option value="daemonset">DaemonSet</option>
                </select>
            </div>
            <div class="form-group">
                <label>Workload Name</label>
                <input type="text" name="name" placeholder="Enter workload name" required>
            </div>
            <div class="form-group">
                <label>Namespace</label>
                <select name="namespace" required>
                    <option value="default">default</option>
                    <option value="production">production</option>
                    <option value="staging">staging</option>
                </select>
            </div>
            <div class="form-group">
                <label>Container Image</label>
                <input type="text" name="image" placeholder="nginx:latest" required>
            </div>
            <div class="form-group">
                <label>Replicas</label>
                <input type="number" name="replicas" value="3" min="1" max="100" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Deploy Workload</button>
            </div>
        </form>
    `);
    
    modal.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Deploying workload...');
        closeModal();
        showNotification('Workload deployment started', 'success');
    });
}

function createModal(title, content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    return modalOverlay;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Filter System
function setupFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function applyFilters() {
    // Get all filter values
    const filters = {};
    document.querySelectorAll('.filter-select').forEach(select => {
        if (select.value) {
            filters[select.name || 'filter'] = select.value;
        }
    });
    
    console.log('Applying filters:', filters);
    // Implement filtering logic here
}

// Deployment Controls
function setupDeploymentControls() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn') && e.target.textContent.includes('Promote')) {
            handleCanaryPromotion();
        }
        
        if (e.target.closest('.btn') && e.target.textContent.includes('Rollback')) {
            handleRollback();
        }
        
        if (e.target.closest('.btn') && e.target.textContent.includes('Start')) {
            handleDeploymentStart();
        }
    });
}

function handleCanaryPromotion() {
    showNotification('Promoting canary deployment to 100%', 'info');
    // Simulate promotion progress
    const progressBar = document.querySelector('.progress-fill.canary');
    if (progressBar) {
        let width = 25;
        const interval = setInterval(() => {
            width += 15;
            progressBar.style.width = width + '%';
            progressBar.parentElement.nextElementSibling.textContent = width + '% Traffic to Canary';
            
            if (width >= 100) {
                clearInterval(interval);
                progressBar.classList.remove('canary');
                progressBar.parentElement.nextElementSibling.textContent = '100% Complete';
                showNotification('Canary deployment promoted successfully', 'success');
            }
        }, 500);
    }
}

function handleRollback() {
    showNotification('Rolling back deployment', 'warning');
    const progressBar = document.querySelector('.progress-fill.canary');
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.parentElement.nextElementSibling.textContent = 'Rolled back';
    }
}

function handleDeploymentStart() {
    showNotification('Starting deployment', 'info');
}

// Cluster Actions
function setupClusterActions() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn') && e.target.textContent === 'Scale') {
            handleClusterScale(e.target.closest('.cluster-card'));
        }
        
        if (e.target.closest('.btn') && e.target.textContent === 'Start') {
            handleClusterStart(e.target.closest('.cluster-card'));
        }
        
        if (e.target.closest('.btn') && e.target.textContent === 'Delete') {
            handleClusterDelete(e.target.closest('.cluster-card'));
        }
    });
}

function handleClusterScale(clusterCard) {
    const clusterName = clusterCard.querySelector('h3').textContent;
    const currentNodes = clusterCard.querySelector('.metric-value').textContent;
    
    const newCount = prompt(`Scale ${clusterName}\nCurrent nodes: ${currentNodes}\nEnter new node count:`, currentNodes);
    if (newCount && !isNaN(newCount)) {
        clusterCard.querySelector('.metric-value').textContent = newCount;
        showNotification(`Scaling ${clusterName} to ${newCount} nodes`, 'info');
    }
}

function handleClusterStart(clusterCard) {
    const clusterName = clusterCard.querySelector('h3').textContent;
    const status = clusterCard.querySelector('.cluster-status');
    
    status.className = 'cluster-status running';
    status.innerHTML = '<i class="fas fa-circle"></i> Running';
    
    // Update metrics
    const metrics = clusterCard.querySelectorAll('.metric-value');
    metrics[1].textContent = '12'; // Pods
    metrics[2].textContent = '45%'; // CPU
    metrics[3].textContent = '38%'; // Memory
    
    showNotification(`Starting cluster ${clusterName}`, 'success');
}

function handleClusterDelete(clusterCard) {
    const clusterName = clusterCard.querySelector('h3').textContent;
    
    if (confirm(`Are you sure you want to delete cluster "${clusterName}"?\n\nThis action cannot be undone.`)) {
        clusterCard.style.opacity = '0.5';
        clusterCard.style.pointerEvents = 'none';
        showNotification(`Deleting cluster ${clusterName}`, 'warning');
        
        setTimeout(() => {
            clusterCard.remove();
        }, 2000);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Position notifications
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Load tab-specific data
function loadTabData(tabName) {
    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'clusters':
            loadClustersData();
            break;
        case 'workloads':
            loadWorkloadsData();
            break;
        case 'monitoring':
            loadMonitoringData();
            break;
        default:
            console.log(`Loading data for ${tabName} tab`);
    }
}

function loadDashboardData() {
    // Simulate loading dashboard data
    console.log('Loading dashboard data...');
}

function loadClustersData() {
    // Simulate loading clusters data
    console.log('Loading clusters data...');
}

function loadWorkloadsData() {
    // Simulate loading workloads data
    console.log('Loading workloads data...');
}

function loadMonitoringData() {
    // Simulate loading monitoring data
    console.log('Loading monitoring data...');
}

// Time range selector for monitoring
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('time-btn')) {
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const timeRange = e.target.textContent;
        console.log(`Loading metrics for ${timeRange}`);
        // Update charts based on time range
    }
});

// Tenant switcher
document.addEventListener('change', function(e) {
    if (e.target.id === 'tenantSelect') {
        const selectedTenant = e.target.value;
        console.log(`Switching to tenant: ${selectedTenant}`);
        // Reload all data for new tenant
        showNotification(`Switched to ${selectedTenant}`, 'success');
    }
});