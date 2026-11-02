/* Each gold plate is cut into depth layers (back to front: data-depth 0 to 1).
   At rest every layer sits at 0, so the stack reads as the original plate.
   Pointer and scroll move nearer layers further than far ones. */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const notes = {
  floor: {
    title: "The Forum floor",
    body: "The open ground between the Capitoline and the Palatine was Rome’s civic room: processions, elections, speeches, and the daily press of the city. The paving you walk is mostly imperial, laid over centuries of earlier streets."
  },
  saturn: {
    title: "Temple of Saturn",
    body: "Eight granite columns still carry a late entablature at the west end of the square. The state treasury sat in the podium. Saturn’s festival, the Saturnalia, turned the ordinary order of the city inside out for a week each December."
  },
  arch: {
    title: "Arch of Septimius Severus",
    body: "Raised in 203 CE beside the foot of the Capitoline. The reliefs record the Parthian campaigns. It was a gate only in ceremony — the real traffic of the Forum moved around it, not through a single passage."
  },
  julia: {
    title: "Basilica Julia",
    body: "The long civil court along the south side, begun under Julius Caesar and finished under Augustus. Its nave is gone. What remains is a paved platform, the stumps of the piers, and game boards scratched into the steps by people waiting on the law."
  },
  history: {
    title: "A public valley",
    body: "For more than a thousand years the Forum was the working center of Rome — assembly ground, market, law court, and sacred way. Temples and basilicas crowded the edges. The marble city you see in drawings is the late version. Under it are republican floors, drains, and the memory of a marsh the kings drained."
  },
  about: {
    title: "About this view",
    body: "A visitor introduction to the Roman Forum, drawn in steel-pen blue on warm paper. The first screen is the valley in Rome. The second follows the same line of stone, in imagination, up to the terraces of Apollo at Delphi."
  }
};

function closeMenus(except) {
  document.querySelectorAll(".menu").forEach((menu) => {
    if (menu === except) return;
    menu.classList.remove("is-open");
    const button = menu.querySelector(".menu-button");
    const panel = menu.querySelector(".menu-panel");
    if (button) button.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
  });
}

function toggleMenu(menu) {
  const willOpen = !menu.classList.contains("is-open");
  closeMenus(willOpen ? menu : null);
  const button = menu.querySelector(".menu-button");
  const panel = menu.querySelector(".menu-panel");
  menu.classList.toggle("is-open", willOpen);
  button.setAttribute("aria-expanded", willOpen ? "true" : "false");
  panel.hidden = !willOpen;
  if (willOpen) {
    const first = panel.querySelector("button");
    if (first) first.focus();
  }
}

function initMenus() {
  document.querySelectorAll(".menu").forEach((menu) => {
    const button = menu.querySelector(".menu-button");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu(menu);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu")) closeMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
      const nav = document.querySelector(".nav");
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        const toggle = nav.querySelector(".nav-toggle");
        toggle.setAttribute("aria-expanded", "false");
        toggle.querySelector(".nav-toggle-label").textContent = "Menu";
        toggle.focus();
      }
    }
  });
}

function initMobileNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const label = toggle.querySelector(".nav-toggle-label");
  toggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    label.textContent = open ? "Close" : "Menu";
    if (!open) closeMenus();
  });

  document.getElementById("primary-nav").addEventListener("click", (event) => {
    if (event.target.closest("[data-note], [data-open-visit]")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      label.textContent = "Menu";
    }
  });
}

function initNotes() {
  const dialog = document.getElementById("note-dialog");
  const title = document.getElementById("note-title");
  const body = document.getElementById("note-body");

  document.querySelectorAll("[data-note]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = notes[button.dataset.note];
      if (!note) return;
      closeMenus();
      title.textContent = note.title;
      body.textContent = note.body;
      dialog.showModal();
    });
  });
}

function initVisit() {
  const dialog = document.getElementById("visit-dialog");
  const form = document.getElementById("visit-form");
  const error = document.getElementById("form-error");
  const success = document.getElementById("request-success");
  const successCopy = document.getElementById("success-copy");
  const dateInput = form.elements.date;

  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  dateInput.min = iso;

  document.querySelectorAll("[data-open-visit]").forEach((button) => {
    button.addEventListener("click", () => {
      closeMenus();
      dialog.showModal();
      const target = document.getElementById("visit-" + button.dataset.openVisit);
      if (target) target.scrollIntoView({ block: "nearest" });
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const date = String(data.get("date") || "");
    const party = String(data.get("party") || "");

    if (!name || !email || !date || !party || !email.includes("@")) {
      error.hidden = false;
      error.textContent = "Add a name, a valid email, a date, and a party size.";
      return;
    }

    if (date < iso) {
      error.hidden = false;
      error.textContent = "Choose today or a later date.";
      return;
    }

    error.hidden = true;
    form.hidden = true;
    success.hidden = false;
    successCopy.textContent = `${name}, a note for ${party === "1" ? "one visitor" : "a party of " + party} on ${date} stays in this browser only. Bring the park ticket when you come, and check the day’s hours before you leave home.`;
  });

  document.getElementById("request-reset").addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    error.hidden = true;
    form.elements.name.focus();
  });
}

