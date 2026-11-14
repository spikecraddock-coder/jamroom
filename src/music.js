export const JAM_KEYS = {
  C: { chords: ["C", "F", "G"], pitchClass: 0, fretStart: 8 },
  Db: { chords: ["Db", "Gb", "Ab"], pitchClass: 1, fretStart: 9 },
  D: { chords: ["D", "G", "A"], pitchClass: 2, fretStart: 10 },
  Eb: { chords: ["Eb", "Ab", "Bb"], pitchClass: 3, fretStart: 11 },
  E: { chords: ["E7", "A7", "B7"], pitchClass: 4, fretStart: 12 },
  F: { chords: ["F", "Bb", "C"], pitchClass: 5, fretStart: 1 },
  "F#": { chords: ["F#", "B", "C#"], pitchClass: 6, fretStart: 2 },
  "Gb": { chords: ["Gb", "Cb", "Db"], pitchClass: 6, fretStart: 2 },
  "G": { chords: ["G", "C", "D"], pitchClass: 7, fretStart: 3 },
  Ab: { chords: ["Ab", "Db", "Eb"], pitchClass: 8, fretStart: 4 },
  A: { chords: ["A7", "D7", "E7"], pitchClass: 9, fretStart: 5 },
  Bb: { chords: ["Bb", "Eb", "F"], pitchClass: 10, fretStart: 6 },
  B: { chords: ["B", "E", "F#"], pitchClass: 11, fretStart: 7 },
};

