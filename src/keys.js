import { CHORDS } from "./music.js";

// Keys bandmate: chooses voice-led voicings, a comping rhythm for the feel,
// and synthesizes an electric piano or a drawbar-style organ.

const LOW = 53;   // F3: lowest voicing note, keeps clear of the bass
const HIGH = 74;  // D5: highest voicing note, stays under the guitar's range
const CENTER = 62;

function chordIntervals(chord) {
  const definition = CHORDS[chord];
  if (!definition) return null;
  const root = definition.pitchClasses[0];
  return { root, intervals: definition.pitchClasses.map((pc) => (pc - root + 12) % 12) };
}

// Pitch classes to voice. Seventh chords drop the root (the bass has it),
// which is how a keyboard player would comp: 3rd, 5th, 7th, plus a 9th for color.
function voicingPitchClasses(chord, color) {
  const parsed = chordIntervals(chord);
  if (!parsed) return [];
  const { root, intervals } = parsed;
  const pcs = intervals.length > 3
    ? [intervals[1], intervals[2], intervals[3], ...(color ? [2] : [])]
    : intervals;
  return [...new Set(pcs.map((interval) => (root + interval) % 12))];
}

function allVoicings(pitchClasses) {
  const results = [];
  const sorted = [...pitchClasses];
  // Every rotation, stacked upward in close position, placed at every octave in range.
  for (let rotation = 0; rotation < sorted.length; rotation += 1) {
    const order = sorted.slice(rotation).concat(sorted.slice(0, rotation));
    for (let base = LOW - 12; base <= HIGH; base += 1) {
      if (((base % 12) + 12) % 12 !== order[0]) continue;
      const notes = [base];
      for (const pc of order.slice(1)) {
        let next = notes.at(-1) + 1;
        while (((next % 12) + 12) % 12 !== pc) next += 1;
        notes.push(next);
      }
      if (notes[0] >= LOW && notes.at(-1) <= HIGH) results.push(notes);
    }
  }
  return results;
}

export function voiceLead(chord, previous, { color = false } = {}) {
  const candidates = allVoicings(voicingPitchClasses(chord, color));
  if (!candidates.length) return previous ?? [];
  const reference = previous?.length ? previous : null;
  let best = candidates[0];
  let bestScore = Infinity;
  for (const notes of candidates) {
    const mid = (notes[0] + notes.at(-1)) / 2;
    let score = Math.abs(mid - CENTER) * 0.35;
    if (reference) {
      // Sum of distances from each new note to its nearest previous note.
      score += notes.reduce((sum, note) => sum + Math.min(...reference.map((old) => Math.abs(old - note))), 0);
    }
    if (score < bestScore) {
      bestScore = score;
      best = notes;
    }
  }
  return best;
}

// Comping rhythms on the 8-step (eighth-note) grid. `len` is in beats.
const PIANO_COMPS = {
  swing: [
    [{ step: 2, len: .45, vel: .8 }, { step: 6, len: .45, vel: .85 }],
    [{ step: 0, len: .9, vel: .75 }, { step: 3, len: .4, vel: .7 }, { step: 6, len: .45, vel: .8 }],
    [{ step: 1, len: .4, vel: .65 }, { step: 2, len: .5, vel: .8 }, { step: 5, len: .4, vel: .7 }, { step: 6, len: .5, vel: .8 }],
    [{ step: 0, len: 1.4, vel: .8 }, { step: 5, len: .9, vel: .7 }],
  ],
  straight: [
    [{ step: 0, len: 1.4, vel: .8 }, { step: 3, len: .45, vel: .7 }, { step: 5, len: 1.2, vel: .75 }],
    [{ step: 0, len: .8, vel: .8 }, { step: 2, len: .4, vel: .6 }, { step: 3, len: .9, vel: .7 }, { step: 6, len: .8, vel: .7 }],
    [{ step: 1, len: .45, vel: .7 }, { step: 3, len: .45, vel: .75 }, { step: 5, len: .45, vel: .7 }, { step: 7, len: .4, vel: .65 }],
    [{ step: 0, len: 2.6, vel: .8 }, { step: 7, len: .4, vel: .65 }],
  ],
  halfTime: [
    [{ step: 0, len: 2.8, vel: .8 }, { step: 6, len: .9, vel: .6 }],
    [{ step: 0, len: 1.2, vel: .8 }, { step: 3, len: 2.2, vel: .7 }],
  ],
};

