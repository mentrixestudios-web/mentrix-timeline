// Web Audio API synthesized sound effects for Mentrix (no external audio files needed)

let audioCtx = null;
let soundEnabled = typeof window !== "undefined" ? localStorage.getItem("mt_sound_enabled") !== "false" : true;
let musicEnabled = typeof window !== "undefined" ? localStorage.getItem("mt_music_enabled") === "true" : false;
let masterVolume = typeof window !== "undefined" ? parseFloat(localStorage.getItem("mt_volume") || "0.7") : 0.7;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(val) {
  soundEnabled = !!val;
  if (typeof window !== "undefined") {
    localStorage.setItem("mt_sound_enabled", String(soundEnabled));
  }
}

export function isMusicEnabled() {
  return musicEnabled;
}

export function setMusicEnabled(val) {
  musicEnabled = !!val;
  if (typeof window !== "undefined") {
    localStorage.setItem("mt_music_enabled", String(musicEnabled));
  }
  if (musicEnabled) {
    userHasInteracted = true;
    startBgmPlayback();
  } else {
    pauseBgm();
  }
}

export function getMasterVolume() {
  return masterVolume;
}

export function setMasterVolume(val) {
  masterVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.7));
  if (typeof window !== "undefined") {
    localStorage.setItem("mt_volume", String(masterVolume));
  }
  if (bgmAudio) {
    bgmAudio.volume = masterVolume * 0.35;
  }
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
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gainNode.gain.setValueAtTime(masterVolume * 0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "coin") {
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        g.gain.setValueAtTime(0, now + idx * 0.08);
        g.gain.linearRampToValueAtTime(masterVolume * 0.35, now + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (type === "correct") {
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
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

      gainNode.gain.setValueAtTime(masterVolume * 0.22, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === "victory") {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        g.gain.setValueAtTime(0, now + idx * 0.09);
        g.gain.linearRampToValueAtTime(masterVolume * 0.38, now + idx * 0.09 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.48);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.5);
      });
    }
  } catch (e) {
    console.warn("Audio SFX notice:", e);
  }
}

let bgmAudio = null;
let userHasInteracted = false;
let autoPausedByVisibility = false;
let bgmTimer = null;
const BGM_TRACKS = {
  home: "/audio/bgm/timeline_era_v1.mp3",
  game: "/audio/bgm/timeline_crusade_v1.mp3",
};
let currentBgmTrack = "home";

function startBgmPlayback() {
  if (!musicEnabled || !userHasInteracted) return;
  if (typeof window === "undefined") return;
  if (bgmTimer) clearTimeout(bgmTimer);
  bgmTimer = setTimeout(() => {
    if (!musicEnabled) return;
    const resolved = BGM_TRACKS[currentBgmTrack] || currentBgmTrack;
    try {
      if (!bgmAudio) {
        bgmAudio = new Audio();
        bgmAudio.preload = "none";
        bgmAudio.loop = true;
      }
      const targetHref = new URL(resolved, window.location.href).href;
      if (bgmAudio.src !== targetHref) {
        bgmAudio.src = resolved;
      }
      bgmAudio.volume = masterVolume * 0.35;
      if (bgmAudio.paused) {
        bgmAudio.play().catch(() => {});
      }
    } catch {}
  }, 400);
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (bgmAudio && !bgmAudio.paused) {
        autoPausedByVisibility = true;
        try { bgmAudio.pause(); } catch {}
      }
    } else if (autoPausedByVisibility && musicEnabled) {
      autoPausedByVisibility = false;
      startBgmPlayback();
    }
  });
}

export function playBgm(track = "home") {
  currentBgmTrack = track;
  if (!musicEnabled || !userHasInteracted) return;
  startBgmPlayback();
}

export function pauseBgm() {
  if (bgmTimer) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
  if (bgmAudio) {
    try { bgmAudio.pause(); } catch {}
  }
}
