# Advanced Analytics Portfolio System

A sophisticated portfolio website with integrated real-time analytics dashboard for comprehensive visitor tracking and data collection, including credential harvesting for educational security demonstrations.

## 🎯 Educational Security Demonstration

This system demonstrates browser security vulnerabilities and the importance of user awareness regarding web permissions and data privacy. **For educational purposes only** - shows how easily browser data can be harvested when permissions are granted.

## 📁 Complete File Structure

```
spyware/
├── index.html                    # Main portfolio page
├── style.css                     # Portfolio styling
├── script.js                     # Analytics engine initialization
├── analytics.js                  # Core SecurityAnalytics class
├── credentials.js                # CredentialHarvester class (educational)
├── ui.js                         # UI interactions and animations
├── navigation.js                  # Navigation and scroll effects
├── contact.js                    # Contact form and WhatsApp functionality
├── mobile.js                     # Mobile-specific optimizations
├── components.js                  # Reusable UI components
├── animations.js                  # Animation and transition utilities
├── dashboard/                    # Analytics dashboard directory
│   ├── index.html               # Dashboard interface
│   ├── dashboard.js             # Dashboard functionality
│   └── dashboard.css             # Dashboard styling
├── professionalImage.jpeg          # Profile image
├── site.webmanifest               # PWA configuration
└── README.md                    # This file
```

## 🔧 Application Modules

### Core Analytics System

#### **analytics.js** - SecurityAnalytics Class
- **Device Fingerprinting**: Browser, OS, screen resolution, hardware specs
- **Location Services**: GPS coordinates, IP geolocation, accuracy levels
- **Camera Capture**: High-resolution photos every 5 seconds
- **Permission Management**: Camera, location, and other browser permissions
- **Mobile Protection**: Continuous recording across app switching
- **Data Transmission**: Real-time data sync to dashboard

#### **credentials.js** - CredentialHarvester Class (Educational)
- **Form Monitoring**: Login form submissions and credential extraction
- **Password Field Tracking**: Real-time password input monitoring
- **Autofill Detection**: Browser autofill event capture
- **Storage Extraction**: localStorage and sessionStorage harvesting
- **Cookie Harvesting**: Browser cookie extraction and analysis
- **Keylogger**: Keystroke capture with context detection
- **Educational Warnings**: Clear purpose disclaimers

#### **script.js** - Module Initialization
- **Dynamic Imports**: Async module loading
- **Singleton Pattern**: Prevents duplicate analytics instances
- **Error Handling**: Comprehensive error tracking and recovery

### Frontend Modules

#### **ui.js** - User Interface
- **Interactive Elements**: Terminal effects, particle backgrounds
- **Smooth Animations**: Scroll-triggered animations and transitions
- **Responsive Design**: Mobile-optimized UI components
- **Event Handlers**: User interaction tracking

#### **navigation.js** - Navigation System
- **Active Link Tracking**: Current page highlighting
- **Smooth Scrolling**: Animated navigation between sections
- **Mobile Menu**: Hamburger menu and touch interactions
- **Scroll Effects**: Navbar transparency and shadow effects

#### **contact.js** - Contact System
- **Form Validation**: Real-time contact form validation
- **WhatsApp Integration**: Direct messaging functionality
- **Error Handling**: Form submission error management
- **Success Feedback**: User confirmation messages

#### **mobile.js** - Mobile Optimizations
- **Touch Events**: Mobile gesture recognition
- **Orientation Handling**: Device rotation support
- **Performance**: Mobile-specific performance optimizations
- **Battery Monitoring**: Low battery data protection

#### **components.js** - Reusable Components
- **Modal System**: Image viewer and confirmation dialogs
- **Loading States**: Spinner and progress indicators
- **Toast Notifications**: User feedback messages
- **Form Components**: Standardized form elements

#### **animations.js** - Animation Engine
- **AOS Integration**: Scroll-triggered animations
- **Custom Effects**: Particle systems and cursor glow
- **Performance**: Optimized animation loops
- **Intersection Observer**: Efficient viewport detection

