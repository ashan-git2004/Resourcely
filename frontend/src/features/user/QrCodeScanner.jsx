import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import '../styles/QrCodeScanner.css';

export default function QrCodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      scanQrCode();
    }, 500); // Scan every 500ms

    return () => clearInterval(interval);
  }, [scanning]);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        scanningRef.current = true;
        setError(null);
      }
    } catch (err) {
      setError('Unable to access camera: ' + err.message);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    scanningRef.current = false;
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setScanning(false);
    }
  };

  const scanQrCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data) {
        scanningRef.current = false;
        stopScanning();
        onScan(code.data);
      }
    } catch (err) {
      // Silently continue scanning
    }
  };

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-container">
        <h2>Scan Booking QR Code</h2>
        
        {error && <div className="qr-scanner-error">{error}</div>}
        
        <video 
          ref={videoRef}
          className="qr-scanner-video"
          autoPlay
          playsInline
        />
        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        <div className="qr-scanner-controls">
          <button onClick={() => {
            stopScanning();
            onClose();
          }} className="btn btn-secondary">
            Close
          </button>
        </div>

        <div className="qr-scanner-instructions">
          <p>Position the QR code within the camera view</p>
          <p className="scanning-status">Scanning...</p>
        </div>
      </div>
    </div>
  );
}
