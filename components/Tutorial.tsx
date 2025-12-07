import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { ChevronRight, ArrowUp, ArrowDown, CheckCircle, Activity } from 'lucide-react';
import { estimatePose } from '../services/webcamService';
import { MOVEMENT_THRESHOLDS } from '../constants';

interface TutorialProps {
  onComplete: () => void;
  calibratedBaseY: number;
  sensitivity: number;
}

type TutorialStep = 'INTRO' | 'PRACTICE_JUMP' | 'PRACTICE_DUCK' | 'READY';

export const Tutorial: React.FC<TutorialProps> = ({ onComplete, calibratedBaseY, sensitivity }) => {
  const webcamRef = useRef<Webcam>(null);
  const [step, setStep] = useState<TutorialStep>('PRACTICE_JUMP');
  const [currentPoseY, setCurrentPoseY] = useState(calibratedBaseY);
  const [actionFeedback, setActionFeedback] = useState<'IDLE' | 'JUMP' | 'DUCK'>('IDLE');
  const [successTimer, setSuccessTimer] = useState(0);

  // Derived thresholds (same as GameCanvas)
  const jumpThresh = MOVEMENT_THRESHOLDS.JUMP_THRESHOLD / sensitivity;
  const duckThresh = MOVEMENT_THRESHOLDS.DUCK_THRESHOLD / sensitivity;
  const jumpLine = calibratedBaseY - jumpThresh;
  const duckLine = calibratedBaseY + duckThresh;

  useEffect(() => {
    let animId: number;
    let lastAction = 'IDLE';

    const loop = async () => {
      if (webcamRef.current?.video?.readyState === 4) {
        const video = webcamRef.current.video;
        const pose = await estimatePose(video);

        if (pose && pose.keypoints) {
          const nose = pose.keypoints.find((k: any) => k.name === 'nose');
          const leftShoulder = pose.keypoints.find((k: any) => k.name === 'left_shoulder');
          const rightShoulder = pose.keypoints.find((k: any) => k.name === 'right_shoulder');

          let y = calibratedBaseY;
          if (nose) y = nose.y;
          else if (leftShoulder && rightShoulder) y = (leftShoulder.y + rightShoulder.y) / 2;
          
          const normalizedY = y / video.videoHeight;
          setCurrentPoseY(normalizedY);

          // Detect Action
          let currentAction: 'IDLE' | 'JUMP' | 'DUCK' = 'IDLE';
          if (normalizedY < jumpLine) currentAction = 'JUMP';
          else if (normalizedY > duckLine) currentAction = 'DUCK';

          setActionFeedback(currentAction);

          // Logic flow for steps
          if (step === 'PRACTICE_JUMP' && currentAction === 'JUMP') {
             // Require holding or just hitting it? Just hitting it is fine for tutorial
             setTimeout(() => setStep('PRACTICE_DUCK'), 500);
          } else if (step === 'PRACTICE_DUCK' && currentAction === 'DUCK') {
             setTimeout(() => setStep('READY'), 500);
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [step, calibratedBaseY, jumpLine, duckLine]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900/95 z-50 relative overflow-hidden">
      
      {/* Background Webcam Feed for Immersive Feel */}
      <div className="absolute inset-0 z-0 opacity-20">
         <Webcam
            ref={webcamRef}
            mirrored
            className="w-full h-full object-cover"
          />
      </div>

      <div className="z-10 w-full max-w-4xl p-8 flex flex-col items-center">
        <h2 className="text-4xl font-display font-bold text-white mb-2 text-center">TRAINING MODULE</h2>
        <p className="text-cyan-400 font-mono mb-8 animate-pulse">SYSTEM CHECK: MOVEMENT SENSORS ACTIVE</p>
        
        <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
          
          {/* Visualizer Panel */}
          <div className="relative w-80 h-64 bg-black rounded-2xl border-2 border-slate-600 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             {/* Threshold Lines */}
             <div className="absolute w-full border-t-2 border-dashed border-green-500/50" style={{ top: `${jumpLine * 100}%` }}>
                <span className="absolute right-2 -top-6 text-xs text-green-500 font-bold">JUMP ZONE</span>
             </div>
             <div className="absolute w-full border-t-2 border-dashed border-yellow-500/50" style={{ top: `${duckLine * 100}%` }}>
                <span className="absolute right-2 top-2 text-xs text-yellow-500 font-bold">DUCK ZONE</span>
             </div>
             <div className="absolute w-full h-0.5 bg-slate-600" style={{ top: `${calibratedBaseY * 100}%` }} />

             {/* Player Indicator */}
             <div 
                className={`absolute left-0 w-full h-1 transition-all duration-75 
                  ${actionFeedback === 'JUMP' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 
                    actionFeedback === 'DUCK' ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-cyan-500'}
                `}
                style={{ top: `${currentPoseY * 100}%` }}
             />
             
             {/* Center Marker */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {actionFeedback === 'JUMP' && <ArrowUp className="text-green-500 w-16 h-16 animate-bounce" />}
                {actionFeedback === 'DUCK' && <ArrowDown className="text-yellow-500 w-16 h-16 animate-bounce" />}
             </div>
          </div>

          {/* Instructions Panel */}
          <div className="flex-1 flex flex-col items-center text-center space-y-6">
            
            {step === 'PRACTICE_JUMP' && (
              <div className="bg-slate-800/80 p-6 rounded-xl border border-green-500/30 animate-in fade-in slide-in-from-right duration-500">
                <ArrowUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">STEP 1: JUMP</h3>
                <p className="text-slate-300">Physically jump up or stand tall to reach the <span className="text-green-400">Green Line</span>.</p>
              </div>
            )}

            {step === 'PRACTICE_DUCK' && (
              <div className="bg-slate-800/80 p-6 rounded-xl border border-yellow-500/30 animate-in fade-in slide-in-from-right duration-500">
                <ArrowDown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">STEP 2: DUCK</h3>
                <p className="text-slate-300">Squat down low to reach the <span className="text-yellow-400">Yellow Line</span>.</p>
              </div>
            )}

            {step === 'READY' && (
              <div className="bg-slate-800/80 p-6 rounded-xl border border-cyan-500/30 animate-in fade-in slide-in-from-right duration-500">
                <CheckCircle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">CALIBRATION COMPLETE</h3>
                <p className="text-slate-300 mb-6">Your movements are synced. Get ready to run!</p>
                <button 
                  onClick={onComplete}
                  className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  START GAME
                </button>
              </div>
            )}
            
            <div className="text-xs text-slate-500 font-mono">
              Current Status: {actionFeedback}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};