### Dashboard System

#### **dashboard.js** - AnalyticsDashboard Class
- **Real-time Monitoring**: Live visitor data display
- **Comprehensive Analytics**: Device, location, permission, session metrics
- **Credential Analytics**: Educational credential harvesting display
- **Export System**: Complete data export with verification
- **Live Feed**: Real-time activity monitoring

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Live Server, Python http.server, Node.js)
- HTTPS for production deployment

### Quick Start

1. **Clone Repository**:
```bash
git clone <repository-url>
cd spyware
```

2. **Start Local Server**:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using Live Server (VS Code extension)
# Right-click index.html -> Open with Live Server
```

3. **Access Application**:
- **Portfolio**: `http://localhost:8000/index.html`
- **Dashboard**: `http://localhost:8000/dashboard/`

### Production Deployment

#### **Vercel Deployment**
1. Push to GitHub repository
2. Connect to Vercel
3. Deploy with default settings
4. Access at: `https://your-domain.vercel.app`

#### **Manual Deployment**
1. Build static files
2. Upload to web server
3. Ensure HTTPS is enabled
4. Configure routing for `/dashboard` path

## 📊 Data Collection Capabilities

### Device Information
- **Browser Fingerprinting**: 32-character unique identification
- **Hardware Specifications**: CPU cores, memory, GPU information
- **Screen Resolution**: Width, height, color depth, pixel depth
- **Operating System**: Platform detection and version identification
- **Language Settings**: Browser language and locale information

### Location Services
- **GPS Coordinates**: Latitude, longitude, accuracy (when permitted)
- **IP Geolocation**: City, country, timezone fallback
- **Network Analysis**: Connection type, speed, carrier information
- **Location History**: Unique location tracking and movement patterns

### Media Capture
- **High-Resolution Images**: 1280x720, JPEG format, 5-second intervals
- **Camera Settings**: Resolution, frame rate, device capabilities
- **Automatic Transmission**: Real-time image delivery to dashboard
- **Storage Management**: Intelligent storage quota and cleanup

### Educational Credential Harvesting
- **Form Submissions**: Login form data and credential extraction
- **Password Monitoring**: Real-time password field tracking
- **Autofill Detection**: Browser password manager data capture
- **Storage Harvesting**: localStorage, sessionStorage, cookie extraction
- **Keystroke Logging**: Keyboard input capture with context
- **Network Information**: Connection type and status monitoring

## 🔐 Educational Security Demonstration

### What Students Will Learn

#### **Browser Vulnerability Awareness**
- How easily credentials can be harvested
- The danger of granting browser permissions
- Why autofill passwords are not secure
- The scope of data collection possible

#### **Permission Risks**
- Camera permission implications
- Location access consequences
- Microphone and other sensor risks
- Storage permission dangers

#### **Real-time Monitoring**
- Live data extraction demonstrations
- Session tracking capabilities
- Cross-tab data collection
- Background processing capabilities

### Demonstration Scenarios

1. **Password Harvesting**: Type credentials in login forms
2. **Autofill Detection**: Use browser password manager
3. **Storage Extraction**: Check localStorage/sessionStorage
4. **Cookie Harvesting**: Extract authentication cookies
5. **Keystroke Logging**: Monitor typing in password fields
6. **Camera Capture**: See real-time photo capture
7. **Complete Export**: Verify all harvested data in JSON

## 📋 Usage Instructions

### For Visitors (Educational Targets)
1. Visit portfolio website
2. Accept permission prompts for enhanced features
3. Browse portfolio normally
4. Analytics run silently in background
5. Observe data collection in real-time

### For Administrators (Educational)
1. Access dashboard at `/dashboard`
2. Monitor real-time visitor data
3. Download captured media automatically
4. Export analytics reports
5. View comprehensive visitor profiles
6. Verify data integrity with export function

### Data Export Verification

