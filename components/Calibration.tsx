import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw } from 'lucide-react';
import { estimatePose, initDetector } from '../services/webcamService';

interface CalibrationProps {
  onComplete: (baseY: number) => void;
  onCancel: () => void;
}

export const Calibration: React.FC<CalibrationProps> = ({ onComplete, onCancel }) => {
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<'INIT' | 'DETECTING' | 'COUNTDOWN' | 'DONE'>('INIT');
  const [countdown, setCountdown] = useState(3);
  const [samples, setSamples] = useState<number[]>([]);
  const [detectedY, setDetectedY] = useState(0.5);

  useEffect(() => {
    const start = async () => {
      await initDetector();
      setStatus('DETECTING');
    };
    start();
  }, []);

  // Detection Loop for visual feedback
  useEffect(() => {
    let animId: number;
    const loop = async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        const video = webcamRef.current.video;
        const pose = await estimatePose(video);
        if (pose && pose.keypoints) {
          const nose = pose.keypoints.find((k: any) => k.name === 'nose');
          const leftShoulder = pose.keypoints.find((k: any) => k.name === 'left_shoulder');
          const rightShoulder = pose.keypoints.find((k: any) => k.name === 'right_shoulder');
          
          let y = detectedY;
          if (nose) y = nose.y;
          else if (leftShoulder && rightShoulder) y = (leftShoulder.y + rightShoulder.y) / 2;

          const normY = y / video.videoHeight;
          setDetectedY(normY);
          
          if (status === 'COUNTDOWN') {
            setSamples(prev => [...prev, normY]);
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [status]); // Remove detectedY dependency to avoid loop stutter, handled by ref/state updates

  const startCalibration = () => {
    setStatus('COUNTDOWN');
    setSamples([]);
    let count = 3;
    setCountdown(3);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        finishCalibration();
      }
    }, 1000);
  };

  const finishCalibration = () => {
    setStatus('DONE');
    if (samples.length > 0) {
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      onComplete(avg);
    } else {
      // Fallback
      onComplete(detectedY);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/90 backdrop-blur-md z-50">
      <div className="max-w-2xl w-full p-8 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-2">CALIBRATION</h2>
        <p className="text-slate-400 mb-8">
          Stand back so your upper body is visible. Assume a comfortable neutral standing position.
        </p>

        <div className="relative mx-auto w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-600 mb-8 group shadow-[0_0_20px_rgba(0,243,255,0.2)]">
          <Webcam
            ref={webcamRef}
            mirrored
            className="w-full h-full object-cover opacity-80"
          />
          
          {/* Guide Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             {/* Static Target Area */}
             <div className="w-full h-0.5 bg-white/20 absolute top-1/2" />
             <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/50 rounded-full" />
             </div>

             {/* Live Tracking Line */}
             <div 
                className="absolute w-full h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-75" 
                style={{ top: `${detectedY * 100}%` }} 
             />
             <div className="absolute right-2 text-xs font-mono text-cyan-500 bg-black/50 px-1 rounded" style={{ top: `${detectedY * 100}%` }}>
                NOSE LEVEL
             </div>
          </div>

          {status === 'COUNTDOWN' && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-9xl font-black text-white backdrop-blur-sm">
               {countdown}
             </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          {status === 'DETECTING' && (
            <button 
              onClick={startCalibration}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all animate-pulse"
            >
              <Camera size={20} /> LOCK POSITION
            </button>
          )}
          
          <button 
            onClick={onCancel}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};