const ORGAN_COMPS = {
  swing: [
    [{ step: 0, len: 3.7, vel: .75 }],
    [{ step: 0, len: 1.6, vel: .75 }, { step: 3, len: 2.2, vel: .7 }],
    [{ step: 2, len: .5, vel: .75 }, { step: 6, len: .5, vel: .8 }],
    [{ step: 0, len: 3.7, vel: .75 }],
  ],
  straight: [
    [{ step: 0, len: 3.7, vel: .75 }],
    [{ step: 0, len: 1.7, vel: .75 }, { step: 5, len: 1.3, vel: .7 }],
    [{ step: 0, len: 3.7, vel: .75 }],
    [{ step: 0, len: 2.7, vel: .75 }, { step: 7, len: .45, vel: .65 }],
  ],
  halfTime: [
    [{ step: 0, len: 3.8, vel: .75 }],
  ],
};

export function compPattern({ sound, feel, barIndex, quiet, lift, stopTime }) {
  if (stopTime) return [{ step: 0, len: .5, vel: 1 }];
  const family = feel === "halfTime" ? "halfTime" : feel === "straight" ? "straight" : "swing";
  const bank = (sound === "organ" ? ORGAN_COMPS : PIANO_COMPS)[family];
  // Phrase-aware choice: a steady figure for three bars, a variation on the
  // fourth, and a different figure in alternate four-bar phrases.
  const phrase = Math.floor(barIndex / 4);
  const base = phrase % 2 === 0 ? 0 : Math.min(2, bank.length - 1);
  const index = barIndex % 4 === 3 ? (base + 1) % bank.length : base;
  let pattern = bank[index];
  if (lift) {
    // Dig in: use the busiest figure in the bank, a touch harder.
    pattern = bank.reduce((busiest, candidate) => candidate.length > busiest.length ? candidate : busiest, pattern)
      .map((hit) => ({ ...hit, vel: Math.min(1, hit.vel * 1.12) }));
  }
  if (quiet) pattern = pattern.slice(0, 1).map((hit) => ({ ...hit, vel: hit.vel * .8 }));
  return pattern;
}

