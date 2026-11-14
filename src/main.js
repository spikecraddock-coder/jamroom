import {
  CHORDS,
  CHORD_STYLES,
  GROOVES,
  JAM_KEYS,
  JAM_PATTERNS,
  barChordSegments,
  getChordForBar,
  patternSectionForBar,
  progressionFor,
  tonicChordFor,
  transposeChord,
  transposeChordBy,
} from "./music.js";
import { AudioEngine } from "./audio-engine.js";

const $ = (id) => document.getElementById(id);
const noteLetters = ["E", "A", "D", "G", "B", "e"];
const app = {
  bpm: 94,
  feel: "shuffle",
  fillMode: "regular",
  key: "C",
  mode: "major",
  form: "standard",
  chordStyle: "major",
  capo: 0,
  customChart: null,
  savedCharts: [],
  activeChartId: null,
  practiceRange: null,
  practiceStart: null,
  practiceCount: 1,
  playerMode: "linked",
  bandPlayer: "pocket",
  separateBassPlayer: "pocket",
  separateDrumPlayer: "pocket",
  bassPattern: "chordTones",
  bassPlayer: "pocket",
  bassSound: "warm",
  drumPlayer: "pocket",
  drumSound: "tight",
  chordalSound: "piano",
  chordalEnabled: false,
  voicings: {},
  lastRenderedBar: null,
  lastRenderedChord: null,
  starting: false,
  bandLeaderQueued: false,
  position: null,
};

function setStatus(message, isError = false) {
  const status = $("status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function displayKeyForSelector(key) {
  return key === "Gb" ? "F#" : key;
}

const MODE_FORM_PAIRS = {
  standard: { major: "standard", minor: "slowMinorBlues" },
  slowMinorBlues: { major: "standard", minor: "slowMinorBlues" },
  quick: { major: "quick", minor: "quickMinorBlues" },
  quickMinorBlues: { major: "quick", minor: "quickMinorBlues" },
  popLoop: { major: "popLoop", minor: "popMinorLoop" },
  popMinorLoop: { major: "popLoop", minor: "popMinorLoop" },
  popSong: { major: "popSong", minor: "popMinorSong" },
  popMinorSong: { major: "popSong", minor: "popMinorSong" },
  sixtiesLoop: { major: "sixtiesLoop", minor: "sixtiesMinorLoop" },
  sixtiesMinorLoop: { major: "sixtiesLoop", minor: "sixtiesMinorLoop" },
  sixtiesSong: { major: "sixtiesSong", minor: "sixtiesMinorSong" },
  sixtiesMinorSong: { major: "sixtiesSong", minor: "sixtiesMinorSong" },
  fiftiesLoop: { major: "fiftiesLoop", minor: "fiftiesMinorLoop" },
  fiftiesMinorLoop: { major: "fiftiesLoop", minor: "fiftiesMinorLoop" },
  rockLoop: { major: "rockLoop", minor: "rockMinorLoop" },
  rockMinorLoop: { major: "rockLoop", minor: "rockMinorLoop" },
  bridgeSong: { major: "bridgeSong", minor: "bridgeMinorSong" },
  bridgeMinorSong: { major: "bridgeSong", minor: "bridgeMinorSong" },
};

const APP_SETTINGS_KEY = "bandstand.preferences.v1";
const clampStoredValue = (value, min, max, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
};

function loadAppSettings() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(APP_SETTINGS_KEY) ?? "null"); }
  catch { return; }
  if (!saved || typeof saved !== "object") return;

  const savedOption = (id, value, fallback) => {
    const select = $(id);
    return select && Array.from(select.options).some((option) => option.value === String(value))
      ? String(value) : fallback;
  };
  app.key = savedOption("keySelect", saved.key, app.key);
  app.form = savedOption("formSelect", saved.form, app.form);
  app.feel = savedOption("feelSelect", saved.feel, app.feel);
  app.fillMode = savedOption("fillSelect", saved.fillMode, app.fillMode);
  app.playerMode = savedOption("playerModeSelect", saved.playerMode, app.playerMode);
  app.bandPlayer = savedOption("bandPlayerSelect", saved.bandPlayer, app.bandPlayer);
  app.separateBassPlayer = savedOption("bassPlayerSelect", saved.separateBassPlayer, app.separateBassPlayer);
  app.separateDrumPlayer = savedOption("drumPlayerSelect", saved.separateDrumPlayer, app.separateDrumPlayer);
  app.bassPattern = savedOption("bassPatternSelect", saved.bassPattern, app.bassPattern);
  app.bassSound = savedOption("bassSoundSelect", saved.bassSound, app.bassSound);
  app.drumSound = savedOption("drumSoundSelect", saved.drumSound, app.drumSound);
  app.chordalSound = savedOption("chordalSelect", saved.chordalSound, app.chordalSound);
  app.chordStyle = ["major", "minor", "seventh", "minorSeventh"].includes(saved.chordStyle)
    ? saved.chordStyle : app.chordStyle;
  app.bpm = Math.round(clampStoredValue(saved.bpm, 60, 140, app.bpm));
  app.capo = Math.round(clampStoredValue(saved.capo, 0, 12, app.capo));
  app.practiceCount = [0, 1, 2].includes(Number(saved.practiceCount)) ? Number(saved.practiceCount) : app.practiceCount;
  app.chordalEnabled = typeof saved.chordalEnabled === "boolean" ? saved.chordalEnabled : app.chordalEnabled;
  app.activeChartId = typeof saved.activeChartId === "string" ? saved.activeChartId : null;
  if (saved.voicings && typeof saved.voicings === "object") {
    app.voicings = Object.fromEntries(Object.entries(saved.voicings).filter(([chord, shape]) =>
      CHORDS[chord]?.voicings?.[shape]));
  }
  for (const [id, value] of Object.entries(saved.volumes ?? {})) {
    const slider = $(id);
    if (!slider || !["bassVolume", "drumVolume", "keysVolume", "masterVolume"].includes(id)) continue;
    slider.value = String(Math.round(clampStoredValue(value, Number(slider.min), Number(slider.max), Number(slider.value))));
  }
}

function persistAppSettings() {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify({
      key: app.key, form: app.form, chordStyle: app.chordStyle, bpm: app.bpm, feel: app.feel,
      fillMode: app.fillMode, practiceCount: app.practiceCount,
      capo: app.capo, playerMode: app.playerMode,
      bandPlayer: app.bandPlayer, separateBassPlayer: app.separateBassPlayer,
      separateDrumPlayer: app.separateDrumPlayer, bassPattern: app.bassPattern,
      bassSound: app.bassSound, drumSound: app.drumSound, chordalSound: app.chordalSound,
      chordalEnabled: app.chordalEnabled, activeChartId: app.activeChartId, voicings: app.voicings,
      volumes: Object.fromEntries(["bassVolume", "drumVolume", "keysVolume", "masterVolume"]
        .map((id) => [id, Number($(id).value)])),
    }));
  } catch {
    setStatus("Could not save preferences in this browser.", true);
  }
}

loadAppSettings();

const engine = new AudioEngine(
  (position) => renderPosition(position),
  (event) => handleAudioStatus(event),
  () => setStatus(`Jam complete. The band played the final ${engine.lastPosition?.chord ?? tonicChordFor(engine.lastPosition?.key ?? engine.key, engine.form, engine.chordStyle)} ending.`),
);

function handleAudioStatus(event) {
  if (event.kind === "loading") {
    setStatus("Loading local samples (" + event.loaded + " of " + event.total + ")…");
  } else if (event.kind === "ready") {
    setStatus("Samples ready. Audio plays through your browser’s default output.");
  } else if (event.kind === "queued" || event.kind === "setting") {
    setStatus(event.message);
  } else if (event.kind === "playing") {
    setStatus("The band is playing through your browser’s default output.");
  } else if (event.kind === "paused") {
    setStatus("Paused. Resume continues from the current beat.");
  } else if (event.kind === "stopped") {
    setStatus("Stopped. Start again for a fresh count-in.");
  } else if (event.kind === "ended") {
    setStatus(`Jam complete. The band played the final ${engine.lastPosition?.chord ?? tonicChordFor(engine.lastPosition?.key ?? engine.key, engine.form, engine.chordStyle)} ending.`);
  }
  updateControls();
}