export const JAM_PATTERNS = {
  standard: {
    name: "Standard 12-bar blues", genre: "blues",
    roles: ["I", "I", "I", "I", "IV", "IV", "I", "I", "V", "IV", "I", "V"],
    sections: [{ name: "Blues", bars: 12 }],
  },
  quick: {
    name: "Quick-change 12-bar blues", genre: "blues",
    roles: ["I", "IV", "I", "I", "IV", "IV", "I", "I", "V", "IV", "I", "V"],
    sections: [{ name: "Blues", bars: 12 }],
  },
  slowMinorBlues: {
    name: "Slow minor 12-bar blues", genre: "blues", mode: "minor",
    roles: ["I", "I", "I", "I", "IV", "IV", "I", "I", "V", "IV", "I", "V"],
    sections: [{ name: "Blues", bars: 12 }], defaultTempo: 68, defaultFeel: "light",
    defaultChordStyle: "minor", defaultBassPattern: "roots", defaultBassPlayer: "basic", defaultDrumPlayer: "pocket",
  },
  quickMinorBlues: {
    name: "Quick-change minor 12-bar blues", genre: "blues", mode: "minor",
    roles: ["I", "IV", "I", "I", "IV", "IV", "I", "I", "V", "IV", "I", "V"],
    sections: [{ name: "Blues", bars: 12 }], defaultChordStyle: "minor",
  },
  popLoop: {
    name: "Pop four-chord loop", genre: "pop",
    roles: ["I", "V", "vi", "IV"],
    sections: [{ name: "Loop", bars: 4 }], defaultTempo: 98, defaultFeel: "straight", defaultBassPattern: "roots",
  },
  popSong: {
    name: "Pop verse + chorus", genre: "pop",
    roles: ["vi", "IV", "I", "V", "vi", "IV", "I", "V", "I", "V", "vi", "IV", "I", "V", "vi", "IV"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }], defaultTempo: 100, defaultFeel: "straight", defaultBassPattern: "chordTones",
  },
  sixtiesLoop: {
    name: "1960s pop loop", genre: "sixties",
    roles: ["I", "vi", "IV", "V", "I", "iii", "IV", "iv"],
    sections: [{ name: "Loop", bars: 8 }], defaultTempo: 108, defaultFeel: "straight", defaultBassPattern: "roots",
  },
  sixtiesSong: {
    name: "1960s pop verse + chorus", genre: "sixties",
    roles: ["I", "vi", "IV", "V", "I", "vi", "IV", "V", "I", "iii", "IV", "iv", "I", "vi", "IV", "V"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }], defaultTempo: 108, defaultFeel: "straight", defaultBassPattern: "chordTones",
  },
  popMinorLoop: {
    name: "Minor pop four-chord loop", genre: "pop", mode: "minor",
    roles: ["i", "VI", "III", "VII"], sections: [{ name: "Loop", bars: 4 }], defaultTempo: 92, defaultFeel: "straight", defaultBassPattern: "roots",
  },
  popMinorSong: {
    name: "Minor pop verse + chorus", genre: "pop", mode: "minor",
    roles: ["i", "VI", "III", "VII", "i", "VI", "III", "VII", "VI", "VII", "i", "i", "VI", "VII", "i", "i"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }], defaultTempo: 96, defaultFeel: "straight", defaultBassPattern: "chordTones",
  },
  sixtiesMinorLoop: {
    name: "1960s minor pop loop", genre: "sixties", mode: "minor",
    roles: ["i", "VI", "iv", "V"], sections: [{ name: "Loop", bars: 4 }], defaultTempo: 102, defaultFeel: "straight", defaultBassPattern: "roots",
  },
  sixtiesMinorSong: {
    name: "1960s minor verse + chorus", genre: "sixties", mode: "minor",
    roles: ["i", "VI", "III", "VII", "i", "VI", "III", "VII", "i", "iv", "VI", "V", "i", "iv", "VII", "V"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }], defaultTempo: 102, defaultFeel: "straight", defaultBassPattern: "chordTones",
  },
  fiftiesMinorLoop: {
    name: "Minor 1950s I–VI–iv–V", genre: "pop", mode: "minor",
    roles: ["i", "VI", "iv", "V"], sections: [{ name: "Loop", bars: 4 }],
  },
  rockMinorLoop: {
    name: "Minor rock loop", genre: "pop", mode: "minor",
    roles: ["i", "iv", "i", "V"], sections: [{ name: "Loop", bars: 4 }],
  },
  fiftiesLoop: {
    name: "1950s I–vi–IV–V", genre: "pop", roles: ["I", "vi", "IV", "V"],
    sections: [{ name: "Loop", bars: 4 }], defaultTempo: 112, defaultFeel: "straight", defaultBassPattern: "roots", defaultBassPlayer: "basic", defaultDrumPlayer: "pocket",
  },
  rockLoop: {
    name: "Rock I–IV–V", genre: "pop", roles: ["I", "IV", "I", "V"],
    sections: [{ name: "Loop", bars: 4 }], defaultTempo: 116, defaultFeel: "straight", defaultBassPattern: "octaves", defaultBassPlayer: "pocket", defaultDrumPlayer: "basic",
  },
  bridgeSong: {
    name: "Original verse · chorus · bridge", genre: "pop",
    roles: ["I", "V", "vi", "IV", "I", "V", "IV", "V", "I", "V", "vi", "IV", "I", "V", "IV", "V", "ii", "IV", "I", "V", "ii", "IV", "V", "V"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }, { name: "Bridge", bars: 8 }],
    defaultTempo: 104, defaultFeel: "straight", defaultBassPattern: "chordTones", defaultBassPlayer: "pocket", defaultDrumPlayer: "pocket",
  },
  bridgeMinorSong: {
    name: "Minor verse · chorus · bridge", genre: "pop", mode: "minor",
    roles: ["i", "V", "VI", "iv", "i", "V", "iv", "V", "i", "V", "VI", "iv", "i", "V", "iv", "V", "iv", "VI", "V", "V", "iv", "VI", "V", "V"],
    sections: [{ name: "Verse", bars: 8 }, { name: "Chorus", bars: 8 }, { name: "Bridge", bars: 8 }],
  },
  custom: {
    name: "Custom chart", genre: "custom", roles: ["I"], sections: [{ name: "Chart", bars: 1 }],
  },
};

const MAJOR_SCALES = {
  C: ["C", "D", "E", "F", "G", "A", "B"], Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"], Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"], F: ["F", "G", "A", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E#"], Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  G: ["G", "A", "B", "C", "D", "E", "F#"], Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"], Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
};

