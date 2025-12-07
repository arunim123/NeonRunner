
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { PlayerState, Obstacle, Particle, PoseAction, PowerUp, ActivePowerUp, ParallaxLayer } from '../types';
import { COLORS, GAME_CONSTANTS, MOVEMENT_THRESHOLDS, POWERUP_TYPES, DIFFICULTY_SETTINGS } from '../constants';
import { estimatePose, initDetector } from '../services/webcamService';
import { playSound, updateMusicSpeed, initAudio } from '../services/audioService';
import { Maximize, Minimize, Zap, Shield, Gauge } from 'lucide-react';

interface GameCanvasProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sensitivity: number;
  volume: number;
  calibratedBaseY: number;
  onGameOver: (score: number, distance: number) => void;
  onPause: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  difficulty, sensitivity, volume, calibratedBaseY, onGameOver 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const requestRef = useRef<number>(0);
  
  // Get settings for current difficulty
  const currentSettings = DIFFICULTY_SETTINGS[difficulty];

  // Game State Refs
  const gameStateRef = useRef({
    isPlaying: false,
    speed: currentSettings.INITIAL_SPEED,
    distance: 0,
    score: 0,
    frames: 0,
    lastSpawnTime: 0,
    combo: 0,
    globalHue: 180, // Cyan base
    shakeTimer: 0
  });

  const playerRef = useRef<PlayerState>({
    y: 0, 
    vy: 0,
    isJumping: false,
    isDucking: false,
    width: GAME_CONSTANTS.PLAYER_WIDTH,
    height: GAME_CONSTANTS.PLAYER_HEIGHT,
    color: COLORS.NEON_CYAN,
    rotation: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const activePowerUpsRef = useRef<ActivePowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const poseActionRef = useRef<PoseAction>('IDLE');
  
  // Parallax Background Refs
  const mountainsRef = useRef<ParallaxLayer[]>([
    { speedModifier: 0.1, points: [], color: '#1e1b4b' }, // Distant
    { speedModifier: 0.3, points: [], color: '#312e81' }, // Mid
    { speedModifier: 0.6, points: [], color: '#4338ca' }  // Close
  ]);
  const starsRef = useRef<{x: number, y: number, size: number, alpha: number}[]>([]);
  
  // React State for HUD
  const [hudScore, setHudScore] = useState(0);
  const [hudCombo, setHudCombo] = useState(0);
  const [hudAction, setHudAction] = useState<PoseAction>('IDLE');
  const [activeEffects, setActiveEffects] = useState<ActivePowerUp[]>([]);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [countDown, setCountDown] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [debugPoseY, setDebugPoseY] = useState(0);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await initDetector();
      initAudio(); // Initialize audio context
      setIsWebcamReady(true);
      generateMountains();
      generateStars();
      
      // Start Countdown
      let count = 3;
      const timer = setInterval(() => {
        count--;
        setCountDown(count);
        if (count <= 0) {
          clearInterval(timer);
          startGame();
        }
      }, 1000);
    };
    init();

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const generateMountains = () => {
    const w = 2000; // Wider than screen to scroll
    const h = 720;
    mountainsRef.current.forEach((layer, idx) => {
      layer.points = [];
      layer.points.push({x: 0, y: h}); // Bottom left
      for(let x = 0; x <= w; x += 50 + Math.random()*100) {
        const height = 100 + Math.random() * 200 - (idx * 50);
        layer.points.push({x: x, y: h - height});
      }
      layer.points.push({x: w, y: h}); // Bottom right
    });
  };

  const generateStars = () => {
    const stars = [];
    for(let i=0; i<100; i++) {
      stars.push({
        x: Math.random() * 1280,
        y: Math.random() * 600,
        size: Math.random() * 2,
        alpha: Math.random()
      });
    }
    starsRef.current = stars;
  };

  const startGame = () => {
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.speed = currentSettings.INITIAL_SPEED; // Use difficulty specific speed
    playerRef.current.y = 0;
    obstaclesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    activePowerUpsRef.current = [];
    gameStateRef.current.score = 0;
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- POSE DETECTION LOOP ---
  useEffect(() => {
    if (!isWebcamReady) return;
    let loopId: number;
    let isActive = true;

    const detectLoop = async () => {
      if (!isActive) return;

      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const pose = await estimatePose(video);
        
        if (pose && pose.keypoints) {
          const nose = pose.keypoints.find((k: any) => k.name === 'nose');
          const leftShoulder = pose.keypoints.find((k: any) => k.name === 'left_shoulder');
          const rightShoulder = pose.keypoints.find((k: any) => k.name === 'right_shoulder');

          let currentY = 0;
          if (nose) currentY = nose.y;
          else if (leftShoulder && rightShoulder) currentY = (leftShoulder.y + rightShoulder.y) / 2;
          
          const normalizedY = currentY / video.videoHeight;
          setDebugPoseY(normalizedY);

          const jumpThresh = MOVEMENT_THRESHOLDS.JUMP_THRESHOLD / sensitivity;
          const duckThresh = MOVEMENT_THRESHOLDS.DUCK_THRESHOLD / sensitivity;

          if (normalizedY < calibratedBaseY - jumpThresh) {
            poseActionRef.current = 'JUMP';
          } else if (normalizedY > calibratedBaseY + duckThresh) {
            poseActionRef.current = 'DUCK';
          } else {
            poseActionRef.current = 'IDLE';
          }
          setHudAction(poseActionRef.current);
        }
      }
      loopId = requestAnimationFrame(detectLoop);
    };
    
    detectLoop();
    return () => { isActive = false; cancelAnimationFrame(loopId); };
  }, [isWebcamReady, calibratedBaseY, sensitivity]);

  // --- GAME LOGIC ---

  const spawnEntity = () => {
    // 10% chance powerup
    if (Math.random() < 0.1) {
      const type = Math.random() < 0.4 ? 'SHIELD' : Math.random() < 0.7 ? 'MULTIPLIER' : 'SLOW_MO';
      powerUpsRef.current.push({
        id: Date.now(),
        x: 1400,
        y: Math.random() > 0.5 ? GAME_CONSTANTS.GROUND_Y - 150 : GAME_CONSTANTS.GROUND_Y - 50,
        width: 40,
        height: 40,
        color: POWERUP_TYPES[type].color,
        type: type as any,
        active: true
      });
    } else {
      const type = Math.random() > 0.5 ? 'GROUND_SPIKE' : 'AERIAL_DRONE';
      obstaclesRef.current.push({
        id: Date.now(),
        x: 1400,
        y: type === 'GROUND_SPIKE' ? GAME_CONSTANTS.GROUND_Y - 50 : GAME_CONSTANTS.GROUND_Y - 140,
        width: type === 'GROUND_SPIKE' ? 50 : 60,
        height: type === 'GROUND_SPIKE' ? 50 : 40,
        color: COLORS.NEON_RED,
        type: type,
        passed: false
      });
    }
  };

  const createParticles = (x: number, y: number, color: string, count: number, speed: number = 5) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x, y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: 1.0,
        color,
        size: Math.random() * 6 + 2
      });
    }
  };

  const triggerShake = () => {
    gameStateRef.current.shakeTimer = GAME_CONSTANTS.SHAKE_INTENSITY;
  };

  const gameLoop = useCallback(() => {
    if (!gameStateRef.current.isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Time Management
    const now = Date.now();
    activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.endTime > now);
    setActiveEffects([...activePowerUpsRef.current]);

    const hasSlowMo = activePowerUpsRef.current.some(p => p.type === 'SLOW_MO');
    const hasShield = activePowerUpsRef.current.some(p => p.type === 'SHIELD');
    const hasMultiplier = activePowerUpsRef.current.some(p => p.type === 'MULTIPLIER');

    // Update Speed logic based on Difficulty Settings
    let currentSpeed = gameStateRef.current.speed;
    if (hasSlowMo) currentSpeed *= 0.5;

    gameStateRef.current.frames++;
    gameStateRef.current.distance += currentSpeed * 0.05;
    
    if (!hasSlowMo) {
      // Accelerate based on difficulty settings
      gameStateRef.current.speed = Math.min(
        currentSettings.MAX_SPEED, 
        currentSettings.INITIAL_SPEED + (gameStateRef.current.distance * currentSettings.ACCELERATION)
      );
    }
    
    // Update Audio Pitch based on speed relative to max
    updateMusicSpeed(1 + (gameStateRef.current.speed - currentSettings.INITIAL_SPEED) / 20);

    // Update Global Hue (Heatmap style: Cyan -> Red)
    // Map speed 8 -> Max to Hue 180 -> 0
    const progress = (gameStateRef.current.speed - currentSettings.INITIAL_SPEED) / (currentSettings.MAX_SPEED - currentSettings.INITIAL_SPEED);
    gameStateRef.current.globalHue = 180 - (Math.max(0, Math.min(1, progress)) * 180);

    // --- PLAYER PHYSICS ---
    const player = playerRef.current;
    const action = poseActionRef.current;

    // Physics Modifiers from Difficulty Settings (Slow Motion Animations)
    const gravity = GAME_CONSTANTS.GRAVITY * currentSettings.GRAVITY_MOD;
    const jumpForce = GAME_CONSTANTS.JUMP_FORCE * currentSettings.JUMP_MOD;

    // Jump
    if (action === 'JUMP' && !player.isJumping && !player.isDucking) {
      player.vy = jumpForce;
      player.isJumping = true;
      createParticles(GAME_CONSTANTS.PLAYER_X + 25, GAME_CONSTANTS.GROUND_Y, COLORS.NEON_CYAN, 5);
      playSound('JUMP');
    }

    // Duck
    if (action === 'DUCK') {
      player.isDucking = true;
      player.height = GAME_CONSTANTS.PLAYER_DUCK_HEIGHT;
    } else {
      player.isDucking = false;
      player.height = GAME_CONSTANTS.PLAYER_HEIGHT;
    }

    // Gravity
    if (player.isJumping) {
      player.y += player.vy;
      player.vy += gravity;

      if (player.y > 0) { // Ground hit
        player.y = 0;
        player.isJumping = false;
        player.vy = 0;
        createParticles(GAME_CONSTANTS.PLAYER_X + 25, GAME_CONSTANTS.GROUND_Y, COLORS.NEON_CYAN, 8);
      }
    }

    // --- SPAWNING ---
    // Adjust spawn rate based on difficulty modifier
    const baseSpawnRate = Math.max(
      GAME_CONSTANTS.SPAWN_RATE_MIN, 
      GAME_CONSTANTS.SPAWN_RATE_MAX - (gameStateRef.current.speed * 2)
    );
    const adjustedSpawnRate = baseSpawnRate * currentSettings.SPAWN_RATE_MODIFIER;
    
    if (gameStateRef.current.frames - gameStateRef.current.lastSpawnTime > adjustedSpawnRate) {
        spawnEntity();
        gameStateRef.current.lastSpawnTime = gameStateRef.current.frames;
    }

    // --- UPDATE & COLLISION ---
    const playerRect = {
      x: GAME_CONSTANTS.PLAYER_X,
      y: GAME_CONSTANTS.GROUND_Y + player.y - player.height,
      w: player.width,
      h: player.height
    };

    // Obstacles
    obstaclesRef.current.forEach(obs => obs.x -= currentSpeed);
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -100);

    // Powerups
    powerUpsRef.current.forEach(p => {
      p.x -= currentSpeed;
      p.y += Math.sin(gameStateRef.current.frames * 0.1) * 2; // Float
    });
    powerUpsRef.current = powerUpsRef.current.filter(p => p.active && p.x > -100);

    let collision = false;

    // Check Obstacles
    obstaclesRef.current.forEach(obs => {
      // Check collision
      const isColliding = 
        playerRect.x < obs.x + obs.width &&
        playerRect.x + playerRect.w > obs.x &&
        playerRect.y < obs.y + obs.height &&
        playerRect.y + playerRect.h > obs.y;

      if (isColliding) {
        if (!obs.passed) {
          if (hasShield) {
            // Shield blocks this specific obstacle
            obs.passed = true; // Mark as handled so we don't hit it again in next frames
            // Remove shield
            activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p.type !== 'SHIELD');
            createParticles(playerRect.x + 25, playerRect.y + 40, COLORS.NEON_CYAN, 20, 10);
            triggerShake();
            playSound('EXPLOSION');
          } else {
            // No shield, game over
            collision = true;
          }
        }
      }

      // Score Pass (only if not already passed/hit)
      if (!obs.passed && obs.x + obs.width < playerRect.x) {
        obs.passed = true;
        const multiplier = hasMultiplier ? 2 : 1;
        // Base score 100 + combo bonus
        const points = (100 + (gameStateRef.current.combo * 10)) * multiplier;
        gameStateRef.current.score += points;
        gameStateRef.current.combo++;
        setHudScore(gameStateRef.current.score);
        setHudCombo(gameStateRef.current.combo);
      }
    });

    // Check Powerups
    powerUpsRef.current.forEach(p => {
       if (
        playerRect.x < p.x + p.width &&
        playerRect.x + playerRect.w > p.x &&
        playerRect.y < p.y + p.height &&
        playerRect.y + playerRect.h > p.y
      ) {
        p.active = false;
        createParticles(p.x, p.y, p.color, 15);
        activePowerUpsRef.current.push({
          type: p.type,
          endTime: Date.now() + GAME_CONSTANTS.POWERUP_DURATION
        });
        playSound('POWERUP');
      }
    });

    // Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Screen Shake Decay
    if (gameStateRef.current.shakeTimer > 0) {
      gameStateRef.current.shakeTimer--;
    }

    if (collision) {
      gameStateRef.current.isPlaying = false;
      triggerShake();
      playSound('GAMEOVER');
      // Draw final frame
      draw(ctx);
      setTimeout(() => {
        onGameOver(gameStateRef.current.score, Math.floor(gameStateRef.current.distance));
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }, 500);
      return;
    }

    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [currentSettings, onGameOver]);

  // --- RENDERING ---
  const draw = (ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const cx = w/2;
    const cy = h/2;

    // Apply Shake
    ctx.save();
    if (gameStateRef.current.shakeTimer > 0) {
      const shake = gameStateRef.current.shakeTimer;
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    // 1. Dynamic Background Gradient
    const hue = gameStateRef.current.globalHue;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `hsl(${hue}, 60%, 5%)`); // Top (Dark)
    gradient.addColorStop(1, `hsl(${hue}, 60%, 15%)`); // Bottom (Lighter)
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Stars
    ctx.fillStyle = '#FFF';
    starsRef.current.forEach(star => {
      ctx.globalAlpha = star.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 3. Parallax Mountains
    mountainsRef.current.forEach((layer, i) => {
      // Scroll offset
      const offset = (gameStateRef.current.distance * 10 * layer.speedModifier) % 2000;
      
      ctx.fillStyle = `hsla(${hue + i*10}, 60%, ${10 + i*5}%, 0.8)`;
      ctx.beginPath();
      // Draw twice for seamless loop
      for(let k=0; k<2; k++) {
        const startX = -offset + (k*2000);
        layer.points.forEach((p, idx) => {
           if(idx === 0) ctx.moveTo(startX + p.x, p.y);
           else ctx.lineTo(startX + p.x, p.y);
        });
      }
      ctx.fill();
    });

    // 4. Floor (Neon Grid)
    ctx.shadowBlur = 20;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(0, GAME_CONSTANTS.GROUND_Y);
    ctx.lineTo(w, GAME_CONSTANTS.GROUND_Y);
    ctx.stroke();

    // Moving Vertical Grid Lines
    const gridOffset = (gameStateRef.current.distance * 40) % 100;
    ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
    for(let x = -gridOffset; x < w; x+=100) {
       // Perspective slant
       ctx.beginPath();
       ctx.moveTo(x, GAME_CONSTANTS.GROUND_Y);
       ctx.lineTo(x - 200, h); // Slant left
       ctx.stroke();
    }

    // 5. Draw Entities
    
    // Player
    const player = playerRef.current;
    const px = GAME_CONSTANTS.PLAYER_X;
    const py = GAME_CONSTANTS.GROUND_Y + player.y - player.height;
    
    // Player Trail (simple previous positions logic is omitted for perf, using opacity blur)
    ctx.shadowBlur = 30;
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    
    // Draw "Runner" Character (Vector)
    ctx.save();
    ctx.translate(px + player.width/2, py + player.height/2);
    
    // Squash stretch
    if(player.isJumping) ctx.scale(0.9, 1.1);
    if(player.isDucking) ctx.scale(1.2, 0.6);

    // Body
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Eye/Visor
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, -player.height/2 + 10, 20, 10);
    
    ctx.restore();

    // Shield Effect
    if (activeEffects.some(e => e.type === 'SHIELD')) {
      ctx.strokeStyle = COLORS.NEON_CYAN;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px + player.width/2, py + player.height/2, 60, 0, Math.PI*2);
      ctx.stroke();
    }

    // Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.shadowColor = obs.color;
      ctx.fillStyle = obs.color;
      
      if (obs.type === 'GROUND_SPIKE') {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width/2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.fill();
      } else {
        // Drone (Circle + Wings)
        ctx.beginPath();
        ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI*2);
        ctx.fill();
        // Wings
        ctx.fillStyle = '#FFF';
        ctx.fillRect(obs.x - 10, obs.y + 10, obs.width + 20, 5);
      }
    });

    // Powerups
    powerUpsRef.current.forEach(p => {
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, 20, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('?', p.x + 12, p.y + 28);
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    ctx.restore(); // End Shake
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group select-none">
      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-20">
        <div className="flex flex-col gap-2">
          <div className="text-5xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] tracking-tighter">
            {Math.floor(hudScore).toString().padStart(6, '0')}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono text-cyan-300">DISTANCE: {Math.floor(gameStateRef.current.distance)}m</div>
            {hudCombo > 1 && (
               <div className="text-xl font-black italic text-yellow-400 animate-bounce">
                  COMBO x{hudCombo}
               </div>
            )}
          </div>
          
          {/* Active Powerups */}
          <div className="flex gap-2 mt-4">
             {activeEffects.map((effect, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800/80 border border-slate-600 animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                   {effect.type === 'SHIELD' && <Shield size={16} className="text-cyan-400" />}
                   {effect.type === 'MULTIPLIER' && <Zap size={16} className="text-yellow-400" />}
                   {effect.type === 'SLOW_MO' && <Gauge size={16} className="text-purple-400" />}
                   <span className="text-xs font-bold text-white">{POWERUP_TYPES[effect.type].label}</span>
                </div>
             ))}
          </div>
        </div>
        
        {/* Action Indicator & Controls */}
        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <div className={`
            flex items-center gap-2 px-6 py-3 rounded-full border-2 backdrop-blur-md transition-all duration-100 shadow-xl
            ${hudAction === 'JUMP' ? 'bg-green-500/20 border-green-400 shadow-green-500/50 scale-110' : 
              hudAction === 'DUCK' ? 'bg-yellow-500/20 border-yellow-400 shadow-yellow-500/50 scale-110' : 'bg-slate-900/50 border-slate-700'}
          `}>
            <div className={`w-3 h-3 rounded-full ${hudAction === 'IDLE' ? 'bg-slate-500' : 'bg-white animate-ping'}`} />
            <span className="font-bold font-display tracking-widest text-lg">{hudAction}</span>
          </div>

          <button 
             onClick={toggleFullscreen}
             className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-600 hover:border-cyan-400"
             title="Toggle Fullscreen"
          >
             {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countDown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <h1 className="text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-600 animate-bounce drop-shadow-[0_0_50px_rgba(0,243,255,0.5)]">
            {countDown}
          </h1>
        </div>
      )}

      {/* Webcam Feed (PIP) */}
      <div className="absolute bottom-6 right-6 w-52 h-40 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black z-30 transition-opacity duration-300 opacity-80 hover:opacity-100 group-hover:border-cyan-500/50">
        <Webcam
          ref={webcamRef}
          mirrored
          className="w-full h-full object-cover opacity-60"
          videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
        />
        {/* Debug Overlay */}
        <div className="absolute inset-0 pointer-events-none">
           <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              TRACKING
           </div>
           
           <div className="absolute left-0 w-full h-0.5 bg-green-500/50" style={{ top: `${calibratedBaseY * 100}%` }} />
           <div className="absolute left-0 w-full h-px border-t border-dashed border-green-400/50" style={{ top: `${(calibratedBaseY - (MOVEMENT_THRESHOLDS.JUMP_THRESHOLD / sensitivity)) * 100}%` }} />
           <div className="absolute left-0 w-full h-px border-t border-dashed border-yellow-400/50" style={{ top: `${(calibratedBaseY + (MOVEMENT_THRESHOLDS.DUCK_THRESHOLD / sensitivity)) * 100}%` }} />
           <div className="absolute left-0 w-full h-1 bg-red-500 shadow-[0_0_8px_red]" style={{ top: `${debugPoseY * 100}%` }} />
        </div>
      </div>

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