function chordMarkup(chord) {
  const match = /^([A-G](?:#|♯|b|♭)?)(m7|m|7)?$/.exec(chord);
  if (!match) return chord;
  return match[1] + (match[2] ? '<span class="quality">' + match[2] + "</span>" : "");
}

function renderChordDiagram(chord, targetId = "chordDiagram") {
  const shapeChord = app.capo ? transposeChordBy(chord, -app.capo, app.key) : chord;
  const definition = CHORDS[shapeChord] ?? CHORDS[chord];
  const shape = definition.voicings[targetId === "chordDiagram" ? (app.voicings[shapeChord] ?? "open") : "open"];
  const xs = [43, 64, 85, 106, 127, 148];
  const yTop = 31;
  const fretHeight = 21;
  const yBottom = yTop + fretHeight * 4;
  let svg = '<svg viewBox="0 0 190 154" role="img" aria-label="' + chord + " sounds from " + shapeChord + " " + shape.name + ' chord box">';
  svg += '<text x="10" y="18" fill="#9bb3b1" font-size="9" font-family="system-ui">' + shape.startFret + "</text>";
  for (let index = 0; index < 6; index += 1) {
    svg += '<line x1="' + xs[index] + '" y1="' + yTop + '" x2="' + xs[index] + '" y2="' + yBottom + '" stroke="#829394" stroke-width="1.2"/>';
  }
  for (let fret = 0; fret <= 4; fret += 1) {
    const y = yTop + fret * fretHeight;
    const stroke = shape.startFret === 1 && fret === 0 ? 3 : 1;
    svg += '<line x1="' + xs[0] + '" y1="' + y + '" x2="' + xs[5] + '" y2="' + y + '" stroke="#829394" stroke-width="' + stroke + '"/>';
    if (fret < 4) {
      svg += '<text x="13" y="' + (y + fretHeight / 2 + 3) + '" fill="#819a99" font-size="8" font-family="system-ui">' + (shape.startFret + fret) + "</text>";
    }
  }
  for (let stringIndex = 0; stringIndex < 6; stringIndex += 1) {
    const fret = shape.frets[stringIndex];
    const finger = shape.fingers[stringIndex];
    const x = xs[stringIndex];
    if (fret === "x") {
      svg += '<text x="' + x + '" y="23" text-anchor="middle" fill="#d08f7c" font-size="13" font-weight="700" font-family="system-ui">×</text>';
      continue;
    }
    if (fret === 0) {
      svg += '<circle cx="' + x + '" cy="19" r="4" fill="none" stroke="#8eaaa6" stroke-width="1.4"/>';
      continue;
    }
    if (shape.barre && fret === shape.barre.fret && stringIndex >= shape.barre.from && stringIndex <= shape.barre.to) continue;
    const y = yTop + (fret - shape.startFret + 0.5) * fretHeight;
    svg += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="#edb875"/>';
    if (finger) svg += '<text x="' + x + '" y="' + (y + 3) + '" text-anchor="middle" fill="#1c292b" font-size="8" font-weight="800" font-family="system-ui">' + finger + "</text>";
  }
  if (shape.barre) {
    const y = yTop + (shape.barre.fret - shape.startFret + 0.5) * fretHeight;
    const x1 = xs[shape.barre.from];
    const x2 = xs[shape.barre.to];
    svg += '<rect x="' + (x1 - 7) + '" y="' + (y - 6.5) + '" width="' + (x2 - x1 + 14) + '" height="13" rx="6.5" fill="#edb875"/>';
    svg += '<text x="' + ((x1 + x2) / 2) + '" y="' + (y + 3) + '" text-anchor="middle" fill="#1c292b" font-size="8" font-weight="800" font-family="system-ui">1</text>';
  }
  for (let index = 0; index < noteLetters.length; index += 1) {
    svg += '<text x="' + xs[index] + '" y="148" text-anchor="middle" fill="#9bb3b1" font-size="8" font-family="system-ui">' + noteLetters[index] + "</text>";
  }
  svg += "</svg>";
  $(targetId).innerHTML = svg;
  if (targetId === "chordDiagram") {
    $("gripChord").textContent = app.capo ? shapeChord + " shape · sounds " + chord : chord + " · " + (shape.shortName ?? shape.name);
    $("gripNote").textContent = app.capo ? "Capo " + app.capo + " · play " + shapeChord + " shape" : "Standard tuning · E A D G B E";
  } else {
    $("nextGripChord").textContent = app.capo ? shapeChord + " shape" : chord;
    $("nextGripNote").textContent = app.capo ? "Capo " + app.capo + " · sounds " + chord : shape.name;
  }
  document.querySelectorAll(".voicing-button").forEach((button) => {
    if (targetId !== "chordDiagram") return;
    const option = definition.voicings[button.dataset.voicing];
    button.textContent = option.shortName ?? (button.dataset.voicing === "barre" ? "Barre" : "Open");
    const active = button.dataset.voicing === shape.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}


function nextLiveChanges(position, key, form, chordStyle, chart = app.customChart) {
  const length = form === "custom" ? (chart?.bars.length ?? 1) : JAM_PATTERNS[form].roles.length;
  const currentIndex = Math.max(0, position.barIndex ?? 0);
  const live = position.phase === "playing" || position.phase === "paused";
  const keyAt = (barIndex) => live ? engine.keyForBarIndex(barIndex) : key;
  const chartIndexAt = (barIndex) => live && engine.practiceRange
    ? engine.practiceRange[0] + ((barIndex % (engine.practiceRange[1] - engine.practiceRange[0] + 1)) + (engine.practiceRange[1] - engine.practiceRange[0] + 1)) % (engine.practiceRange[1] - engine.practiceRange[0] + 1)
    : barIndex;
  const chordAt = (barIndex) => getChordForBar(chartIndexAt(barIndex), keyAt(barIndex), form, chordStyle, chart);
  if (form === "custom" && position.phase !== "count-in" && position.phase !== "ending") {
    const currentBeat = position.phase === "stopped" ? 0 : (position.beat ?? 0);
    const changes = [];
    let activeChord = position.chord ?? chordAt(currentIndex);
    const barsToScan = (live && engine.practiceRange
      ? engine.practiceRange[1] - engine.practiceRange[0] + 1
      : length) * 2;
    scan: for (let barOffset = 0; barOffset <= barsToScan; barOffset += 1) {
      const timelineIndex = currentIndex + barOffset;
      const segments = barChordSegments(chartIndexAt(timelineIndex), keyAt(timelineIndex), form, chordStyle, chart);
      let segmentStartBeat = 0;
      for (const segment of segments) {
        const timelineBeat = barOffset * 4 + segmentStartBeat;
        segmentStartBeat += segment.beats;
        if (timelineBeat <= currentBeat || segment.chord === activeChord) continue;
        changes.push({ chord: segment.chord, distance: timelineBeat - currentBeat });
        activeChord = segment.chord;
        if (changes.length === 2) break scan;
      }
    }
    const asDistance = (beats) => ({ barsUntil: Math.floor(beats / 4), beatsUntil: beats % 4 });
    if (changes.length) {
      const nextDistance = changes[0].distance;
      return {
        next: { chord: changes[0].chord, ...asDistance(nextDistance) },
        then: changes[1]
          ? { chord: changes[1].chord, ...asDistance(changes[1].distance - nextDistance) }
          : { chord: activeChord, barsUntil: length, beatsUntil: 0 },
      };
    }
    return {
      next: { chord: activeChord, barsUntil: length, beatsUntil: 0 },
      then: { chord: activeChord, barsUntil: length, beatsUntil: 0 },
    };
  }
  if (position.nextChord && position.beatsUntilNext > 0) {
    return { next: { chord: position.nextChord, barsUntil: 0, beatsUntil: position.beatsUntilNext },
      then: { chord: chordAt(currentIndex + 1), barsUntil: 1, beatsUntil: 0 } };
  }
  const findNext = (barIndex) => {
    const currentChord = barIndex === currentIndex && position.chord ? position.chord : chordAt(barIndex);
    for (let distance = 1; distance <= length * 2; distance += 1) {
      const upcomingIndex = barIndex + distance;
      const candidates = form === "custom"
        ? barChordSegments(chartIndexAt(upcomingIndex), keyAt(upcomingIndex), form, chordStyle, chart).map((segment) => segment.chord)
        : [chordAt(upcomingIndex)];
      const chord = candidates.find((candidate) => candidate !== currentChord);
      if (chord) return { chord, barsUntil: distance };
    }
    return { chord: currentChord, barsUntil: length };
  };
  const next = findNext(currentIndex);
  return { next, then: findNext(currentIndex + next.barsUntil) };
}

function nextChangeAfterCountIn(startBar, key, form, chordStyle, chart, practiceRange) {
  const length = form === "custom" ? (chart?.bars.length ?? 1) : JAM_PATTERNS[form].roles.length;
  const loopStart = practiceRange?.[0] ?? 0;
  const loopLength = practiceRange ? practiceRange[1] - practiceRange[0] + 1 : length;
  let activeChord = barChordSegments(startBar, key, form, chordStyle, chart)[0]?.chord ??
    getChordForBar(startBar, key, form, chordStyle, chart);
  for (let barOffset = 0; barOffset < loopLength; barOffset += 1) {
    const bar = loopStart + ((startBar - loopStart + barOffset) % loopLength);
    let segmentStartBeat = 0;
    for (const segment of barChordSegments(bar, key, form, chordStyle, chart)) {
      const beatsUntil = barOffset * 4 + segmentStartBeat;
      if (beatsUntil === 0) {
        activeChord = segment.chord;
        segmentStartBeat += segment.beats;
        continue;
      }
      if (segment.chord !== activeChord) {
        return beatsUntil % 4 === 0
          ? { chord: segment.chord, barsUntil: beatsUntil / 4, beatsUntil: 0 }
          : { chord: segment.chord, barsUntil: 0, beatsUntil };
      }
      activeChord = segment.chord;
      segmentStartBeat += segment.beats;
    }
  }
  return { chord: activeChord, barsUntil: loopLength, beatsUntil: 0 };
}

function renderBars(position, key, form, chordStyle, chart = app.customChart) {
  const progression = progressionFor(key, form, chordStyle, chart);
  const length = progression.length;
  const genre = JAM_PATTERNS[form].genre;
  const completed = position.phase === "stopped" && position.completed;
  const activePractice = position.phase !== "stopped" ? engine.practiceRange : null;
  const currentBar = completed ? -1 : position.phase === "count-in" ? (activePractice?.[0] ?? 0) : Math.max(0, position.bar ?? ((position.barIndex ?? 0) % length));
  const next = position.phase === "count-in" ? { barsUntil: 0 } : nextLiveChanges(position, key, form, chordStyle, chart).next;
  const nextBar = position.phase === "count-in" ? currentBar : activePractice
    ? activePractice[0] + ((currentBar - activePractice[0] + next.barsUntil) % (activePractice[1] - activePractice[0] + 1))
    : (currentBar + next.barsUntil + length) % length;
  const bars = $("bars");
  const barsPerRow = length <= 8 ? length : length === 12 ? 12 : window.innerWidth >= 1200 ? 16 : 8;
  bars.style.setProperty("--bars-per-row", String(barsPerRow));
  bars.style.setProperty("--bars-mobile", String(length <= 4 ? 4 : length === 12 ? 6 : 4));
  bars.classList.toggle("tight", length > 12 && barsPerRow >= 16);
  bars.classList.toggle("has-sections", JAM_PATTERNS[form].sections.length > 1);
  const html = progression.map((chord, index) => {
    let state = "";
    if (completed || (position.phase !== "count-in" && index < currentBar)) state = "past";
    else if (index === currentBar) state = position.phase === "count-in" ? "soon" : "current";
    else if (index === nextBar) state = "soon";
    const section = patternSectionForBar(form, index, chart);
    const sectionTag = JAM_PATTERNS[form].sections.length > 1 && section.startBar === index
      ? '<span class="bar-section">' + section.name.toUpperCase() + '</span>' : "";
    const visibleChord = barChordSegments(index, key, form, chordStyle, chart).map((segment) => segment.chord).join(" / ");
    const inPracticeRange = Boolean(app.practiceRange && index >= app.practiceRange[0] && index <= app.practiceRange[1]);
    const selected = inPracticeRange ? " practice-range" : "";
    return '<div class="bar ' + state + selected + '"' + (index === currentBar ? ' aria-current="step"' : "") + '><span class="bar-number">' +
      String(index + 1).padStart(2, "0") + (index === currentBar && position.phase !== "count-in" ? " · NOW" : "") +
      '</span>' + sectionTag + '<span class="bar-chord">' + visibleChord + "</span></div>";
  }).join("");
  bars.innerHTML = html;
  bars.querySelectorAll(".bar").forEach((button, index) => {
    button.setAttribute("role", "button");
    button.tabIndex = 0;
    button.title = `Select bar ${index + 1} for a practice loop`;
    button.setAttribute("aria-pressed", String(Boolean(app.practiceRange && index >= app.practiceRange[0] && index <= app.practiceRange[1])));
    const selectBar = () => {
      if (app.practiceStart === null) {
        app.practiceStart = index;
        app.practiceRange = [index, index];
      } else {
        app.practiceRange = [Math.min(app.practiceStart, index), Math.max(app.practiceStart, index)];
        app.practiceStart = null;
      }
      renderBars(position, key, form, chordStyle, chart);
      bars.querySelectorAll(".bar")[index]?.focus();
      $("practiceRangeLabel").textContent = app.practiceRange
        ? `Practice bars ${app.practiceRange[0] + 1}–${app.practiceRange[1] + 1}` : "Click bars to choose a practice loop";
    };
    button.addEventListener("click", selectBar);
    button.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectBar(); } });
  });
  const practicing = (position.phase !== "stopped" || completed) && Boolean(engine.practiceRange);
  const unit = practicing ? "Practice loop" : genre === "blues" ? "Chorus" : "Round";
  if (completed) {
    $("mapStatus").textContent = "Complete · " + unit + " " + (position.chorus || 1);
  } else if (position.phase === "count-in") {
    const firstBar = practicing ? engine.practiceRange[0] + 1 : 1;
    $("mapStatus").textContent = "Count-in · next is bar " + firstBar;
  } else {
    const section = patternSectionForBar(form, currentBar, chart);
    $("mapStatus").textContent = unit + " " + (position.chorus || 1) + " · Bar " + ((position.bar ?? 0) + 1) + " of " + length +
      (JAM_PATTERNS[form].sections.length > 1 ? " · " + section.name : "");
  }
}

function stageCue(position, chart = app.customChart) {
  if (position.phase === "count-in") return {
    chip: "COUNT IN",
    caption: `${position.countInBars ?? 1} ${position.countInBars === 1 ? "bar" : "bars"} of count-in. The band comes in on ${getChordForBar(engine.practiceRange?.[0] ?? 0, position.key ?? app.key, position.form ?? app.form, position.chordStyle ?? app.chordStyle, chart)}.`,
    css: "",
  };
  if (position.phase === "ending") return { chip: "ENDING", caption: `Final ${position.chord} hit · let it ring.`, css: "" };
  if (position.phase === "paused") return { chip: "PAUSED", caption: "Resume continues from this beat.", css: "" };
  if (position.phase === "stopped" && position.completed) return {
    chip: "JAM COMPLETE",
    caption: `Final ${position.chord} hit · ready for another jam.`,
    css: "complete",
  };
  if (position.phase === "stopped") return { chip: "READY", caption: "Click Start and play along.", css: "" };
  if (position.stopTime) return { chip: "STOP-TIME", caption: "The band hits beat one and leaves you the space. Fill it!", css: "stoptime" };
  if (position.lift) return { chip: "PUSHING", caption: "The band is playing louder and busier. Press D to ease off.", css: "lift" };
  return { chip: "JAM", caption: "Play along. The band keeps the loop going.", css: "" };
}

function changeDistanceText(change, afterNext = false) {
  const parts = [];
  if (change.barsUntil) parts.push(change.barsUntil + (change.barsUntil === 1 ? " bar" : " bars"));
  if (change.beatsUntil) parts.push(change.beatsUntil + (change.beatsUntil === 1 ? " beat" : " beats"));
  const distance = parts.join(" + ") || "this bar";
  if (!afterNext) return "in " + distance;
  if (change.barsUntil && change.beatsUntil) return distance + " later";
  if (change.beatsUntil) return change.beatsUntil + (change.beatsUntil === 1 ? " more beat" : " more beats");
  if (change.barsUntil) return change.barsUntil + (change.barsUntil === 1 ? " more bar" : " more bars");
  return "right after";
}

function renderPosition(position) {
  app.position = position;
  const completed = position.phase === "stopped" && position.completed;
  const usingPlayingSession = position.phase !== "stopped" || completed;
  const chart = usingPlayingSession ? engine.customChart : app.customChart;
  const key = usingPlayingSession ? (position.key ?? engine.key) : app.key;
  const form = usingPlayingSession ? (position.form ?? engine.form) : app.form;
  const pattern = JAM_PATTERNS[form];
  const length = form === "custom" ? (chart?.bars.length ?? 1) : pattern.roles.length;
  const practicing = (position.phase !== "stopped" || completed) && Boolean(engine.practiceRange);
  const unit = practicing ? "PRACTICE LOOP" : pattern.genre === "blues" ? "CHORUS" : "ROUND";
  const chordStyle = usingPlayingSession ? (position.chordStyle ?? engine.chordStyle) : app.chordStyle;
  const openingBar = position.phase === "count-in" && engine.practiceRange ? engine.practiceRange[0] : 0;
  const firstChord = getChordForBar(openingBar, key, form, chordStyle, chart);
  const chord = position.phase === "stopped" && !completed ? firstChord : position.chord ?? firstChord;
  app.currentChord = chord;
  const songName = pattern.name + " in " + key + (pattern.genre === "blues" ? " · " + CHORD_STYLES[chordStyle].name : "");
  const harmonyLabel = chordStyle === "major" ? "major" : chordStyle === "minor" ? "minor" : chordStyle === "minorSeventh" ? "minor 7ths" : "7ths";
  $("summarySong").textContent = key + " · " + pattern.name + (pattern.genre === "blues" ? " · " + harmonyLabel : "");
  $("mapTitle").textContent = songName;
  document.title = "Jamroom — " + songName;
  const role = stageCue(position, chart);
  $("roleChip").textContent = role.chip;
  $("roleChip").className = "role-chip " + role.css;
  $("roleCaption").textContent = role.caption;

  if (completed) {
    $("positionText").textContent = "JAM COMPLETE · FINAL " + chord + " HIT";
    $("nowLabel").textContent = "LAST HIT";
    $("currentChord").innerHTML = chordMarkup(chord);
    $("nextChord").textContent = "—";
    $("nextTime").textContent = "ready to start again";
    $("thenChord").textContent = "—";
    $("thenTime").textContent = "";
  } else if (position.phase === "count-in") {
    $("positionText").textContent = "GET READY · " + (position.countInBars === 0 ? "READY" : String(position.countInBars ?? 1).toUpperCase() + " BAR COUNT-IN");
    $("nowLabel").textContent = "COUNT IN";
    $("currentChord").textContent = String((position.countBar ?? 0) * 4 + (position.beat ?? 0) + 1);
    $("nextChord").textContent = firstChord;
    $("nextTime").textContent = "starts after count-in";
    const firstChange = nextChangeAfterCountIn(openingBar, key, form, chordStyle, chart,
      engine.practiceRange ? engine.practiceRange : null);
    $("thenChord").textContent = firstChange.chord;
    $("thenTime").textContent = firstChange.beatsUntil
      ? "in " + firstChange.beatsUntil + (firstChange.beatsUntil === 1 ? " beat" : " beats")
      : "in " + firstChange.barsUntil + (firstChange.barsUntil === 1 ? " bar" : " bars");
  } else if (position.phase === "ending") {
    $("positionText").textContent = unit + " " + String(position.chorus).padStart(2, "0") + " · FINAL HIT";
    $("nowLabel").textContent = "ENDING";
    $("currentChord").innerHTML = chordMarkup(chord);
    $("nextChord").textContent = "—";
    $("nextTime").textContent = "jam complete";
    $("thenChord").textContent = "—";
    $("thenTime").textContent = "";
  } else {
    const songSection = patternSectionForBar(form, position.bar ?? 0, chart);
    $("positionText").textContent = unit + " " + String(position.chorus || 1).padStart(2, "0") +
      (pattern.sections.length > 1 ? " · " + songSection.name.toUpperCase() : "") +
      " · BAR " + String((position.bar ?? 0) + 1).padStart(2, "0") + " OF " + length;
    $("nowLabel").textContent = position.phase === "paused" ? "PAUSED ON" : "PLAYING NOW";
    $("currentChord").innerHTML = chordMarkup(chord);
    const { next, then } = nextLiveChanges(position, key, form, chordStyle, chart);
    $("nextChord").textContent = next.chord;
    $("nextTime").textContent = changeDistanceText(next);
    $("thenChord").textContent = then.chord;
    $("thenTime").textContent = changeDistanceText(then, true);
  }

  $("beatCaption").textContent = completed
    ? "FINAL " + chord + " HIT"
    : position.phase === "count-in"
    ? "COUNT " + ((position.countBar ?? 0) * 4 + (position.beat ?? 0) + 1) + " OF " + ((position.countInBars ?? 1) * 4)
    : position.phase === "ending" ? "LET IT RING" : "BEAT " + ((position.beat ?? 0) + 1) + " OF 4";
  document.querySelectorAll(".beats span").forEach((dot, index) => {
    dot.classList.toggle("active", !completed && position.phase !== "ending" && index === (position.beat ?? 0));
  });

  const barKey = position.phase + ":" + String(position.barIndex) + ":" + key + ":" + form + ":" + chordStyle +
    ":" + engine.key + ":" + engine.pendingKey + ":" + JSON.stringify(chart?.bars ?? []);
  if (app.lastRenderedBar !== barKey) {
    app.lastRenderedBar = barKey;
    renderBars(position, key, form, chordStyle, chart);
  }
  const nextShapeChord = position.phase === "count-in"
    ? nextChangeAfterCountIn(openingBar, key, form, chordStyle, chart, engine.practiceRange).chord
    : nextLiveChanges(position, key, form, chordStyle, chart).next.chord;
  const coachKey = chord + ":" + nextShapeChord + ":" + key + ":" + form + ":" + chordStyle + ":" + app.capo;
  if (app.lastRenderedChord !== coachKey) {
    app.lastRenderedChord = coachKey;
    renderChordDiagram(chord);
    renderChordDiagram(nextShapeChord, "nextChordDiagram");
  }
  updateControls();
}

function updateControls() {
  const active = engine.state === "playing";
  const paused = engine.state === "paused";
  const activeForm = active || paused ? engine.form : app.form;
  const unit = (active || paused) && engine.practiceRange ? "practice loop" : JAM_PATTERNS[activeForm].genre === "blues" ? "chorus" : "round";
  $("play").disabled = app.starting;
  $("stop").disabled = (!active && !paused) || app.starting;
  $("quiet").disabled = !active || app.starting;
  $("end").disabled = !active || app.starting;
  $("lift").disabled = !active || app.starting;
  $("stopTime").disabled = !active || app.starting;
  const lifting = active ? (engine.pendingLift ?? engine.lift) : false;
  $("lift").textContent = lifting ? "Ease off" : "Push harder";
  $("lift").classList.toggle("button-queued", engine.pendingLift !== null && active);
  $("lift").setAttribute("aria-pressed", String(lifting));
  const stopTimeOn = active && engine.stopTimeRemaining > 0;
  $("stopTime").textContent = stopTimeOn ? "Hits only!" : engine.pendingStopTime && active ? "Hits only queued ✓" : "Hits only";
  $("stopTime").classList.toggle("button-queued", active && (engine.pendingStopTime || stopTimeOn));
  $("play").innerHTML = active
    ? "Ⅱ <span>Pause</span>"
    : paused
      ? "▶ <span>Resume</span>"
      : "▶ <span>Start jam</span>";
  const queuedQuiet = active || paused
    ? (engine.pendingQuiet === null ? engine.quiet : engine.pendingQuiet)
    : false;
  $("quiet").textContent = queuedQuiet ? "Back to normal" : "Quieter";
  $("end").textContent = engine.endAtBar !== null || engine.endingScheduled ? "Ending queued ✓" : "End jam";
  $("end").classList.toggle("button-queued", engine.endAtBar !== null || engine.endingScheduled);
  $("practiceFaster").disabled = !(active || paused) || !engine.practiceRange || app.bpm >= 140 || app.starting;
  const keyQueued = (active || paused) && (engine.pendingKey !== null || engine.key !== (app.position?.key ?? engine.key));
  $("keyChangeHint").textContent = app.bandLeaderQueued ? "next jam" : keyQueued ? app.key + " queued" : "live: next loop";
}

function updateTempoControls(bpm) {
  app.bpm = Number(bpm);
  $("tempo").value = String(app.bpm);
  $("tempoValue").textContent = String(app.bpm);
  $("summaryTempo").textContent = app.bpm + " BPM";
  document.querySelectorAll(".preset-button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.bpm) === app.bpm);
  });
}

