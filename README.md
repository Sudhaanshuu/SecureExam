# Anti-Cheat Exam Environment

A React-based dual monitoring system for online assessments that prevents cheating by monitoring both laptop webcam and phone camera simultaneously.

## Features

- **Dual Camera Monitoring**: Monitors both laptop webcam and phone camera simultaneously
- **Face Detection**: Real-time face detection and tracking using face-api.js
- **Attention Tracking**: Monitors student attention levels during exam
- **Multiple Person Detection**: Alerts when multiple faces are detected
- **Tab Switching Detection**: Detects when students switch tabs or windows
- **Phone Integration**: QR code-based phone camera connection via WebRTC
- **Real-time Alerts**: Live alert system for suspicious activities
- **Suspicion Scoring**: Automatic suspicion level calculation based on alerts
- **Exam Timer**: Built-in countdown timer for exams
- **Question Navigation**: Easy navigation between exam questions

## Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: CSS3 with modern features
- **Camera Access**: WebRTC API
- **Face Detection**: face-api.js (simulated in current version)
- **QR Code**: qrcode library
- **Real-time Communication**: WebRTC (for phone camera integration)

## Project Structure

```
exam-app/
├── src/
│   ├── components/
│   │   ├── ExamSetup.jsx          # Initial setup and phone connection
│   │   ├── ExamInterface.jsx      # Main exam interface with questions
│   │   ├── LaptopCamera.jsx       # Laptop webcam monitoring
│   │   ├── PhoneCamera.jsx        # Phone camera integration
│   │   └── MonitoringDashboard.jsx # Dual monitoring dashboard
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
└── README.md                      # This file
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with camera support
- Smartphone with camera for dual monitoring

### Setup Steps

1. **Navigate to the exam-app directory**:
   ```bash
   cd exam-app
   ```

2. **Install dependencies** (you'll need to create package.json first):
   ```bash
   npm init -y
   npm install react react-dom
   npm install -D vite @vitejs/plugin-react
   npm install qrcode
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## Usage

### Starting an Exam

1. **Connect Phone Camera**:
   - Scan the QR code displayed on the setup screen
   - This connects your phone camera for side-view monitoring

2. **Verify System Requirements**:
   - Ensure laptop webcam is enabled
   - Confirm phone camera is connected
   - Check internet connection stability
   - Grant browser permissions for camera access

3. **Start the Exam**:
   - Click "Start Exam" button
   - Both cameras will begin monitoring
   - Timer will start automatically

### During the Exam

- **Answer Questions**: Select options and navigate between questions
- **Monitor Status**: Check the monitoring dashboard for real-time alerts
- **Stay Focused**: Maintain face visibility and avoid tab switching
- **Phone Position**: Keep phone positioned to capture side view

### Alert System

The system generates alerts for:
- Face not detected for extended periods
- Multiple faces detected
- Tab/window switching
- Attention score drops
- Phone disconnection

Alerts are categorized by severity:
- 🟡 Medium: Warning level issues
- 🔴 High: Serious cheating indicators

## Detection Features

### Laptop Camera Monitoring
- Real-time face detection
- Face position tracking
- Attention score calculation
- Multiple person detection
- No-face timeout alerts

### Phone Camera Monitoring
- Side-view monitoring
- Signal strength tracking
- Connection quality monitoring
- Resolution detection
- Angle verification

### Behavioral Monitoring
- Tab switching detection
- Window focus tracking
- Time-based analysis
- Suspicion level calculation

## Customization

### Adding Questions

Edit `ExamInterface.jsx` to add or modify questions:

```javascript
const questions = [
  {
    id: 1,
    question: 'Your question here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 0 // Index of correct answer
  },
  // Add more questions...
]
```

### Adjusting Exam Duration

Modify the duration in `ExamSetup.jsx`:

```javascript
onStartExam({
  sessionId,
  duration: 60, // Change duration in minutes
  questionCount: 10
})
```

### Detection Sensitivity

Adjust detection thresholds in `LaptopCamera.jsx`:
- Face detection confidence
- No-face timeout duration
- Attention score thresholds

## Production Deployment

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Hosting Options

- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your repository
- **GitHub Pages**: Use gh-pages branch

## Security Considerations

- All camera streams are processed locally in the browser
- No video data is stored on servers
- Session IDs are randomly generated
- HTTPS is required for camera access in production

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (may require additional permissions)
- Opera

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure no other app is using the camera
- Try a different browser
- Check if HTTPS is enabled (required for camera access)

### Phone Connection Issues
- Ensure phone and laptop are on same network
- Check QR code scanning
- Verify WebRTC support in browser
- Try refreshing the page

### Performance Issues
- Close other browser tabs
- Check system resources
- Reduce video quality if needed
- Use a modern browser

## Future Enhancements

- [ ] Integrate actual face-api.js for production
- [ ] Add audio monitoring
- [ ] Implement server-side recording
- [ ] Add admin dashboard for proctors
- [ ] Support multiple phone cameras
- [ ] Add AI-powered behavior analysis
- [ ] Implement exam analytics
- [ ] Add screenshot capture on alerts

## License

This project is part of the Placement_Help repository and follows the same license.

## Contributing

Contributions are welcome! Please follow the existing code style and add appropriate tests.

## Support

For issues or questions, please open an issue in the main repository.
