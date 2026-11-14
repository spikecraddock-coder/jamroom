import { CHORDS, CHORD_STYLES, FILL_MODES, GROOVES, JAM_KEYS, JAM_PATTERNS, barChordSegments, getChordForBar, patternSectionForBar, tonicChordFor } from "./music.js";
import { BASS_PATTERNS, BASS_PLAYERS, BASS_SOUNDS, DRUM_PLAYERS, DRUM_SOUNDS, bassPart } from "./rhythm-arranger.js";
import { buildLick, compPattern, createRoom, playElectricPiano, playLeadNote, playOrgan, voiceLead } from "./keys.js";

const BASS_FILES = [
  [28, "E1"], [29, "F1"], [30, "F-sharp1"], [31, "G1"], [32, "G-sharp1"],
  [33, "A1"], [34, "A-sharp1"], [35, "B1"], [36, "C2"], [37, "C-sharp2"],
  [38, "D2"], [39, "D-sharp2"],
];
const PICK_FILES = ["E", "F", "F-sharp", "G", "G-sharp", "A", "A-sharp", "B", "C", "C-sharp", "D", "D-sharp"];

const DRUM_FILES = {
  "kick-6": "kick-6.flac", "kick-12": "kick-12.flac", "kick-16": "kick-16.flac", "kick-20": "kick-20.flac", "kick-24": "kick-24.flac",
  "kick-r-6": "kick-r-6.flac", "kick-r-12": "kick-r-12.flac", "kick-r-16": "kick-r-16.flac", "kick-r-20": "kick-r-20.flac", "kick-r-24": "kick-r-24.flac",
  "snare-12": "snare-12.flac", "snare-20": "snare-20.flac",
  "snare-36": "snare-36.flac", "snare-42": "snare-42.flac", "snare-45": "snare-45.flac", "snare-48": "snare-48.flac", "snare-51": "snare-51.flac",
  "snare-r-12": "snare-r-12.flac", "snare-r-20": "snare-r-20.flac", "snare-r-36": "snare-r-36.flac",
  "snare-r-42": "snare-r-42.flac", "snare-r-45": "snare-r-45.flac", "snare-r-48": "snare-r-48.flac", "snare-r-51": "snare-r-51.flac",
  "ghost-snare-1": "ghost-snare-1.flac", "ghost-snare-6": "ghost-snare-6.flac",
  "hat-closed-1": "hat-closed-1.flac", "hat-closed-5": "hat-closed-5.flac", "hat-closed-8": "hat-closed-8.flac",
  "hat-closed-10": "hat-closed-10.flac", "hat-closed-12": "hat-closed-12.flac", "hat-closed-16": "hat-closed-16.flac",
  "hat-open-4": "hat-open-4.flac", "hat-open-12": "hat-open-12.flac", "hat-open-16": "hat-open-16.flac",
  "ride-1": "ride-1.flac", "ride-3": "ride-3.flac", "ride-4": "ride-4.flac",
  "tom-mid-5": "tom-mid-5.flac", "tom-mid-7": "tom-mid-7.flac", "tom-mid-9": "tom-mid-9.flac",
  "tom-floor-5": "tom-floor-5.flac", "tom-floor-12": "tom-floor-12.flac", "tom-floor-16": "tom-floor-16.flac",
};

// The source kit groups numbered recordings by strike velocity. Keep a hit in
// the right layer, then alternate recordings within that layer.
const DRUM_TAKES = {
  kick: [[.43, ["kick-6", "kick-12"]], [.75, ["kick-12", "kick-16"]], [Infinity, ["kick-20", "kick-24"]]],
  snare: [[.28, ["snare-12", "snare-20"]], [.52, ["snare-36", "snare-42"]],
    [.78, ["snare-42", "snare-45", "snare-48"]], [Infinity, ["snare-48", "snare-51"]]],
  ghost: [[.34, ["ghost-snare-1", "ghost-snare-6"]], [Infinity, ["ghost-snare-6", "ghost-snare-1"]]],
  hat: [[.18, ["hat-closed-1", "hat-closed-5", "hat-closed-8"]],
    [.31, ["hat-closed-8", "hat-closed-10", "hat-closed-12"]], [Infinity, ["hat-closed-12", "hat-closed-16"]]],
  openHat: [[.3, ["hat-open-4", "hat-open-12"]], [Infinity, ["hat-open-12", "hat-open-16"]]],
  ride: [[.17, ["ride-1", "ride-3"]], [Infinity, ["ride-3", "ride-4"]]],
  midTom: [[.5, ["tom-mid-5", "tom-mid-7"]], [Infinity, ["tom-mid-7", "tom-mid-9"]]],
  floorTom: [[.5, ["tom-floor-5", "tom-floor-12"]], [Infinity, ["tom-floor-12", "tom-floor-16"]]],
};

const KICK_POOL = ["kick-6", "kick-12", "kick-16", "kick-20"];
const SNARE_POOL = ["snare-12", "snare-20", "snare-36", "snare-45"];
const GHOST_POOL = ["ghost-snare-1", "ghost-snare-6"];
const HAT_POOL = ["hat-closed-1", "hat-closed-8", "hat-closed-16"];
const TOM_MID_POOL = ["tom-mid-5", "tom-mid-7"];
const TOM_FLOOR_POOL = ["tom-floor-5", "tom-floor-12"];

const FILL_PATTERNS = {
  short: [
    [["ghost", 5, 0.30], ["snare", 6, 0.82], ["snare", 7, 0.46]],
    [["tom-mid", 6, 0.58], ["snare", 7, 0.62]],
  ],
  regular: [
    [["ghost", 4, 0.26], ["tom-mid", 5, 0.56], ["snare", 6, 0.86], ["snare", 7, 0.56]],
    [["snare", 5, 0.48], ["tom-floor", 6, 0.62], ["snare", 7, 0.68]],
  ],
  section: [
    [["tom-mid", 3, 0.48], ["tom-mid", 4, 0.60], ["tom-floor", 5, 0.68], ["snare", 6, 0.92], ["snare", 7, 0.64]],
    [["snare", 3, 0.44], ["tom-mid", 4, 0.60], ["tom-floor", 5, 0.70], ["snare", 6, 0.92], ["snare", 7, 0.68]],
    [["tom-mid", 4, 0.62], ["snare", 5, 0.50], ["tom-floor", 6, 0.70], ["snare", 7, 0.78]],
  ],
};