function updateFeelControls(feel) {
  app.feel = feel;
  $("feelSelect").value = feel;
  $("summaryFeel").textContent = GROOVES[feel].name;
}

function updateSetupNote() {
  const isBlues = JAM_PATTERNS[app.form].genre === "blues";
  const unit = isBlues ? "chorus" : "round";
  $("setupNote").textContent = `Change key while playing; it starts with the next ${unit}..`;
  $("customEditor").open = app.form === "custom";
  $("customEditor").hidden = app.form !== "custom";
}

const CHART_STORAGE_KEY = "bandstand.customCharts.v1";
const CHART_ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const CHART_QUALITIES = ["", "m", "7", "m7"];
const CHART_CHORDS = CHART_ROOTS.flatMap((root) => CHART_QUALITIES.map((quality) => root + quality));
const CHART_ROOT_ALIASES = { "C#": "Db", "D#": "Eb", Gb: "F#", "G#": "Ab", "A#": "Bb", Cb: "B", "E#": "F" };

function normalizeChartChord(chord) {
  const match = /^([A-G](?:#|b)?)(m7|m|7)?$/.exec(String(chord ?? ""));
  if (!match) return null;
  const root = CHART_ROOT_ALIASES[match[1]] ?? match[1];
  return CHART_ROOTS.includes(root) ? root + (match[2] ?? "") : null;
}

function normalizeChart(chart, fallbackKey = app.key) {
  if (!Array.isArray(chart?.bars) || chart.bars.length < 1 || chart.bars.length > 32) return null;
  const bars = chart.bars.map((bar) => {
    if (!Array.isArray(bar?.chords) || bar.chords.length < 1 || bar.chords.length > 2) return null;
    const chords = bar.chords.map(normalizeChartChord);
    return chords.every(Boolean) ? { chords } : null;
  });
  if (bars.some((bar) => !bar)) return null;
  const storedKey = displayKeyForSelector(chart.baseKey);
  return {
    ...chart,
    name: String(chart.name || "My jam").slice(0, 40),
    baseKey: JAM_KEYS[storedKey] ? storedKey : fallbackKey,
    bars,
  };
}

function freshChart(name = "My jam", length = 8, baseKey = app.key) {
  const chartKey = displayKeyForSelector(baseKey);
  return { version: 1, id: null, name, baseKey: chartKey, bars: Array.from({ length }, () => ({ chords: [chartKey] })) };
}

function loadSavedCharts() {
  try {
    const loaded = JSON.parse(localStorage.getItem(CHART_STORAGE_KEY) ?? "[]");
    app.savedCharts = Array.isArray(loaded) ? loaded.map((chart) => normalizeChart(chart)).filter(Boolean) : [];
  } catch {
    app.savedCharts = [];
  }
  renderSavedCharts();
}

function renderSavedCharts() {
  const select = $("savedChartSelect");
  select.innerHTML = '<option value="">New chart</option>' + app.savedCharts.map((chart) =>
    '<option value="' + chart.id + '">' + chart.name.replace(/[<>&"']/g, "") + "</option>").join("");
  select.value = app.activeChartId ?? "";
}

function chartChordOptions(selected = "", allowBlank = false) {
  return (allowBlank ? [['', "— second half —"]] : []).concat(CHART_CHORDS.map((chord) => [chord, chord]))
    .map(([value, label]) => '<option value="' + value + '"' + (value === selected ? " selected" : "") + ">" + label + "</option>").join("");
}

function renderCustomBars() {
  if (!app.customChart) app.customChart = freshChart();
  const container = $("customBars");
  container.innerHTML = app.customChart.bars.map((bar, index) => {
    const chords = bar.chords ?? [];
    return '<div class="custom-bar-editor"><strong>' + String(index + 1).padStart(2, "0") + '</strong><select aria-label="Bar ' + (index + 1) + ' chord" data-bar="' + index + '" data-slot="0">' + chartChordOptions(chords[0] ?? app.customChart.baseKey) + '</select>' +
      '<select aria-label="Bar ' + (index + 1) + ' second half chord" data-bar="' + index + '" data-slot="1">' + chartChordOptions(chords[1] ?? "", true) + '</select></div>';
  }).join("");
  $("customLength").value = String(app.customChart.bars.length);
  $("customName").value = app.customChart.name;
  container.querySelectorAll("select").forEach((select) => select.addEventListener("change", () => {
    const index = Number(select.dataset.bar);
    const slot = Number(select.dataset.slot);
    const bar = app.customChart.bars[index];
    if (slot === 1 && select.value === "") bar.chords = [bar.chords[0] ?? app.customChart.baseKey];
    else {
      bar.chords[slot] = select.value;
      if (slot === 1 && !bar.chords[0]) bar.chords[0] = app.customChart.baseKey;
      bar.chords = bar.chords.filter(Boolean).slice(0, 2);
    }
    app.customChart.name = $("customName").value.trim() || "My jam";
    if (app.form === "custom" && engine.state === "stopped") updateSongSelection();
    else restartAfterChartEdit();
  }));
}

function persistCharts() {
  try { localStorage.setItem(CHART_STORAGE_KEY, JSON.stringify(app.savedCharts)); }
  catch { setStatus("Could not save this chart in browser storage.", true); }
  renderSavedCharts();
}

function saveChart({ duplicate = false } = {}) {
  if (!app.customChart) app.customChart = freshChart();
  const name = $("customName").value.trim() || "My jam";
  const chart = { ...app.customChart, name, bars: app.customChart.bars.map((bar) => ({ chords: [...bar.chords] })) };
  if (!chart.id || duplicate) chart.id = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const index = app.savedCharts.findIndex((item) => item.id === chart.id);
  if (index < 0) app.savedCharts.push(chart); else app.savedCharts[index] = chart;
  app.customChart = chart;
  app.activeChartId = chart.id;
  persistCharts();
  $("savedChartSelect").value = chart.id;
  if (app.form === "custom" && engine.state === "stopped") updateSongSelection();
  setStatus(`Saved “${chart.name}” in this browser.`);
}

function selectSavedChart(id) {
  if (!id) {
    app.activeChartId = null;
    app.customChart = freshChart();
  } else {
    const found = app.savedCharts.find((chart) => chart.id === id);
    if (!found) return;
    app.customChart = JSON.parse(JSON.stringify(found));
    app.activeChartId = id;
    app.key = displayKeyForSelector(app.customChart.baseKey);
    $("keySelect").value = app.key;
  }
  renderCustomBars();
  if (app.form === "custom" && engine.state === "stopped") updateSongSelection();
  else restartAfterChartEdit();
}

function resizeChart(length) {
  if (!app.customChart) app.customChart = freshChart();
  const size = Math.max(1, Math.min(32, Number(length) || 1));
  app.customChart.bars = app.customChart.bars.slice(0, size);
  while (app.customChart.bars.length < size) app.customChart.bars.push({ chords: [app.customChart.baseKey] });
  renderCustomBars();
  if (app.form === "custom" && engine.state === "stopped") updateSongSelection();
  else restartAfterChartEdit();
}

function exportChart() {
  if (!app.customChart) return;
  const blob = new Blob([JSON.stringify(app.customChart, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${(app.customChart.name || "jam-chart").replace(/[^a-z0-9-]+/gi, "-")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importChart(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const chart = normalizeChart(JSON.parse(String(reader.result)));
      if (!chart) {
        throw new Error("That file is not a supported 1–32 bar Jamroom chart.");
      }
      chart.id = null;
      app.customChart = chart;
      app.activeChartId = null;
      renderCustomBars();
      $("formSelect").value = "custom";
      app.form = "custom";
      $("customEditor").open = true;
      const restart = stopForRestart();
      updateSongSelection();
      setStatus("Imported chart. Save it to keep a browser copy.");
      if (restart?.resume) startJam();
    } catch (error) { setStatus(error.message || "Could not import this chart.", true); }
  };
  reader.readAsText(file);
}


function updateSongSelection() {
  const usesBluesChordStyle = JAM_PATTERNS[app.form].genre === "blues";
  app.mode = app.form === "custom" ? "custom"
    : usesBluesChordStyle
      ? ["minor", "minorSeventh"].includes(app.chordStyle) ? "minor" : "major"
      : JAM_PATTERNS[app.form].mode ?? "major";
  $("modeSelect").value = app.mode;
  $("modeSelect").disabled = app.mode === "custom";
  $("chordStyleSelect").options[0].textContent = app.mode === "minor" ? "Minor triads" : "Major triads";
  $("chordStyleSelect").options[1].textContent = app.mode === "minor" ? "Minor sevenths" : "Dominant sevenths";
  $("chordStyleSelect").value = ["seventh", "minorSeventh"].includes(app.chordStyle) ? "sevenths" : "triads";
  $("chordStyleControl").hidden = !usesBluesChordStyle;
  $("writtenHarmony").hidden = usesBluesChordStyle;
  $("writtenHarmonyValue").textContent = app.form === "custom" ? "Custom chart" : "Written chords";
  updateSetupNote();
  if (engine.state === "stopped") {
    renderPosition({
      phase: "stopped", chord: getChordForBar(0, app.key, app.form, app.chordStyle, app.customChart), bar: 0, barIndex: 0,
      chorus: 1, beat: 0, bpm: app.bpm, quiet: false,
    });
  } else {
    setStatus("Progression and mode changes take effect the next time you start.");
  }
}

function syncBandLeaderText() {
  const selectedJam = `${app.key} ${app.mode === "custom" ? "custom chart" : app.mode} · ${JAM_PATTERNS[app.form].name}`;
  $("bandLeaderCallout").textContent = app.bandLeaderQueued
    ? `Next jam: ${selectedJam}. Stop and start to take the call.`
    : `Current jam: ${selectedJam}. Press for a surprise.`;
}

function callBandLeaderJam() {
  const availableKeys = Array.from($("keySelect").options).map((option) => option.value);
  const availableForms = Object.keys(JAM_PATTERNS).filter((form) => form !== "custom");
  let calls = availableForms.flatMap((form) => availableKeys.map((key) => ({ form, key })));
  const differentCalls = calls.filter((call) => call.form !== app.form || call.key !== app.key);
  if (differentCalls.length) calls = differentCalls;
  const call = calls[Math.floor(Math.random() * calls.length)];
  const pattern = JAM_PATTERNS[call.form];
  const useSevenths = ["seventh", "minorSeventh"].includes(app.chordStyle);
  app.key = call.key;
  app.form = call.form;
  if (pattern.genre === "blues") {
    const mode = pattern.mode ?? "major";
    app.chordStyle = mode === "minor"
      ? useSevenths ? "minorSeventh" : "minor"
      : useSevenths ? "seventh" : "major";
  }
  const restart = stopForRestart();
  app.bandLeaderQueued = false;
  $("keySelect").value = app.key;
  $("formSelect").value = app.form;
  updateSongSelection();
  const callout = `Band Leader calls ${app.key}: ${pattern.name}.`;
  $("bandLeaderCallout").textContent = restart?.resume ? callout : `${callout} Start when ready.`;
  updateControls();
  setStatus(restart?.resume ? `${callout} Restarting with a fresh count-in.` : callout);
  persistAppSettings();
  if (restart?.resume) startJam();
}
$("bandLeaderCall").addEventListener("click", callBandLeaderJam);

// Some changes (a new jam card, mode, harmony, or chart) can't be applied mid-loop. Stop the
// band first, apply the change, then call startJam() again if it was playing.
// Returns null when nothing was live, otherwise whether to resume and the practice range.
function stopForRestart({ keepRange = false } = {}) {
  if (engine.state !== "playing" && engine.state !== "paused") return null;
  const restart = { resume: engine.state === "playing", range: keepRange ? engine.practiceRange : null };
  if (!keepRange) {
    app.practiceRange = null;
    app.practiceStart = null;
    $("practiceRangeLabel").textContent = "Click bars to choose a practice loop";
  }
  engine.stop();
  return restart;
}

let chartRestartTimer = null;
// Chart edits come in bursts (one dropdown per bar), so wait for a pause before restarting.
function restartAfterChartEdit() {
  if (app.form !== "custom" || (engine.state !== "playing" && engine.state !== "paused")) return;
  setStatus("Chart changed. The jam restarts in a moment so you hear it.");
  clearTimeout(chartRestartTimer);
  chartRestartTimer = setTimeout(() => {
    const restart = stopForRestart();
    if (!restart) return;
    updateSongSelection();
    if (restart.resume) startJam();
  }, 900);
}

async function startJam(practiceRange = null) {
  app.starting = true;
  app.bandLeaderQueued = false;
  $("bandLeaderCallout").textContent = `Now playing ${app.key}: ${JAM_PATTERNS[app.form].name}.`;
  updateControls();
  setStatus("Preparing the band’s local samples…");
  try {
    await engine.start({ bpm: app.bpm, feel: app.feel, fillMode: app.fillMode, key: app.key, form: app.form, chordStyle: app.chordStyle,
      bassPattern: app.bassPattern, bassPlayer: app.bassPlayer, bassSound: app.bassSound,
      drumPlayer: app.drumPlayer, drumSound: app.drumSound, chordalSound: app.chordalSound,
      chordalEnabled: app.chordalEnabled, customChart: app.customChart,
      practiceRange, countInBars: app.practiceCount });
    if (engine.key !== app.key) engine.requestKey(app.key);
  } catch (error) {
    setStatus(error.message || "Could not start audio.", true);
  } finally {
    app.starting = false;
    updateControls();
  }
}

$("play").addEventListener("click", async () => {
  if (engine.state === "playing") {
    engine.pause();
    return;
  }
  if (engine.state === "paused") {
    app.starting = true;
    updateControls();
    try {
      await engine.resume();
    } catch (error) {
      setStatus(error.message || "Could not resume audio.", true);
    } finally {
      app.starting = false;
      updateControls();
    }
    return;
  }
  await startJam();
});

$("practiceLoop").addEventListener("click", async () => {
  if (!app.practiceRange) {
    setStatus("Choose a start and end bar in the progression strip first.");
    return;
  }
  app.practiceCount = Number($("practiceCount").value);
  if (engine.state !== "stopped") engine.stop();
  await startJam(app.practiceRange);
});
$("fullJam").addEventListener("click", async () => {
  app.practiceRange = null;
  app.practiceStart = null;
  $("practiceRangeLabel").textContent = "Click bars to choose a practice loop";
  if (engine.state !== "stopped") engine.stop();
  await startJam();
});
$("practiceCount").addEventListener("change", (event) => { app.practiceCount = Number(event.target.value); });
$("practiceFaster").addEventListener("click", () => {
  if ((engine.state !== "playing" && engine.state !== "paused") || !engine.practiceRange) return;
  const nextBpm = Math.min(140, Math.max(app.bpm, engine.bpm) + 2);
  if (nextBpm <= engine.bpm) return;
  updateTempoControls(nextBpm);
  engine.requestPracticeTempo(nextBpm);
  updateControls();
});

$("stop").addEventListener("click", () => engine.stop());
$("quiet").addEventListener("click", () => {
  engine.toggleQuiet();
  updateControls();
});
$("end").addEventListener("click", () => {
  engine.toggleEndAfterChorus();
  updateControls();
});
$("lift").addEventListener("click", () => {
  engine.toggleLift();
  updateControls();
});
$("stopTime").addEventListener("click", () => {
  engine.toggleStopTime();
  updateControls();
});

$("feelSelect").addEventListener("change", (event) => {
  updateFeelControls(event.target.value);
  engine.requestFeel(app.feel);
});

$("fillSelect").addEventListener("change", (event) => {
  app.fillMode = event.target.value;
  engine.requestFillMode(app.fillMode);
});

function applyPlayers() {
  const linked = app.playerMode === "linked";
  $("bandPlayerControl").hidden = !linked;
  document.querySelectorAll(".rhythm-independent").forEach((control) => { control.hidden = linked; });
  app.bassPlayer = linked ? (app.bandPlayer === "expressive" ? "melodic" : app.bandPlayer) : app.separateBassPlayer;
  app.drumPlayer = linked ? app.bandPlayer : app.separateDrumPlayer;
  engine.requestBandSetting("bassPlayer", app.bassPlayer);
  engine.requestBandSetting("drumPlayer", app.drumPlayer);
}

$("playerModeSelect").addEventListener("change", (event) => {
  app.playerMode = event.target.value;
  applyPlayers();
});
$("bandPlayerSelect").addEventListener("change", (event) => {
  app.bandPlayer = event.target.value;
  applyPlayers();
});
$("bassPlayerSelect").addEventListener("change", (event) => {
  app.separateBassPlayer = event.target.value;
  if (app.playerMode === "separate") applyPlayers();
});
$("drumPlayerSelect").addEventListener("change", (event) => {
  app.separateDrumPlayer = event.target.value;
  if (app.playerMode === "separate") applyPlayers();
});
for (const [id, key] of [
  ["bassPatternSelect", "bassPattern"], ["bassSoundSelect", "bassSound"], ["drumSoundSelect", "drumSound"],
]) {
  $(id).addEventListener("change", (event) => {
    app[key] = event.target.value;
    engine.requestBandSetting(key, app[key]);
  });
}

$("chordalSelect").addEventListener("change", (event) => {
  app.chordalSound = event.target.value;
  engine.requestBandSetting("chordalSound", app.chordalSound);
});
$("chordalEnabled").addEventListener("change", (event) => {
  app.chordalEnabled = event.target.checked;
  engine.requestBandSetting("chordalEnabled", app.chordalEnabled);
});

for (const [channel, sliderId, readoutId] of [
  ["bass", "bassVolume", "bassVolumeValue"],
  ["drums", "drumVolume", "drumVolumeValue"],
  ["keys", "keysVolume", "keysVolumeValue"],
]) {
  const slider = $(sliderId);
  const readout = $(readoutId);
  const updateVolume = () => {
    const level = Number(slider.value);
    readout.value = level + "%";
    slider.setAttribute("aria-valuetext", level === 0 ? "Muted" : level + " percent");
    engine.setChannelVolume(channel, level);
  };
  slider.addEventListener("input", updateVolume);
  updateVolume();
}

const masterSlider = $("masterVolume");
const masterReadout = $("masterVolumeValue");
const updateMasterVolume = () => {
  const level = Number(masterSlider.value);
  masterReadout.value = level + "%";
  masterSlider.setAttribute("aria-valuetext", level === 0 ? "Muted" : level + " percent output");
  engine.setMasterVolume(level);
};
masterSlider.addEventListener("input", updateMasterVolume);
updateMasterVolume();

$("tempo").addEventListener("input", (event) => {
  updateTempoControls(event.target.value);
  engine.requestTempo(app.bpm);
});

document.querySelectorAll(".preset-button").forEach((button) => {
  button.addEventListener("click", () => {
    updateTempoControls(button.dataset.bpm);
    engine.requestTempo(app.bpm);
  });
});

$("keySelect").addEventListener("change", (event) => {
  app.key = event.target.value;
  if (engine.state === "playing" || engine.state === "paused") engine.requestKey(app.key);
  else updateSongSelection();
  syncBandLeaderText();
});

$("modeSelect").addEventListener("change", (event) => {
  const mode = event.target.value;
  const nextForm = MODE_FORM_PAIRS[app.form]?.[mode];
  if (!nextForm) {
    event.target.value = app.mode;
    return;
  }
  const restart = stopForRestart();
  const currentIsBlues = JAM_PATTERNS[app.form].genre === "blues";
  const keepSevenths = currentIsBlues && ["seventh", "minorSeventh"].includes(app.chordStyle);
  app.form = nextForm;
  $("formSelect").value = nextForm;
  if (JAM_PATTERNS[nextForm].genre === "blues") {
    app.chordStyle = mode === "minor"
      ? keepSevenths ? "minorSeventh" : "minor"
      : keepSevenths ? "seventh" : "major";
  }
  updateSongSelection();
  syncBandLeaderText();
  if (restart?.resume) startJam();
});

$("formSelect").addEventListener("change", (event) => {
  // A new jam card restarts the band, so it also takes the card's suggested tempo,
  // feel and rhythm section like it would from a stopped state.
  const restart = stopForRestart();
  app.form = event.target.value;
  if (app.form === "custom" && !app.customChart) {
    app.customChart = freshChart();
    renderCustomBars();
  }
  const selectedPattern = JAM_PATTERNS[app.form];
  if (selectedPattern.defaultTempo) updateTempoControls(selectedPattern.defaultTempo);
  if (selectedPattern.defaultFeel) updateFeelControls(selectedPattern.defaultFeel);
  if (selectedPattern.genre === "blues") {
    app.chordStyle = selectedPattern.defaultChordStyle ?? (selectedPattern.mode === "minor" ? "minor" : "major");
  }
  if (selectedPattern.defaultBassPattern) {
    app.bassPattern = selectedPattern.defaultBassPattern;
    $("bassPatternSelect").value = app.bassPattern;
  }
  if (selectedPattern.defaultBassPlayer || selectedPattern.defaultDrumPlayer) {
    app.playerMode = "separate";
    app.separateBassPlayer = selectedPattern.defaultBassPlayer ?? app.separateBassPlayer;
    app.separateDrumPlayer = selectedPattern.defaultDrumPlayer ?? app.separateDrumPlayer;
    app.bassPlayer = app.separateBassPlayer;
    app.drumPlayer = app.separateDrumPlayer;
    $("playerModeSelect").value = "separate";
    $("bassPlayerSelect").value = app.separateBassPlayer;
    $("drumPlayerSelect").value = app.separateDrumPlayer;
    $("bandPlayerControl").hidden = true;
    document.querySelectorAll(".rhythm-independent").forEach((control) => { control.hidden = false; });
  }
  updateSongSelection();
  syncBandLeaderText();
  if (restart?.resume) startJam();
});

$("chordStyleSelect").addEventListener("change", (event) => {
  const restart = stopForRestart({ keepRange: true });
  app.chordStyle = event.target.value === "sevenths"
    ? app.mode === "minor" ? "minorSeventh" : "seventh"
    : app.mode === "minor" ? "minor" : "major";
  updateSongSelection();
  if (restart?.resume) startJam(restart.range);
});

document.querySelectorAll(".voicing-button").forEach((button) => {
  button.addEventListener("click", () => {
    const chord = app.currentChord;
    const shapeChord = app.capo ? transposeChordBy(chord, -app.capo, app.key) : chord;
    app.voicings[shapeChord] = button.dataset.voicing;
    renderChordDiagram(chord);
  });
});

$("capoSelect").addEventListener("change", (event) => {
  app.capo = Number(event.target.value);
  app.lastRenderedChord = null;
  renderPosition(app.position ?? { phase: "stopped", bar: 0, barIndex: 0 });
});

$("savedChartSelect").addEventListener("change", (event) => selectSavedChart(event.target.value));
$("customLength").addEventListener("change", (event) => resizeChart(event.target.value));
$("customName").addEventListener("input", (event) => {
  if (app.customChart) app.customChart.name = event.target.value;
});
$("newChart").addEventListener("click", () => {
  app.activeChartId = null;
  app.customChart = freshChart();
  $("formSelect").value = "custom";
  app.form = "custom";
  renderCustomBars();
  updateSongSelection();
});
$("saveChart").addEventListener("click", () => saveChart());
$("duplicateChart").addEventListener("click", () => saveChart({ duplicate: true }));
$("deleteChart").addEventListener("click", () => {
  if (!app.activeChartId) return;
  app.savedCharts = app.savedCharts.filter((chart) => chart.id !== app.activeChartId);
  app.activeChartId = null;
  app.customChart = freshChart();
  persistCharts();
  renderCustomBars();
  updateSongSelection();
});
$("exportChart").addEventListener("click", exportChart);
$("importChart").addEventListener("change", (event) => importChart(event.target.files?.[0]));


$("fullScreen").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      $("fullScreen").textContent = "Exit full screen";
      $("fullScreen").setAttribute("aria-label", "Exit full screen");
    } else {
      await document.exitFullscreen();
    }
  } catch {
    setStatus("Full-screen mode is unavailable in this browser.");
  }
});

document.addEventListener("fullscreenchange", () => {
  const active = Boolean(document.fullscreenElement);
  $("fullScreen").textContent = active ? "Exit full screen" : "Full screen";
  $("fullScreen").setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
});

document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement ||
    target instanceof HTMLTextAreaElement || target?.closest?.("summary, [role='button'], [contenteditable='true']")) return;
  if (event.code === "Space") {
    event.preventDefault();
    $("play").click();
  } else if (event.key.toLowerCase() === "e" && ! $("end").disabled) {
    $("end").click();
  } else if (event.key.toLowerCase() === "b" && ! $("quiet").disabled) {
    $("quiet").click();
  } else if (event.key.toLowerCase() === "d" && ! $("lift").disabled) {
    $("lift").click();
  } else if (event.key.toLowerCase() === "s" && ! $("stopTime").disabled) {
    $("stopTime").click();
  }
});

const savedSettingControls = new Set([
  "keySelect", "modeSelect", "formSelect", "chordStyleSelect", "feelSelect", "fillSelect",
  "practiceCount", "capoSelect", "chordalSelect", "chordalEnabled",
  "playerModeSelect", "bandPlayerSelect", "bassPlayerSelect", "drumPlayerSelect", "bassPatternSelect",
  "bassSoundSelect", "drumSoundSelect", "savedChartSelect",
]);
document.addEventListener("change", (event) => {
  if (savedSettingControls.has(event.target?.id)) persistAppSettings();
});
document.addEventListener("input", (event) => {
  if (["tempo", "bassVolume", "drumVolume", "keysVolume", "masterVolume"].includes(event.target?.id)) {
    persistAppSettings();
  }
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".preset-button, .voicing-button, #practiceFaster, #newChart, #saveChart, #duplicateChart, #deleteChart, #bandLeaderCall")) {
    persistAppSettings();
  }
});
window.addEventListener("pagehide", persistAppSettings);
// After a mouse click, drop focus from buttons and bars so Space always means
// play/pause instead of re-pressing whatever was clicked last.
document.addEventListener("click", (event) => {
  if (event.detail > 0 && document.activeElement?.matches?.("button, .bar")) document.activeElement.blur();
});