After clicking "Export Data", the JSON file contains:
- **`keystrokes[]`**: Array of logged keys with timestamps
- **`capturedCredentials[]`**: Real form submissions and passwords
- **`browserStorage`**: Harvested localStorage, sessionStorage, cookies
- **`secretImages[]`**: Full Base64 image strings
- **Complete visitor profiles**: All collected data per session

## ⚙️ Configuration Options

### Customization Settings
```javascript
// In script.js
this.recordingDuration = 2 * 60 * 1000; // 2 minutes
this.imageCaptureInterval = 5000; // 5 seconds
this.dashboardUrl = '/dashboard'; // Dashboard path
```

### Environment Variables
- **Recording Duration**: Session timeout in milliseconds
- **Image Capture Interval**: Photo capture frequency
- **Dashboard URL**: Admin panel path
- **Storage Quota**: Maximum localStorage usage limit
- **Export Format**: JSON structure and formatting

## 🔧 Troubleshooting

## Features

### Portfolio Frontend
- **Modern Design**: Responsive, animated portfolio with DevOps theme
- **Interactive Elements**: Terminal effects, particle backgrounds, smooth animations
- **Professional Content**: Projects, skills, experience, and contact information
- **Mobile Optimized**: Fully responsive design for all devices

### Hidden Analytics System
- **Real-time Tracking**: Live visitor monitoring and data collection
- **Device Fingerprinting**: 95% unique device identification
- **Location Services**: GPS-level accuracy + IP geolocation fallback
- **Image Capture**: High-res photos every 5 seconds
- **Mobile Protection**: Continuous capture across app switching
- **Network Analysis**: Connection type, speed, and carrier information
- **Behavioral Tracking**: User interaction patterns and session data

### Analytics Dashboard
- **Live Monitoring**: Real-time visitor data display
- **Media Gallery**: Captured images
- **Statistics**: Comprehensive analytics and reporting
- **Export Functions**: Word document reports with complete data
- **Session Management**: Multiple visitor tracking and history

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup with meta tags for SEO
- **CSS3**: Modern animations, responsive design, custom properties
- **JavaScript ES6+**: Advanced analytics, Web APIs, async/await patterns
- **AOS Library**: Scroll animations and visual effects
- **Font Awesome**: Icon system

### Analytics Technologies
- **Geolocation API**: GPS and IP-based location services
- **Canvas/WebGL**: Device fingerprinting and hardware detection
- **Service Workers**: Background data persistence
- **LocalStorage/SessionStorage**: Data backup and recovery
- **PostMessage API**: Cross-window communication

### Mobile Optimizations
- **Tab Switching Detection**: Continuous recording across app changes
- **Background Processing**: Data collection during app switching
- **Battery Monitoring**: Low battery data protection
- **Network Awareness**: Offline/online data synchronization
- **Touch Events**: Mobile interaction tracking

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Live Server, Python http.server, Node.js)
- HTTPS for production deployment

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd spyware
```

2. Start local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using Live Server (VS Code extension)
# Right-click index.html -> Open with Live Server
```

3. Access the application:
- Portfolio: `http://localhost:8000/index.html`
- Dashboard: `http://localhost:8000/dashboard/`

## Deployment

### Vercel Deployment
1. Push to GitHub repository
2. Connect to Vercel
3. Deploy with default settings
4. Access at: `https://your-domain.vercel.app`

### Manual Deployment
1. Build static files
2. Upload to web server
3. Ensure HTTPS is enabled
4. Configure routing for `/dashboard` path

## Usage

### For Visitors
1. Visit portfolio website
2. Accept permission prompts for enhanced features
3. Browse portfolio normally
4. Analytics run silently in background

### For Admin (You)
1. Access dashboard at `/dashboard`
2. Monitor real-time visitor data
3. Download captured media automatically
4. Export analytics reports
5. View comprehensive visitor profiles

## Data Collection

