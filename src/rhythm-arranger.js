import { CHORDS } from "./music.js";

export const BASS_PATTERNS = {
  roots: { name: "Roots & fifths" },
  chordTones: { name: "Root · third · fifth" },
  walking: { name: "Walking bass" },
  boogie: { name: "Boogie pulse" },
  octaves: { name: "Pop octaves" },
};

export const BASS_PLAYERS = {
  basic: { name: "Basic" },
  pocket: { name: "Pocket" },
  melodic: { name: "Melodic" },
};

export const DRUM_PLAYERS = {
  basic: { name: "Basic" },
  pocket: { name: "Pocket" },
  expressive: { name: "Expressive" },
};

export const BASS_SOUNDS = {
  finger: { name: "Fingered electric" },
  warm: { name: "Rounded electric" },
  pick: { name: "Picked electric" },
  synth: { name: "Synth bass" },
  softSynth: { name: "Soft synth" },
};

export const DRUM_SOUNDS = {
  acoustic: { name: "Acoustic kit" },
  tight: { name: "Tight kit" },
  electronic: { name: "Electronic kit" },
};

const note = (step, midi, velocity, length) => ({ step, midi, velocity, length });

// Each pattern has a recognizable skeleton. Players change its space and
// articulation; they do not choose random notes unrelated to the harmony.
export function bassPart({ chord, nextChord, barIndex, genre = "blues", pattern = "chordTones", player = "pocket" }) {
  const current = CHORDS[chord];
  const root = current.rootMidi;
  const thirdInterval = (current.pitchClasses[1] - current.pitchClasses[0] + 12) % 12;
  const third = root + thirdInterval;
  const fifth = root + 7;
  const minor = thirdInterval === 3;
  // A minor chord gets its flat seventh as the boogie/walking color. A natural
  // sixth would clash with several of the written pop and 1960s changes.
  const color = root + (minor ? 10 : 9);
  const seventh = current.pitchClasses.length > 3
    ? root + ((current.pitchClasses[3] - current.pitchClasses[0] + 12) % 12)
    : color;
  const nextRoot = CHORDS[nextChord].rootMidi;
  const change = nextChord !== chord;
  const approach = nextRoot === 28 ? 29 : nextRoot - 1;
  const turn = barIndex % 4;
  // In pop forms the harmony can move every bar. Mark the end of a four-bar
  // thought instead of adding a chromatic lead-in to every change.
  const pickupChange = change && (genre === "blues" || turn === 3);
  let notes;

  switch (pattern) {
    case "roots":
      notes = player === "basic"
        ? [note(0, root, .88, 1.8), note(4, fifth, .72, 1.65)]
        : [note(0, root, .88, 1.55), note(3, fifth, .6, .5), note(4, root, .77, 1.35),
          ...(turn % 2 ? [note(6, fifth, .64, .75)] : [])];
      break;
    case "walking":
      notes = [note(0, root, .88, .83), note(2, third, .68, .8),
        note(4, fifth, .75, .8), note(6, change ? approach : seventh, .64, .8)];
      if (player === "pocket" && change && turn === 3) {
        notes[3] = note(6, seventh, .58, .48);
        notes.push(note(7, approach, .45, .27));
      }
      if (player === "melodic" && turn === 3) notes[2] = note(4, color, .73, .8);
      break;
    case "boogie":
      notes = [note(0, root, .9, .82), note(2, fifth, .69, .8),
        note(4, color, .75, .78), note(6, fifth, .66, .8)];
      if (player !== "basic" && turn === 3) notes.push(note(7, pickupChange ? approach : root, .45, .26));
      break;
    case "octaves":
      notes = player === "basic"
        ? [note(0, root, .88, 1.7), note(4, root + 12, .65, 1.5)]
        : [note(0, root, .88, 1.2), note(3, root + 12, .58, .48),
          note(4, root, .77, 1.3), note(7, root + 12, .55, .32)];
      break;
    case "chordTones":
    default:
      notes = [note(0, root, .9, 1.45),
        ...(player === "basic" || turn % 2 === 0 ? [note(2, third, .63, .82)] : []),
        note(4, fifth, .75, 1.12),
        ...(turn % 2 === 0 ? [note(6, root, .67, .74)] : [note(6, third, .61, .74)])];
      break;
  }

  const addsPickup = pickupChange && pattern !== "walking" &&
    (player === "melodic" || (player === "pocket" && turn % 2 === 1)) &&
    !notes.some((event) => event.step === 7);
  if (addsPickup && pattern === "chordTones") {
    const beatFour = notes.find((event) => event.step === 6);
    // On a V–I turnaround, the third of V can equal the chromatic approach
    // into I. Return to the root on beat four so the pickup moves upward.
    if (beatFour?.midi === approach) beatFour.midi = root;
  }

  if (player === "melodic") {
    // One small answer at a chord change or phrase boundary keeps the line
    // conversational without turning every bar into a run.
    if (addsPickup) notes.push(note(7, approach, .46, .28));
    else if (!change && turn === 3 && pattern !== "walking" && !notes.some((event) => event.step === 7)) {
      notes.push(note(7, seventh, .43, .26));
    }
  } else if (player === "pocket" && addsPickup) {
    notes.push(note(7, approach, .42, .28));
  }

  notes.sort((left, right) => left.step - right.step);
  if (player === "basic") return notes;
  return notes.map((event) => ({
    ...event,
    // Repeated two-bar dynamics make a phrase while retaining its downbeat.
    velocity: event.velocity * (barIndex % 2 ? .94 : 1),
    length: player === "pocket" && event.step === 0 ? event.length * .9 : event.length,
  }));
}