const MINOR_SCALES = {
  C: ["C", "D", "Eb", "F", "G", "Ab", "Bb"], Db: ["C#", "D#", "E", "F#", "G#", "A", "B"],
  D: ["D", "E", "F", "G", "A", "Bb", "C"], Eb: ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"],
  E: ["E", "F#", "G", "A", "B", "C", "D"], F: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  "F#": ["F#", "G#", "A", "B", "C#", "D", "E"], Gb: ["F#", "G#", "A", "B", "C#", "D", "E"],
  G: ["G", "A", "Bb", "C", "D", "Eb", "F"], Ab: ["G#", "A#", "B", "C#", "D#", "E", "F#"],
  A: ["A", "B", "C", "D", "E", "F", "G"], Bb: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"],
  B: ["B", "C#", "D", "E", "F#", "G", "A"],
};

const MAJOR_ROLE_DEGREES = { I: [0, ""], ii: [1, "m"], iii: [2, "m"], IV: [3, ""], iv: [3, "m"], V: [4, ""], vi: [5, "m"] };
const MINOR_ROLE_DEGREES = { i: [0, "m"], III: [2, ""], iv: [3, "m"], v: [4, "m"], V: [4, ""], VI: [5, ""], VII: [6, ""] };
const makeHarmony = (scale, roles) => Object.fromEntries(Object.entries(roles).map(([role, [degree, quality]]) => [role, scale[degree] + quality]));
const KEY_HARMONY = Object.fromEntries(Object.entries(MAJOR_SCALES).map(([key, scale]) => [key, makeHarmony(scale, MAJOR_ROLE_DEGREES)]));
const KEY_HARMONY_MINOR = Object.fromEntries(Object.entries(MINOR_SCALES).map(([key, scale]) => [key, makeHarmony(scale, MINOR_ROLE_DEGREES)]));

export const CHORD_STYLES = {
  major: { name: "Major chords" },
  minor: { name: "Minor chords" },
  seventh: { name: "Blues sevenths" },
  minorSeventh: { name: "Minor sevenths" },
};

export function progressionFor(key = "A", patternId = "standard", chordStyle = "major", customChart = null) {
  const pattern = JAM_PATTERNS[patternId] ?? JAM_PATTERNS.standard;
  if (patternId === "custom" && customChart?.bars?.length) {
    return customChart.bars.map((bar) => transposeChord(bar.chords?.[0] ?? "A", customChart.baseKey ?? key, key));
  }
  if (pattern.genre === "blues") {
    // Blues roles are always written I/IV/V; the chord style decides quality.
    // Minor blues keeps a dominant V7 — it is what pulls the form back home.
    const minorStyle = chordStyle === "minor" || chordStyle === "minorSeventh";
    const major = KEY_HARMONY[key] ?? KEY_HARMONY.A;
    const minor = KEY_HARMONY_MINOR[key] ?? KEY_HARMONY_MINOR.A;
    return pattern.roles.map((role) => {
      if (minorStyle) {
        if (role === "V") return `${minor.V}7`;
        const chord = minor[{ I: "i", IV: "iv" }[role] ?? "i"];
        return chordStyle === "minorSeventh" ? `${chord}7` : chord;
      }
      const chord = major[role] ?? major.I;
      return chordStyle === "seventh" ? `${chord}7` : chord;
    });
  }
  const harmony = pattern.mode === "minor" ? (KEY_HARMONY_MINOR[key] ?? KEY_HARMONY_MINOR.A) : (KEY_HARMONY[key] ?? KEY_HARMONY.A);
  return pattern.roles.map((role) => harmony[role] ?? Object.values(harmony)[0]);
}

export function tonicChordFor(key = "A", patternId = "standard", chordStyle = "major") {
  const pattern = JAM_PATTERNS[patternId] ?? JAM_PATTERNS.standard;
  const tonic = pattern.mode === "minor" || (pattern.genre === "blues" && ["minor", "minorSeventh"].includes(chordStyle))
    ? (KEY_HARMONY_MINOR[key] ?? KEY_HARMONY_MINOR.A).i
    : (KEY_HARMONY[key] ?? KEY_HARMONY.A).I;
  if (pattern.genre !== "blues") return tonic;
  if (chordStyle === "seventh") return `${tonic}7`;
  if (chordStyle === "minorSeventh") return `${tonic}7`;
  return tonic;
}

