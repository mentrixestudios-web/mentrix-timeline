// Web Audio API synthesized sound effects for Mentrix (no external audio files needed)

let audioCtx = null;
let soundEnabled = localStorage.getItem("mt_sound_enabled") !== "false";
let musicEnabled = localStorage.getItem("mt_music_enabled") !== "false";
let masterVolume = parseFloat(localStorage.getItem("mt_volume") || "0.7");

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(val) {
  soundEnabled = !!val;
  localStorage.setItem("mt_sound_enabled", String(soundEnabled));
}

export function isMusicEnabled() {
  return musicEnabled;
}

export function setMusicEnabled(val) {
  musicEnabled = !!val;
  localStorage.setItem("mt_music_enabled", String(musicEnabled));
}

export function getMasterVolume() {
  return masterVolume;
}

export function setMasterVolume(val) {
  masterVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.7));
  localStorage.setItem("mt_volume", String(masterVolume));
}

export function playSfx(type = "click") {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(masterVolume, now);
    gainNode.connect(ctx.destination);

    if (type === "click" || type === "tap") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

      gainNode.gain.setValueAtTime(masterVolume * 0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "coin") {
      // Moneda brillante: doble tono agudo tipo arcade
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        g.gain.setValueAtTime(0, now + idx * 0.08);
        g.gain.linearRampToValueAtTime(masterVolume * 0.4, now + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (type === "correct") {
      // Acorde triunfal ascendente
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        g.gain.setValueAtTime(0, now + idx * 0.06);
        g.gain.linearRampToValueAtTime(masterVolume * 0.35, now + idx * 0.06 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.4);
      });
    } else if (type === "wrong" || type === "error") {
      // Tono grave descendente
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);

      gainNode.gain.setValueAtTime(masterVolume * 0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "victory") {
      // Fanfarria
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        g.gain.setValueAtTime(0, now + idx * 0.09);
        g.gain.linearRampToValueAtTime(masterVolume * 0.4, now + idx * 0.09 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.5);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.55);
      });
    }
  } catch (e) {
    console.warn("Audio SFX notice:", e);
  }
}
