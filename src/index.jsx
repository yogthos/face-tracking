import React, { useEffect, useRef, useState } from 'react';
import '@techstark/opencv-js';

const loadFaceApiScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof faceapi !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const FaceTrackingApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setStatus('Loading face detection models...');
        await loadFaceApiScript();
        
        setStatus('Loading face-api.js models...');
        await loadModels();
        
        setStatus('Setting up camera...');
        await setupCamera();
        
        setModelsLoaded(true);
        setStatus('Models loaded, starting face detection...');
        startFaceDetection();
      } catch (error) {
        setStatus(`Error: ${error.message}`);
        console.error('Initialization error:', error);
      }
    };

    initializeApp();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const loadModels = async () => {
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);
  };

  const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          const canvas = canvasRef.current;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          resolve();
        };
      });
    }
  };

  const startFaceDetection = () => {
    if (!modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const detectFaces = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        resizedDetections.forEach(detection => {
          const { x, y, width, height } = detection.detection.box;
          
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          if (detection.landmarks) {
            drawFacialLandmarks(detection.landmarks, ctx);
          }
        });

        setStatus(`Detected ${detections.length} face(s)`);
      }
      
      requestAnimationFrame(detectFaces);
    };

    detectFaces();
  };

  const drawFacialLandmarks = (landmarks, ctx) => {
    const positions = landmarks.positions;
    
    ctx.fillStyle = '#ffff00';
    
    for (let i = 0; i < positions.length; i++) {
      const point = positions[i];
      
      if (i >= 36 && i <= 41) {
        ctx.fillStyle = '#ff0000';
      } else if (i >= 42 && i <= 47) {
        ctx.fillStyle = '#ff0000';
      } else if (i >= 27 && i <= 35) {
        ctx.fillStyle = '#00ffff';
      } else if (i >= 48 && i <= 67) {
        ctx.fillStyle = '#ff6600';
      } else {
        ctx.fillStyle = '#ffff00';
      }
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    
    if (positions.length > 0) {
      ctx.beginPath();
      ctx.moveTo(positions[positions.length - 1].x, positions[positions.length - 1].y);
      ctx.lineTo(positions[0].x, positions[0].y);
      ctx.stroke();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div id="video-container" style={{ position: 'relative', marginBottom: '20px' }}>
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          playsInline
          style={{ width: '640px', height: '480px', borderRadius: '8px' }}
        />
        <canvas 
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, borderRadius: '8px' }}
        />
      </div>
      <div id="status" style={{ 
        marginTop: '20px', 
        fontSize: '18px', 
        color: '#333',
        backgroundColor: '#fff',
        padding: '10px 20px',
        borderRadius: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {status}
      </div>
    </div>
  );
};

export default FaceTrackingApp;