export const CHORDS = {
  A7: {
    rootMidi: 33,
    rootName: "A",
    tones: ["A", "C♯", "E", "G"],
    pitchClasses: [9, 1, 4, 7],
    noteHint: "A · C♯ · E · G",
    voicings: {
      open: {
        id: "open", name: "Open shape", startFret: 1,
        frets: ["x", 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0],
      },
      barre: {
        id: "barre", name: "5th fret barre", startFret: 5,
        frets: [5, 7, 5, 6, 5, 5], fingers: [1, 3, 1, 2, 1, 1],
        barre: { fret: 5, from: 0, to: 5, finger: 1 },
      },
    },
  },
  B7: {
    rootMidi: 35, rootName: "B", tones: ["B", "D♯", "F♯", "A"], pitchClasses: [11, 3, 6, 9],
    voicings: {
      open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },
      barre: { id: "barre", name: "2nd fret barre", startFret: 2, frets: ["x", 2, 4, 2, 4, 2], fingers: [0, 1, 3, 1, 4, 1], barre: { fret: 2, from: 1, to: 5, finger: 1 } },
    },
  },
  C7: {
    rootMidi: 36, rootName: "C", tones: ["C", "E", "G", "B♭"], pitchClasses: [0, 4, 7, 10],
    voicings: {
      open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
      barre: { id: "barre", name: "3rd fret barre", startFret: 3, frets: ["x", 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 1], barre: { fret: 3, from: 1, to: 5, finger: 1 } },
    },
  },
  D7: {
    rootMidi: 38,
    rootName: "D",
    tones: ["D", "F♯", "A", "C"],
    pitchClasses: [2, 6, 9, 0],
    noteHint: "D · F♯ · A · C",
    voicings: {
      open: {
        id: "open", name: "Open shape", startFret: 1,
        frets: ["x", "x", 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3],
      },
      barre: {
        id: "barre", name: "5th fret barre", startFret: 5,
        frets: ["x", 5, 7, 5, 7, 5], fingers: [0, 1, 3, 1, 4, 1],
        barre: { fret: 5, from: 1, to: 5, finger: 1 },
      },
    },
  },
  E7: {
    rootMidi: 28,
    rootName: "E",
    tones: ["E", "G♯", "B", "D"],
    pitchClasses: [4, 8, 11, 2],
    noteHint: "E · G♯ · B · D",
    voicings: {
      open: {
        id: "open", name: "Open shape", startFret: 1,
        frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0],
      },
      barre: {
        id: "barre", name: "7th fret barre", startFret: 7,
        frets: ["x", 7, 9, 7, 9, 7], fingers: [0, 1, 3, 1, 4, 1],
        barre: { fret: 7, from: 1, to: 5, finger: 1 },
      },
    },
  },
  F7: {
    rootMidi: 29, rootName: "F", tones: ["F", "A", "C", "E♭"], pitchClasses: [5, 9, 0, 3],
    voicings: {
      open: { id: "open", name: "Compact shape", shortName: "Compact", startFret: 6, frets: ["x", 8, 7, 8, 6, "x"], fingers: [0, 3, 2, 4, 1, 0] },
      barre: { id: "barre", name: "1st fret barre", startFret: 1, frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 0, to: 5, finger: 1 } },
    },
  },
  G7: {
    rootMidi: 31, rootName: "G", tones: ["G", "B", "D", "F"], pitchClasses: [7, 11, 2, 5],
    voicings: {
      open: { id: "open", name: "Open shape", startFret: 1, frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
      barre: { id: "barre", name: "3rd fret barre", startFret: 3, frets: [3, 5, 3, 4, 3, 3], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 3, from: 0, to: 5, finger: 1 } },
    },
  },
};