const DRUM_ENVELOPES = {
  ride: { seconds: 0.95, release: 0.23, highpass: 250 },
  tom: { seconds: 1.1, release: 0.25 },
  openHat: { seconds: 0.58, release: 0.18, highpass: 350 },
};
const DEFAULT_MIX_LEVEL = 80;
const DEFAULT_MASTER_VOLUME = 115;
const MASTER_VOLUME_MAX = 175;
const MIX_BUS_GAINS = { drums: 0.82, bass: 0.76, keys: 0.65 };

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function choose(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function shortBassPart(chord, nextChord, pattern, player, barIndex) {
  const current = CHORDS[chord];
  const root = current.rootMidi;
  const third = root + ((current.pitchClasses[1] - current.pitchClasses[0] + 12) % 12);
  const fifth = root + 7;
  const nextRoot = CHORDS[nextChord]?.rootMidi ?? root;
  const approach = nextRoot === 28 ? 29 : nextRoot - 1;
  const note = (step, midi, velocity, length = .42) => ({ step, midi, velocity, length });
  const sparse = player === "basic";
  if (pattern === "walking") return [note(0, root, .84, .38), note(1, third, .62), note(2, fifth, .72), note(3, approach, .5, .22)];
  if (pattern === "boogie") return [note(0, root, .86), note(1, fifth, .6), note(2, root, .72), note(3, fifth, .58)];
  if (pattern === "octaves") return [note(0, root, .82, .6), note(2, root + 12, .62, .5)];
  if (pattern === "roots") return [note(0, root, .85, .65), note(2, fifth, .64, .55)];
  return sparse
    ? [note(0, root, .84, .64), note(2, fifth, .66, .55)]
    : [note(0, root, .85, .38), note(1, third, .58), note(2, fifth, .7), note(3, barIndex % 2 ? approach : third, .5, .24)];
}

function drumEnvelope(name) {
  if (name.startsWith("ride-")) return DRUM_ENVELOPES.ride;
  if (name.startsWith("tom-")) return DRUM_ENVELOPES.tom;
  if (name.startsWith("hat-open-")) return DRUM_ENVELOPES.openHat;
  return null;
}

function drumTake(name, velocity, time, sound) {
  const family = name.startsWith("kick-") ? "kick"
    : name.startsWith("ghost-snare-") ? "ghost"
      : name.startsWith("snare-") ? "snare"
        : name.startsWith("hat-closed-") ? "hat"
          : name.startsWith("hat-open-") ? "openHat"
            : name.startsWith("ride-") ? "ride"
              : name.startsWith("tom-mid-") ? "midTom" : "floorTom";
  const layer = DRUM_TAKES[family].find(([maximum]) => velocity <= maximum)[1];
  const sourceNumber = Number(name.match(/\d+$/)?.[0] ?? 0);
  const take = layer[(Math.floor(time * 11) + sourceNumber) % layer.length];
  if (sound === "tight" && (family === "kick" || family === "snare")) {
    return take.replace(family === "kick" ? "kick-" : "snare-", family === "kick" ? "kick-r-" : "snare-r-");
  }
  return take;
}

function safeStop(node, when) {
  try { node.stop(when); } catch { /* A source can end between the state check and stop. */ }
}

export class AudioEngine {
  constructor(onPosition = () => {}, onStatus = () => {}, onEnded = () => {}) {
    this.onPosition = onPosition;
    this.onStatus = onStatus;
    this.onEnded = onEnded;
    this.context = null;
    this.buffers = new Map();
    this.ready = false;
    this.nodes = new Set();
    this.timeline = [];
    this.timer = null;
    this.state = "stopped";
    this.bpm = 94;
    this.feel = "shuffle";
    this.fillMode = "regular";
    this.bassPattern = "chordTones";
    this.bassPlayer = "pocket";
    this.bassSound = "warm";
    this.drumPlayer = "pocket";
    this.drumSound = "tight";
    this.chordalSound = "piano";
    this.chordalEnabled = false;
    // Optional lead voice that plays the note-highway phrase. `highwayNotes(bar, key)` returns
    // [{ beat, midi, dur }] for one chart bar and is set by the UI.
    this.highwayAudible = false;
    this.highwayNotes = null;
    this.customChart = null;
    this.practiceRange = null;
    this.countInBars = 1;
    this.pendingBand = {};
    this.key = "C";
    this.pendingKey = null;
    this.form = "standard";
    this.barsPerCycle = JAM_PATTERNS.standard.roles.length;
    this.chordStyle = "major";
    this.quiet = false;
    this.lift = false;
    this.pendingLift = null;
    this.pendingStopTime = false;
    this.stopTimeRemaining = 0;
    this.keysVoicing = null;
    this.callVariant ??= 0;
    this.pendingBpm = null;
    this.pendingBpmAtLoop = false;
    this.pendingFeel = null;
    this.pendingFillMode = null;
    this.pendingQuiet = null;
    this.endAtBar = null;
    this.endingScheduled = false;
    this.stopAt = null;
    this.pauseSnapshot = null;
    this.countInStart = null;
    this.songStart = null;
    this.nextBarIndex = 0;
    this.nextBarTime = 0;
    this.lastPosition = null;
    this.loadPromise = null;
    this.buses = null;
    this.mixLevels = { drums: DEFAULT_MIX_LEVEL, bass: DEFAULT_MIX_LEVEL, keys: DEFAULT_MIX_LEVEL };
    this.masterVolume = DEFAULT_MASTER_VOLUME;
  }

  async prepare() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error("This browser does not support Web Audio.");
      this.context = new AudioContextClass();
      this.createBuses();
    }
    if (this.context.state === "suspended") await this.context.resume();
    if (this.ready) return;
    if (this.loadPromise) return this.loadPromise;

    const requests = [];
    for (const [midi, name] of BASS_FILES) {
      requests.push([`bass:${midi}`, new URL(`../assets/audio/bass/${name}.flac`, import.meta.url)]);
      requests.push([`bass:pick:${midi}`, new URL(`../assets/audio/bass/pick/${PICK_FILES[midi - 28]}.flac`, import.meta.url)]);
    }
    for (const [name, file] of Object.entries(DRUM_FILES)) {
      requests.push([`drum:${name}`, new URL(`../assets/audio/drums/${file}`, import.meta.url)]);
    }

    this.loadPromise = (async () => {
      let completed = 0;
      let nextRequest = 0;
      const worker = async () => {
        while (nextRequest < requests.length) {
          const [key, url] = requests[nextRequest++];
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Could not load sound sample ${url.pathname} (${response.status}).`);
          const data = await response.arrayBuffer();
          let buffer;
          try {
            buffer = await this.context.decodeAudioData(data.slice(0));
          } catch (error) {
            const kind = key.startsWith("bass:") ? "bass" : "drum";
            throw new Error(`This browser could not decode the local ${kind} FLAC sample (${key}). ${error?.message ?? ""}`);
          }
          this.buffers.set(key, buffer);
          completed += 1;
          this.onStatus({ kind: "loading", loaded: completed, total: requests.length });
        }
      };
      const results = await Promise.allSettled(Array.from({ length: Math.min(4, requests.length) }, worker));
      const failure = results.find((result) => result.status === "rejected");
      if (failure) throw failure.reason;
      this.ready = true;
      this.onStatus({ kind: "ready" });
    })();

    try {
      await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  createBuses() {
    const ctx = this.context;
    const drums = ctx.createGain();
    const bass = ctx.createGain();
    const keys = ctx.createGain();
    const master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const output = ctx.createGain();
    const peakGuard = ctx.createDynamicsCompressor();
    drums.gain.value = MIX_BUS_GAINS.drums * this.mixLevels.drums / DEFAULT_MIX_LEVEL;
    bass.gain.value = MIX_BUS_GAINS.bass * this.mixLevels.bass / DEFAULT_MIX_LEVEL;
    keys.gain.value = MIX_BUS_GAINS.keys * this.mixLevels.keys / DEFAULT_MIX_LEVEL;
    master.gain.value = 1;
    output.gain.value = this.masterVolume / 100;
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.2;
    peakGuard.threshold.value = -1;
    peakGuard.knee.value = 0;
    peakGuard.ratio.value = 20;
    peakGuard.attack.value = 0.003;
    peakGuard.release.value = 0.09;
    drums.connect(master);
    bass.connect(master);
    keys.connect(master);
    // Keys sit in a small room so they blend behind the rhythm section.
    const roomSend = ctx.createGain();
    roomSend.gain.value = 0.32;
    const room = createRoom(ctx);
    keys.connect(roomSend);
    roomSend.connect(room);
    room.connect(master);
    // Shared organ vibrato (in cents), like a scanner/Leslie shimmer.
    const vibratoLfo = ctx.createOscillator();
    const vibrato = ctx.createGain();
    vibratoLfo.frequency.value = 6.1;
    vibrato.gain.value = 7;
    vibratoLfo.connect(vibrato);
    vibratoLfo.start();
    master.connect(compressor);
    compressor.connect(output);
    output.connect(peakGuard);
    peakGuard.connect(ctx.destination);
    this.buses = { drums, bass, keys, master, compressor, output, peakGuard, room, roomSend, vibrato };
  }

  setChannelVolume(channel, percent) {
    if (!Object.hasOwn(MIX_BUS_GAINS, channel)) return;
    const level = clamp(Number(percent) || 0, 0, 100);
    this.mixLevels[channel] = level;
    if (!this.context || !this.buses) return;
    const gain = this.buses[channel].gain;
    const now = this.context.currentTime;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(MIX_BUS_GAINS[channel] * level / DEFAULT_MIX_LEVEL, now, 0.015);
  }

  setMasterVolume(percent) {
    const level = clamp(Number(percent) || 0, 0, MASTER_VOLUME_MAX);
    this.masterVolume = level;
    if (!this.context || !this.buses?.output) return;
    const gain = this.buses.output.gain;
    const now = this.context.currentTime;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(level / 100, now, 0.015);
  }

  async start({ bpm = this.bpm, feel = this.feel, fillMode = this.fillMode, key = this.key, form = this.form, chordStyle = this.chordStyle,
    bassPattern = this.bassPattern, bassPlayer = this.bassPlayer, bassSound = this.bassSound,
    drumPlayer = this.drumPlayer, drumSound = this.drumSound, chordalSound = this.chordalSound,
    chordalEnabled = this.chordalEnabled, customChart = this.customChart, practiceRange = null, countInBars = 1 } = {}) {
    if (this.state === "paused") return this.resume();
    if (this.state === "playing" || this.state === "count-in") return;
    await this.prepare();
    this.stopAllNodes();
    this.timeline = [];
    this.bpm = clamp(Number(bpm) || 94, 60, 140);
    this.feel = GROOVES[feel] ? feel : "shuffle";
    this.fillMode = FILL_MODES[fillMode] ? fillMode : "regular";
    this.bassPattern = BASS_PATTERNS[bassPattern] ? bassPattern : "chordTones";
    this.bassPlayer = BASS_PLAYERS[bassPlayer] ? bassPlayer : "pocket";
    this.bassSound = BASS_SOUNDS[bassSound] ? bassSound : "finger";
    this.drumPlayer = DRUM_PLAYERS[drumPlayer] ? drumPlayer : "pocket";
    this.drumSound = DRUM_SOUNDS[drumSound] ? drumSound : "acoustic";
    this.key = JAM_KEYS[key] ? key : "C";
    this.pendingKey = null;
    this.form = JAM_PATTERNS[form] ? form : "standard";
    this.chordalSound = ["piano", "organ", "off"].includes(chordalSound) ? chordalSound : "piano";
    this.chordalEnabled = Boolean(chordalEnabled) && this.chordalSound !== "off";
    this.customChart = this.form === "custom" && customChart?.bars?.length ? JSON.parse(JSON.stringify(customChart)) : null;
    const rawPractice = Array.isArray(practiceRange) && practiceRange.length === 2 ? practiceRange.map(Number) : null;
    this.practiceRange = rawPractice && rawPractice[0] >= 0 && rawPractice[1] >= rawPractice[0]
      ? [Math.min(rawPractice[0], JAM_PATTERNS[this.form].roles.length - 1), Math.min(rawPractice[1], JAM_PATTERNS[this.form].roles.length - 1)] : null;
    this.practiceRange = this.form === "custom" && this.customChart && rawPractice
      ? [Math.min(rawPractice[0], this.customChart.bars.length - 1), Math.min(rawPractice[1], this.customChart.bars.length - 1)] : this.practiceRange;
    this.countInBars = Math.max(0, Math.min(2, Number(countInBars) || 0));
    this.pendingBand = {};
    this.barsPerCycle = this.form === "custom" && this.customChart ? this.customChart.bars.length : JAM_PATTERNS[this.form].roles.length;
    this.chordStyle = CHORD_STYLES[chordStyle] ? chordStyle : "major";
    this.quiet = false;
    this.lift = false;
    this.pendingLift = null;
    this.pendingStopTime = false;
    this.stopTimeRemaining = 0;
    this.keysVoicing = null;
    this.callVariant ??= 0;
    this.pendingBpm = null;
    this.pendingBpmAtLoop = false;
    this.pendingFeel = null;
    this.pendingFillMode = null;
    this.pendingQuiet = null;
    this.endAtBar = null;
    this.endingScheduled = false;
    this.stopAt = null;
    this.pauseSnapshot = null;
    const barSeconds = 240 / this.bpm;
    this.countInStart = this.context.currentTime + 0.18;
    this.songStart = this.countInStart + barSeconds * this.countInBars;
    this.nextBarIndex = 0;
    this.nextBarTime = this.songStart;
    this.state = "playing";
    this.scheduleCountIn(this.countInStart, barSeconds, this.bpm, this.feel, this.countInBars);
    this.startTimer();
    this.onStatus({ kind: "playing" });
    this.emitPosition();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.scheduleAhead();
      this.emitPosition();
      if (this.stopAt !== null && this.context.currentTime >= this.stopAt) {
        this.stop({ ended: true });
      }
    }, 25);
  }

  loopLength() {
    return this.practiceRange ? this.practiceRange[1] - this.practiceRange[0] + 1 : this.barsPerCycle;
  }

  scheduleAhead() {
    if (this.state !== "playing" || !this.context) return;
    const horizon = this.context.currentTime + 0.14;
    let guard = 0;
    while (this.nextBarTime <= horizon && guard < 4 && !this.endingScheduled) {
      guard += 1;
      this.applyQueuedSettings(this.nextBarIndex);
      const duration = 240 / this.bpm;
      const chorus = Math.floor(this.nextBarIndex / this.loopLength()) + 1;
      const bar = this.practiceRange
        ? this.practiceRange[0] + (this.nextBarIndex % (this.practiceRange[1] - this.practiceRange[0] + 1))
        : this.nextBarIndex % this.barsPerCycle;
      const chordSegments = barChordSegments(bar, this.key, this.form, this.chordStyle, this.customChart)
        .reduce((segments, segment) => {
          const startBeat = segments.length ? segments.at(-1).startBeat + segments.at(-1).beats : 0;
          segments.push({ ...segment, startBeat });
          return segments;
        }, []);
      const chord = chordSegments[0]?.chord ?? getChordForBar(bar, this.key, this.form, this.chordStyle, this.customChart);
      const songSection = patternSectionForBar(this.form, bar, this.customChart);
      const previous = this.timeline[this.timeline.length - 1];
      let stopTime = false;
      let stopTimeLast = false;
      if (this.stopTimeRemaining > 0) {
        stopTime = true;
        this.stopTimeRemaining -= 1;
        stopTimeLast = this.stopTimeRemaining === 0;
      }
      const entry = {
        startTime: this.nextBarTime,
        duration,
        bpm: this.bpm,
        feel: this.feel,
        fillMode: this.fillMode,
        bassPattern: this.bassPattern,
        bassPlayer: this.bassPlayer,
        bassSound: this.bassSound,
        drumPlayer: this.drumPlayer,
        drumSound: this.drumSound,
        chordalSound: this.chordalSound,
        chordalEnabled: this.chordalEnabled,
        quiet: this.quiet,
        lift: this.lift,
        stopTime,
        stopTimeLast,
        key: this.key,
        barIndex: this.nextBarIndex,
        bar,
        chorus,
        chord,
        chordSegments,
        songSection,
        afterFill: Boolean(previous && previous.phase !== "ending" &&
          (previous.stopTimeLast || (!previous.stopTime && this.fillTypeForBar(previous.bar, previous.fillMode)))),
      };
      this.timeline.push(entry);
      if (this.timeline.length > 40) this.timeline.splice(0, this.timeline.length - 40);
      this.scheduleBar(entry);

      if (this.endAtBar === this.nextBarIndex) {
        this.scheduleEnding(entry);
        break;
      }
      this.nextBarTime += duration;
      this.nextBarIndex += 1;
    }
  }

  applyQueuedSettings(barIndex) {
    const updates = [];
    if (barIndex % this.loopLength() === 0 && this.pendingKey !== null) {
      this.key = this.pendingKey;
      this.pendingKey = null;
      updates.push(`Key ${this.key} is coming in on the downbeat.`);
    }
    if (this.pendingBpm !== null && (!this.pendingBpmAtLoop || barIndex % this.loopLength() === 0)) {
      this.bpm = this.pendingBpm;
      this.pendingBpm = null;
      this.pendingBpmAtLoop = false;
      updates.push(`Tempo is now ${this.bpm} BPM.`);
    }
    if (this.pendingFeel !== null) {
      this.feel = this.pendingFeel;
      this.pendingFeel = null;
      updates.push(`${GROOVES[this.feel].name} is now active.`);
    }
    if (this.pendingFillMode !== null) {
      this.fillMode = this.pendingFillMode;
      this.pendingFillMode = null;
      updates.push(`Drum fills: ${FILL_MODES[this.fillMode].name}.`);
    }
    for (const [key, value] of Object.entries(this.pendingBand)) {
      this[key] = value;
      updates.push(`${({ bassPattern: "Bass pattern", bassPlayer: "Bassist", bassSound: "Bass sound", drumPlayer: "Drummer", drumSound: "Drum sound", chordalSound: "Chordal sound", chordalEnabled: "Chordal bandmate" })[key]} changed.`);
    }
    this.pendingBand = {};
    if (barIndex % this.loopLength() === 0 && this.pendingQuiet !== null) {
      this.quiet = this.pendingQuiet;
      this.pendingQuiet = null;
      if (this.quiet) {
        this.lift = false;
        this.pendingLift = null;
      }
      const unit = this.practiceRange ? "practice loop" : JAM_PATTERNS[this.form].genre === "blues" ? "chorus" : "round";
      updates.push(this.quiet ? `The band has eased down for this ${unit}.` : "The band is back at full dynamics.");
    }
    if (this.pendingLift !== null) {
      this.lift = this.pendingLift;
      this.pendingLift = null;
      if (this.lift) {
        this.quiet = false;
        this.pendingQuiet = null;
      }
      updates.push(this.lift ? "The band is digging in." : "The band settles back into the groove.");
    }
    if (this.pendingStopTime && barIndex % 4 === 0) {
      this.pendingStopTime = false;
      this.stopTimeRemaining = 4;
      updates.push("Stop-time! The band hits beat one for four bars — it's all yours.");
    }
    if (updates.length) this.onStatus({ kind: "setting", message: updates.join(" ") });
  }

  keyForBarIndex(barIndex) {
    const pausedEntry = this.state === "paused" ? this.pauseSnapshot?.entry : null;
    if (pausedEntry?.barIndex === barIndex) return pausedEntry.key ?? this.key;
    if (this.state !== "paused") {
      for (let index = this.timeline.length - 1; index >= 0; index -= 1) {
        const entry = this.timeline[index];
        if (entry.phase !== "ending" && entry.barIndex === barIndex) return entry.key ?? this.key;
      }
    }
    const nextUnscheduled = pausedEntry ? pausedEntry.barIndex + 1 : this.nextBarIndex;
    const pendingAt = Math.ceil(nextUnscheduled / this.loopLength()) * this.loopLength();
    return this.pendingKey !== null && barIndex >= pendingAt ? this.pendingKey : this.key;
  }

  eventTime(startTime, step, bpm, feel) {
    const beatSeconds = 60 / bpm;
    const groove = GROOVES[feel] ?? GROOVES.shuffle;
    const beat = Math.floor(step / 2);
    const subdivision = step % 2;
    return startTime + (beat + (subdivision ? groove.swing : 0)) * beatSeconds;
  }

  scheduleCountIn(startTime, duration, bpm, feel, bars = 1) {
    for (let countBar = 0; countBar < bars; countBar += 1) {
      for (let step = 0; step < 8; step += 1) {
        const time = this.eventTime(startTime + countBar * duration, step, bpm, feel);
        const onBeat = step % 2 === 0;
        this.playDrum(choose(HAT_POOL), time, onBeat ? 0.23 : 0.13);
        if (!onBeat) continue;
        const beat = step / 2;
        if (beat === 0 || beat === 2) this.playDrum(choose(KICK_POOL), time, 0.72);
        else this.playDrum(choose(SNARE_POOL), time, 0.66);
      }
    }
  }

  fillTypeForBar(bar, mode = this.fillMode) {
    if (mode === "off") return null;
    const nextBar = (bar + 1) % this.barsPerCycle;
    const sectionEnd = nextBar === 0 ||
      patternSectionForBar(this.form, nextBar).startBar !== patternSectionForBar(this.form, bar).startBar;
    if (sectionEnd) return "section";
    if (mode === "frequent" && (bar + 1) % 2 === 0) return "short";
    if (mode === "regular" && (bar + 1) % 4 === 0) return "regular";
    return null;
  }

  scheduleBar(entry, skipBefore = -Infinity) {
    const { startTime, bpm, feel, bar, barIndex, chord, quiet } = entry;
    const energy = quiet ? 0.68 : this.chorusEnergy(entry.chorus) * (entry.lift ? 1.1 : 1);
    if (entry.stopTime) {
      this.scheduleStopTimeBar(entry, skipBefore, energy);
      return;
    }
    const groove = GROOVES[feel] ?? GROOVES.shuffle;
    const event = (step) => this.eventTime(startTime, step, bpm, feel);
    const play = (sample, step, velocity, bus = "drums") => {
      const time = event(step);
      if (time >= skipBefore) this.playDrum(sample, time, velocity * energy, bus, entry.drumSound);
    };
    const choice = (pool, step) => pool[(barIndex * 3 + step + Math.floor(step / 2)) % pool.length];
    const player = entry.drumPlayer;
    const backbeat = groove.halfTime ? 4 : 2;
    const lastBackbeat = groove.halfTime ? -1 : 6;

    const fillType = this.fillTypeForBar(bar, entry.fillMode);
    const accentAfterFill = entry.afterFill;
    play(choice(KICK_POOL, 0), 0, .92);
    if (!groove.halfTime) play(choice(KICK_POOL, 4), 4, player === "basic" ? .72 : bar % 3 === 1 ? .56 : .76);
    else if (bar % 2 === 1) play(choice(KICK_POOL, 6), 6, .55);
    if (feel === "boogie") {
      play(choice(KICK_POOL, 2), 2, .32);
      if (!fillType) play(choice(KICK_POOL, 6), 6, .36);
    }
    play(choice(SNARE_POOL, backbeat), backbeat, groove.halfTime ? .85 : .71);
    if (!fillType && lastBackbeat >= 0) play(choice(SNARE_POOL, 6), 6, .84);
    if (player !== "basic" && !groove.halfTime && barIndex % 4 === 3 && !fillType) play(choice(KICK_POOL, 7), 7, .4);
    if (player === "expressive" && barIndex % 4 === 1 && !fillType) play(choice(KICK_POOL, 3), 3, .38);
    if (accentAfterFill) play("hat-open-4", 0, 0.34);
    if (entry.lift) {
      // Digging in: a bigger downbeat, a pushed kick, and an open hat lifting into the next bar.
      play("ride-4", 0, .42);
      if (!fillType && !groove.halfTime) play(choice(KICK_POOL, 3), 3, .5);
      if (!fillType && barIndex % 2 === 1) play("hat-open-12", 7, .3);
    }

    for (let step = 0; step < 8; step += 1) {
      const time = event(step);
      if (time < skipBefore || (fillType && step >= 5) || (accentAfterFill && step === 0)) continue;
      if (player === "basic" && step % 2 && groove.halfTime) continue;
      const isBackbeat = step === backbeat || step === lastBackbeat;
      const isRideBeat = (groove.ride === "ride" || entry.lift) && step % 2 === 0 && !isBackbeat;
      const shade = player === "basic" ? 1 : step % 2 ? .78 : step === 0 || step === 4 ? 1.12 : .92;
      if (isRideBeat) this.playDrum("ride-1", time, (step === 0 ? 0.12 : 0.18) * energy * shade, "drums", entry.drumSound);
      else {
        const gain = isBackbeat ? 0.13 : step % 2 === 0 ? 0.27 : 0.17;
        this.playDrum(choice(HAT_POOL, step), time, gain * energy * shade, "drums", entry.drumSound);
      }
    }
    const beatSeconds = 60 / bpm;
    const segments = entry.chordSegments ?? [{ chord, beats: 4, startBeat: 0 }];
    if (entry.chordalEnabled && entry.chordalSound !== "off") this.scheduleKeys(entry, segments, event, beatSeconds, energy, skipBefore);
    if (this.highwayAudible && this.highwayNotes) {
      for (const note of this.highwayNotes(bar, entry.key ?? this.key)) {
        const time = event(Math.round(note.beat * 2));
        if (time >= skipBefore) this.playLead(note.midi, time, note.dur * beatSeconds, note.landing ? .95 : .8);
      }
    }
    const nextBar = this.practiceRange
      ? this.practiceRange[0] + ((bar - this.practiceRange[0] + 1) % (this.practiceRange[1] - this.practiceRange[0] + 1))
      : (bar + 1) % this.barsPerCycle;
    const nextChord = getChordForBar(nextBar, this.keyForBarIndex(barIndex + 1), this.form, this.chordStyle, this.customChart);
    let notes;
    if (segments.length > 1) {
      notes = segments.flatMap((segment, index) => {
        const upcoming = segments[index + 1]?.chord ?? nextChord;
        return shortBassPart(segment.chord, upcoming, entry.bassPattern, entry.bassPlayer, barIndex)
          .map((bassNote) => ({ ...bassNote, step: segment.startBeat * 2 + bassNote.step }));
      }).sort((left, right) => left.step - right.step);
    } else {
      notes = bassPart({ chord, nextChord, barIndex, genre: JAM_PATTERNS[this.form].genre,
        pattern: entry.bassPattern, player: entry.bassPlayer });
    }
    for (let index = 0; index < notes.length; index += 1) {
      const bassNote = notes[index];
      // A small, consistent delay behind the kick keeps the low end settled.
      const time = event(bassNote.step) + (entry.bassPlayer === "basic" ? .008 : .015);
      const nextTime = index + 1 < notes.length ? event(notes[index + 1].step) : startTime + 4 * beatSeconds;
      const length = Math.min(beatSeconds * bassNote.length, Math.max(.09, nextTime - time - .015));
      if (time >= skipBefore) this.playBass(bassNote.midi, time, bassNote.velocity * energy,
        length, entry.bassSound, barIndex + bassNote.step);
    }

    if (fillType) {
      const variations = FILL_PATTERNS[fillType];
      const variation = Math.floor(barIndex / (fillType === "short" ? 2 : 4));
      const fill = variations[variation % variations.length];
      for (const [kind, step, velocity] of fill) {
        const time = event(step);
        if (time < skipBefore) continue;
        const pool = kind === "tom-mid" ? TOM_MID_POOL
          : kind === "tom-floor" ? TOM_FLOOR_POOL
            : kind === "ghost" ? GHOST_POOL : SNARE_POOL;
        const fillLevel = player === "basic" ? .68 : player === "expressive" ? 1.05 : .85;
        this.playDrum(choice(pool, step), time, velocity * energy * fillLevel, "drums", entry.drumSound);
      }
    } else if (player !== "basic" && barIndex % 4 === (player === "expressive" ? 1 : 2)) {
      const step = groove.halfTime ? 3 : 5;
      const time = event(step);
      if (time >= skipBefore) this.playDrum(choice(GHOST_POOL, step), time, (player === "expressive" ? .28 : .18) * energy, "drums", entry.drumSound);
    }
  }

  chorusEnergy(chorus) {
    // A subtle, repeatable lift keeps every chorus from feeling mechanically identical.
    return [0.90, 0.97, 1.0, 0.94][(chorus - 1) % 4];
  }

  scheduleKeys(entry, segments, event, beatSeconds, energy, skipBefore = -Infinity) {
    const pattern = compPattern({ sound: entry.chordalSound, feel: entry.feel, barIndex: entry.barIndex,
      quiet: entry.quiet, lift: entry.lift, stopTime: entry.stopTime });
    segments.forEach((segment, index) => {
      const firstStep = segment.startBeat * 2;
      const endStep = firstStep + segment.beats * 2;
      let hits = pattern.filter((hit) => hit.step >= firstStep && hit.step < endStep);
      // A chord change in the middle of a bar is always sounded.
      if (index > 0 && !hits.some((hit) => hit.step === firstStep)) hits = [{ step: firstStep, len: segment.beats * .8, vel: .75 }, ...hits];
      if (!hits.length) return;
      const voicing = voiceLead(segment.chord, this.keysVoicing, { color: entry.chordalSound === "piano" });
      this.keysVoicing = voicing;
      const segmentEnd = entry.startTime + (segment.startBeat + segment.beats) * beatSeconds;
      for (const hit of hits) {
        const time = event(hit.step);
        if (time < skipBefore) continue;
        const room = index < segments.length - 1 ? segmentEnd - time - .03 : hit.len * beatSeconds;
        const seconds = Math.max(.08, Math.min(hit.len * beatSeconds, room));
        this.playKeys(voicing, time, seconds, hit.vel * energy, entry.chordalSound);
      }
    });
  }

  playKeys(notes, time, seconds, velocity, sound = "piano") {
    if (!this.context || !this.buses?.keys || !notes?.length || time < this.context.currentTime - .02) return;
    if (sound === "organ") playOrgan(this.context, this.buses.keys, notes, time, seconds, velocity, this.nodes, this.buses.vibrato);
    else playElectricPiano(this.context, this.buses.keys, notes, time, seconds, velocity, this.nodes);
  }

  playChordal(chord, time, duration, sound = "piano", velocity = .5) {
    if (!CHORDS[chord]) return;
    const voicing = voiceLead(chord, this.keysVoicing, { color: sound === "piano" });
    this.keysVoicing = voicing;
    this.playKeys(voicing, time, duration, velocity, sound);
  }

  // Plays a one-bar original call phrase starting on the next bar's downbeat and
  // landing on a tone of the chord that bar brings. Returns seconds until it starts.
  playCallPhrase(scalePitchClasses) {
    if (this.state !== "playing" || !this.context || !this.buses?.keys) return null;
    const now = this.context.currentTime;
    const current = [...this.timeline].reverse().find((item) => item.startTime <= now && item.phase !== "ending");
    if (!current) return null;
    let startTime = current.startTime + current.duration;
    let barIndex = current.barIndex + 1;
    if (startTime - now < .12) {
      startTime += current.duration;
      barIndex += 1;
    }
    const loop = this.loopLength();
    const bar = this.practiceRange
      ? this.practiceRange[0] + (barIndex % loop)
      : barIndex % this.barsPerCycle;
    const chord = barChordSegments(bar, this.keyForBarIndex(barIndex), this.form, this.chordStyle, this.customChart)[0]?.chord;
    const lick = buildLick(scalePitchClasses, CHORDS[chord]?.pitchClasses ?? [], this.callVariant);
    this.callVariant += 1;
    const beat = 60 / current.bpm;
    lick.forEach((note, index) => {
      const time = this.eventTime(startTime, note.step, current.bpm, current.feel);
      this.playLead(note.midi, time, note.length * beat, index === 0 || index === lick.length - 1 ? .95 : .78, index === 0);
    });
    return startTime - now;
  }

  playLead(midi, time, seconds, velocity, scoop = false) {
    if (!this.context || !this.buses?.keys) return;
    playLeadNote(this.context, this.buses.keys, midi, time, seconds, velocity, this.nodes, scoop);
  }

  scheduleStopTimeBar(entry, skipBefore, energy) {
    const { startTime, bpm, feel, chord, drumSound } = entry;
    const event = (step) => this.eventTime(startTime, step, bpm, feel);
    const hit = (sample, step, velocity) => {
      const time = event(step);
      if (time >= skipBefore) this.playDrum(sample, time, velocity * energy, "drums", drumSound);
    };
    // The whole band hits beat one together, then leaves the space to the guitarist.
    hit("kick-20", 0, 1);
    hit("ride-4", 0, .55);
    hit("hat-open-12", 0, .32);
    hit("snare-45", 0, .5);
    // A quiet foot-hat on 2, 3 and 4 keeps everyone's time.
    for (const step of [2, 4, 6]) hit("hat-closed-5", step, .1);
    const beatSeconds = 60 / bpm;
    const bassTime = event(0) + .01;
    if (bassTime >= skipBefore) {
      this.playBass(CHORDS[chord].rootMidi, bassTime, .95 * energy, beatSeconds * .7, entry.bassSound, entry.barIndex);
    }
    if (entry.chordalEnabled && entry.chordalSound !== "off") {
      this.scheduleKeys(entry, [{ chord, beats: 4, startBeat: 0 }], event, beatSeconds, energy, skipBefore);
    }
    if (entry.stopTimeLast) {
      // Fill back into the groove.
      const fill = FILL_PATTERNS.section[entry.barIndex % FILL_PATTERNS.section.length];
      for (const [kind, step, velocity] of fill) {
        if (step < 4) continue;
        const pool = kind === "tom-mid" ? TOM_MID_POOL : kind === "tom-floor" ? TOM_FLOOR_POOL : kind === "ghost" ? GHOST_POOL : SNARE_POOL;
        hit(pool[step % pool.length], step, velocity * .95);
      }
    }
  }

  playDrum(name, time, velocity, bus = "drums", sound = this.drumSound) {
    if (sound === "electronic") {
      this.playElectronicDrum(name, time, velocity, bus);
      return;
    }
    const take = drumTake(name, velocity, time, sound);
    const buffer = this.buffers.get(`drum:${take}`);
    if (!buffer || !this.context || time < this.context.currentTime - 0.02) return;
    const source = this.context.createBufferSource();
    const amp = this.context.createGain();
    const envelope = sound === "tight"
      ? { seconds: take.startsWith("kick") ? .35 : take.startsWith("snare") ? .27 : .17, release: .09,
        highpass: take.startsWith("hat") || take.startsWith("ride") ? 500 : 0 }
      : drumEnvelope(take);
    const level = clamp(velocity, 0.025, 1.2);
    let highpass = null;
    let stopTime = null;
    source.buffer = buffer;
    amp.gain.setValueAtTime(level, time);
    if (envelope) {
      const seconds = Math.min(buffer.duration, envelope.seconds);
      const release = Math.min(envelope.release, seconds * 0.4);
      amp.gain.setValueAtTime(level, time + seconds - release);
      amp.gain.linearRampToValueAtTime(0, time + seconds);
      stopTime = time + seconds + 0.01;
    }
    if (envelope?.highpass) {
      highpass = this.context.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = envelope.highpass;
      source.connect(highpass);
      highpass.connect(amp);
    } else {
      source.connect(amp);
    }
    amp.connect(this.buses[bus] ?? this.buses.drums);
    source.onended = () => {
      this.nodes.delete(source);
      try { source.disconnect(); highpass?.disconnect(); amp.disconnect(); } catch { /* Already disconnected. */ }
    };
    this.nodes.add(source);
    source.start(time);
    if (stopTime !== null) source.stop(stopTime);
  }

  playElectronicDrum(name, time, velocity, bus = "drums") {
    if (!this.context || time < this.context.currentTime - .02) return;
    const ctx = this.context;
    const level = clamp(velocity, .025, 1.2);
    const isKick = name.startsWith("kick");
    const isTom = name.startsWith("tom");
    const isSnare = name.includes("snare");
    const length = isKick ? .31 : isTom ? .37 : isSnare ? .23 : name.startsWith("ride") ? .32 : .12;
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(Math.max(.001, level * (isKick ? .72 : .35)), time);
    amp.gain.exponentialRampToValueAtTime(.001, time + length);
    amp.connect(this.buses[bus] ?? this.buses.drums);
    const source = isKick || isTom ? ctx.createOscillator() : ctx.createBufferSource();
    let filter = null;
    if (isKick || isTom) {
      source.type = "sine";
      source.frequency.setValueAtTime(isKick ? 145 : name.startsWith("tom-floor") ? 120 : 185, time);
      source.frequency.exponentialRampToValueAtTime(isKick ? 48 : name.startsWith("tom-floor") ? 74 : 110, time + length * .7);
    } else {
      if (!this.noiseBuffer) {
        const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
        this.noiseBuffer = buffer;
      }
      source.buffer = this.noiseBuffer;
      filter = ctx.createBiquadFilter();
      filter.type = isSnare ? "bandpass" : "highpass";
      filter.frequency.value = isSnare ? 1700 : 6500;
      filter.Q.value = isSnare ? .65 : .5;
    }
    source.connect(filter ?? amp);
    filter?.connect(amp);
    source.onended = () => {
      this.nodes.delete(source);
      try { source.disconnect(); filter?.disconnect(); amp.disconnect(); } catch { /* Source was stopped. */ }
    };
    this.nodes.add(source);
    if (isKick || isTom) source.start(time);
    else source.start(time, (Math.floor(time * 1000) % 6) * .09);
    source.stop(time + length + .01);
  }

  playBass(targetMidi, time, velocity, durationSeconds = 0.8, sound = this.bassSound, variation = 0) {
    if (!this.context || time < this.context.currentTime - 0.02) return;
    if (sound === "synth") {
      this.playSynthBass(targetMidi, time, velocity, durationSeconds);
      return;
    }
    if (sound === "softSynth") {
      this.playSoftSynthBass(targetMidi, time, velocity, durationSeconds);
      return;
    }
    const nearest = clamp(Math.round(targetMidi), 28, 39);
    // Neighboring recorded notes have distinct attacks. Pitching one by a
    // semitone supplies a second take without repeating the identical transient.
    const alternate = variation % 4 === 2;
    const sourceMidi = alternate ? (nearest === 39 ? 38 : nearest + 1) : nearest;
    const buffer = this.buffers.get(sound === "pick" ? `bass:pick:${sourceMidi}` : `bass:${sourceMidi}`);
    if (!buffer) return;
    const source = this.context.createBufferSource();
    const amp = this.context.createGain();
    const toneFilter = sound === "warm" ? this.context.createBiquadFilter() : null;
    const playbackRate = 2 ** ((targetMidi - sourceMidi) / 12);
    const seconds = Math.min(buffer.duration / playbackRate, Math.max(0.1, durationSeconds));
    const release = Math.min(0.09, seconds * 0.22);
    const level = clamp(velocity, 0.025, 1);
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, time);
    if (toneFilter) {
      toneFilter.type = "lowpass";
      toneFilter.frequency.value = 950;
      toneFilter.Q.value = .55;
    }
    amp.gain.setValueAtTime(0, time);
    amp.gain.linearRampToValueAtTime(level, time + 0.008);
    amp.gain.setValueAtTime(level, time + seconds - release);
    amp.gain.linearRampToValueAtTime(0, time + seconds);
    source.connect(toneFilter ?? amp);
    toneFilter?.connect(amp);
    amp.connect(this.buses.bass);
    source.onended = () => {
      this.nodes.delete(source);
      try { source.disconnect(); toneFilter?.disconnect(); amp.disconnect(); } catch { /* Already disconnected. */ }
    };
    this.nodes.add(source);
    source.start(time);
    source.stop(time + seconds + 0.01);
  }

  playSynthBass(targetMidi, time, velocity, durationSeconds) {
    const ctx = this.context;
    const seconds = Math.max(.12, durationSeconds);
    const hz = 440 * 2 ** ((targetMidi - 69) / 12);
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const fundamental = ctx.createOscillator();
    const edge = ctx.createOscillator();
    const edgeGain = ctx.createGain();
    fundamental.type = "triangle";
    edge.type = "sawtooth";
    fundamental.frequency.setValueAtTime(hz * 1.006, time);
    fundamental.frequency.exponentialRampToValueAtTime(hz, time + .045);
    edge.frequency.value = hz;
    edgeGain.gain.value = .12;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950 + 520 * velocity, time);
    filter.frequency.exponentialRampToValueAtTime(280, time + Math.min(seconds, .28));
    amp.gain.setValueAtTime(.001, time);
    amp.gain.linearRampToValueAtTime(.42 * velocity, time + .012);
    amp.gain.setValueAtTime(.29 * velocity, time + Math.max(.02, seconds - .09));
    amp.gain.linearRampToValueAtTime(0, time + seconds);
    fundamental.connect(filter);
    edge.connect(edgeGain);
    edgeGain.connect(filter);
    filter.connect(amp);
    amp.connect(this.buses.bass);
    const cleanup = (node) => {
      this.nodes.delete(node);
      try { node.disconnect(); } catch { /* Source was stopped. */ }
    };
    fundamental.onended = () => cleanup(fundamental);
    edge.onended = () => { cleanup(edge); edgeGain.disconnect(); filter.disconnect(); amp.disconnect(); };
    this.nodes.add(fundamental);
    this.nodes.add(edge);
    fundamental.start(time);
    edge.start(time);
    fundamental.stop(time + seconds + .01);
    edge.stop(time + seconds + .01);
  }

  playSoftSynthBass(targetMidi, time, velocity, durationSeconds) {
    const ctx = this.context;
    const seconds = Math.max(.12, durationSeconds);
    const hz = 440 * 2 ** ((targetMidi - 69) / 12);
    const level = clamp(velocity, .025, 1);
    const fundamental = ctx.createOscillator();
    const secondHarmonic = ctx.createOscillator();
    const thirdHarmonic = ctx.createOscillator();
    const secondGain = ctx.createGain();
    const thirdGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const amp = ctx.createGain();

    fundamental.type = "sine";
    secondHarmonic.type = "sine";
    thirdHarmonic.type = "sine";
    fundamental.frequency.value = hz;
    secondHarmonic.frequency.value = hz * 2;
    thirdHarmonic.frequency.value = hz * 3;
    secondGain.gain.value = .2;
    thirdGain.gain.value = .08;
    filter.type = "lowpass";
    filter.frequency.value = 820;
    filter.Q.value = .5;

    const attack = Math.min(.026, seconds * .25);
    const release = Math.min(.11, seconds * .22);
    const peak = .44 * level;
    const sustain = .31 * level;
    amp.gain.setValueAtTime(.001, time);
    amp.gain.linearRampToValueAtTime(peak, time + attack);
    amp.gain.setValueAtTime(sustain, Math.max(time + attack, time + seconds - release));
    amp.gain.linearRampToValueAtTime(.001, time + seconds);

    fundamental.connect(filter);
    secondHarmonic.connect(secondGain);
    thirdHarmonic.connect(thirdGain);
    secondGain.connect(filter);
    thirdGain.connect(filter);
    filter.connect(amp);
    amp.connect(this.buses.bass);

    const sources = [fundamental, secondHarmonic, thirdHarmonic];
    const nodes = [...sources, secondGain, thirdGain, filter, amp];
    let activeSources = sources.length;
    const cleanup = () => {
      nodes.forEach((node) => {
        this.nodes.delete(node);
        try { node.disconnect(); } catch { /* Already disconnected. */ }
      });
    };
    sources.forEach((source) => {
      source.onended = () => {
        this.nodes.delete(source);
        activeSources -= 1;
        if (activeSources === 0) cleanup();
      };
      this.nodes.add(source);
      source.start(time);
      source.stop(time + seconds + .01);
    });
  }

  scheduleEnding(entry) {
    const tagTime = entry.startTime + entry.duration;
    const finalChord = this.form === "custom" && this.customChart
      ? barChordSegments(entry.bar, entry.key ?? this.key, this.form, this.chordStyle, this.customChart).at(-1)?.chord ??
        getChordForBar(entry.bar, entry.key ?? this.key, this.form, this.chordStyle, this.customChart)
      : tonicChordFor(entry.key ?? this.key, this.form, this.chordStyle);
    this.playBass(CHORDS[finalChord].rootMidi, tagTime, 0.94, 1.6, entry.bassSound);
    this.playDrum(choose(KICK_POOL), tagTime, 0.92, "drums", entry.drumSound);
    this.playDrum("ride-1", tagTime, 0.35, "drums", entry.drumSound);
    this.playDrum(choose(SNARE_POOL), tagTime + 0.015, 0.6, "drums", entry.drumSound);
    if (entry.chordalEnabled && entry.chordalSound !== "off") this.playChordal(finalChord, tagTime, 2.6, entry.chordalSound, .9);
    this.timeline.push({
      startTime: tagTime, duration: 4, bpm: entry.bpm, feel: entry.feel, quiet: entry.quiet,
      barIndex: entry.barIndex, bar: entry.bar, chorus: entry.chorus, chord: finalChord, key: entry.key, phase: "ending",
    });
    this.endingScheduled = true;
    this.stopAt = tagTime + 3.5;
  }

  positionAt(time = this.context?.currentTime ?? 0) {
    if (this.state === "paused" && this.pauseSnapshot) return { ...this.pauseSnapshot.position, phase: "paused" };
    if (this.state === "stopped") return this.lastPosition ?? {
      phase: "stopped", chord: getChordForBar(0, this.key, this.form, this.chordStyle, this.customChart), key: this.key,
      bar: 0, barIndex: 0, chorus: 1, beat: 0, bpm: this.bpm,
      quiet: false,
    };
    if (this.countInStart !== null && this.songStart !== null && time < this.songStart) {
      const beatDuration = 60 / this.bpm;
      const totalBeat = Math.floor(Math.max(0, time - this.countInStart) / beatDuration);
      const beat = clamp(totalBeat % 4, 0, 3);
      return {
        phase: "count-in", chord: null, key: this.key, bar: -1, barIndex: -1, chorus: 0, beat, countBar: Math.floor(totalBeat / 4), countInBars: this.countInBars, bpm: this.bpm,
        quiet: false,
      };
    }
    let entry = null;
    for (let index = this.timeline.length - 1; index >= 0; index -= 1) {
      if (this.timeline[index].startTime <= time) {
        entry = this.timeline[index];
        break;
      }
    }
    if (!entry) {
      return {
        phase: "count-in", chord: null, key: this.key, bar: -1, barIndex: -1, chorus: 0, beat: 0, bpm: this.bpm,
        quiet: false,
      };
    }
    if (entry.phase === "ending") {
      return {
        phase: "ending", chord: entry.chord, key: entry.key, bar: entry.bar, barIndex: entry.barIndex, chorus: entry.chorus,
        beat: 0, bpm: entry.bpm, quiet: entry.quiet,
      };
    }
    const elapsed = clamp(time - entry.startTime, 0, entry.duration - 0.0001);
    const beat = clamp(Math.floor(elapsed / (60 / entry.bpm)), 0, 3);
    const segments = entry.chordSegments ?? [{ chord: entry.chord, beats: 4, startBeat: 0 }];
    let segmentIndex = segments.findIndex((segment) => beat >= segment.startBeat && beat < segment.startBeat + segment.beats);
    if (segmentIndex < 0) segmentIndex = segments.length - 1;
    const activeSegment = segments[segmentIndex];
    const nextSegment = segments[segmentIndex + 1];
    return {
      phase: "playing", chord: activeSegment?.chord ?? entry.chord, key: entry.key, bar: entry.bar, barIndex: entry.barIndex, segmentIndex,
      nextChord: nextSegment?.chord ?? null,
      beatsUntilNext: nextSegment ? Math.max(1, nextSegment.startBeat - beat) : null,
      chorus: entry.chorus, beat, bpm: entry.bpm,
      quiet: entry.quiet, feel: entry.feel, songSection: entry.songSection,
      lift: Boolean(entry.lift), stopTime: Boolean(entry.stopTime),
    };
  }

  // Fractional beat clock for smooth visuals. `beat` is 0–4 within the bar and
  // negative during the count-in. Returns null when there is nothing to scroll.
  beatClock() {
    if (!this.context) return null;
    if (this.state === "paused" && this.pauseSnapshot?.entry && !this.pauseSnapshot.countIn) {
      const entry = this.pauseSnapshot.entry;
      return { barIndex: entry.barIndex, bar: entry.bar, beat: clamp(this.pauseSnapshot.elapsed / (60 / entry.bpm), 0, 4), key: entry.key ?? this.key, feel: entry.feel };
    }
    if (this.state !== "playing") return null;
    const time = this.context.currentTime;
    if (this.countInStart !== null && this.songStart !== null && time < this.songStart) {
      return { barIndex: 0, bar: this.practiceRange ? this.practiceRange[0] : 0, beat: -(this.songStart - time) / (60 / this.bpm), key: this.key, feel: this.feel };
    }
    let entry = null;
    for (let index = this.timeline.length - 1; index >= 0; index -= 1) {
      if (this.timeline[index].startTime <= time) { entry = this.timeline[index]; break; }
    }
    if (!entry || entry.phase === "ending") return null;
    const elapsed = clamp(time - entry.startTime, 0, entry.duration);
    return { barIndex: entry.barIndex, bar: entry.bar, beat: elapsed / (60 / entry.bpm), key: entry.key ?? this.key, feel: entry.feel };
  }

  emitPosition() {
    const position = this.positionAt();
    position.key ??= this.key;
    position.form = this.form;
    position.chordStyle = this.chordStyle;
    this.lastPosition = position;
    this.onPosition(position);
  }

  requestKey(key) {
    if (!JAM_KEYS[key]) return;
    if (this.state === "paused" && this.pauseSnapshot?.countIn) {
      this.key = key;
      this.pendingKey = null;
      this.pauseSnapshot.config.key = key;
      this.pauseSnapshot.position.key = key;
      this.onStatus({ kind: "setting", message: `The count-in will restart in ${key}.` });
      this.emitPosition();
      return;
    }
    if (this.state === "playing" && this.positionAt().phase === "count-in" && this.nextBarIndex === 0) {
      this.key = key;
      this.pendingKey = null;
      this.onStatus({ kind: "setting", message: `The band will start in ${key}.` });
      this.emitPosition();
      return;
    }
    if (this.state === "playing" || this.state === "paused") {
      if (key === this.key) {
        this.pendingKey = null;
        if (this.pauseSnapshot) this.pauseSnapshot.pendingKey = null;
        this.onStatus({ kind: "setting", message: `Key change canceled. The band stays in ${key}.` });
        this.emitPosition();
        return;
      }
      const position = this.positionAt();
      const currentBar = Math.max(0, position.barIndex ?? 0);
      const loopLength = this.loopLength();
      const currentCycleStart = Math.floor(currentBar / loopLength) * loopLength;
      const firstUnscheduled = this.state === "paused" && this.pauseSnapshot?.entry
        ? this.pauseSnapshot.entry.barIndex + 1 : this.nextBarIndex;
      const queuedAt = Math.ceil(firstUnscheduled / loopLength) * loopLength;
      const cyclesAway = (queuedAt - currentCycleStart) / loopLength;
      this.pendingKey = key;
      if (this.pauseSnapshot) this.pauseSnapshot.pendingKey = key;
      const unit = this.practiceRange ? "practice loop" : JAM_PATTERNS[this.form].genre === "blues" ? "chorus" : "round";
      const pluralUnit = unit === "chorus" ? "choruses" : unit === "practice loop" ? "practice loops" : "rounds";
      const when = cyclesAway === 1 ? `with the next ${unit}` : `in ${cyclesAway} ${pluralUnit}`;
      this.onStatus({ kind: "queued", message: `Key ${key} starts ${when}.` });
      this.emitPosition();
      return;
    }
    this.key = key;
    this.pendingKey = null;
    this.onStatus({ kind: "setting", message: `Key set to ${key}.` });
  }

  requestTempo(bpm) {
    const value = clamp(Number(bpm) || this.bpm, 60, 140);
    if (this.state === "playing") {
      this.pendingBpm = value;
      this.pendingBpmAtLoop = false;
      this.onStatus({ kind: "queued", message: `Tempo changes to ${value} BPM at the next bar.` });
    } else if (this.state === "paused" && this.pauseSnapshot) {
      if (this.pauseSnapshot.countIn) {
        this.bpm = value;
        this.pauseSnapshot.config.bpm = value;
      } else {
        this.pendingBpm = value;
        this.pendingBpmAtLoop = false;
        this.pauseSnapshot.nextBpm = value;
        this.pauseSnapshot.nextBpmAtLoop = false;
      }
      this.onStatus({ kind: "queued", message: `Tempo changes to ${value} BPM when you resume${this.pauseSnapshot.countIn ? "" : " at the next bar"}.` });
    } else {
      this.bpm = value;
      this.onStatus({ kind: "setting", message: `Tempo set to ${value} BPM.` });
    }
    return value;
  }

  requestPracticeTempo(bpm) {
    if (!this.practiceRange) return this.requestTempo(bpm);
    const value = clamp(Number(bpm) || this.bpm, 60, 140);
    if (this.state === "playing") {
      this.pendingBpm = value;
      this.pendingBpmAtLoop = true;
      this.onStatus({ kind: "queued", message: `Tempo increases to ${value} BPM after this practice repeat.` });
    } else if (this.state === "paused" && this.pauseSnapshot) {
      if (this.pauseSnapshot.countIn) {
        this.bpm = value;
        this.pauseSnapshot.config.bpm = value;
        this.onStatus({ kind: "setting", message: `Tempo set to ${value} BPM for the practice loop.` });
        return value;
      }
      this.pendingBpm = value;
      this.pendingBpmAtLoop = true;
      this.pauseSnapshot.nextBpm = value;
      this.pauseSnapshot.nextBpmAtLoop = true;
      this.onStatus({ kind: "queued", message: `Tempo increases to ${value} BPM at the next practice loop after you resume.` });
    } else {
      this.bpm = value;
      this.onStatus({ kind: "setting", message: `Tempo set to ${value} BPM.` });
    }
    return value;
  }

  requestFeel(feel) {
    if (!GROOVES[feel]) return;
    if (this.state === "playing") {
      this.pendingFeel = feel;
      this.onStatus({ kind: "queued", message: `${GROOVES[feel].name} starts at the next bar.` });
    } else if (this.state === "paused" && this.pauseSnapshot) {
      if (this.pauseSnapshot.countIn) {
        this.feel = feel;
        this.pauseSnapshot.config.feel = feel;
      } else {
        this.pendingFeel = feel;
        this.pauseSnapshot.nextFeel = feel;
      }
      this.onStatus({ kind: "queued", message: `${GROOVES[feel].name} starts when you resume${this.pauseSnapshot.countIn ? "" : " at the next bar"}.` });
    } else {
      this.feel = feel;
      this.onStatus({ kind: "setting", message: `Feel set to ${GROOVES[feel].name}.` });
    }
  }

  requestFillMode(fillMode) {
    if (!FILL_MODES[fillMode]) return;
    if (this.state === "paused" && this.pauseSnapshot) {
      const pausedInCountIn = this.pauseSnapshot.countIn;
      if (this.pauseSnapshot.countIn) {
        this.pauseSnapshot.config.fillMode = fillMode;
        this.fillMode = fillMode;
      } else {
        this.pauseSnapshot.nextFillMode = fillMode;
      }
      this.onStatus({ kind: "queued", message: `Drum fills change to ${FILL_MODES[fillMode].name} ${pausedInCountIn ? "when you resume" : "at the next bar after you resume"}.` });
      return;
    }
    if (this.state === "playing" || this.state === "paused") {
      this.pendingFillMode = fillMode;
      this.onStatus({ kind: "queued", message: `Drum fills change to ${FILL_MODES[fillMode].name} at the next bar.` });
    } else {
      this.fillMode = fillMode;
      this.onStatus({ kind: "setting", message: `Drum fills: ${FILL_MODES[fillMode].name}.` });
    }
  }

  requestBandSetting(key, value) {
    const choices = { bassPattern: BASS_PATTERNS, bassPlayer: BASS_PLAYERS, bassSound: BASS_SOUNDS,
      drumPlayer: DRUM_PLAYERS, drumSound: DRUM_SOUNDS,
      chordalSound: { piano: { name: "Piano" }, organ: { name: "Organ" }, off: { name: "Off" } },
      chordalEnabled: { true: { name: "On" }, false: { name: "Off" } } };
    if (!choices[key]?.[value]) return;
    const label = { bassPattern: "Bass pattern", bassPlayer: "Bassist", bassSound: "Bass sound",
      drumPlayer: "Drummer", drumSound: "Drum sound", chordalSound: "Chordal sound", chordalEnabled: "Chordal bandmate" }[key];
    if (this.state === "playing") {
      this.pendingBand[key] = value;
      this.onStatus({ kind: "queued", message: `${label} changes at the next bar.` });
    } else if (this.state === "paused" && this.pauseSnapshot) {
      if (this.pauseSnapshot.countIn) {
        this[key] = value;
        this.pauseSnapshot.config[key] = value;
        this.onStatus({ kind: "setting", message: `${label} is ready for the count-in.` });
      } else {
        this.pendingBand[key] = value;
        this.pauseSnapshot.pendingBand[key] = value;
        this.onStatus({ kind: "queued", message: `${label} changes at the next bar after you resume.` });
      }
    } else {
      this[key] = value;
      this.onStatus({ kind: "setting", message: `${label} set to ${choices[key][value].name}.` });
    }
  }

  toggleQuiet() {
    if (this.state !== "playing") return null;
    this.pendingQuiet = !(this.pendingQuiet ?? this.quiet);
    const state = this.pendingQuiet;
    const unit = this.practiceRange ? "practice loop" : JAM_PATTERNS[this.form].genre === "blues" ? "chorus" : "round";
    this.onStatus({
      kind: "queued",
      message: state ? `The band eases down at the next ${unit}.` : `The band returns to full dynamics at the next ${unit}.`,
    });
    return state;
  }

  toggleLift() {
    if (this.state !== "playing") return null;
    const next = !(this.pendingLift ?? this.lift);
    this.pendingLift = next === this.lift ? null : next;
    if (next && this.quiet) this.pendingQuiet = null;
    this.onStatus({ kind: "queued", message: next ? "The band digs in at the next bar." : "The band settles back at the next bar." });
    return next;
  }

  toggleStopTime() {
    if (this.state !== "playing") return false;
    if (this.stopTimeRemaining > 0) return true;
    if (this.pendingStopTime) {
      this.pendingStopTime = false;
      this.onStatus({ kind: "setting", message: "Stop-time canceled." });
      return false;
    }
    this.pendingStopTime = true;
    const queuedAt = Math.ceil(this.nextBarIndex / 4) * 4;
    const barsAway = Math.max(1, queuedAt - Math.max(0, this.positionAt().barIndex ?? 0));
    this.onStatus({ kind: "queued", message: `Stop-time in ${barsAway} ${barsAway === 1 ? "bar" : "bars"}: the band will hit beat one and leave you the space.` });
    return true;
  }

  toggleEndAfterChorus() {
    if (this.state !== "playing") return false;
    if (this.endAtBar !== null && !this.endingScheduled) {
      this.endAtBar = null;
      this.onStatus({ kind: "setting", message: "The ending was canceled." });
      return false;
    }
    if (this.endingScheduled) return true;
    const position = this.positionAt();
    const currentBarIndex = position.phase === "count-in" ? 0 : Math.max(0, position.barIndex);
    const loopLength = this.loopLength();
    this.endAtBar = Math.floor(currentBarIndex / loopLength) * loopLength + loopLength - 1;
    this.onStatus({ kind: "queued", message: this.practiceRange
      ? "The band will play the ending after this practice loop."
      : `The band will play the ending after bar ${this.barsPerCycle}.` });
    if (this.endAtBar < this.nextBarIndex) {
      const entry = this.timeline.find((item) => item.barIndex === this.endAtBar && item.phase !== "ending");
      if (entry) this.scheduleEnding(entry);
    }
    return true;
  }

  pause() {
    if (this.state !== "playing" || !this.context) return;
    const position = this.positionAt();
    if (position.phase === "count-in") {
      this.pauseSnapshot = { countIn: true, position, config: { bpm: this.bpm, feel: this.feel, fillMode: this.fillMode,
        key: this.pendingKey ?? this.key, form: this.form, chordStyle: this.chordStyle,
        bassPattern: this.bassPattern, bassPlayer: this.bassPlayer, bassSound: this.bassSound,
        drumPlayer: this.drumPlayer, drumSound: this.drumSound, chordalSound: this.chordalSound,
        chordalEnabled: this.chordalEnabled, customChart: this.customChart, practiceRange: this.practiceRange,
        countInBars: this.countInBars } };
    } else {
      const entry = [...this.timeline].reverse().find((item) => item.startTime <= this.context.currentTime && item.phase !== "ending");
      const elapsed = entry ? clamp(this.context.currentTime - entry.startTime, 0, entry.duration - 0.001) : 0;
      this.pauseSnapshot = {
        countIn: false,
        position,
        entry,
        elapsed,
        nextBpm: this.pendingBpm,
        nextBpmAtLoop: this.pendingBpmAtLoop,
        nextFeel: this.pendingFeel,
        nextFillMode: this.pendingFillMode,
        pendingKey: this.pendingKey,
        pendingBand: { ...this.pendingBand },
        fillMode: this.fillMode,
        pendingQuiet: this.pendingQuiet,
        lift: this.lift,
        pendingLift: this.pendingLift,
        pendingStopTime: this.pendingStopTime,
        stopTimeRemaining: this.stopTimeRemaining,
        endAtBar: this.endAtBar,
        endingScheduled: this.endingScheduled,
        quiet: this.quiet,
      };
    }
    this.clearTimer();
    this.stopAllNodes();
    this.state = "paused";
    this.onStatus({ kind: "paused" });
    this.emitPosition();
  }

  async resume() {
    if (this.state !== "paused" || !this.pauseSnapshot) return;
    if (this.context.state === "suspended") await this.context.resume();
    const snapshot = this.pauseSnapshot;
    this.pauseSnapshot = null;
    if (snapshot.countIn) {
      this.state = "stopped";
      await this.start(snapshot.config);
      return;
    }
    const now = this.context.currentTime;
    const entry = snapshot.entry;
    if (!entry) {
      await this.start({ bpm: this.bpm, feel: this.feel, fillMode: snapshot.nextFillMode ?? snapshot.fillMode, key: snapshot.pendingKey ?? this.key, form: this.form, chordStyle: this.chordStyle,
        bassPattern: snapshot.pendingBand.bassPattern ?? this.bassPattern,
        bassPlayer: snapshot.pendingBand.bassPlayer ?? this.bassPlayer,
        bassSound: snapshot.pendingBand.bassSound ?? this.bassSound,
        drumPlayer: snapshot.pendingBand.drumPlayer ?? this.drumPlayer,
        drumSound: snapshot.pendingBand.drumSound ?? this.drumSound,
        chordalSound: snapshot.pendingBand.chordalSound ?? this.chordalSound,
        chordalEnabled: snapshot.pendingBand.chordalEnabled ?? this.chordalEnabled,
        customChart: this.customChart, practiceRange: this.practiceRange, countInBars: this.countInBars });
      return;
    }
    this.state = "playing";
    this.timeline = [];
    this.bpm = entry.bpm;
    this.feel = entry.feel;
    this.fillMode = snapshot.fillMode;
    this.bassPattern = entry.bassPattern;
    this.bassPlayer = entry.bassPlayer;
    this.bassSound = entry.bassSound;
    this.drumPlayer = entry.drumPlayer;
    this.drumSound = entry.drumSound;
    this.pendingBand = { ...snapshot.pendingBand };
    this.quiet = snapshot.quiet;
    this.pendingBpm = snapshot.nextBpm;
    this.pendingBpmAtLoop = snapshot.nextBpmAtLoop ?? false;
    this.pendingFeel = snapshot.nextFeel;
    this.pendingFillMode = snapshot.nextFillMode;
    this.pendingKey = snapshot.pendingKey;
    this.pendingQuiet = snapshot.pendingQuiet;
    this.lift = snapshot.lift ?? false;
    this.pendingLift = snapshot.pendingLift ?? null;
    this.pendingStopTime = snapshot.pendingStopTime ?? false;
    this.stopTimeRemaining = snapshot.stopTimeRemaining ?? 0;
    this.keysVoicing = null;
    this.endAtBar = snapshot.endAtBar;
    this.endingScheduled = false;
    this.stopAt = null;
    const resumedStart = now + 0.1 - snapshot.elapsed;
    const resumedEntry = { ...entry, startTime: resumedStart };
    this.timeline.push(resumedEntry);
    this.nextBarIndex = entry.barIndex + 1;
    this.nextBarTime = resumedStart + entry.duration;
    const skipBefore = now + 0.09;
    this.scheduleBar(resumedEntry, skipBefore);
    if (this.endAtBar === entry.barIndex) this.scheduleEnding(resumedEntry);
    this.startTimer();
    this.onStatus({ kind: "playing" });
    this.emitPosition();
  }

  stop({ ended = false } = {}) {
    this.clearTimer();
    this.stopAllNodes();
    this.state = "stopped";
    this.pauseSnapshot = null;
    this.countInStart = null;
    this.songStart = null;
    this.endAtBar = null;
    this.endingScheduled = false;
    this.stopAt = null;
    this.pendingKey = null;
    const position = ended
      ? { ...(this.lastPosition ?? {}), phase: "stopped", completed: true }
      : { phase: "stopped", chord: getChordForBar(0, this.key, this.form, this.chordStyle, this.customChart), bar: 0, barIndex: 0, chorus: 1, beat: 0, bpm: this.bpm, quiet: false };
    position.key ??= this.key;
    position.form = this.form;
    position.chordStyle = this.chordStyle;
    this.lastPosition = position;
    this.onPosition(position);
    this.onStatus({ kind: ended ? "ended" : "stopped" });
    if (ended) this.onEnded();
  }

  clearTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  stopAllNodes() {
    if (!this.context) return;
    const now = this.context.currentTime;
    for (const node of this.nodes) safeStop(node, now);
    this.nodes.clear();
  }
}
