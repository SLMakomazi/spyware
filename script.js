// Educational Security Demonstration Script
class SecurityDemo {
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
        this.init();
    }

    init() {
        // Show welcome modal on page load
        setTimeout(() => {
            this.showWelcomeModal();
        }, 1000);

        // Set up event listeners
        document.getElementById('acceptBtn').addEventListener('click', () => this.handleAccept());
        document.getElementById('declineBtn').addEventListener('click', () => this.handleDecline());
        document.getElementById('closeDashboard').addEventListener('click', () => this.closeDashboard());
        
        // Image viewer event listeners
        document.querySelector('.close-btn').addEventListener('click', () => this.closeImageViewer());
        document.getElementById('downloadImage').addEventListener('click', () => this.downloadCurrentImage());
        document.getElementById('deleteImage').addEventListener('click', () => this.deleteCurrentImage());
        
        // Close modal when clicking outside
        document.getElementById('imageViewerModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('imageViewerModal')) {
                this.closeImageViewer();
            }
        });
    }

    showWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.style.display = 'block';
    }

    async handleAccept() {
        const modal = document.getElementById('welcomeModal');
        modal.style.display = 'none';
        
        // Start collecting data
        await this.collectAllData();
        
        // Show dashboard
        this.showDashboard();
    }

    handleDecline() {
        const modal = document.getElementById('welcomeModal');
        modal.style.display = 'none';
        
        // Show educational message
        alert('Good choice! Always be cautious about permission requests. This was an educational demonstration.');
    }

    async collectAllData() {
        // Collect device information
        this.collectDeviceInfo();
        
        // Collect browser information
        this.collectBrowserInfo();
        
        // Try to collect camera data
        await this.tryCollectCamera();
        
        // Try to collect location data
        await this.tryCollectLocation();
        
        // Check permission statuses
        this.checkPermissions();
    }

    collectDeviceInfo() {
        const deviceInfo = {
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
            maxTouchPoints: navigator.maxTouchPoints || 0
        };

        this.collectedData.device = deviceInfo;
        this.updateDeviceInfo(deviceInfo);
    }

    collectBrowserInfo() {
        const browserInfo = {
            name: this.getBrowserName(),
            version: this.getBrowserVersion(),
            supportsGeolocation: 'geolocation' in navigator,
            supportsCamera: 'mediaDevices' in navigator,
            supportsNotifications: 'Notification' in window,
            supportsServiceWorker: 'serviceWorker' in navigator,
            supportsWebRTC: 'RTCPeerConnection' in window,
            supportsLocalStorage: 'localStorage' in window,
            supportsSessionStorage: 'sessionStorage' in window,
            supportsIndexedDB: 'indexedDB' in window,
            supportsWebGL: this.checkWebGL(),
            supportsWebAudio: 'AudioContext' in window || 'webkitAudioContext' in window
        };

        this.collectedData.browser = browserInfo;
        this.updateBrowserInfo(browserInfo);
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

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    async tryCollectCamera() {
        const statusElement = document.getElementById('camera-status');
        statusElement.textContent = 'Requesting permission...';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: false 
            });
            
            statusElement.textContent = 'Camera access granted';
            statusElement.style.color = 'green';
            
            // Store stream for secret capture
            this.cameraStream = stream;
            
            // Show camera feed briefly to appear legitimate
            const video = document.getElementById('camera-feed');
            const canvas = document.getElementById('camera-canvas');
            video.srcObject = stream;
            video.classList.remove('hidden');
            
            // Capture a snapshot after 3 seconds (visible capture)
            setTimeout(() => {
                this.captureCameraSnapshot(video, canvas);
            }, 3000);
            
            // Start secret background captures
            this.startSecretCapture();
            
            this.collectedData.camera = {
                status: 'granted',
                timestamp: new Date().toISOString(),
                capabilities: stream.getVideoTracks()[0].getCapabilities()
            };

        } catch (error) {
            statusElement.textContent = `Camera denied: ${error.name}`;
            statusElement.style.color = 'red';
            
            this.collectedData.camera = {
                status: 'denied',
                error: error.name,
                timestamp: new Date().toISOString()
            };
        }
    }

    captureCameraSnapshot(video, canvas) {
        // Wait for video to be ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setTimeout(() => this.captureCameraSnapshot(video, canvas), 500);
            return;
        }
        
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
            context.drawImage(video, 0, 0);
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            this.collectedData.camera.snapshot = imageData;
            
            console.log('Visible camera snapshot captured successfully');
        } catch (error) {
            console.error('Error capturing visible snapshot:', error);
        }
        
        // Hide video but keep stream for secret captures
        video.classList.add('hidden');
    }

    startSecretCapture() {
        if (!this.cameraStream) return;
        
        // Create hidden video element for secret capture
        const secretVideo = document.createElement('video');
        secretVideo.srcObject = this.cameraStream;
        secretVideo.autoplay = true;
        secretVideo.muted = true;
        secretVideo.style.display = 'none';
        secretVideo.playsInline = true;
        document.body.appendChild(secretVideo);
        
        // Wait for video to be ready and playing
        secretVideo.onloadedmetadata = () => {
            secretVideo.play().then(() => {
                // Wait a bit for video to actually start rendering
                setTimeout(() => {
                    // Start capturing images every 10 seconds
                    this.secretCaptureInterval = setInterval(() => {
                        this.captureSecretImage(secretVideo);
                    }, 10000);
                    
                    // Capture first image after 3 seconds
                    setTimeout(() => {
                        this.captureSecretImage(secretVideo);
                    }, 3000);
                }, 1000);
            }).catch(error => {
                console.error('Error playing secret video:', error);
            });
        };
    }

    captureSecretImage(video) {
        // Check if video is ready and has valid dimensions
        if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.paused || video.ended) {
            console.log('Video not ready for capture, skipping...');
            return;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        try {
            // Draw the current video frame
            context.drawImage(video, 0, 0);
            
            // Check if canvas has content (not all black)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let hasContent = false;
            
            // Check if any pixel is not pure black
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] > 10 || pixels[i + 1] > 10 || pixels[i + 2] > 10) {
                    hasContent = true;
                    break;
                }
            }
            
            if (!hasContent) {
                console.log('Captured image appears to be black, skipping...');
                canvas.remove();
                return;
            }
            
            // Convert to base64 with lower quality for smaller size
            const base64Image = canvas.toDataURL('image/jpeg', 0.3);
            
            // Store secret image with timestamp
            const secretImageData = {
                image: base64Image,
                timestamp: new Date().toISOString(),
                type: 'secret_capture',
                width: canvas.width,
                height: canvas.height
            };
            
            this.collectedData.secretImages.push(secretImageData);
            
            // Log for demonstration (in real attack, this would be sent to server)
            console.log('Secret image captured:', secretImageData.timestamp);
            
        } catch (error) {
            console.error('Error capturing secret image:', error);
        } finally {
            // Clean up canvas
            canvas.remove();
            
            // Update dashboard if visible
            this.updateSecretImageCount();
        }
    }

    updateSecretImageCount() {
        const dashboard = document.getElementById('dashboard');
        if (!dashboard.classList.contains('hidden')) {
            // Refresh the entire secret images display
            this.displaySecretImages();
        }
    }

    stopSecretCapture() {
        if (this.secretCaptureInterval) {
            clearInterval(this.secretCaptureInterval);
            this.secretCaptureInterval = null;
        }
        
        if (this.cameraStream) {
            const tracks = this.cameraStream.getTracks();
            tracks.forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    displaySecretImages() {
        const grid = document.getElementById('secret-images-grid');
        const count = document.getElementById('secret-image-count');
        
        if (!grid || !count) return;
        
        // Clear existing images
        grid.innerHTML = '';
        
        // Update count
        count.textContent = `Secret images captured: ${this.collectedData.secretImages.length}`;
        
        // Display images
        this.collectedData.secretImages.forEach((imageData, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            
            const img = document.createElement('img');
            img.src = imageData.image;
            img.style.width = '100px';
            img.style.height = '75px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.border = '2px solid #ff6b6b';
            img.setAttribute('data-index', index);
            img.addEventListener('click', () => this.openImageViewer(index));
            
            const timestamp = document.createElement('div');
            timestamp.textContent = new Date(imageData.timestamp).toLocaleTimeString();
            timestamp.style.fontSize = '10px';
            timestamp.style.textAlign = 'center';
            timestamp.style.marginTop = '2px';
            timestamp.style.color = '#666';
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(timestamp);
            grid.appendChild(imgContainer);
        });
    }

    async tryCollectLocation() {
        const statusElement = document.getElementById('location-status');
        const infoElement = document.getElementById('location-info');
        
        statusElement.textContent = 'Requesting permission...';

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    enableHighAccuracy: true
                });
            });
            
            statusElement.textContent = 'Location access granted';
            statusElement.style.color = 'green';
            
            const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: new Date(position.timestamp).toISOString()
            };
            
            this.collectedData.location = locationData;
            
            infoElement.innerHTML = `
                <strong>Latitude:</strong> ${locationData.latitude}<br>
                <strong>Longitude:</strong> ${locationData.longitude}<br>
                <strong>Accuracy:</strong> ${locationData.accuracy}m<br>
                <strong>Timestamp:</strong> ${locationData.timestamp}
            `;

        } catch (error) {
            statusElement.textContent = `Location denied: ${error.name}`;
            statusElement.style.color = 'red';
            
            this.collectedData.location = {
                status: 'denied',
                error: error.name,
                timestamp: new Date().toISOString()
            };
            
            infoElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
        }
    }

    async checkPermissions() {
        const permissions = [
            'camera',
            'microphone',
            'geolocation',
            'notifications',
            'persistent-storage'
        ];

        const permissionStatus = {};
        const statusElement = document.getElementById('permission-status');

        for (const permission of permissions) {
            try {
                const result = await navigator.permissions.query({ name: permission });
                permissionStatus[permission] = result.state;
            } catch (error) {
                permissionStatus[permission] = 'unsupported';
            }
        }

        this.collectedData.permissions = permissionStatus;
        
        // Display permission status
        let statusHTML = '<strong>Permission Status:</strong><br>';
        for (const [permission, status] of Object.entries(permissionStatus)) {
            const color = status === 'granted' ? 'green' : status === 'denied' ? 'red' : 'orange';
            statusHTML += `<span style="color: ${color}">${permission}: ${status}</span><br>`;
        }
        statusElement.innerHTML = statusHTML;
    }

    updateDeviceInfo(deviceInfo) {
        const element = document.getElementById('device-info');
        element.innerHTML = `
            <strong>User Agent:</strong> ${deviceInfo.userAgent}<br>
            <strong>Platform:</strong> ${deviceInfo.platform}<br>
            <strong>Language:</strong> ${deviceInfo.language}<br>
            <strong>Screen:</strong> ${deviceInfo.screenResolution}<br>
            <strong>Timezone:</strong> ${deviceInfo.timezone}<br>
            <strong>CPU Cores:</strong> ${deviceInfo.hardwareConcurrency}<br>
            <strong>Memory:</strong> ${deviceInfo.deviceMemory}GB<br>
            <strong>Touch Points:</strong> ${deviceInfo.maxTouchPoints}
        `;
    }

    updateBrowserInfo(browserInfo) {
        const element = document.getElementById('browser-info');
        element.innerHTML = `
            <strong>Browser:</strong> ${browserInfo.name} ${browserInfo.version}<br>
            <strong>Geolocation:</strong> ${browserInfo.supportsGeolocation ? 'Yes' : 'No'}<br>
            <strong>Camera:</strong> ${browserInfo.supportsCamera ? 'Yes' : 'No'}<br>
            <strong>Notifications:</strong> ${browserInfo.supportsNotifications ? 'Yes' : 'No'}<br>
            <strong>Service Worker:</strong> ${browserInfo.supportsServiceWorker ? 'Yes' : 'No'}<br>
            <strong>WebRTC:</strong> ${browserInfo.supportsWebRTC ? 'Yes' : 'No'}<br>
            <strong>WebGL:</strong> ${browserInfo.supportsWebGL ? 'Yes' : 'No'}<br>
            <strong>Web Audio:</strong> ${browserInfo.supportsWebAudio ? 'Yes' : 'No'}
        `;
    }

    showDashboard() {
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.remove('hidden');
        
        // Display secret images
        this.displaySecretImages();
        
        // Log collected data for demonstration
        console.log('Educational Demo - Collected Data:', this.collectedData);
    }

    closeDashboard() {
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.add('hidden');
        
        // Stop secret capture when closing dashboard
        this.stopSecretCapture();
    }

    // Method to demonstrate what data CANNOT be accessed
    demonstrateBrowserLimits() {
        const limitations = {
            emails: 'Blocked - No API exists for web access',
            messages: 'Blocked - No API exists for web access', 
            phoneSettings: 'Blocked - No API exists for web access',
            contacts: 'Blocked - No API exists for web access',
            files: 'Limited - User must explicitly select files',
            clipboard: 'Limited - Requires user gesture and permission'
        };
        
        return limitations;
    }

    openImageViewer(index) {
        const imageData = this.collectedData.secretImages[index];
        if (!imageData) return;
        
        this.currentViewingImage = index;
        
        const modal = document.getElementById('imageViewerModal');
        const viewerImage = document.getElementById('viewerImage');
        const imageTitle = document.getElementById('imageTitle');
        const imageTimestamp = document.getElementById('imageTimestamp');
        const imageDimensions = document.getElementById('imageDimensions');
        
        // Set image source
        viewerImage.src = imageData.image;
        
        // Set image info
        imageTitle.textContent = `Secret Image #${index + 1}`;
        imageTimestamp.textContent = `Captured: ${new Date(imageData.timestamp).toLocaleString()}`;
        
        // Get image dimensions
        viewerImage.onload = () => {
            imageDimensions.textContent = `Dimensions: ${viewerImage.naturalWidth} x ${viewerImage.naturalHeight}px`;
        };
        
        // Show modal
        modal.style.display = 'block';
    }

    closeImageViewer() {
        const modal = document.getElementById('imageViewerModal');
        modal.style.display = 'none';
        this.currentViewingImage = null;
    }

    downloadCurrentImage() {
        if (this.currentViewingImage === null) return;
        
        const imageData = this.collectedData.secretImages[this.currentViewingImage];
        if (!imageData) return;
        
        // Create download link
        const link = document.createElement('a');
        link.href = imageData.image;
        link.download = `secret_image_${this.currentViewingImage + 1}_${new Date(imageData.timestamp).getTime()}.jpg`;
        link.click();
    }

    deleteCurrentImage() {
        if (this.currentViewingImage === null) return;
        
        if (confirm('Are you sure you want to delete this secret image?')) {
            // Remove image from array
            this.collectedData.secretImages.splice(this.currentViewingImage, 1);
            
            // Close viewer
            this.closeImageViewer();
            
            // Refresh display
            this.displaySecretImages();
            
            // Update count in camera section
            this.updateSecretImageCount();
        }
    }
}

