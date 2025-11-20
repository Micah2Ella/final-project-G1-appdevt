class AudioManager {
  constructor() {
    this.currentTrack = null;
    this.audio = new Audio();
    this.targetVolume = 0.5;
    this.audio.volume = this.targetVolume;
    this.fadeDuration = 800;
    this.isFading = false;
  }

  cancelFade() {
    this.isFading = false;
  }

  play(src) {
    if (this.isFading) return;
    // cancel any fade-out / fade-in in progress
    this.cancelFade();

    if (this.currentTrack === src && !this.audio.paused) return;

    this.currentTrack = src;
    this.audio.src = src;
    this.audio.loop = true;

    // Start silent
    this.audio.volume = 0;

    this.audio.play().then(() => {
      this.fadeIn();
    }).catch(() => {});
  }

  fadeIn() {
    this.isFading = true;

    const duration = this.fadeDuration;
    const startTime = performance.now();

    const fade = (now) => {
      if (!this.isFading) return; // cancelled early

      const progress = (now - startTime) / duration;

      if (progress < 1) {
        const newVolume = this.targetVolume * progress;

        // Clamp
        this.audio.volume = Math.max(0, Math.min(1, newVolume));

        requestAnimationFrame(fade);
      } else {
        this.audio.volume = this.targetVolume;
        this.isFading = false;
      }
    };

    requestAnimationFrame(fade);
  }

  stop() {
    // cancel fade-in first
    this.cancelFade();

    this.isFading = true;

    const startVolume = this.audio.volume;
    const duration = this.fadeDuration;
    const startTime = performance.now();

    const fade = (now) => {
      if (!this.isFading) return; // cancelled by a new play()

      const progress = (now - startTime) / duration;

      if (progress < 1) {
        const newVolume = startVolume * (1 - progress);

        // CLAMP between 0 and 1
        this.audio.volume = Math.max(0, Math.min(1, newVolume));

        requestAnimationFrame(fade);
      } else {
        this.audio.volume = 0;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isFading = false;
      }
    };

    requestAnimationFrame(fade);
  }

  unlock() {
    // no-op if already unlocked
    if (this._unlocked) return;
    this._unlocked = true;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    }
}

export default new AudioManager();