const MAJOR_VOICINGS = {
  A: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    barre: { id: "barre", name: "5th fret barre", startFret: 5, frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 5, from: 0, to: 5, finger: 1 } },
  },
  B: {
    open: { id: "open", name: "2nd fret shape", shortName: "2nd fret", startFret: 2, frets: ["x", 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 2, from: 1, to: 5, finger: 1 } },
    barre: { id: "barre", name: "7th fret barre", startFret: 7, frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 7, from: 0, to: 5, finger: 1 } },
  },
  C: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
    barre: { id: "barre", name: "3rd fret barre", startFret: 3, frets: ["x", 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 3, from: 1, to: 5, finger: 1 } },
  },
  D: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", "x", 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    barre: { id: "barre", name: "5th fret barre", startFret: 5, frets: ["x", 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 5, from: 1, to: 5, finger: 1 } },
  },
  E: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    barre: { id: "barre", name: "7th fret barre", startFret: 7, frets: ["x", 7, 9, 9, 9, 7], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 7, from: 1, to: 5, finger: 1 } },
  },
  F: {
    open: { id: "open", name: "Compact shape", shortName: "Compact", startFret: 1, frets: ["x", "x", 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 4, to: 5, finger: 1 } },
    barre: { id: "barre", name: "1st fret barre", startFret: 1, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 0, to: 5, finger: 1 } },
  },
  G: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    barre: { id: "barre", name: "3rd fret barre", startFret: 3, frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 3, from: 0, to: 5, finger: 1 } },
  },
};

for (const [name, voicings] of Object.entries(MAJOR_VOICINGS)) {
  const seventh = CHORDS[`${name}7`];
  CHORDS[name] = {
    rootMidi: seventh.rootMidi, rootName: name,
    tones: seventh.tones.slice(0, 3), pitchClasses: seventh.pitchClasses.slice(0, 3),
    voicings,
  };
}

function fretLabel(fret) {
  return fret + (fret === 2 ? "nd" : fret === 3 ? "rd" : "th");
}

function eMinorBarre(fret, id = "barre") {
  return {
    id, name: `${fretLabel(fret)} fret barre`,
    ...(id === "open" ? { shortName: fretLabel(fret) } : {}),
    startFret: fret, frets: [fret, fret + 2, fret + 2, fret, fret, fret],
    fingers: [1, 3, 4, 1, 1, 1], barre: { fret, from: 0, to: 5, finger: 1 },
  };
}

function aMinorBarre(fret, id = "open") {
  return {
    id, name: `${fretLabel(fret)} fret barre`,
    ...(id === "open" ? { shortName: fretLabel(fret) } : {}),
    startFret: fret, frets: ["x", fret, fret + 2, fret + 2, fret + 1, fret],
    fingers: [0, 1, 3, 4, 2, 1], barre: { fret, from: 1, to: 5, finger: 1 },
  };
}

const MINOR_CHORDS = {
  Am: { rootMidi: 33, tones: ["A", "C", "E"], pitchClasses: [9, 0, 4], voicings: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
    barre: eMinorBarre(5),
  } },
  Bm: { rootMidi: 35, tones: ["B", "D", "F♯"], pitchClasses: [11, 2, 6], voicings: {
    open: aMinorBarre(2), barre: eMinorBarre(7),
  } },
  Cm: { rootMidi: 36, tones: ["C", "E♭", "G"], pitchClasses: [0, 3, 7], voicings: {
    open: aMinorBarre(3), barre: eMinorBarre(8),
  } },
  "C#m": { rootMidi: 37, tones: ["C♯", "E", "G♯"], pitchClasses: [1, 4, 8], voicings: {
    open: aMinorBarre(4), barre: eMinorBarre(9),
  } },
  Dm: { rootMidi: 38, tones: ["D", "F", "A"], pitchClasses: [2, 5, 9], voicings: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: ["x", "x", 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
    barre: aMinorBarre(5, "barre"),
  } },
  Em: { rootMidi: 28, tones: ["E", "G", "B"], pitchClasses: [4, 7, 11], voicings: {
    open: { id: "open", name: "Open shape", startFret: 1, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    barre: aMinorBarre(7, "barre"),
  } },
  Fm: { rootMidi: 29, tones: ["F", "A♭", "C"], pitchClasses: [5, 8, 0], voicings: {
    open: { id: "open", name: "Compact shape", shortName: "Compact", startFret: 1, frets: ["x", "x", 3, 1, 1, 1], fingers: [0, 0, 3, 1, 1, 1], barre: { fret: 1, from: 3, to: 5, finger: 1 } },
    barre: eMinorBarre(1),
  } },
  "F#m": { rootMidi: 30, tones: ["F♯", "A", "C♯"], pitchClasses: [6, 9, 1], voicings: {
    open: eMinorBarre(2, "open"), barre: aMinorBarre(9, "barre"),
  } },
  Gm: { rootMidi: 31, tones: ["G", "B♭", "D"], pitchClasses: [7, 10, 2], voicings: {
    open: eMinorBarre(3, "open"), barre: aMinorBarre(10, "barre"),
  } },
  "G#m": { rootMidi: 32, tones: ["G♯", "B", "D♯"], pitchClasses: [8, 11, 3], voicings: {
    open: eMinorBarre(4, "open"), barre: aMinorBarre(11, "barre"),
  } },
};