// Initialize the demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    const demo = new SecurityDemo();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        demo.stopSecretCapture();
    });
});

// Add some "deceptive" UI elements for educational purposes
class DeceptiveUI {
    constructor() {
        this.createFakeProgressIndicators();
        this.createFakeSecurityBadges();
    }

    createFakeProgressIndicators() {
        // Create fake "scanning" indicators
        const scanHTML = `
            <div id="fake-scanner" class="hidden">
                <div class="scanner-overlay">
                    <div class="scanner-content">
                        <h3>Security Scan in Progress...</h3>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p>Checking device compatibility...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', scanHTML);
    }

    createFakeSecurityBadges() {
        // Create fake security badges
        const badgesHTML = `
            <div class="security-badges">
                <span class="badge">SSL Secured</span>
                <span class="badge">GDPR Compliant</span>
                <span class="badge">Privacy Protected</span>
            </div>
        `;
        
        // Add to modal content
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.insertAdjacentHTML('beforeend', badgesHTML);
        }
    }
}

// Add CSS for deceptive elements
const deceptiveStyles = `
    .security-badges {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }
    
    .badge {
        background: #28a745;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .scanner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    }
    
    .scanner-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
    }
    
    .progress-bar {
        width: 100%;
        height: 20px;
        background: #f0f0f0;
        border-radius: 10px;
        overflow: hidden;
        margin: 1rem 0;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        width: 0%;
        animation: progress 3s ease-in-out;
    }
    
    @keyframes progress {
        0% { width: 0%; }
        100% { width: 100%; }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = deceptiveStyles;
document.head.appendChild(styleSheet);

// Initialize deceptive UI
document.addEventListener('DOMContentLoaded', () => {
    new DeceptiveUI();
});
