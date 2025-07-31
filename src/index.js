// Import face-api.js
const faceapi = require('face-api.js');
const canvas = require('canvas');

// Set up canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.setEnv({
  canvas: Canvas,
  Image: Image,
  ImageData: ImageData
});

// Create a simple HTML structure for the app
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Face Tracking App</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #f0f0f0;
      font-family: Arial, sans-serif;
    }
    
    #video-container {
      position: relative;
      margin-bottom: 20px;
    }
    
    #video {
      width: 640px;
      height: 480px;
    }
    
    #canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
    
    #status {
      margin-top: 20px;
      font-size: 18px;
      color: #333;
    }
  </style>
</head>
<body>
  <div id="video-container">
    <video id="video" autoplay muted playsinline></video>
    <canvas id="canvas"></canvas>
  </div>
  <div id="status">Initializing face tracking...</div>

  <script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
  <script>
    // Load face detection models
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    }

    // Initialize the app
    async function init() {
      const video = document.getElementById('video');
      const canvas = document.getElementById('canvas');
      const status = document.getElementById('status');

      try {
        // Get user media (camera)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false 
        });
        video.srcObject = stream;

        // Wait for video to load
        video.addEventListener('loadeddata', async () => {
          status.textContent = 'Face tracking started';
          
          // Load models
          await loadModels();
          
          // Start face detection loop
          setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
            
            if (detections.length > 0) {
              // Draw detections on canvas
              const displaySize = { width: video.width, height: video.height };
              faceapi.matchDimensions(canvas, displaySize);
              
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
              faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
          }, 100);
        });
      } catch (err) {
        status.textContent = 'Error accessing camera: ' + err.message;
        console.error('Camera error:', err);
      }
    }

    // Start the app when page loads
    window.addEventListener('load', init);
  </script>
</body>
</html>
`;

// Export the HTML content as a string
module.exports = htmlContent;