Object.assign(CHORDS, MINOR_CHORDS);

const PITCH_CLASS = {
  C: 0, "B#": 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4,
  "E#": 5, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9,
  "A#": 10, Bb: 10, B: 11, Cb: 11,
};
const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_PITCH_CLASSES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function spellChordTones(root, intervals) {
  const rootLetter = LETTERS.indexOf(root[0]);
  const rootPitchClass = PITCH_CLASS[root];
  const steps = intervals.length === 4 ? [0, 2, 4, 6] : [0, 2, 4];
  return intervals.map((interval, index) => {
    const letter = LETTERS[(rootLetter + steps[index]) % LETTERS.length];
    const pitchClass = (rootPitchClass + interval) % 12;
    const difference = ((pitchClass - NATURAL_PITCH_CLASSES[letter] + 6 + 12) % 12) - 6;
    return letter + (difference === 1 ? "♯" : difference === -1 ? "♭" : difference === 2 ? "𝄪" : difference === -2 ? "𝄫" : "");
  });
}

function movableShape(root, quality, base) {
  const pc = PITCH_CLASS[root];
  const basePc = base === "E" ? 4 : 9;
  const fret = (pc - basePc + 12) % 12;
  const suffix = quality === "m" ? "m" : quality === "7" ? "7" : quality === "m7" ? "m7" : "";
  let frets;
  let fingers;
  let barre;
  if (base === "E" && quality === "") {
    frets = [fret, fret + 2, fret + 2, fret + 1, fret, fret];
    fingers = [1, 3, 4, 2, 1, 1];
    barre = { fret, from: 0, to: 5, finger: 1 };
  } else if (base === "E" && quality === "m") {
    frets = [fret, fret + 2, fret + 2, fret, fret, fret];
    fingers = [1, 3, 4, 1, 1, 1];
    barre = { fret, from: 0, to: 5, finger: 1 };
  } else if (base === "E" && quality === "7") {
    frets = [fret, fret + 2, fret, fret + 1, fret, fret];
    fingers = [1, 3, 1, 2, 1, 1];
    barre = { fret, from: 0, to: 5, finger: 1 };
  } else if (base === "E") {
    frets = [fret, fret + 2, fret, fret, fret, fret];
    fingers = [1, 3, 1, 1, 1, 1];
    barre = { fret, from: 0, to: 5, finger: 1 };
  } else if (quality === "") {
    frets = ["x", fret, fret + 2, fret + 2, fret + 2, fret];
    fingers = [0, 1, 3, 4, 2, 1];
    barre = { fret, from: 1, to: 5, finger: 1 };
  } else if (quality === "m") {
    frets = ["x", fret, fret + 2, fret + 2, fret + 1, fret];
    fingers = [0, 1, 3, 4, 2, 1];
    barre = { fret, from: 1, to: 5, finger: 1 };
  } else if (quality === "7") {
    frets = ["x", fret, fret + 2, fret, fret + 2, fret];
    fingers = [0, 1, 3, 1, 4, 1];
    barre = { fret, from: 1, to: 5, finger: 1 };
  } else {
    frets = ["x", fret, fret + 2, fret, fret + 1, fret];
    fingers = [0, 1, 3, 1, 2, 1];
    barre = { fret, from: 1, to: 5, finger: 1 };
  }
  if (fret === 0) {
    const openFrets = base === "E"
      ? quality === "" ? [0, 2, 2, 1, 0, 0] : quality === "m" ? [0, 2, 2, 0, 0, 0]
        : quality === "7" ? [0, 2, 0, 1, 0, 0] : [0, 2, 0, 0, 0, 0]
      : quality === "" ? ["x", 0, 2, 2, 2, 0] : quality === "m" ? ["x", 0, 2, 2, 1, 0]
        : quality === "7" ? ["x", 0, 2, 0, 2, 0] : ["x", 0, 2, 0, 1, 0];
    const openFingers = base === "E"
      ? quality === "" ? [0, 2, 3, 1, 0, 0] : quality === "m" ? [0, 2, 3, 0, 0, 0]
        : quality === "7" ? [0, 2, 0, 1, 0, 0] : [0, 2, 0, 0, 0, 0]
      : quality === "m" ? [0, 0, 2, 3, 1, 0] : quality === "" ? [0, 0, 1, 2, 3, 0]
        : quality === "7" ? [0, 0, 1, 0, 2, 0] : [0, 0, 2, 0, 1, 0];
    return { id: "open", name: "Open shape", shortName: "Open", startFret: 1, frets: openFrets,
      fingers: openFingers, barre: null };
  }
  return { id: base === "E" ? "barre" : "open", name: `${fretLabel(fret)} fret ${base}-shape barre`,
    shortName: `${fretLabel(fret)} fret`, startFret: fret, frets, fingers, barre };
}

