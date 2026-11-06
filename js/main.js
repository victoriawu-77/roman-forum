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
      plate: null,
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
      hand: null,
      scroll: 0,
      ready: false
    };
  });

  states.forEach((state) => {
    const [sw, sh] = state.source;
    state.plate = nums(state.art.dataset.plate, `0 0 ${sw} ${sh}`);
  });

  // Touch screens. Reach is a share of the card for the nearest layer;
  // travel is clamped so the padding always covers it.
  const TOUCH_X = 0.12;
  const TOUCH_Y = 0.022;
  // Gyroscope: full tilt (TILT_RANGE degrees from the resting angle) moves the
  // nearest layer about as far as the pointer does at a card corner on a
  // desktop, a little more sideways because phones are narrow.
  const TILT_X = { hero: 0.1, end: 0.07 };
  const TILT_Y = { hero: 0.035, end: 0.025 };
  // Pointer reach as a share of the card, for the nearest layer.
  const POINTER_X = { hero: 0.04, end: 0.026 };
  const POINTER_Y = { hero: 0.02, end: 0.014 };
  // Scroll reach as a share of the card height.
  const SCROLL = { hero: 0.2, end: 0.13 };
  // Nearer layers swell a little as the hero scrolls away.
  const SCROLL_SCALE = 0.045;

  // Safe zone. Every layer (and the flat drawing) is drawn a little larger
  // than the card: one uniform zoom, chosen per card and per screen from how
  // far the nearest layer can travel there, plus a small fixed margin. The
  // drawn plate (data-plate, in source pixels; the source may carry a paper
  // margin around it) always covers the card, and offsetAt() clamps every
  // move so no edge of the plate can ever enter the card.
  const SAFE_MIN = 0.02; // fixed margin per side, as a share of the card
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

  // Largest offset the nearest layer is asked for on this kind of screen,
  // as a share of the card width and height.
  function reach(state) {
    const touch = !finePointer.matches;
    const m = state.mode;
    const rx = touch ? Math.max(TILT_X[m], m === "hero" ? TOUCH_X : 0) : POINTER_X[m];
    const ry = touch ? Math.max(TILT_Y[m], m === "hero" ? TOUCH_Y : 0) : POINTER_Y[m];
    return [rx + SAFE_MIN, ry + SAFE_MIN];
  }

  function layout(state, early) {
    const cw = state.card.clientWidth;
    const ch = state.card.clientHeight;
    if (!cw || !ch) return;
    const [sw, sh] = state.source;
    const [px0, py0, px1, py1] = state.plate;
    const pw = px1 - px0;
    const ph = py1 - py0;
    const [rx, ry] = reach(state);
    // Uniform zoom: the plate covers the card plus the travel on every side.
    const s = Math.max((cw * (1 + 2 * rx)) / pw, (ch * (1 + 2 * ry)) / ph);
    const [fx, fy] = objectPosition(state.poster);
    const plx = (cw - pw * s) * fx; // plate origin inside the card
    const ply = (ch - ph * s) * fy;
    const left = plx - px0 * s; // source image origin inside the card
    const top = ply - py0 * s;
    const width = sw * s;
    const height = sh * s;
    const origin = `${(cw / 2 - left).toFixed(2)}px ${(ch / 2 - top).toFixed(2)}px`;
    [state.poster, ...state.layers.map(({ el }) => el)].forEach((el) => {
      el.style.left = left.toFixed(2) + "px";
      el.style.top = top.toFixed(2) + "px";
      el.style.width = width.toFixed(2) + "px";
      el.style.height = height.toFixed(2) + "px";
      el.style.transformOrigin = origin;
    });
    state.geo = {
      s, ox: left, oy: top, bw: cw, bh: ch, ax: 0, ay: 0, cw, ch,
      // Plate edges in card pixels, at rest.
      pl: plx, pt: ply, pr: plx + pw * s, pb: ply + ph * s,
      roomL: -plx, roomR: plx + pw * s - cw, roomT: -ply, roomB: ply + ph * s - ch
    };
    if (state.sky && !early) sizeSky(state);
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

  // Size the art before it decodes (the sky waits: its setup comes later).
  states.forEach((state) => layout(state, true));

  // Hero layers ship as data-src / data-srcset so the poster can win LCP
  // without four more 3840 requests racing it. Arm them after the poster
  // has painted (idle callback, short timeout fallback). Delphi keeps
  // ordinary lazy src/srcset and is watched immediately.
  function armDeferredLayers(state) {
    state.layers.forEach(({ el }) => {
      if (el.dataset.srcset) {
        el.srcset = el.dataset.srcset;
        delete el.dataset.srcset;
      }
      if (el.dataset.sizes) {
        el.sizes = el.dataset.sizes;
        delete el.dataset.sizes;
      }
      if (el.dataset.src) {
        el.src = el.dataset.src;
        delete el.dataset.src;
      }
    });
  }

  function watchLayers(state) {
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
  }

  function afterPoster(state, start) {
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      start();
    };
    const schedule = () => {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(run, { timeout: 450 });
      } else {
        setTimeout(run, 60);
      }
    };
    const poster = state.poster;
    if (poster && !(poster.complete && poster.naturalWidth > 0)) {
      poster.addEventListener("load", schedule, { once: true });
      poster.addEventListener("error", schedule, { once: true });
      setTimeout(schedule, 2500);
    } else {
      schedule();
    }
  }

  states.forEach((state) => {
    const deferred = state.layers.some(
      ({ el }) => el.dataset.src || el.dataset.srcset
    );
    if (!deferred) {
      watchLayers(state);
      return;
    }
    afterPoster(state, () => {
      armDeferredLayers(state);
      watchLayers(state);
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
      // Never let an edge of the plate into the card: after scaling about
      // the card centre and moving, the plate must still reach past every
      // side by at least a pixel.
      const cx = g.cw / 2;
      const cy = g.ch / 2;
      const xMax = -1 - cx - (g.pl - cx) * scale;
      const xMin = g.cw + 1 - cx - (g.pr - cx) * scale;
      const yMax = -1 - cy - (g.pt - cy) * scale;
      const yMin = g.ch + 1 - cy - (g.pb - cy) * scale;
      x = xMin > xMax ? (xMin + xMax) / 2 : Math.min(xMax, Math.max(xMin, x));
      y = yMin > yMax ? (yMin + yMax) / 2 : Math.min(yMax, Math.max(yMin, y));
    }
    return { x, y, scale };
  }

  // Bird (sx, sy) in source pixels → CSS pixels inside the card, matching drawSky.
  function cardOf(state, sx, sy, depth) {
    const g = state.geo;
    if (!g) return { x: 0, y: 0 };
    const o = reducedMotion.matches ? { x: 0, y: 0, scale: 1 } : offsetAt(state, depth);
    const x = g.ox + sx * g.s;
    const y = g.oy + sy * g.s;
    const cx = g.bw / 2;
    const cy = g.bh / 2;
    return {
      x: cx + (x - cx) * o.scale + o.x,
      y: cy + (y - cy) * o.scale + o.y
    };
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
    states.forEach((state) => layout(state));
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
      state.hand = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      kick();
    });
    state.card.addEventListener("pointerleave", () => {
      state.tx = 0;
      state.ty = 0;
      state.hand = null;
      kick();
    });
  });

  const TILT_RANGE = 20; // degrees
  const TILT_RECENTER = 5; // seconds for the resting angle to follow the hand
  const hero = states.find((state) => state.mode === "hero");
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let dragging = false;
  // listening: handler attached; active: real readings are arriving, so the
  // gyroscope drives the parallax and finger drags are off.
  const tilt = { listening: false, active: false, x: 0, y: 0, n0: null, last: 0, events: 0, permission: "n/a" };

  function setTouchTarget(nx, ny) {
    // nx, ny in -1..1
    if (!hero || reducedMotion.matches) return;
    const rect = hero.card.getBoundingClientRect();
    hero.tx = clamp(nx, -1, 1) * TOUCH_X * rect.width;
    hero.ty = clamp(ny, -1, 1) * TOUCH_Y * rect.height;
    kick();
  }

  if (hero) {
    // Horizontal finger drags move the layers when there is no gyroscope.
    // The card is touch-action: pan-y, so the browser keeps vertical
    // scrolling; a drag that turns out to be mostly vertical is ignored.
    let start = null;
    let axis = null;
    hero.card.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || reducedMotion.matches || tilt.active) return;
      start = { x: event.clientX, y: event.clientY };
      axis = null;
    });
    hero.card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "touch" || !start || tilt.active) return;
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
      if (!tilt.active) setTouchTarget(0, 0); // eases back to rest through the frame lerp
    };
    hero.card.addEventListener("pointerup", endDrag);
    hero.card.addEventListener("pointercancel", endDrag);
  }

  // Signed difference of two angles, in -180..180.
  const angleDiff = (a, b) => ((((a - b) % 360) + 540) % 360) - 180;

  function screenAngle() {
    // window.orientation is what iOS and Android phones report most
    // reliably; screen.orientation is the standard fallback.
    if (typeof window.orientation === "number") return window.orientation;
    const so = window.screen && window.screen.orientation;
    if (so && typeof so.angle === "number") return so.angle;
    return 0;
  }

  function onOrientation(event) {
    if (event.gamma == null || event.beta == null || reducedMotion.matches) return;
    const now = performance.now();
    const dt = tilt.last ? Math.min(0.25, (now - tilt.last) / 1000) : 0;
    tilt.last = now;
    tilt.events += 1;
    if (!tilt.active) {
      tilt.active = true;
      dragging = false;
      document.documentElement.classList.add("has-tilt");
    }
    hideHint();
    // Turn the device angles into screen axes: x is left-right across the
    // screen as it is held now, y is toward and away from the viewer.
    const angle = ((Math.round(screenAngle() / 90) * 90) % 360 + 360) % 360;
    let ax = event.gamma;
    let ay = event.beta;
    if (angle === 90) {
      ax = event.beta;
      ay = -event.gamma;
    } else if (angle === 270) {
      ax = -event.beta;
      ay = event.gamma;
    } else if (angle === 180) {
      ax = -event.gamma;
      ay = -event.beta;
    }
    // The first reading is the resting angle. It then slowly follows the
    // hand, so the phone can be held at any angle and drifts back to centre.
    if (tilt.n0 === null || tilt.n0.angle !== angle) tilt.n0 = { x: ax, y: ay, angle };
    else {
      const k = Math.min(1, dt / TILT_RECENTER);
      tilt.n0.x += angleDiff(ax, tilt.n0.x) * k;
      tilt.n0.y += angleDiff(ay, tilt.n0.y) * k;
    }
    const rawX = clamp(angleDiff(ax, tilt.n0.x) / TILT_RANGE, -1, 1);
    const rawY = clamp(angleDiff(ay, tilt.n0.y) / TILT_RANGE, -1, 1);
    // Low-pass the sensor; the frame lerp smooths it again.
    tilt.x += (rawX - tilt.x) * 0.3;
    tilt.y += (rawY - tilt.y) * 0.3;
    // Tilting the right edge down shows more of the right side: the near
    // layers move left, as with a pointer moving right.
    states.forEach((state) => {
      state.tx = -tilt.x * TILT_X[state.mode] * (state.w || state.card.clientWidth);
      state.ty = -tilt.y * TILT_Y[state.mode] * (state.h || state.card.clientHeight);
    });
    kick();
  }

  function listenTilt(onSilence) {
    if (tilt.listening) return;
    tilt.listening = true;
    window.addEventListener("deviceorientation", onOrientation);
    // No readings within about a second (no gyroscope, not allowed yet, or
    // blocked): finger drags and scrolling keep driving the parallax.
    window.setTimeout(() => {
      if (tilt.active) return;
      stopTilt();
      if (onSilence) onSilence();
    }, 1000);
  }

  function stopTilt() {
    window.removeEventListener("deviceorientation", onOrientation);
    tilt.listening = false;
    tilt.active = false;
    document.documentElement.classList.remove("has-tilt");
  }

  const hint = document.querySelector(".tilt-hint");
  function hideHint() {
    if (!hint || hint.hidden || hint.classList.contains("is-done")) return;
    hint.classList.add("is-done");
    window.setTimeout(() => {
      hint.hidden = true;
    }, 700);
  }

  const coarse = window.matchMedia("(pointer: coarse)");
  if (states.length && "DeviceOrientationEvent" in window && coarse.matches && !reducedMotion.matches) {
    const D = window.DeviceOrientationEvent;
    // Listen straight away: Android and other browsers that need no
    // permission start sending readings, and nothing else is shown.
    listenTilt(() => {
      // Silent. iOS 13+ sends nothing until the page asks, and the request
      // must come from a tap: the first tap anywhere on the page asks. The
      // listeners are passive, so they never delay scrolling or the tap's
      // own action.
      if (typeof D.requestPermission !== "function") return;
      tilt.permission = "pending";
      if (hint) hint.hidden = false;
      let asking = false;
      const removeAsk = () => {
        document.removeEventListener("touchend", ask, true);
        document.removeEventListener("click", ask, true);
      };
      function ask() {
        if (asking || tilt.permission !== "pending") return;
        asking = true;
        let request;
        try {
          request = D.requestPermission();
        } catch (error) {
          request = Promise.reject(error);
        }
        Promise.resolve(request)
          .then((answer) => {
            tilt.permission = answer;
            removeAsk();
            if (answer === "granted") listenTilt(hideHint);
            else hideHint();
          })
          .catch(() => {
            // Not counted as a tap (for example the end of a scroll): the
            // next tap asks again.
          })
          .finally(() => {
            asking = false;
          });
      }
      // touchend and click carry the user activation Safari needs; touchstart
      // does not.
      document.addEventListener("touchend", ask, { capture: true, passive: true });
      document.addEventListener("click", ask, { capture: true, passive: true });
    });
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
      state.flock = { dir: -1, speed: 21, baseY: 450, t: rand() * 20, wait: 0, entered: false };
      state.mist = [
        { sy: 72, len: 230, gap: 2.8, lines: 5, speed: 2.4, depth: 0.06, off: 0.08, alpha: 0.2 },
        { sy: 196, len: 300, gap: 3, lines: 6, speed: 3.2, depth: 0.04, off: 0.66, alpha: 0.18 }
      ].map((m) => Object.assign({ wave: rand() * 10, x: null }, m));
    } else {
      // Two birds of prey riding a thermal over the valley at Delphi.
      // Positions are in the 3840×2558 source (the older 1246-wide numbers
      // × 3840/1246), so the pair circles in the open cream sky above the
      // valley instead of a sliver at the top-left corner.
      const HD = 3840 / 1246;
      state.birds = [
        { cx: 250 * HD, cy: 252 * HD, r: 110 * HD, period: 34, span: 28, depth: 0.24, a: 0.5, climb: 96 * HD, wander: 40 * HD, liftAmp: 22 * HD },
        { cx: 290 * HD, cy: 272 * HD, r: 74 * HD, period: 27, span: 21, depth: 0.16, a: 3.6, climb: 74 * HD, wander: 40 * HD, liftAmp: 22 * HD }
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
    f.baseY = 400 + rand() * 100; // below sticky nav; mid open-sky band of plate
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
      // 17i: shy away from the pointer — bank off and dart a little.
      let scare = 0;
      if (state.hand && state.geo) {
        const p = cardOf(state, b.x, b.y, b.depth);
        const dx = p.x - state.hand.x;
        const dy = p.y - state.hand.y;
        const d = Math.hypot(dx, dy) || 1;
        const R = 140;
        if (d < R) {
          scare = 1 - d / R;
          const push = 260 * scare * scare;
          ax += (dx / d) * push;
          ay += (dy / d) * push;
          b.mix = Math.max(b.mix || 0, 0.45 + 0.55 * scare);
        }
      }
      const ovx = b.vx;
      const ovy = b.vy;
      b.vx += ax * dt;
      b.vy += ay * dt;
      const sp = Math.hypot(b.vx, b.vy);
      const lo = f.speed * 0.7;
      const hi = f.speed * (scare > 0.15 ? 2.3 : 1.35);
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
      b.lift = (b.liftAmp || 22) * Math.sin((b.t / b.climb) * Math.PI * 2 + b.period);
      b.cxNow = b.cx + Math.sin(skyClock * 0.02 + b.period) * (b.wander || 40);
      let sx = b.cxNow + Math.cos(b.a) * b.r;
      let sy = b.cy - b.lift + Math.sin(b.a) * b.r * 0.22;
      // Nearer half of the circle reads a little larger.
      b.near = Math.sin(b.a);
      // 17i: glide off the pointer, then ease back onto the thermal.
      if (b.fleeX === undefined) {
        b.fleeX = 0;
        b.fleeY = 0;
      }
      let wantX = 0;
      let wantY = 0;
      if (state.hand && state.geo) {
        const p = cardOf(state, sx + b.fleeX, sy + b.fleeY, b.depth);
        const dx = p.x - state.hand.x;
        const dy = p.y - state.hand.y;
        const d = Math.hypot(dx, dy) || 1;
        const R = 150;
        if (d < R) {
          const k = 1 - d / R;
          const push = (110 / Math.max(state.geo.s, 1e-6)) * k * k;
          wantX = (dx / d) * push;
          wantY = (dy / d) * push;
          b.mix = Math.max(b.mix || 0, 0.5 + 0.5 * k);
        }
      }
      const ease = Math.min(1, dt * 7);
      b.fleeX += (wantX - b.fleeX) * ease;
      b.fleeY += (wantY - b.fleeY) * ease;
      sx += b.fleeX;
      sy += b.fleeY;
      b.x = sx;
      b.y = sy;
      const vx = -Math.sin(b.a);
      b.dirNow = vx < 0 ? -1 : 1;
      // Banked into the circle all the way round: the wing on the inside of
      // the turn dips, and the bank is seen most side-on at the ends.
      b.roll = 0.55 * Math.cos(b.a) * -b.dirNow;
      if (wantX || wantY) b.roll = clamp(b.roll + wantX * 0.0012, -0.75, 0.75);
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
    const base = clamp(span * 0.055, 0.75, 2.1); // stroke width at the shoulder, px (raised with 16d scale)
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
    // Bird CSS size follows plate zoom (g.s). When a tall hero crops the
    // plate to a narrow visible width, ease that down a little so gulls stay
    // a steady share of the *visible* scene — continuous in visW, no 600px cliff.
    // Hero BOOST 3.0 (16d). Delphi 17h: same 3.0, plus a pixel floor so the
    // pair stays readable on a narrow phone plate (width-locked aspect).
    const visW = g.cw / Math.max(g.s, 1e-6);
    const crop = clamp(0.84 + 0.18 * ((visW - 900) / 2300), 0.84, 1.02);
    const BOOST = 3.0;
    const plateScale = g.s * crop * BOOST;
    const ordered = state.birds.slice().sort((a, b) => a.depth - b.depth);
    ordered.forEach((b) => {
      const soar = state.mode !== "hero";
      const near = soar ? 1 + 0.08 * b.near : 1;
      const p = place(b.x, b.y, b.depth);
      // Farther birds are paler, as the far city is paler than the temple.
      const alpha = (soar ? 0.48 : 0.32) + b.depth * 1.0;
      // Soft floor: hero 6px; Delphi 24px so raptors do not shrink to specks.
      const floor = soar ? 24 : 6;
      drawBird(ctx, p.x, p.y, Math.max(floor, b.span * plateScale * p.k * near), b, alpha, soar);
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
        tx: st.tx, ty: st.ty, px: st.px, py: st.py, ready: st.ready, tilt: { active: tilt.active, listening: tilt.listening, permission: tilt.permission, x: tilt.x, y: tilt.y, events: tilt.events, n0: tilt.n0 }, dragging,
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
    },
    placeFlock(mode, plateX, plateY) {
      // Pin birds in plate pixels for screenshots (hero flock or Delphi pair).
      skyStates.forEach((state) => {
        if (state.mode !== mode || !state.birds) return;
        if (state.mode === "hero" && state.flock) {
          state.flock.entered = true;
          state.flock.wait = 0;
          state.flock.baseY = plateY;
          state.birds.forEach((b) => {
            b.x = plateX + (b.slot ? b.slot.x : 0);
            b.y = plateY + (b.slot ? b.slot.y : 0);
            b.vx = (state.flock.dir || -1) * state.flock.speed;
            b.vy = 0;
            b.roll = 0;
            b.heading = 0;
            b.amt = 0;
            b.mix = 0;
            b.glide = 2;
          });
        } else {
          state.birds.forEach((b, i) => {
            b.x = plateX + i * 36;
            b.y = plateY + i * 10;
            b.near = 0.5;
            b.dirNow = 1;
            b.roll = 0.1;
            b.amt = 0;
            b.mix = 0;
            b.glide = 4;
          });
        }
      });
      drawSkyOnce();
    },
    birdScale(mode) {
      const st = states.find((x) => x.mode === mode);
      if (!st || !st.geo) return null;
      const g = st.geo;
      const visW = g.cw / Math.max(g.s, 1e-6);
      const crop = clamp(0.84 + 0.18 * ((visW - 900) / 2300), 0.84, 1.02);
      const BOOST = 3.0;
      return { s: g.s, visW, crop, boost: BOOST, plateScale: g.s * crop * BOOST, cw: g.cw, ch: g.ch };
    }
  };
}

initMenus();
initMobileNav();
initNotes();
initVisit();
initParallax();
