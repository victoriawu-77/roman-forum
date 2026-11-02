# Roman Forum

A single-page landing in blue steel-pen style. The first screen is the Roman Forum. The second is the sanctuary of Apollo at Delphi.

Ink is `#1B3A6B`. Paper is `#F3EDE2`. Navigation, the headline, and the visit button are real HTML over the drawing.

## Open locally

From this folder:

```bash
python3 -m http.server 43123
```

Then open [http://127.0.0.1:43123](http://127.0.0.1:43123).

A local server is the reliable way to load the fonts and script. Opening `index.html` as a file can block those.

## Motion

Each drawing is cut into four depth layers (`assets/layers/*.webp`), stacked so that at rest they rebuild the original plate.

- Forum: sky and hills, the far city, the temples and arch, then the portico, the right column, and the foreground rubble.
- Delphi: sky and far ranges, the cliffs, the sanctuary terraces, then the olive tree and the near slope.

On desktop, nearer layers move further with the pointer. On every device, including iPhone Safari, the layers also move at different rates on scroll. On the Forum, far layers lag as the page scrolls away. On Delphi, the layers settle into place as you reach the end of the page.

Where a nearer layer used to hide part of a farther one, the gap is filled with line work taken from the surrounding drawing.

If the system asks for reduced motion, the layers stay still.

`tools/build_layers.py` with `tools/hero.json` and `tools/delphi.json` rebuilds the layers. You also need a depth map and full-size PNG masters, which are kept out of the site.

Source Serif 4 and Outfit are included under the SIL Open Font License. See `assets/fonts/OFL.txt`.