for (const root of Object.keys(PITCH_CLASS)) {
  for (const quality of ["", "m", "7", "m7"]) {
    const chord = root + quality;
    if (CHORDS[chord]) continue;
    const rootPc = PITCH_CLASS[root];
    const intervals = quality === "m" || quality === "m7" ? [0, 3, 7] : [0, 4, 7];
    if (quality === "7" || quality === "m7") intervals.push(10);
    const startMidi = 28 + ((rootPc - 4 + 12) % 12);
    const tones = spellChordTones(root, intervals);
    const eShape = movableShape(root, quality, "E");
    const aShape = movableShape(root, quality, "A");
    CHORDS[chord] = {
      rootMidi: startMidi, rootName: root, tones,
      pitchClasses: intervals.map((interval) => (rootPc + interval) % 12),
      voicings: { open: aShape, barre: eShape },
    };
  }
}

export const GROOVES = {
  shuffle: { id: "shuffle", name: "Driving shuffle", swing: 0.66, ride: "ride" },
  boogie: { id: "boogie", name: "Boogie shuffle", swing: 0.66, ride: "ride" },
  light: { id: "light", name: "Light swing", swing: 0.58, ride: "ride" },
  straight: { id: "straight", name: "Straight backbeat", swing: 0.5, ride: "hat" },
  halfTime: { id: "halfTime", name: "Half-time pop", swing: 0.5, ride: "hat", halfTime: true },
};

export const FILL_MODES = {
  off: { name: "Off" },
  light: { name: "Section changes" },
  regular: { name: "Every 4 bars" },
  frequent: { name: "Every 2 bars" },
};

export const TEMPO_PRESETS = [
  { name: "Slow", bpm: 76 },
  { name: "Medium", bpm: 94 },
  { name: "Up", bpm: 112 },
];

export function getChordForBar(barIndex, key = "A", patternId = "standard", chordStyle = "major", customChart = null) {
  const progression = progressionFor(key, patternId, chordStyle, customChart);
  const length = progression.length;
  if (!length) return "A";
  return progression[((barIndex % length) + length) % length];
}

export function nextDistinctChord(barIndex, key = "A", patternId = "standard", chordStyle = "major", customChart = null) {
  const progression = progressionFor(key, patternId, chordStyle, customChart);
  const current = getChordForBar(barIndex, key, patternId, chordStyle, customChart);
  for (let distance = 1; distance <= progression.length; distance += 1) {
    const chord = getChordForBar(barIndex + distance, key, patternId, chordStyle, customChart);
    if (chord !== current) return { chord, barsUntil: distance };
  }
  return { chord: current, barsUntil: progression.length };
}

export function bluesPitchClasses(key = "A") {
  const root = (JAM_KEYS[key] ?? JAM_KEYS.A).pitchClass;
  return [0, 3, 5, 6, 7, 10].map((interval) => (root + interval) % 12);
}

export const GUIDE_APPROACHES = {
  auto: "Best fit for this jam",
  majorPentatonic: "Major pentatonic",
  minorPentatonic: "Minor pentatonic",
  blues: "Blues scale",
  major: "Major scale",
  minor: "Natural minor scale",
  chord: "Current chord tones",
};