loadSavedCharts();
if (app.activeChartId) {
  const activeChart = app.savedCharts.find((chart) => chart.id === app.activeChartId);
  if (activeChart) app.customChart = JSON.parse(JSON.stringify(activeChart));
  else app.activeChartId = null;
}
if (app.form === "custom" && !app.customChart) app.customChart = freshChart();
if (app.customChart) renderCustomBars();
$("keySelect").value = app.key;
$("formSelect").value = app.form;
$("feelSelect").value = app.feel;
$("fillSelect").value = app.fillMode;
$("capoSelect").value = String(app.capo);
$("chordalSelect").value = app.chordalSound;
$("chordalEnabled").checked = app.chordalEnabled;
$("playerModeSelect").value = app.playerMode;
$("bandPlayerSelect").value = app.bandPlayer;
$("bassPlayerSelect").value = app.separateBassPlayer;
$("drumPlayerSelect").value = app.separateDrumPlayer;
$("bassPatternSelect").value = app.bassPattern;
$("bassSoundSelect").value = app.bassSound;
$("drumSoundSelect").value = app.drumSound;
$("chordStyleSelect").value = ["seventh", "minorSeventh"].includes(app.chordStyle) ? "sevenths" : "triads";
applyPlayers();
$("practiceCount").value = String(app.practiceCount);
updateTempoControls(app.bpm);
updateFeelControls(app.feel);
updateSongSelection();
$("bandLeaderCallout").textContent = `Current jam: ${app.key} · ${JAM_PATTERNS[app.form].name}. Press for a surprise.`;
setStatus("Ready. Use your laptop’s default audio output.");

// Settings drawer: everything that isn't the chord lives here, out of the way.
function setDrawer(open) {
  $("drawer").hidden = !open;
  $("drawerBackdrop").hidden = !open;
  $("menuToggle").setAttribute("aria-expanded", String(open));
}
$("menuToggle").addEventListener("click", () => setDrawer($("drawer").hidden));
$("drawerClose").addEventListener("click", () => setDrawer(false));
$("drawerBackdrop").addEventListener("click", () => setDrawer(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setDrawer(false);
  else if (event.key.toLowerCase() === "m" && !/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) setDrawer($("drawer").hidden);
});

document.querySelectorAll(".tempo-step").forEach((button) => button.addEventListener("click", () => {
  const input = $("tempo");
  input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), Number(input.value) + Number(button.dataset.step))));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}));

