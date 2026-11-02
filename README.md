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

The drawings shift slightly with the pointer and with scroll. If the system asks for reduced motion, that shift stays off.

Source Serif 4 and Outfit are included under the SIL Open Font License. See `assets/fonts/OFL.txt`.
