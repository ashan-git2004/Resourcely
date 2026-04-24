import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

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
    const interval = setInterval(scanQrCode, 500);
    return () => clearInterval(interval);
  }, [scanning]);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
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
      if (code?.data) {
        scanningRef.current = false;
        stopScanning();
        onScan(code.data);
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-8 w-[90%] max-w-[600px] flex flex-col gap-6">
        <h2 className="m-0 text-[#333]">Scan Booking QR Code</h2>

        {error && (
          <div className="bg-[#ffebee] text-[#d32f2f] p-4 rounded text-sm">{error}</div>
        )}

        <video ref={videoRef} className="w-full aspect-square rounded bg-black object-cover" autoPlay playsInline />
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => { stopScanning(); onClose(); }}
            className="ghost-btn flex-1 max-w-[200px]"
          >
            Close
          </button>
        </div>

        <div className="text-center text-[#666] text-sm m-0">
          <p className="m-0">Position the QR code within the camera view</p>
          <p className="m-0">Scanning…</p>
        </div>
      </div>
    </div>
  );
}
