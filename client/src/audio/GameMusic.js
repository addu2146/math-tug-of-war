/**
 * GameMusic — Procedural Indian-style fast background music using Web Audio API.
 *
 * Inspired by Bollywood / Indian folk game-show energy:
 *  - Tanpura-style drone (Sa-Pa) for constant warmth
 *  - Tabla-style rhythm: dha-dhin-dha-dhin fast taal pattern
 *  - Sitar-like melody using Raga Bhairav / pentatonic scale
 *  - Dhol-style bass hits for excitement
 *  - Bright, kid-friendly, high-energy
 *
 * No external files — all generated in real-time.
 */

// Raga-inspired scale frequencies (Sa=C4 base)
// Using a pentatonic subset for kid-friendly catchiness
const SA = 261.63;  // C4
const RE = 293.66;  // D4
const GA = 329.63;  // E4
const PA = 392.00;  // G4
const DHA = 440.00;  // A4
const SA2 = 523.25;  // C5
const RE2 = 587.33;  // D5
const GA2 = 659.25;  // E5

// Melody patterns — multiple catchy sequences that cycle
const MELODY_PATTERNS = [
    [SA2, PA, DHA, PA, GA, RE, GA, PA],           // ascending-descending motif
    [SA2, RE2, SA2, DHA, PA, DHA, SA2, PA],       // bouncy high phrase
    [GA, PA, DHA, SA2, DHA, PA, GA, RE],          // classic arohi-avarohi
    [PA, GA, PA, DHA, SA2, DHA, PA, GA],          // playful mid-range
];

// Tabla bol pattern (mapped to sounds): 1=Dha, 2=Dhin, 3=Ta, 4=Tin, 0=rest
const TABLA_PATTERN = [1, 2, 2, 1, 3, 4, 2, 1, 1, 2, 3, 2, 1, 4, 2, 3];