function initParallax() {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const cards = Array.from(document.querySelectorAll("[data-parallax]"));
  const nums = (value, fallback) => (value || fallback).trim().split(/\s+/).map(Number);
  const states = cards.map((card) => {
    const art = card.querySelector(".art");
    return {
      card,
      art,
      poster: art.querySelector(".poster"),
      sky: art.querySelector(".sky"),
      source: nums(art.dataset.source, "1246 700"),
      pad: nums(art.dataset.pad, "0 0 0 0"),
      mode: card.dataset.parallax,
      layers: Array.from(art.querySelectorAll(".layer")).map((el) => ({
        el,
        depth: parseFloat(el.dataset.depth) || 0
      })),
      geo: null,
      px: 0,
      py: 0,
      tx: 0,
      ty: 0,
      scroll: 0,
      ready: false
    };
  });

  // Pointer reach as a share of the card, for the nearest layer.
  const POINTER_X = { hero: 0.04, end: 0.026 };
  const POINTER_Y = { hero: 0.02, end: 0.014 };
  // Scroll reach as a share of the card height.
  const SCROLL = { hero: 0.2, end: 0.13 };
  // Nearer layers swell a little as the hero scrolls away.
  const SCROLL_SCALE = 0.045;

  // Place each padded layer so that the plate inside it sits exactly where
  // the flat drawing (object-fit: cover) sits, and work out how far each edge
  // of the padding reaches past the card, which caps the travel.
  function objectPosition(el) {
    const parts = getComputedStyle(el).objectPosition.split(/\s+/);
    const read = (part) => {
      if (!part) return 0.5;
      if (part === "left" || part === "top") return 0;
      if (part === "right" || part === "bottom") return 1;
      if (part === "center") return 0.5;
      return part.endsWith("%") ? parseFloat(part) / 100 : 0.5;
    };
    return [read(parts[0]), read(parts[1])];
  }

  function layout(state) {
    const bw = state.art.clientWidth;
    const bh = state.art.clientHeight;
    if (!bw || !bh) return;
    const [sw, sh] = state.source;
    const [pl, pt, pr, pb] = state.pad;
    const s = Math.max(bw / sw, bh / sh);
    const [fx, fy] = objectPosition(state.poster);
    const ox = (bw - sw * s) * fx; // plate origin inside the art box
    const oy = (bh - sh * s) * fy;
    const left = ox - pl * s;
    const top = oy - pt * s;
    const width = (sw + pl + pr) * s;
    const height = (sh + pt + pb) * s;
    state.layers.forEach(({ el }) => {
      el.style.left = left.toFixed(2) + "px";
      el.style.top = top.toFixed(2) + "px";
      el.style.width = width.toFixed(2) + "px";
      el.style.height = height.toFixed(2) + "px";
      el.style.transformOrigin = `${(bw / 2 - left).toFixed(2)}px ${(bh / 2 - top).toFixed(2)}px`;
    });
    // Art box position inside the card (the art overscans the card).
    const ax = state.art.offsetLeft;
    const ay = state.art.offsetTop;
    const cw = state.card.clientWidth;
    const ch = state.card.clientHeight;
    state.geo = {
      s, ox, oy, bw, bh, ax, ay, cw, ch,
      // Room left before an edge of the padded layer would enter the card.
      roomL: Math.max(0, -(ax + left)),
      roomR: Math.max(0, ax + left + width - cw),
      roomT: Math.max(0, -(ay + top)),
      roomB: Math.max(0, ay + top + height - ch)
    };
    if (state.sky) sizeSky(state);
  }

  // Wait until every layer of a card has loaded and decoded, then fade out the
  // flat drawing on top. Until then the layers stay still under it. If any
  // layer fails, the flat drawing simply stays.
  function whenDecoded(img) {
    const loaded = img.complete && img.naturalWidth > 0
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", reject, { once: true });
        });
    return loaded.then(() =>
      typeof img.decode === "function"
        ? img.decode().catch(() => {
            if (!img.naturalWidth) throw new Error("layer did not decode");
          })
        : undefined
    );
  }

  states.forEach((state) => {
    Promise.all(state.layers.map(({ el }) => whenDecoded(el)))
      .then(() => {
        layout(state);
        state.ready = true;
        state.art.classList.add("is-ready");
        measureScroll();
        apply(state);
        startSky();
      })
      .catch(() => {
        state.ready = false;
      });
  });

  function measureScroll() {
    const vh = window.innerHeight || 1;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - vh);
    const y = window.scrollY || window.pageYOffset || 0;
    states.forEach((state) => {
      const rect = state.card.getBoundingClientRect();
      if (state.mode === "end") {
        // At rest once the page reaches its end; drifts while the plate rises into view.
        state.scroll = Math.min(1, Math.max(0, (maxScroll - y) / vh));
      } else {
        // At rest at the top of the page; far layers lag as the plate scrolls away.
        state.scroll = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      }
      state.h = rect.height;
      state.w = rect.width;
    });
  }

  // Offset and scale of anything at a given depth (0 far, 1 near).
  function offsetAt(state, depth) {
    const reach = SCROLL[state.mode] * (state.h || 0) * state.scroll;
    let x = state.px * depth;
    let y = state.py * depth;
    let scale = 1;
    // Far layers lag behind the page. In the hero they sink as the plate
    // leaves the top; at the end of the page they rise into place from below.
    if (state.mode === "end") y -= reach * (1 - depth);
    else {
      y += reach * (1 - depth);
      scale = 1 + SCROLL_SCALE * state.scroll * depth;
    }
    const g = state.geo;
    if (g) {
      // Never let a padded edge into the card.
      const grow = (scale - 1) / 2;
      x = Math.min(g.roomL + grow * g.bw - 1, Math.max(-(g.roomR + grow * g.bw - 1), x));
      y = Math.min(g.roomT + grow * g.bh - 1, Math.max(-(g.roomB + grow * g.bh - 1), y));
    }
    return { x, y, scale };
  }

  function apply(state) {
    if (!state.ready) return;
    state.layers.forEach(({ el, depth }) => {
      const o = offsetAt(state, depth);
      el.style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0) scale(${o.scale.toFixed(4)})`;
    });
  }

  function reset() {
    states.forEach((state) => {
      state.layers.forEach(({ el }) => {
        el.style.transform = "none";
      });
    });
  }

  let running = false;
  function frame() {
    if (reducedMotion.matches) {
      reset();
      running = false;
      return;
    }
    let moving = false;
    states.forEach((state) => {
      state.px += (state.tx - state.px) * 0.09;
      state.py += (state.ty - state.py) * 0.09;
      if (Math.abs(state.tx - state.px) > 0.05 || Math.abs(state.ty - state.py) > 0.05) moving = true;
      else {
        state.px = state.tx;
        state.py = state.ty;
      }
      apply(state);
    });
    if (moving) requestAnimationFrame(frame);
    else running = false;
  }

  function kick() {
    if (reducedMotion.matches) return;
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  function onScroll() {
    if (reducedMotion.matches) return;
    measureScroll();
    kick();
  }

  function onResize() {
    states.forEach(layout);
    measureScroll();
    if (reducedMotion.matches) reset();
    else states.forEach(apply);
    drawSkyOnce();
  }

  states.forEach((state) => {
    state.card.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      const rect = state.card.getBoundingClientRect();
      const dx = (event.clientX - rect.left) / rect.width - 0.5;
      const dy = (event.clientY - rect.top) / rect.height - 0.5;
      state.tx = dx * -2 * POINTER_X[state.mode] * rect.width;
      state.ty = dy * -2 * POINTER_Y[state.mode] * rect.height;
      kick();
    });
    state.card.addEventListener("pointerleave", () => {
      state.tx = 0;
      state.ty = 0;
      kick();
    });
  });

  // Touch and tilt (hero only). Reach is a share of the card for the
  // nearest layer; travel is clamped so the padding always covers it.
  const TOUCH_X = 0.12;
  const TOUCH_Y = 0.022;
  const hero = states.find((state) => state.mode === "hero");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let dragging = false;
  const tilt = { on: false, x: 0, y: 0, g0: null, b0: null };

  function setTouchTarget(nx, ny) {
    // nx, ny in -1..1
    if (!hero || reducedMotion.matches) return;
    const rect = hero.card.getBoundingClientRect();
    hero.tx = clamp(nx, -1, 1) * TOUCH_X * rect.width;
    hero.ty = clamp(ny, -1, 1) * TOUCH_Y * rect.height;
    kick();
  }

  if (hero) {
    // Horizontal finger drags move the layers. The card is touch-action: pan-y,
    // so the browser keeps vertical scrolling; a drag that turns out to be
    // mostly vertical is ignored.
    let start = null;
    let axis = null;
    hero.card.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || reducedMotion.matches) return;
      start = { x: event.clientX, y: event.clientY };
      axis = null;
    });
    hero.card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch" || !start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      }
      if (axis !== "x") return;
      dragging = true;
      const rect = hero.card.getBoundingClientRect();
      // Half a card width of drag reaches full travel.
      setTouchTarget(dx / (rect.width * 0.5), 0);
    });
    const endDrag = (event) => {
      if (event.pointerType !== "touch") return;
      start = null;
      axis = null;
      if (!dragging) return;
      dragging = false;
      if (tilt.on) setTouchTarget(-tilt.x, -tilt.y);
      else setTouchTarget(0, 0); // eases back to rest through the frame lerp
    };
    hero.card.addEventListener("pointerup", endDrag);
    hero.card.addEventListener("pointercancel", endDrag);
  }

  function onOrientation(event) {
    if (event.gamma == null || event.beta == null || reducedMotion.matches) return;
    // Readings are arriving, so no permission step is needed (or it was granted).
    if (pill && !pill.hidden) pill.hidden = true;
    // The first reading is the neutral pose; travel is relative to it.
    if (tilt.g0 === null) {
      tilt.g0 = event.gamma;
      tilt.b0 = event.beta;
    }
    const rawX = clamp((event.gamma - tilt.g0) / 20, -1, 1);
    const rawY = clamp((event.beta - tilt.b0) / 20, -1, 1);
    // Low-pass the sensor before the frame lerp smooths it again.
    tilt.x += (rawX - tilt.x) * 0.25;
    tilt.y += (rawY - tilt.y) * 0.25;
    if (!dragging) setTouchTarget(-tilt.x, -tilt.y);
  }

  function startTilt() {
    if (tilt.on) return;
    tilt.on = true;
    window.addEventListener("deviceorientation", onOrientation);
  }

  const pill = document.querySelector(".tilt-pill");
  const coarse = window.matchMedia("(pointer: coarse)");
  if (hero && "DeviceOrientationEvent" in window && coarse.matches && !reducedMotion.matches) {
    // Listen straight away: browsers that need no permission (Android) start
    // sending readings; iOS sends nothing until the pill is tapped.
    startTilt();
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iOS: permission must come from a tap.
      if (pill) {
        pill.hidden = false;
        pill.addEventListener("click", () => {
          DeviceOrientationEvent.requestPermission()
            .then((answer) => {
              if (answer !== "granted") {
                window.removeEventListener("deviceorientation", onOrientation);
                tilt.on = false;
              }
            })
            .catch(() => {})
            .finally(() => {
              pill.hidden = true;
            });
        });
      }
    }
  }

  /* ---------------------------------------------------------------------
     Sky: a few birds and thin mist strokes, drawn to match the plate. The
     plate's line work is a soft greyed blue, about rgb(72, 98, 130) at full
     strength over the paper; the temple and far-city lines sit at about half
     strength and the far hills at about a seventh. Birds and mist use that
     ink at those strengths, with strokes about a pixel wide. Positions are in
     plate pixels, so they stay in the sky at every crop. Each item moves with
     the parallax at its own depth.
     --------------------------------------------------------------------- */
  const INK = "72, 98, 130";
  const skyStates = states.filter((state) => state.sky);
  let skyClock = 0;
  let skyLast = 0;
  let skyRunning = false;
  let skyVisible = new Set();
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Wingbeat: a few beats, then a glide. Small birds beat faster.
  function makeWings(span) {
    return {
      phase: rand() * Math.PI * 2,
      freq: clamp(4.6 - span * 0.11, 1.9, 3.6) * (0.92 + rand() * 0.16),
      amt: rand() < 0.5 ? 1 : 0,
      beats: 2 + Math.floor(rand() * 4),
      glide: 0.8 + rand() * 2.5,
      // Small fixed differences in how each bird is drawn, like a hand.
      j: [rand() - 0.5, rand() - 0.5, rand() - 0.5, rand() - 0.5]
    };
  }

  function stepWings(w, dt, glideMin, glideMax, beatsMax) {
    if (w.amt > 0.5) {
      const before = Math.floor(w.phase / (Math.PI * 2));
      w.phase += dt * w.freq * Math.PI * 2;
      if (Math.floor(w.phase / (Math.PI * 2)) > before) {
        w.beats -= 1;
        if (w.beats <= 0) {
          w.amt = 0.49; // settle into the glide at the top of a beat
          w.glide = glideMin + rand() * (glideMax - glideMin);
        }
      }
    } else {
      w.glide -= dt;
      if (w.glide <= 0) {
        w.amt = 1;
        w.beats = 2 + Math.floor(rand() * beatsMax);
      }
    }
    // Ease between beating and gliding.
    w.mix = w.mix === undefined ? (w.amt > 0.5 ? 1 : 0) : w.mix;
    w.mix += ((w.amt > 0.5 ? 1 : 0) - w.mix) * Math.min(1, dt * 6);
  }

  function seedSky(state) {
    if (state.mode === "hero") {
      // One loose flock of gulls. Each bird keeps a loose place in the group
      // and steers by cohesion, alignment and separation.
      const sizes = [24, 21, 20, 18, 17, 15];
      state.birds = sizes.map((span, i) =>
        Object.assign(makeWings(span), {
          span,
          depth: 0.1 + span / 160,
          slot: { x: (rand() - 0.5) * 110, y: (rand() - 0.5) * 34 },
          wx: rand() * 10,
          wy: rand() * 10,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          roll: 0,
          heading: 0
        })
      );
      state.flock = { dir: -1, speed: 21, baseY: 128, t: rand() * 20, wait: 0, entered: false };
      state.mist = [
        { sy: 72, len: 230, gap: 2.8, lines: 5, speed: 2.4, depth: 0.06, off: 0.08, alpha: 0.2 },
        { sy: 196, len: 300, gap: 3, lines: 6, speed: 3.2, depth: 0.04, off: 0.66, alpha: 0.18 }
      ].map((m) => Object.assign({ wave: rand() * 10, x: null }, m));
    } else {
      // Two birds of prey riding a thermal over the valley at Delphi: wide,
      // slow circles seen from the side, climbing and drifting.
      state.birds = [
        { cx: 250, cy: 252, r: 110, period: 34, span: 28, depth: 0.24, a: 0.5, climb: 96 },
        { cx: 290, cy: 272, r: 74, period: 27, span: 21, depth: 0.16, a: 3.6, climb: 74 }
      ].map((b) =>
        Object.assign(makeWings(b.span), b, { amt: 0, glide: 3 + rand() * 6, lift: 0, roll: 0 })
      );
      state.mist = [
        { sy: 300, len: 240, gap: 2.8, lines: 5, speed: 2.4, depth: 0.03, off: 0.04, alpha: 0.2 },
        { sy: 90, len: 200, gap: 2.8, lines: 4, speed: 1.8, depth: 0.05, off: 0.4, alpha: 0.17 }
      ].map((m) => Object.assign({ wave: rand() * 10, x: null }, m));
    }
  }

  function sizeSky(state) {
    const g = state.geo;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(g.bw * dpr);
    const h = Math.round(g.bh * dpr);
    if (state.sky.width !== w || state.sky.height !== h) {
      state.sky.width = w;
      state.sky.height = h;
    }
    state.dpr = dpr;
    if (!state.birds) seedSky(state);
    // The part of the plate the card shows, in plate pixels.
    state.view = {
      x0: (-g.ax - g.ox) / g.s,
      x1: (-g.ax + g.cw - g.ox) / g.s,
      y0: (-g.ay - g.oy) / g.s,
      y1: (-g.ay + g.ch - g.oy) / g.s
    };
  }

  // Put the whole flock just off one side, entering on a gentle slant.
  function launchFlock(state, x) {
    const f = state.flock;
    const v = state.view;
    f.baseY = 112 + rand() * 46;
    f.t = rand() * 20;
    const edge = x !== undefined ? x : f.dir < 0 ? v.x1 + 70 : v.x0 - 70;
    const climb = (rand() - 0.5) * 6;
    state.birds.forEach((b) => {
      b.x = edge + b.slot.x * (x !== undefined ? 1 : 0.8) - f.dir * Math.abs(b.slot.x) * 0.2;
      b.y = f.baseY + b.slot.y;
      b.vx = f.dir * f.speed * (0.95 + rand() * 0.1);
      b.vy = climb;
    });
    f.entered = x !== undefined;
  }

  function stepFlock(state, dt) {
    const f = state.flock;
    const v = state.view;
    const birds = state.birds;
    if (f.wait > 0) {
      f.wait -= dt;
      if (f.wait <= 0) launchFlock(state);
      return;
    }
    f.t += dt;
    // The flock's line of flight: a slow rise and fall, no straight rails.
    const goalY = f.baseY + Math.sin(f.t * 0.16) * 16 + Math.sin(f.t * 0.07 + 1.3) * 10;
    let cx = 0;
    let cy = 0;
    let mvx = 0;
    let mvy = 0;
    birds.forEach((b) => {
      cx += b.x;
      cy += b.y;
      mvx += b.vx;
      mvy += b.vy;
    });
    const n = birds.length;
    cx /= n;
    cy /= n;
    mvx /= n;
    mvy /= n;
    birds.forEach((b) => {
      let ax = (cx + b.slot.x - b.x) * 0.05; // cohesion, to a loose place
      let ay = (cy + b.slot.y - b.y) * 0.05;
      ax += (mvx - b.vx) * 0.4; // alignment
      ay += (mvy - b.vy) * 0.4;
      birds.forEach((o) => {
        if (o === b) return;
        const dx = b.x - o.x;
        const dy = (b.y - o.y) * 1.6;
        const d2 = dx * dx + dy * dy;
        if (d2 < 900 && d2 > 0.01) {
          ax += (dx / d2) * 120; // separation
          ay += (dy / d2) * 120;
        }
      });
      ax += (f.dir * f.speed - b.vx) * 0.35; // the group's way
      ay += (goalY - cy) * 0.06 - b.vy * 0.3;
      // Each bird drifts a little on its own.
      ax += Math.sin(skyClock * 0.53 + b.wx) * 2.2;
      ay += Math.sin(skyClock * 0.71 + b.wy) * 2.6 + Math.sin(skyClock * 1.9 + b.wx) * 1.2;
      // A few pixels of lift on the downbeat, a slow sink in the glide.
      ay += b.mix > 0.5 ? -0.6 : 0.9;
      // Stay in the open sky: below the menu, above the roofs and the title.
      if (b.y < 94) ay += (94 - b.y) * 0.5;
      if (b.y > 188) ay -= (b.y - 188) * 0.5;
      const ovx = b.vx;
      const ovy = b.vy;
      b.vx += ax * dt;
      b.vy += ay * dt;
      const sp = Math.hypot(b.vx, b.vy);
      const lo = f.speed * 0.7;
      const hi = f.speed * 1.35;
      if (sp < lo || sp > hi) {
        const k = clamp(sp, lo, hi) / sp;
        b.vx *= k;
        b.vy *= k;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // Bank into turns: roll follows the turn rate, smoothed.
      const turn = (ovx * b.vy - ovy * b.vx) / Math.max(1, sp * sp) / Math.max(dt, 1e-3);
      b.roll += (clamp(turn * 6, -0.6, 0.6) - b.roll) * Math.min(1, dt * 2);
      b.heading = Math.atan2(b.vy, Math.abs(b.vx));
      stepWings(b, dt, 1.2, 3.6, 4);
    });
    // Gone off the far side: the flock comes back later as one group.
    const out = birds.every((b) => (f.dir < 0 ? b.x < v.x0 - 50 : b.x > v.x1 + 50));
    if (out) {
      f.wait = 3 + rand() * 4;
      f.dir = rand() < 0.65 ? -1 : 1;
    }
  }

  function stepThermal(state, dt) {
    state.birds.forEach((b) => {
      b.a += (dt / b.period) * Math.PI * 2;
      // The thermal drifts; the birds climb in it and slowly sink out again.
      b.t = (b.t || 0) + dt;
      b.lift = 22 * Math.sin((b.t / b.climb) * Math.PI * 2 + b.period);
      b.cxNow = b.cx + Math.sin(skyClock * 0.02 + b.period) * 40;
      const sx = b.cxNow + Math.cos(b.a) * b.r;
      const sy = b.cy - b.lift + Math.sin(b.a) * b.r * 0.22;
      // Nearer half of the circle reads a little larger.
      b.near = Math.sin(b.a);
      b.x = sx;
      b.y = sy;
      const vx = -Math.sin(b.a);
      b.dirNow = vx < 0 ? -1 : 1;
      // Banked into the circle all the way round: the wing on the inside of
      // the turn dips, and the bank is seen most side-on at the ends.
      b.roll = 0.55 * Math.cos(b.a) * -b.dirNow;
      b.heading = Math.atan2(Math.cos(b.a) * 0.22, Math.abs(vx) + 0.3) * 0.6;
      stepWings(b, dt, 5, 11, 2);
    });
  }

  function updateSky(state, dt) {
    const v = state.view;
    if (!v) return;
    const span = v.x1 - v.x0;
    if (state.mode === "hero") {
      if (!state.flock.entered && state.flock.wait <= 0 && state.birds[0].x === 0) {
        launchFlock(state, v.x0 + span * 0.66);
      }
      // Fixed small steps keep the flock steady at any frame rate.
      let left = dt;
      while (left > 1e-6) {
        const h = Math.min(left, 1 / 30);
        stepFlock(state, h);
        left -= h;
      }
    } else {
      stepThermal(state, dt);
    }
    state.mist.forEach((m) => {
      if (m.x === null) m.x = v.x0 + span * m.off;
      m.x -= m.speed * dt;
      if (m.x + m.len < v.x0 - 20) m.x = v.x1 + 20;
    });
  }

  // One gull seen side-on from below: a clean M, each wing a tapered pen
  // stroke, widest at the shoulder and fining to a point at the tip.
  // pose: lift of the wrist and tip (in spans) from the beat; roll banks the
  // bird and foreshortens the wing on the high side.
  function drawBird(ctx, x, y, span, b, alpha, soar) {
    const w = b;
    const ph = w.phase;
    const m = w.mix === undefined ? 0 : w.mix;
    // Glide pose: gulls hold an M (arm up, hand down); soarers a flat V.
    const gWrist = soar ? 0.035 : 0.06;
    const gTip = soar ? 0.075 : 0.015;
    const beatW = Math.sin(ph) * 0.15;
    const beatT = Math.sin(ph - 0.9) * 0.26;
    const wrist = gWrist + (beatW - gWrist * 0.3) * m;
    const tip = gTip + (beatW + beatT - gTip * 0.3) * m;
    const roll = w.roll || 0;
    const dir = w.dirNow !== undefined ? w.dirNow : w.vx < 0 ? -1 : 1;
    const j = w.j;
    const base = Math.max(1.05, span * 0.06); // stroke width at the shoulder, px
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(roll * 0.45 + (w.heading || 0) * dir * 0.5);
    ctx.fillStyle = `rgba(${INK}, ${alpha.toFixed(3)})`;

    const wing = (side) => {
      // Foreshortened on the high side of a bank.
      const k = 1 - 0.32 * clamp(-side * roll, 0, 1) + 0.06 * clamp(side * roll, 0, 1);
      const X = (f) => side * span * f * k;
      const jw = j[side > 0 ? 0 : 1] * 0.025;
      const jt = j[side > 0 ? 2 : 3] * 0.03;
      const yW = -span * (wrist + jw);
      const yT = -span * (tip + jt);
      const t0 = base; // thickness at the shoulder
      const t1 = base * 0.75; // at the wrist
      const p = new Path2D();
      p.moveTo(X(0.02), -t0 * 0.5);
      // Leading edge: shoulder to wrist (arm), wrist to tip (hand).
      p.quadraticCurveTo(X(0.1), yW * 0.95 - t0 * 0.5, X(0.21), yW - t1 * 0.5);
      p.quadraticCurveTo(X(0.36), (yW + yT) / 2 - span * 0.012, X(0.5), yT);
      // Trailing edge back to the body, the stroke fining to the tip.
      p.quadraticCurveTo(X(0.36), (yW + yT) / 2 + t1 * 0.35, X(0.21), yW + t1 * 0.5);
      p.quadraticCurveTo(X(0.1), yW * 0.85 + t0 * 0.55, X(0.02), t0 * 0.55);
      p.closePath();
      return p;
    };
    ctx.fill(wing(-1));
    ctx.fill(wing(1));
    // Body: a short spindle with the head forward.
    ctx.beginPath();
    ctx.ellipse(dir * span * 0.02, base * 0.15, span * 0.085, Math.max(0.6, span * 0.022), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // A cloud drawn the engraver's way: a lens of short, gently waving
  // horizontal strokes, longest in the middle and thin at both ends.
  function drawMist(ctx, m, s) {
    const n = m.lines;
    for (let l = 0; l < n; l++) {
      const u = (l - (n - 1) / 2) / ((n - 1) / 2 || 1); // -1..1
      const lineLen = m.len * Math.sqrt(Math.max(0.08, 1 - u * u)) * (0.85 + 0.15 * Math.sin(l * 2.3 + m.wave));
      const x0 = m.x + (m.len - lineLen) / 2 + Math.sin(l * 1.7 + m.wave) * m.len * 0.06;
      const y0 = m.sy + l * m.gap;
      const segs = 14;
      for (let i = 0; i < segs; i++) {
        const a = i / segs;
        const b = (i + 1) / segs;
        const fade = Math.pow(Math.sin(Math.PI * (a + b) / 2), 0.8);
        ctx.strokeStyle = `rgba(${INK}, ${(m.alpha * fade).toFixed(3)})`;
        ctx.beginPath();
        for (let k = 0; k <= 4; k++) {
          const t = a + ((b - a) * k) / 4;
          const px = (x0 + lineLen * t) * s;
          const py = (y0 + Math.sin(t * 5.5 + m.wave + l * 0.6) * 1.4 + Math.sin(t * 31 + l) * 0.25) * s;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  }

  function drawSky(state) {
    const g = state.geo;
    if (!g || !state.birds) return;
    const ctx = state.sky.getContext("2d");
    const dpr = state.dpr || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, state.sky.width, state.sky.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const still = reducedMotion.matches;
    const cx = g.bw / 2;
    const cy = g.bh / 2;
    const place = (sx, sy, depth) => {
      const o = still ? { x: 0, y: 0, scale: 1 } : offsetAt(state, depth);
      const x = g.ox + sx * g.s;
      const y = g.oy + sy * g.s;
      return {
        x: cx + (x - cx) * o.scale + o.x,
        y: cy + (y - cy) * o.scale + o.y,
        k: o.scale
      };
    };

    ctx.lineWidth = 0.8;
    ctx.lineCap = "round";
    state.mist.forEach((m) => {
      const p = place(m.x, m.sy, m.depth);
      ctx.save();
      ctx.translate(p.x - m.x * g.s, p.y - m.sy * g.s);
      drawMist(ctx, m, g.s);
      ctx.restore();
    });

    if (state.mode === "hero" && state.flock.wait > 0) return;
    // Phones show the plate larger, so the birds come down a size there.
    const small = g.cw < 600 ? 0.85 : 1;
    const ordered = state.birds.slice().sort((a, b) => a.depth - b.depth);
    ordered.forEach((b) => {
      const soar = state.mode !== "hero";
      const near = soar ? 1 + 0.08 * b.near : 1;
      const p = place(b.x, b.y, b.depth);
      // Farther birds are paler, as the far city is paler than the temple.
      const alpha = 0.32 + b.depth * 1.0;
      drawBird(ctx, p.x, p.y, Math.max(10, b.span * g.s * small * p.k * near), b, alpha, soar);
    });
  }

  function skyFrame(now) {
    if (!skyRunning) return;
    const dt = skyLast ? Math.min(0.1, (now - skyLast) / 1000) : 0;
    skyLast = now;
    skyClock += dt;
    skyStates.forEach((state) => {
      if (!state.ready || !skyVisible.has(state)) return;
      updateSky(state, dt);
      drawSky(state);
    });
    requestAnimationFrame(skyFrame);
  }

  function drawSkyOnce() {
    skyStates.forEach((state) => {
      if (state.ready) drawSky(state);
    });
  }

  function startSky() {
    drawSkyOnce();
    if (reducedMotion.matches || document.hidden || skyRunning) return;
    skyRunning = true;
    skyLast = 0;
    requestAnimationFrame(skyFrame);
  }

  function stopSky() {
    skyRunning = false;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = skyStates.find((s) => s.card === entry.target);
        if (!state) return;
        if (entry.isIntersecting) skyVisible.add(state);
        else skyVisible.delete(state);
      });
    });
    skyStates.forEach((state) => io.observe(state.card));
  } else {
    skyVisible = new Set(skyStates);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopSky();
    else startSky();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  reducedMotion.addEventListener("change", () => {
    onResize();
    if (reducedMotion.matches) stopSky();
    else {
      onScroll();
      startSky();
    }
  });

  if (reducedMotion.matches) reset();
  else onScroll();

  // Test hook: lets a screenshot script pin the pointer and the sky clock
  // without real input.
  window.__parallax = {
    pointer(mode, dx, dy) {
      states.forEach((state) => {
        if (state.mode !== mode) return;
        const rect = state.card.getBoundingClientRect();
        state.tx = state.px = dx * -2 * POINTER_X[state.mode] * rect.width;
        state.ty = state.py = dy * -2 * POINTER_Y[state.mode] * rect.height;
        apply(state);
        if (state.sky) drawSky(state);
      });
    },
    offset(mode, x, y) {
      // Pin the nearest-layer offset in CSS pixels (for frame-by-frame captures).
      states.forEach((state) => {
        if (state.mode !== mode) return;
        state.tx = state.px = x;
        state.ty = state.py = y;
        apply(state);
        if (state.sky) drawSky(state);
      });
    },
    touchReach() {
      return { x: TOUCH_X, y: TOUCH_Y };
    },
    update() {
      measureScroll();
      states.forEach(apply);
      drawSkyOnce();
    },
    state(mode) {
      const st = states.find((x) => x.mode === mode);
      return st && {
        tx: st.tx, ty: st.ty, px: st.px, py: st.py, ready: st.ready, tilt: tilt.on, dragging,
        geo: st.geo, birds: st.birds && st.birds.length,
        flock: st.birds && st.birds.map((b) => ({ x: b.x, y: b.y, span: b.span, depth: b.depth })),
        view: st.view,
        transforms: st.layers.map(({ el }) => el.style.transform)
      };
    },
    pause() {
      stopSky();
    },
    advance(seconds, steps) {
      // Run the sky forward in fixed steps (for frame-by-frame captures).
      const n = steps || 1;
      for (let i = 0; i < n; i++) {
        skyClock += seconds / n;
        skyStates.forEach((state) => state.ready && updateSky(state, seconds / n));
      }
      drawSkyOnce();
    }
  };
}

initMenus();
initMobileNav();
initNotes();
initVisit();
initParallax();
