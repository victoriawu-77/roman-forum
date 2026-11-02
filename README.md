# Roman Forum

A single-page landing in blue steel-pen style. The first screen is the Roman Forum. The second is the sanctuary of Apollo at Delphi.

Ink is `#1B3A6B`. Paper is `#F3EDE2`. Both drawings run full-bleed, edge to edge. Navigation, the headline, and the visit button are real HTML over the drawing.

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

Each layer file carries a margin of mirrored line work around the plate (`tools/pad_layers.py`). The script sizes and places the layers so that the plate inside lines up exactly with the flat drawing, and caps travel so an edge never comes into view. The motion is deliberately strong: the nearest layer moves about 4% of the screen width with the pointer, and the Forum's nearer layers also swell slightly as the page scrolls away.

A loose flock of six gulls crosses the Forum sky. Each bird steers by cohesion, alignment and separation, so the group drifts, rises and falls, and banks through gentle turns. They beat their wings a few times and then glide, and smaller birds beat faster. When the flock leaves the screen, it comes back later as one group, entering from off screen and staying in the open sky above the roofs and clear of the headline. Over the valley at Delphi, two birds of prey circle slowly in a drifting thermal, banked into the turn. Birds and the thin bands of drawn cloud use the plate's own ink, a soft grey blue (rgb 72, 98, 130), at about the strength of the temple and far-city lines, paler for farther birds. Each wing is a single tapered stroke about a pixel wide. They are drawn on a canvas between the far hills and the city, so they move with the parallax at their own depth. The canvas pauses when it is off screen or the tab is hidden.

Each card also carries a flat copy of the full drawing (`assets/layers/*-flat.jpg`) on top of the layers. It fades out only once every layer has loaded and decoded, so a slow connection or a failed layer shows the whole drawing, never a half-built stack.

On phones and tablets the gyroscope drives the parallax on both plates. The angle the phone is held at when the page opens counts as level, and that level slowly follows the hand over about five seconds, so any comfortable angle works. Tilt is read up to about 20 degrees each way, smoothed, and turned to match the screen in landscape. Android and other browsers start at once without asking. iPhone and iPad Safari only send motion readings after the page asks, and the request has to come from a tap, so the first tap anywhere on the page asks (the listener is passive and does not block scrolling or links). A small "Tap, then tilt your phone" hint shows until then and fades once tilting works or the request is answered. If motion access is refused or no readings arrive within about a second, a sideways finger drag on the Forum moves the layers instead, easing back when you let go. Vertical swipes always scroll the page (`touch-action: pan-y`), and finger drags are ignored while the gyroscope is in use.

Where a nearer layer used to hide part of a farther one, the gap is filled with line work taken from the surrounding drawing.

If the system asks for reduced motion, the layers stay still and the birds are drawn once, without moving.

`tools/build_layers.py` with `tools/hero.json` and `tools/delphi.json` rebuilds the layers, then `tools/pad_layers.py` adds the margins. You also need a depth map and full-size PNG masters, which are kept out of the site.

Source Serif 4 and Outfit are included under the SIL Open Font License. See `assets/fonts/OFL.txt`.