export class GameMusic {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        
        // HTMLAudioElements for actual MP3 tracks
        this.setupAudio = null;
        this.gameAudio = null;
        this.timeoutIds = [];
        this.intervalIds = [];
        this.droneOscs = [];
    }

    init() {
        if (this.setupAudio) return;
        
        // Classic Beethoven for the lobby
        this.setupAudio = new Audio('/assets/setup_music.mp3');
        this.setupAudio.loop = true;
        this.setupAudio.volume = 0.4;
        
        // 1812 Overture for the gameplay
        this.gameAudio = new Audio('/assets/game_music.mp3');
        this.gameAudio.loop = true;
        this.gameAudio.volume = 0.6;
        
        // We still need the AudioContext for the right/wrong SFX!
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.60;
        this.masterGain.connect(this.ctx.destination);
    }
    
    // Call this the moment SetupWizard mounts
    startSetupMusic() {
        this.init();
        if (this.setupAudio && this.setupAudio.paused) {
            // The file is now physically trimmed to the best 35 seconds (the iconic opening motif)
            this.setupAudio.currentTime = 0;
            this.setupAudio.play().catch(e => console.warn('Audio blocked until interaction', e));
        }
    }
    
    stopSetupMusic() {
        if (this.setupAudio) {
            this.setupAudio.pause();
            this.setupAudio.currentTime = 0;
        }
        this.timeoutIds.forEach(id => clearInterval(id));
        this.timeoutIds = [];
    }

    start() {
        this.stopSetupMusic();
        
        if (this.isPlaying) return;
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;

        if (this.gameAudio) {
            this.gameAudio.currentTime = 0;
            this.gameAudio.play().catch(e => console.warn('Game audio blocked until interaction', e));
        }
    }

    /* ================================================================
     *  TANPURA DRONE (Sa + Pa — constant warm bed)
     * ================================================================ */
    startDrone() {
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.06;
        this.droneGain.connect(this.masterGain);

        // Sa drone (fundamental)
        const sa = this.ctx.createOscillator();
        sa.type = 'sawtooth';
        sa.frequency.value = SA / 2; // one octave lower
        const saFilter = this.ctx.createBiquadFilter();
        saFilter.type = 'lowpass';
        saFilter.frequency.value = 300;
        saFilter.Q.value = 2;
        sa.connect(saFilter);
        saFilter.connect(this.droneGain);
        sa.start();
        this.droneOscs.push(sa);

        // Pa drone (fifth)
        const pa = this.ctx.createOscillator();
        pa.type = 'sawtooth';
        pa.frequency.value = PA / 2;
        const paFilter = this.ctx.createBiquadFilter();
        paFilter.type = 'lowpass';
        paFilter.frequency.value = 300;
        paFilter.Q.value = 2;
        pa.connect(paFilter);
        paFilter.connect(this.droneGain);
        pa.start();
        this.droneOscs.push(pa);

        // Add shimmer with a very quiet high Sa
        const shimmer = this.ctx.createOscillator();
        shimmer.type = 'sine';
        shimmer.frequency.value = SA;
        const shimGain = this.ctx.createGain();
        shimGain.gain.value = 0.02;
        shimmer.connect(shimGain);
        shimGain.connect(this.droneGain);
        shimmer.start();
        this.droneOscs.push(shimmer);
    }

    /* ================================================================
     *  TABLA (Dha / Dhin / Ta / Tin)
     * ================================================================ */
    playTabla(time, bol) {
        switch (bol) {
            case 1: this.playDha(time); break;     // bass + open
            case 2: this.playDhin(time); break;     // bass + closed
            case 3: this.playTa(time); break;       // treble open
            case 4: this.playTin(time); break;      // treble closed
        }
    }

    // Dha — deep resonant open hit (bayan + dayan)
    playDha(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.15);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.2);
        // Treble click
        this.playClick(time, 800, 0.12, 0.03);
    }

    // Dhin — muted bass with higher click
    playDhin(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.12);
        this.playClick(time, 1200, 0.10, 0.02);
    }

    // Ta — sharp treble hit (dayan only)
    playTa(time) {
        this.playClick(time, 600, 0.20, 0.06);
    }

    // Tin — bright short treble
    playTin(time) {
        this.playClick(time, 1000, 0.15, 0.025);
    }

    // Generic click — used for tabla treble component
    playClick(time, freq, vol, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + dur);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        filter.Q.value = 3;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur + 0.01);
    }

    /* ================================================================
     *  DHOL — big bass drum on strong beats
     * ================================================================ */
    playDhol(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);
        gain.gain.setValueAtTime(0.55, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.22);
    }

    /* ================================================================
     *  GHUNGROO — tiny metallic shimmer on every beat
     * ================================================================ */
    playGhungroo(time) {
        const bufSize = this.ctx.sampleRate * 0.015;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.08;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.015);
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 10000;
        src.connect(hp);
        hp.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
    }

    /* ================================================================
     *  SITAR-LIKE MELODY — plucked string sound
     * ================================================================ */
    playSitar(time, freq) {
        // Two detuned oscillators for that buzzy sitar-ish timbre
        for (let detune of [-8, 8]) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            osc.detune.value = detune;

            // Pluck envelope: sharp attack, medium decay
            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.04, time + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

            // Resonant filter for twangy character
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = freq * 2;
            filter.Q.value = 5;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + 0.25);
        }
    }

    /* ================================================================
     *  TAAN — fast ornamental melodic run (every 16 beats)
     * ================================================================ */
    playTaan(time) {
        const run = [SA, RE, GA, PA, DHA, SA2, RE2, GA2, RE2, SA2, DHA, PA];
        const noteLen = 0.045; // super fast
        run.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            osc.detune.value = 5;
            gain.gain.setValueAtTime(0.08, time + i * noteLen);
            gain.gain.exponentialRampToValueAtTime(0.01, time + i * noteLen + noteLen * 0.9);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = freq * 2;
            filter.Q.value = 4;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time + i * noteLen);
            osc.stop(time + i * noteLen + noteLen);
        });
    }

    /* ================================================================
     *  SOUND EFFECTS (unchanged API)
     * ================================================================ */

    playCorrect() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Ascending Sa-Ga-Pa — happy Indian flourish
        [SA, GA, PA].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq * 2;
            gain.gain.setValueAtTime(0.18, now + i * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.12);
        });
    }

    playIncorrect() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Descending low buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    /* ================================================================
     *  STOP / DESTROY
     * ================================================================ */

    stop() {
        this.isPlaying = false;
        
        // Stop lobby music if it happens to be playing
        this.stopSetupMusic();

        if (this.gameAudio) {
            this.gameAudio.pause();
            this.gameAudio.currentTime = 0;
        }

        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];
        // Stop drone oscillators
        this.droneOscs.forEach(osc => {
            try { osc.stop(); } catch (e) { /* already stopped */ }
        });
        this.droneOscs = [];
    }

    destroy() {
        this.stop();
        if (this.ctx) {
            this.ctx.close().catch(() => { });
            this.ctx = null;
        }
        if (this.setupAudio) {
            this.setupAudio.pause();
            this.setupAudio.src = '';
            this.setupAudio = null;
        }
        if (this.gameAudio) {
            this.gameAudio.pause();
            this.gameAudio.src = '';
            this.gameAudio = null;
        }
    }
}

// Singleton
export const gameMusic = new GameMusic();
