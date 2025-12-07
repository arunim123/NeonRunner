
// Procedural Audio Service using Web Audio API
// Generates Retro Synth sounds without external files

let audioCtx: AudioContext | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicGain: GainNode | null = null;
let isMuted = false;
let currentTempo = 1.0;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setMute = (mute: boolean) => {
  isMuted = mute;
  if (musicGain) {
    musicGain.gain.setTargetAtTime(mute ? 0 : 0.08, audioCtx?.currentTime || 0, 0.1);
  }
};

export const updateMusicSpeed = (speedRatio: number) => {
  // speedRatio: 1.0 to 2.0 typically
  currentTempo = speedRatio;
  if (musicOscillators.length > 0 && audioCtx) {
    // Pitch shift for intensity (slight rise)
    const pitchMod = 1 + (speedRatio - 1) * 0.2;
    
    musicOscillators.forEach((osc, i) => {
        // Base Frequencies: C3 (130.81), G3 (196.00), C4 (261.63)
        const baseFreq = i === 0 ? 130.81 : i === 1 ? 196.00 : 261.63;
        osc.frequency.setTargetAtTime(
            baseFreq * pitchMod, 
            audioCtx!.currentTime, 
            2
        );
    });
  }
};

export const playSound = (type: 'JUMP' | 'DUCK' | 'GAMEOVER' | 'POWERUP' | 'EXPLOSION') => {
  if (!audioCtx || isMuted) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'JUMP':
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    
    case 'DUCK':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;

    case 'POWERUP':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1); // C#
      osc.frequency.setValueAtTime(659, now + 0.2); // E
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;

    case 'EXPLOSION':
      // Noise buffer for explosion
      const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      noise.start(now);
      break;

    case 'GAMEOVER':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1);
      osc.start(now);
      osc.stop(now + 1);
      break;
  }
};

export const startMusic = () => {
  if (!audioCtx || musicOscillators.length > 0) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // "Light" Ambient Pad - C Major Triad
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const osc3 = audioCtx.createOscillator();
  musicGain = audioCtx.createGain();

  // Root - C3
  osc1.type = 'triangle';
  osc1.frequency.value = 130.81; 
  
  // Fifth - G3
  osc2.type = 'sine';
  osc2.frequency.value = 196.00;
  
  // Octave - C4
  osc3.type = 'sine';
  osc3.frequency.value = 261.63; 
  osc3.detune.value = 5; // Slight detune for shimmer

  // Filter for softness
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800; // Open up the filter more for "lightness"

  // Slow LFO for breathing effect
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.2; // Very slow
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 300;

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(musicGain);
  musicGain.connect(audioCtx.destination);

  musicGain.gain.value = isMuted ? 0 : 0.08; // Lower volume for ambient

  osc1.start();
  osc2.start();
  osc3.start();

  musicOscillators = [osc1, osc2, osc3];
};

export const stopMusic = () => {
  musicOscillators.forEach(o => o.stop());
  musicOscillators = [];
  musicGain = null;
};