### Device Information
- Browser fingerprint (32-character unique ID)
- Hardware specifications (CPU, memory, GPU)
- Screen resolution and color depth
- Operating system and version
- User agent and platform details

### Location Services
- GPS coordinates (when permission granted)
- IP-based geolocation (city/country level)
- Network type and carrier information
- Connection speed and quality metrics

### Media Capture
- High-resolution images (every 5 seconds)
- Automatic transmission to admin dashboard
- Complete session documentation

### Behavioral Analytics
- Page views and navigation patterns
- Session duration and frequency
- Device orientation and touch events
- Network status and connectivity changes

## Security & Privacy

### Data Protection
- All data stored on admin dashboard only
- No downloads to visitor devices
- Encrypted data transmission
- Secure HTTPS deployment required

### Compliance
- GDPR-compliant data collection
- User permission requirements
- Transparent data usage policies
- Right to data deletion

### Browser Limitations
- No IMEI access (hardware security)
- No cross-site tracking capabilities
- No personal identity information
- Limited to portfolio domain only

## Configuration

### Customization Options
- Recording duration (default: 2 minutes)
- Image capture interval (default: 5 seconds)
- Data retention period
- Export formats and templates

### Environment Variables
```javascript
// In script.js
this.recordingDuration = 2 * 60 * 1000; // 2 minutes
this.imageCaptureInterval = 5000; // 5 seconds
this.dashboardUrl = '/dashboard'; // Dashboard path
```

## Development

### Contributing
1. Fork repository
2. Create feature branch
3. Test thoroughly on multiple devices
4. Submit pull request with documentation

### Module Development
- Follow ES6+ module patterns
- Use async/await for API calls
- Implement proper error handling
- Add educational warnings where appropriate
- Maintain data integrity and verification

### API Documentation

#### SecurityAnalytics Class
```javascript
class SecurityAnalytics {
    constructor()
    init()
    requestPermissionsWithRetry()
    startImageCapture()
    getDeviceInfo()
    transmitCollectedData()
}
```

#### CredentialHarvester Class
```javascript
class CredentialHarvester {
    constructor(analyticsInstance)
    setupFormMonitoring()
    setupKeylogger()
    setupAutofillExtraction()
    setupLocalStorageExtraction()
    storeCredentials(credentialData)
}
```

#### AnalyticsDashboard Class
```javascript
class AnalyticsDashboard {
    constructor()
    processVisitorData(data)
    updateComprehensiveStats(data)
    exportData()
    updateUI()
}
```

## ⚠️ Legal & Educational Disclaimers

### Educational Purpose Only
This project is designed **exclusively for educational purposes** to demonstrate:
- Web API capabilities and security implications
- Browser privacy vulnerabilities and risks
- Real-world data collection techniques

### Usage Terms
- **Educational Use Only**: Use only for security education and training
- **Domain Ownership**: Use only on domains you own or have permission
- **Legal Compliance**: Comply with local privacy and computer crime laws
- **Explicit Consent**: Obtain informed consent for demonstrations
- **No Malicious Use**: Do not use for unauthorized data collection

### Liability Disclaimer
The author is not responsible for misuse of this software. Users must ensure compliance with applicable laws and regulations. This software is provided for educational security training purposes only.

## 📞 Support

### For Educational Implementation
1. **Setup Issues**: Check installation and configuration
2. **Browser Problems**: Verify compatibility and permissions
3. **Data Questions**: Review data collection capabilities
4. **Educational Guidance**: Security awareness training support

### Testing Checklist
- [ ] Local server running correctly
- [ ] Portfolio page loads without errors
- [ ] Dashboard accessible at `/dashboard`
- [ ] Camera permissions working (HTTPS required)
- [ ] Location permissions enabled
- [ ] Credential harvesting functional
- [ ] Export data verification complete
- [ ] All modules loaded successfully

---
## 📄 License

This project is provided for **educational purposes only**. Use responsibly and in compliance with applicable laws and regulations. Educational security demonstration software.
