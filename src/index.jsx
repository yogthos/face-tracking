import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceTrackingApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Initializing face tracking...');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const initFaceTracking = async () => {
      try {
        // Load face detection models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');

        // Get user media (camera)
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('Face tracking started');
          setIsTracking(true);
        }
      } catch (err) {
        setStatus(`Error accessing camera: ${err.message}`);
        console.error('Camera error:', err);
      }
    };

    initFaceTracking();

    return () => {
      // Cleanup on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const detectFaces = async () => {
      if (!isTracking || !videoRef.current || !canvasRef.current) return;

      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  }, [isTracking]);

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
          style={{ width: '640px', height: '480px' }}
        />
        <canvas 
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
      <div id="status" style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
        {status}
      </div>
    </div>
  );
};

export default FaceTrackingApp;