export function guidePitchClasses(key = "A", patternId = "standard", approach = "auto", chord = null) {
  const pattern = JAM_PATTERNS[patternId] ?? JAM_PATTERNS.standard;
  const selected = approach === "auto"
    ? (pattern.genre === "blues" ? "blues" : patternId === "custom" ? "chord" : pattern.mode === "minor" ? "minor" : "major")
    : approach;
  const root = (JAM_KEYS[key] ?? JAM_KEYS.A).pitchClass;
  const intervals = {
    majorPentatonic: [0, 2, 4, 7, 9],
    minorPentatonic: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
  };
  if (selected === "chord" && chord && CHORDS[chord]) return [...CHORDS[chord].pitchClasses];
  return (intervals[selected] ?? intervals.major).map((interval) => (root + interval) % 12);
}

export function patternSectionForBar(patternId = "standard", barIndex = 0, customChart = null) {
  const pattern = JAM_PATTERNS[patternId] ?? JAM_PATTERNS.standard;
  const cycleLength = patternId === "custom" ? (customChart?.bars?.length ?? 1) : pattern.roles.length;
  const bar = ((barIndex % cycleLength) + cycleLength) % cycleLength;
  let start = 0;
  for (const section of pattern.sections) {
    if (bar < start + section.bars) return { name: section.name, barInSection: bar - start, startBar: start };
    start += section.bars;
  }
  return { name: "Loop", barInSection: bar, startBar: 0 };
}

export function transposeChord(chord, fromKey, toKey) {
  const shift = ((JAM_KEYS[toKey]?.pitchClass ?? 9) - (JAM_KEYS[fromKey]?.pitchClass ?? 9) + 12) % 12;
  return transposeChordBy(chord, shift, toKey);
}

export function transposeChordBy(chord, semitones, keyHint = "A") {
  const match = /^([A-G](?:#|b|♯|♭)?)(m7|m|7)?$/.exec(chord ?? "");
  if (!match) return chord;
  const source = PITCH_CLASS[match[1].replace("♯", "#").replace("♭", "b")];
  if (source === undefined) return chord;
  const flats = ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(keyHint);
  const names = flats
    ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
    : NOTE_NAMES;
  return names[((source + semitones) % 12 + 12) % 12] + (match[2] ?? "");
}

export function barChordSegments(barIndex, key = "A", patternId = "standard", chordStyle = "major", customChart = null) {
  if (patternId !== "custom" || !customChart?.bars?.length) {
    return [{ chord: getChordForBar(barIndex, key, patternId, chordStyle, customChart), beats: 4 }];
  }
  const chartBar = customChart.bars[((barIndex % customChart.bars.length) + customChart.bars.length) % customChart.bars.length];
  const sourceChords = (chartBar.chords ?? []).filter(Boolean).slice(0, 2);
  const chords = sourceChords.length ? sourceChords : ["A"];
  const segments = chords.map((chord) => ({ chord: transposeChord(chord, customChart.baseKey ?? key, key), beats: 4 / chords.length }));
  return segments;
}

const STRING_MIDI = [64, 59, 55, 50, 45, 40]; // high e to low E
const NOTE_LABELS = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
const NOTE_SPELLINGS = {
  E: { 3: "D♯" },
  G: { 1: "D♭" },
  D: { 8: "A♭" },
  C: { 6: "G♭", 8: "A♭" },
  Db: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
  Eb: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
  F: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
  Gb: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
  Ab: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
  Bb: { 1: "D♭", 3: "E♭", 6: "G♭", 8: "A♭", 10: "B♭" },
};

export function fretboardNotes(startFret = 5, fretCount = 4, key = "A", capo = 0) {
  return STRING_MIDI.map((openMidi, stringIndex) => ({
    label: ["e", "B", "G", "D", "A", "E"][stringIndex],
    notes: Array.from({ length: fretCount }, (_, index) => {
      const physicalFret = startFret + index;
      const midi = openMidi + physicalFret;
      const pitchClass = midi % 12;
      return {
        fret: physicalFret, midi, pitchClass,
        name: NOTE_SPELLINGS[key]?.[pitchClass] ?? NOTE_LABELS[pitchClass],
      };
    }),
  }));
}