function hz(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

// Tine-style electric piano: two-operator FM with a fast-decaying modulation
// index gives the bell attack, then a mellow sine body.
export function playElectricPiano(ctx, destination, notes, time, seconds, velocity, track) {
  const perNote = velocity * .27 / Math.sqrt(Math.max(1, notes.length));
  notes.forEach((midi, index) => {
    const f = hz(midi);
    const start = time + index * .006; // a slightly rolled chord, like a hand
    const carrier = ctx.createOscillator();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    const amp = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    carrier.type = "sine";
    modulator.type = "sine";
    bell.type = "sine";
    carrier.frequency.value = f;
    modulator.frequency.value = f;
    bell.frequency.value = f * 4.02;
    const brightness = 1.4 + velocity * 1.6;
    modGain.gain.setValueAtTime(f * brightness, start);
    modGain.gain.exponentialRampToValueAtTime(f * .18, start + .35);
    bellGain.gain.setValueAtTime(perNote * .22, start);
    bellGain.gain.exponentialRampToValueAtTime(.0001, start + .12);
    const hold = Math.max(.12, seconds);
    const release = .16;
    amp.gain.setValueAtTime(.0001, start);
    amp.gain.linearRampToValueAtTime(perNote, start + .004);
    amp.gain.exponentialRampToValueAtTime(perNote * .45, start + .25);
    amp.gain.exponentialRampToValueAtTime(perNote * .28, start + Math.max(.26, hold));
    amp.gain.exponentialRampToValueAtTime(.0001, start + hold + release);
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(amp);
    bell.connect(bellGain);
    bellGain.connect(amp);
    if (pan) {
      pan.pan.value = (index / Math.max(1, notes.length - 1) - .5) * .5;
      amp.connect(pan);
      pan.connect(destination);
    } else {
      amp.connect(destination);
    }
    const nodes = [carrier, modulator, bell, modGain, bellGain, amp, pan].filter(Boolean);
    const sources = [carrier, modulator, bell];
    let active = sources.length;
    for (const source of sources) {
      source.onended = () => {
        track.delete(source);
        active -= 1;
        if (!active) nodes.forEach((node) => { try { node.disconnect(); } catch { /* done */ } });
      };
      track.add(source);
      source.start(start);
      source.stop(start + hold + release + .02);
    }
  });
}

// Drawbar-style organ: sine partials at 8', 4', 2 2/3', 2' with a shared
// vibrato LFO and a soft attack. No square waves.
const DRAWBARS = [[1, 1], [2, .55], [3, .32], [4, .22]];
export function playOrgan(ctx, destination, notes, time, seconds, velocity, track, vibrato) {
  const perNote = velocity * .1 / Math.sqrt(Math.max(1, notes.length));
  const hold = Math.max(.1, seconds);
  notes.forEach((midi) => {
    const f = hz(midi);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(.0001, time);
    amp.gain.linearRampToValueAtTime(perNote, time + .025);
    amp.gain.setValueAtTime(perNote, time + hold);
    amp.gain.linearRampToValueAtTime(.0001, time + hold + .08);
    amp.connect(destination);
    const sources = DRAWBARS.map(([ratio, level]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f * ratio;
      gain.gain.value = level;
      if (vibrato) vibrato.connect(osc.detune);
      osc.connect(gain);
      gain.connect(amp);
      return [osc, gain];
    });
    let active = sources.length;
    for (const [osc, gain] of sources) {
      osc.onended = () => {
        track.delete(osc);
        try { if (vibrato) vibrato.disconnect(osc.detune); } catch { /* done */ }
        try { osc.disconnect(); gain.disconnect(); } catch { /* done */ }
        active -= 1;
        if (!active) { try { amp.disconnect(); } catch { /* done */ } }
      };
      track.add(osc);
      osc.start(time);
      osc.stop(time + hold + .1);
    }
  });
}

// A soft synthetic room so the keys sit behind the band instead of in front.
export function createRoom(ctx, seconds = 1.6) {
  const length = Math.round(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) ** 3.2 * (i < ctx.sampleRate * .012 ? i / (ctx.sampleRate * .012) : 1);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

// Short original call phrases for "Hear a phrase". Steps are eighth notes
// (swung by the engine); degrees index into the guide scale, octave-wrapped.
// The final note is replaced by the nearest tone of the chord it lands on.
const LICKS = [
  [[0, 4, .9], [1, 3, .45], [2, 2, .45], [3, 1, .45], [4, 0, 1.6]],
  [[1, 2, .45], [2, 3, .45], [3, 4, .9], [5, 3, .45], [6, 2, 1.2]],
  [[0, 5, 1.4], [3, 4, .45], [4, 3, .45], [5, 2, .45], [6, 0, 1.2]],
  [[0, 0, .45], [1, 2, .45], [2, 3, .9], [4, 3, .45], [5, 4, .45], [6, 3, 1.2]],
  [[2, 4, .45], [3, 3, .45], [4, 4, .9], [6, 2, .45], [7, 0, 1]],
];

export function buildLick(scalePitchClasses, chordPitchClasses, variant = 0) {
  const scale = [...new Set(scalePitchClasses)].sort((a, b) => a - b);
  const ladder = [];
  for (let midi = 60; midi <= 84; midi += 1) if (scale.includes(midi % 12)) ladder.push(midi);
  const start = ladder.findIndex((midi) => midi >= 64);
  const lick = LICKS[((variant % LICKS.length) + LICKS.length) % LICKS.length];
  const notes = lick.map(([step, degree, length]) => ({ step, midi: ladder[Math.min(ladder.length - 1, start + degree)], length }));
  const last = notes.at(-1);
  if (chordPitchClasses?.length) {
    let best = last.midi;
    for (let delta = 0; delta <= 6; delta += 1) {
      if (chordPitchClasses.includes((last.midi - delta) % 12)) { best = last.midi - delta; break; }
      if (chordPitchClasses.includes((last.midi + delta) % 12)) { best = last.midi + delta; break; }
    }
    last.midi = best;
  }
  return notes;
}

// A mellow lead voice with a small scoop into the first note and gentle vibrato.
export function playLeadNote(ctx, destination, midi, time, seconds, velocity, track, scoop = false) {
  const f = hz(midi);
  const osc = ctx.createOscillator();
  const second = ctx.createOscillator();
  const secondGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const amp = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  osc.type = "triangle";
  second.type = "sine";
  osc.frequency.setValueAtTime(scoop ? f * .94 : f, time);
  if (scoop) osc.frequency.exponentialRampToValueAtTime(f, time + .09);
  second.frequency.value = f * 2;
  secondGain.gain.value = .25;
  lfo.frequency.value = 5.4;
  lfoGain.gain.setValueAtTime(0, time);
  lfoGain.gain.linearRampToValueAtTime(seconds > .4 ? 14 : 0, time + Math.min(seconds, .35));
  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  const level = .16 * velocity;
  amp.gain.setValueAtTime(.0001, time);
  amp.gain.linearRampToValueAtTime(level, time + .012);
  amp.gain.exponentialRampToValueAtTime(level * .6, time + Math.max(.05, seconds * .6));
  amp.gain.exponentialRampToValueAtTime(.0001, time + seconds + .08);
  osc.connect(filter);
  second.connect(secondGain);
  secondGain.connect(filter);
  filter.connect(amp);
  amp.connect(destination);
  const sources = [osc, second, lfo];
  const nodes = [...sources, secondGain, filter, amp, lfoGain];
  let active = sources.length;
  for (const source of sources) {
    source.onended = () => {
      track.delete(source);
      active -= 1;
      if (!active) nodes.forEach((node) => { try { node.disconnect(); } catch { /* done */ } });
    };
    track.add(source);
    source.start(time);
    source.stop(time + seconds + .1);
  }
}
