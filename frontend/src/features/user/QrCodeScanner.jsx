import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { buttonStyles } from "./UserUi";

export default function QrCodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanningRef = useRef(false);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const interval = window.setInterval(scanQrCode, 500);
    return () => window.clearInterval(interval);
  }, [scanning]);

  async function startScanning() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        scanningRef.current = true;
        setError("");
      }
    } catch (cameraError) {
      setError(`Unable to access camera: ${cameraError.message}`);
      setScanning(false);
    }
  }

  function stopScanning() {
    scanningRef.current = false;
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setScanning(false);
    }
  }

  function scanQrCode() {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        scanningRef.current = false;
        stopScanning();
        onScan(code.data);
      }
    } catch {
      // Ignore intermittent frame parsing errors while scanning.
    }
  }

  return (
    // <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/80 px-4 py-20 backdrop-blur-sm">
    //   <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
    //     <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800 sm:px-8">
    //       <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">Scan booking QR code</h2>
    //       <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Position the QR code within the frame and keep the camera steady.</p>
    //     </div>

    //     <div className="space-y-5 px-6 py-6 sm:px-8">
    //       {error ? (
    //         <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
    //           {error}
    //         </div>
    //       ) : null}

    //       <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
    //         <video ref={videoRef} className="aspect-square w-full object-cover" autoPlay playsInline />
    //         <canvas ref={canvasRef} className="hidden" />
    //       </div>

    //       <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
    //         <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
    //           <p>Scanning is automatic once the code is visible.</p>
    //           <p className="text-zinc-500 dark:text-zinc-400">If nothing is detected, adjust distance, lighting, or camera angle.</p>
    //         </div>
    //         <button
    //           type="button"
    //           onClick={() => {
    //             stopScanning();
    //             onClose();
    //           }}
    //           className={buttonStyles.secondary}
    //         >
    //           Close scanner
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    
  // 1. Increased z-index to 9999 to guarantee it sits above headers.
  // 2. Changed flex to 'grid place-items-center' for safer centering.
  // 3. Replaced py-20 with an even 'p-4 sm:p-6' so there is always a boundary.
      <div className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-zinc-950/80 p-4 backdrop-blur-sm sm:p-6">
        
        {/* Scaled down from max-w-2xl to max-w-md and rounded-3xl to rounded-2xl */}
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          
          {/* Tighter header padding and typography */}
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Scan QR Code
            </h2>
            <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">
              Position the code within the frame to scan.
            </p>
          </div>

          <div className="space-y-4 p-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Video container tightened up */}
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 dark:border-zinc-800">
              {/* Added max-h-[50vh] so the video doesn't become massively tall on certain devices */}
              <video 
                ref={videoRef} 
                className="aspect-square w-full max-h-[45vh] object-cover" 
                autoPlay 
                playsInline 
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action footer area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-1">
              <div className="text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Scanning automatically.</p>
                <p className="text-zinc-500">Adjust distance if not detecting.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopScanning();
                  onClose();
                }}
                className={`shrink-0 ${buttonStyles.secondary}`}
              >
                Close scanner
              </button>
            </div>
          </div>
        </div>
      </div>
    // );
  );
}
