# Audio sample provenance

Jamroom stores and plays this small local subset of FreePats instrument samples. It does not hotlink to the sample repositories at runtime.

## Drums: MuldjordKit

- Source: MuldjordKit, assembled for FreePats by Roberto; original kit recorded by Lars Muldjord.
- Version: FreePats release 2020-10-18.
- License: Creative Commons Attribution 4.0 International (CC BY 4.0).
- Required credit, from the kit README: “Drum samples provided by DrumGizmo.org.”
- Source information: https://freepats.zenvoid.org/Percussion/acoustic-drum-kit.html
- Sample repository: https://github.com/freepats/muldjordkit
- Included subset: recordings from both kick drums and two snare banks, plus ghost snare, closed and open hi-hat, ride, mid tom, and floor tom. The numbered recordings span strike strengths; the app selects a suitable layer for each hit and alternates recordings within that range.

The MuldjordKit license and source README are preserved under assets/licenses/freepats-muldjordkit/.

## Bass: Finger Bass YR and Picked Bass YR

- Source: samples created by Andrea Biasior from a Yamaha RBX bass guitar, with small edits and bank integration by Roberto for FreePats.
- Version: 2019-09-30.
- License: Creative Commons CC0 1.0 public domain dedication.
- Source information: https://freepats.zenvoid.org/ElectricGuitar/clean-electric-bass.html
- Sample repository: https://github.com/freepats/electric-bass-YR
- Included subset: 12 chromatic fingered samples and 12 corresponding picked samples from E1 through D♯2. The picked originals are stored under `assets/audio/bass/pick/`; their source filenames omit the octave. The app can also synthesize bass tones without samples.

The bass license and source README are preserved under assets/licenses/freepats-bass-yr/.

## Sample filenames

The app sample loader uses local FLAC files under `assets/audio/bass/` and `assets/audio/drums/`. Bass notes may alternate with an adjacent recorded note pitched by one semitone to avoid an identical attack on every repeat. The acoustic option uses the kit's left kick and first snare bank. Tight uses its right kick and second snare bank with shorter envelopes. The electronic option uses Web Audio synthesis. Local filenames identify the instrument and source recording number; `-r-` marks the second acoustic bank.
