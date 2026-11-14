# Jamroom

A free backing band for guitarists, in your browser. Pick a key and a progression, press **Start jam**, and play along with bass, drums and keys. It needs no account, no install, no guitar input and no internet connection once the page has loaded. Everything runs locally in the browser.

## Using it

1. Choose a **Key**, **Mode** and **Song** (progression) in the top bar, and set the **BPM**.
2. Press **Start jam**. After a short count-in the band loops the chart forever.
3. Watch the big chord and the bar strip. The *Next change* cards show what is coming, and the fingering card shows the open or barre shape.

Settings (☰ button, or **M**) hold the mixer, practice loop, Band Leader random call, feel, drum fills, capo, the keys bandmate, band sound, and the custom chart editor.

### Cues while the band plays

- **Push harder** (**D**): the band plays louder and busier. Press again to **Ease off**.
- **Hits only** (**S**): for four bars the band only plays a hit on beat one, leaving space for you.
- **Quieter** (**B**): the band plays softer from the next chorus.
- **End jam** (**E**): a short fill and an ending hit at the next loop boundary.

**Space** plays and pauses. **Esc** closes Settings.

### Built-in progressions

Standard and quick-change 12-bar blues (major and minor), pop four-chord loops and verse/chorus forms, 1960s-style and 1950s I–vi–IV–V loops, rock I–IV–V, and an original verse/chorus/bridge. They are original arrangements, not copies of particular songs. You can also build your own in the **Custom chart editor** (1–32 bars, one chord or two half-bar changes), and export or import charts as JSON.

## Install and offline use

Jamroom is a progressive web app. In Chrome, Edge or Android, use the browser's **Install** option; on iPhone and iPad use Share → Add to Home Screen. After the first full load (the sounds get cached) it also works offline. App code is fetched fresh when online, so updates arrive on the next visit. If you change the sound files, bump `VERSION` in `sw.js`.

## Running it

It is a static site with no build step. Serve the folder with any static web server, because the browser blocks ES modules from `file://` pages. For example:

```
npx http-server -p 8123 .
```

On Windows, double-click `Start-Jamroom.cmd` to start a local-only server and open the page.

To publish, upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, and so on).

## Files

- `index.html`, `styles.css`: interface and layout.
- `src/music.js`: keys, chords, progressions and chord diagrams.
- `src/audio-engine.js`: sample loading, Web Audio scheduling, mixer, count-in, fills, dynamics and transport.
- `src/rhythm-arranger.js`: bass and drum pattern choices.
- `src/keys.js`: the electric piano and organ.
- `src/main.js`: interface wiring.
- `manifest.webmanifest`, `sw.js`, `icons/`: install and offline support.
- `assets/audio/`: bass and drum samples.
- `assets/ATTRIBUTION.md`, `assets/licenses/`: sample sources and licenses.

## License and credits

Code: MIT, see `LICENSE`.

Audio samples come from [FreePats](https://freepats.zenvoid.org/) and keep their own licenses:

- Drums: MuldjordKit by Lars Muldjord, CC BY 4.0. *Drum samples provided by DrumGizmo.org.*
- Bass: Finger Bass YR and Picked Bass YR by Andrea Biasior, CC0.

Details are in `assets/ATTRIBUTION.md`.
