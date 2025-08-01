# Face Tracking Application

A real-time face detection and tracking application built with React and face-api.js. This project uses TensorFlow.js to perform face detection, landmark recognition, and expression analysis directly in the browser without requiring a backend server.

## Features

- Real-time face detection using TinyFaceDetector
- Facial landmark detection (68 points)
- Face recognition capabilities
- Expression analysis (happy, sad, angry, etc.)
- Responsive design that works on different screen sizes
- Camera access with user permission handling
- Automatic cleanup of camera resources when component unmounts

## Technologies Used

- **React** - Frontend library for building user interfaces
- **face-api.js** - JavaScript library for face detection and recognition
- **TensorFlow.js** - Machine learning library for running models in the browser
- **Vite** - Fast build tool and development server
- **HTML5 Canvas** - For rendering face detection results

## Prerequisites

Before you begin, ensure you have:
- Node.js installed (version 14 or higher)
- A modern web browser with camera access support

## Installation

1. Clone the repository:
