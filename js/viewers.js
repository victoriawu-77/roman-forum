/* Landmark viewers: four spatial views that replace the flat notes sheet
   for the four #explore landmarks. Only transform / opacity are animated. */
(() => {
  const ORDER = ["floor", "saturn", "arch", "julia"];
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  const V = "?v=17j-ink5";
  const TOUCH = matchMedia("(hover: none), (pointer: coarse), (max-width: 640px)").matches;
  const HINT = {
    floor: "Drag to turn the plan. Tap a marker to go there.",
    saturn: TOUCH
      ? "Drag across the columns, or tilt the phone, to step around them."
      : "Move the pointer, or tilt the phone, to step around the columns.",
    arch: TOUCH
      ? "Drag upward to walk through the arch at eye level."
      : "Scroll or drag to walk forward through the arch at eye level.",
    julia: TOUCH
      ? "Drag along the steps. Tap a ring to read a game board."
      : "Scroll or drag along the steps. Tap a ring to read a game board."
  };
  /* near/mid layers are raster pen-ink PNGs (v2); board SVGs stay vector */
  const BOARDS = [
    { x: 21, y: 73, cap: "A rota — eight spokes in a circle, a three-in-a-row game for two.",
      d: `<circle class="ink" stroke-width="3" cx="100" cy="100" r="88"/>` + [0, 45, 90, 135].map(a => `<line class="ink" stroke-width="2.4" x1="${100 + 88 * Math.cos(a * Math.PI / 180)}" y1="${100 + 88 * Math.sin(a * Math.PI / 180)}" x2="${100 - 88 * Math.cos(a * Math.PI / 180)}" y2="${100 - 88 * Math.sin(a * Math.PI / 180)}"/>`).join("") + `<circle class="ink" stroke-width="2" cx="100" cy="100" r="16"/>` },
    { x: 54, y: 74, cap: "Duodecim scripta — three rows of twelve, raced with dice.",
      d: [0, 1, 2].map(r => Array.from({ length: 12 }, (_, c) => `<circle class="ink" stroke-width="2" cx="${16 + c * 15.3 + (c > 5 ? 6 : 0)}" cy="${62 + r * 38}" r="5.5"/>`).join("")).join("") + `<path class="ink" stroke-width="1.6" d="M104 40V170"/>` },
    { x: 83, y: 72, cap: "Terni lapilli — a scratched square, three stones each.",
      d: `<rect class="ink" stroke-width="3" x="22" y="22" width="156" height="156"/><path class="ink" stroke-width="2.4" d="M22 22 178 178M178 22 22 178M100 22V178M22 100H178"/>` }
  ];

  /* ---------- markup ---------- */
  /* Responsive plates: same art as 3840 masters, 1280/1920 for phone + typical desktop.
     Progressive: primary plate paints first; far/secondary layers hydrate after. */
  const plate = (base, w = 3840, h = 2160, sizes = "100vw") => {
    const stem = `assets/viewers/${base}`;
    /* src fallback = 1280 so WebKit does not also fetch a competing 1920 default */
    return `data-src="${stem}-1280.webp${V}" data-srcset="${stem}-1280.webp${V} 1280w, ${stem}-1920.webp${V} 1920w, ${stem}.webp${V} ${w}w" data-sizes="${sizes}" width="${w}" height="${h}" decoding="async" alt=""`;
  };
  const dlg = document.createElement("dialog");
  dlg.className = "vw";
  dlg.setAttribute("aria-labelledby", "vw-title");
  dlg.innerHTML = `
    <div class="vw-stage" id="vw-stage">
      <div class="vw-scene" data-s="floor"><div class="fl-wrap"><div class="fl-plane is-live">
        <img ${plate("floor-plan", 3072, 2304, "min(86vw, 112vh)")} data-pri="1">
        ${[["arch", 13, 29, "Arch"], ["saturn", 18, 53, "Temple of Saturn"], ["floor", 56, 52, "The square"], ["julia", 47, 80, "Basilica Julia"]]
          .map(([k, x, y, l]) => `<div class="fl-pin" style="left:${x}%;top:${y}%"><div class="fl-post"><button type="button" data-go="${k}">${l}</button></div></div>`).join("")}
      </div></div></div>
      <div class="vw-scene" data-s="saturn">
        <div class="vw-layer sa-far" data-d="0.12"><img ${plate("saturn-far")} data-pri="3"></div>
        <div class="vw-layer sa-layer sa-mid" data-d="0.4"><img ${plate("saturn-mid")} data-pri="2"></div>
        <div class="vw-layer sa-layer sa-near" data-d="1"><img ${plate("saturn-near")} data-src-port="assets/viewers/saturn-near-port-1280.webp${V}" data-srcset-port="assets/viewers/saturn-near-port-1280.webp${V} 1280w, assets/viewers/saturn-near-port-1920.webp${V} 1920w, assets/viewers/saturn-near-port.webp${V} 3840w" data-pri="1"></div>
      </div>
      <div class="vw-scene" data-s="arch">
        <div class="ar-dolly">
          <div class="vw-layer ar-beyond"><img ${plate("arch-beyond")} data-pri="2"></div>
          <div class="vw-layer ar-face"><img ${plate("arch-face")} data-pri="1"></div>
        </div>
      </div>
      <div class="vw-scene" data-s="julia">
        <div class="vw-layer ju-track"><img ${plate("julia-pano")} data-pri="1">
          ${BOARDS.map((b, i) => `<button type="button" class="ju-spot" data-board="${i}" style="left:${b.x}%;top:${b.y}%" aria-label="Game board ${i + 1}"></button>`).join("")}
        </div>
        <div class="vw-layer ju-near"><img ${plate("julia-near", 3840, 1010)} data-pri="2"></div>
        <div class="ju-loupe" role="dialog" aria-label="Game board"><button type="button" data-loupe-close>Back</button><svg viewBox="0 0 200 200"></svg><p></p></div>
      </div>
    </div>
    <div class="vw-top"><span class="vw-count" id="vw-count"></span><button type="button" class="vw-close" data-close>Close</button></div>
    <div class="vw-meter"><i></i></div>
    <div class="vw-notes"><h2 id="vw-title"></h2><p id="vw-body"></p><p class="vw-hint" id="vw-hint"></p></div>
    <div class="vw-nav"><button type="button" data-step="-1">← Previous</button><button type="button" data-step="1">Next →</button></div>`;
  document.body.appendChild(dlg);

  const $ = (s) => dlg.querySelector(s);
  const stage = $("#vw-stage");
  const meter = $(".vw-meter i");
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let cur = null, raf = 0;
  const st = { tilt: 0, rot: 0, tTilt: 0, tRot: 0, cx: 0, cy: 0, tx: 0, ty: 0, p: 0, tp: 0, gyro: false, last: 0 };

  /* portrait frames are taller than the 16:9 near plate: swap in the plate with
     extended foreground (same top 2160 rows + inked ground below) so the nearest
     layer always reaches past the stage bottom, incl. parallax travel */
  const pickSrc = (im) => {
    const port = dlg.classList.contains("is-port") && im.dataset.srcPort;
    return port || im.dataset.srcLand || im.dataset.src;
  };
  const pickSrcset = (im) => {
    const port = dlg.classList.contains("is-port") && im.dataset.srcsetPort;
    return port || im.dataset.srcsetLand || im.dataset.srcset || "";
  };
  function applyPlate(im, { priority } = {}) {
    const src = pickSrc(im);
    const srcset = pickSrcset(im);
    const sizes = im.dataset.sizes || "100vw";
    if (!src && !srcset) return;
    im.sizes = sizes;
    if (srcset) {
      im.srcset = srcset;
      /* Keep src equal to the first (smallest) candidate so WebKit does not
         download a larger default src in parallel with the srcset choice. */
      const fallback = srcset.split(",")[0].trim().split(/\s+/)[0];
      if (im.getAttribute("src") !== fallback) im.src = fallback;
    } else {
      im.removeAttribute("srcset");
      if (im.getAttribute("src") !== src) im.src = src;
    }
    im.decoding = "async";
    if (priority) im.fetchPriority = priority;
    im.removeAttribute("data-src");
  }
  function hydrateScene(sc, { primaryOnly = false } = {}) {
    const imgs = [...sc.querySelectorAll("img[data-src], img[src]")];
    const pending = imgs.filter((im) => im.dataset.src);
    const pri = (im) => +(im.dataset.pri || 9);
    pending.sort((a, b) => pri(a) - pri(b));
    const first = pending.filter((im) => pri(im) <= 1);
    const rest = pending.filter((im) => pri(im) > 1);
    first.forEach((im) => applyPlate(im, { priority: "high" }));
    if (primaryOnly) return rest;
    rest.forEach((im) => applyPlate(im, { priority: "low" }));
    return [];
  }

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
            if (!img.naturalWidth) throw new Error("plate did not decode");
          })
        : undefined
    );
  }

  /* v17j-ink5: ONE hatch of the primary plate; secondaries stay hidden until
     decoded + primary drawn, then a quiet opacity fade (no per-plate hatch). */
  function inkScene(sc) {
    const imgs = [...sc.querySelectorAll(".vw-layer img, .fl-plane > img")];
    const pri = (im) => +(im.dataset.pri || 9);
    const primary = imgs.filter((im) => pri(im) <= 1);
    const secondary = imgs.filter((im) => pri(im) > 1);
    let primaryDrawn = false;
    const pendingShow = [];

    const showSecondary = (im) => {
      im.classList.add("is-shown");
    };

    const maybeShowSecondaries = () => {
      if (!primaryDrawn) return;
      pendingShow.splice(0).forEach(showSecondary);
      secondary.forEach((im) => {
        if (im.naturalWidth > 0 && !im.classList.contains("is-shown")) {
          showSecondary(im);
        }
      });
    };

    imgs.forEach((im) => {
      im.classList.remove(
        "is-ink",
        "is-ink-done",
        "is-plate-draw",
        "is-plate-drawn",
        "is-plate-primary",
        "is-plate-secondary",
        "is-shown"
      );
    });
    primary.forEach((im) => im.classList.add("is-plate-primary"));
    secondary.forEach((im) => im.classList.add("is-plate-secondary"));

    const waitArmed = (im, fn) => {
      if (im.dataset.src && !im.getAttribute("src")) {
        const poll = () => {
          if (im.getAttribute("src") || !im.dataset.src) fn();
          else setTimeout(poll, 40);
        };
        poll();
      } else fn();
    };

    primary.forEach((im) => {
      waitArmed(im, () => {
        whenDecoded(im)
          .then(() => {
            if (RM.matches) {
              im.classList.add("is-plate-drawn");
              primaryDrawn = true;
              maybeShowSecondaries();
              return;
            }
            im.classList.add("is-plate-draw");
            const done = (ev) => {
              if (
                ev &&
                ev.animationName &&
                String(ev.animationName).indexOf("plateHatch") === -1
              ) {
                return;
              }
              im.removeEventListener("animationend", done);
              im.classList.add("is-plate-drawn");
              im.classList.remove("is-plate-draw");
              primaryDrawn = true;
              maybeShowSecondaries();
            };
            im.addEventListener("animationend", done);
            setTimeout(done, 2200);
          })
          .catch(() => {
            primaryDrawn = true;
            maybeShowSecondaries();
          });
      });
    });

    if (!primary.length) {
      primaryDrawn = true;
    }

    secondary.forEach((im) => {
      waitArmed(im, () => {
        whenDecoded(im)
          .then(() => {
            if (primaryDrawn) showSecondary(im);
            else pendingShow.push(im);
          })
          .catch(() => {});
      });
    });
  }

  function fitPortrait() {
    const port = innerWidth < innerHeight;
    dlg.classList.toggle("is-port", port);
    dlg.querySelectorAll("img[data-src-port]").forEach((im) => {
      if (!im.dataset.srcLand) im.dataset.srcLand = im.dataset.src || im.getAttribute("src");
      if (!im.dataset.srcsetLand && im.dataset.srcset) im.dataset.srcsetLand = im.dataset.srcset;
      if (im.getAttribute("src")) {
        const u = pickSrc(im), ss = pickSrcset(im);
        if (im.getAttribute("src") !== u) im.src = u;
        if (ss) im.srcset = ss;
      }
    });
  }
  addEventListener("resize", fitPortrait);
  function open(k) {
    fitPortrait();
    cur = k;
    dlg.dataset.k = k;
    let deferred = [];
    dlg.querySelectorAll(".vw-scene").forEach((s) => {
      const on = s.dataset.s === k;
      s.classList.toggle("is-on", on);
      if (on) deferred = hydrateScene(s, { primaryOnly: true });
    });
    /* paint primary plate first; hydrate far layers on the next frames so one
       open does not contend all 3840s on the network at once */
    if (deferred.length) {
      const kick = () => deferred.forEach((im) => applyPlate(im, { priority: "low" }));
      if (typeof requestIdleCallback === "function") requestIdleCallback(kick, { timeout: 220 });
      else setTimeout(kick, 48);
    }
    const onScene = dlg.querySelector(".vw-scene.is-on");
    if (onScene) inkScene(onScene);
    $("#vw-count").textContent = `${["i", "ii", "iii", "iv"][ORDER.indexOf(k)]} / iv`;
    $("#vw-title").textContent = notes[k].title;
    $("#vw-body").textContent = notes[k].body;
    $("#vw-hint").textContent = RM.matches ? "Motion is reduced: a still, layered view." : HINT[k];
    $(".ju-loupe").classList.remove("is-on");
    dlg.querySelectorAll("[data-go]").forEach((b) => b.setAttribute("aria-current", b.dataset.go === k));
    // reset scene state
    Object.assign(st, { tilt: 0, rot: 0, tTilt: 56, tRot: -16, cx: 0, cy: 0, tx: 0, ty: 0, p: 0, tp: 0 });
    if (matchMedia("(max-width: 640px)").matches) { st.tTilt = 48; st.tRot = -2; }
    if (RM.matches) { st.tilt = st.tTilt; st.rot = st.tRot; }
    if (!dlg.open) { dlg.showModal(); requestAnimationFrame(() => dlg.classList.add("is-in")); }
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }

  function close() { dlg.classList.remove("is-in"); setTimeout(() => dlg.open && dlg.close(), RM.matches ? 0 : 300); }
  dlg.addEventListener("close", () => { dlg.classList.remove("is-in"); cancelAnimationFrame(raf); cur = null; });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); if ($(".ju-loupe.is-on")) return $(".ju-loupe").classList.remove("is-on"); close(); });

  function tick(t) {
    const k = RM.matches ? 1 : 0.085;
    const sc = dlg.querySelector(".vw-scene.is-on");
    if (cur === "floor") {
      st.tilt = lerp(st.tilt, st.tTilt, k * 0.7); st.rot = lerp(st.rot, st.tRot, k * 0.7);
      sc.querySelector(".fl-plane").style.transform = `translate(-50%,-50%) rotateX(${st.tilt}deg) rotateZ(${st.rot}deg)`;
      sc.querySelectorAll(".fl-post").forEach((p) => (p.style.transform = `rotateZ(${-st.rot}deg) rotateX(-90deg)`));
    } else if (cur === "saturn") {
      let tx = st.tx, ty = st.ty;
      if (!RM.matches && !st.gyro && t - st.last > 2500) { tx = Math.sin(t / 3200) * 0.7; ty = Math.cos(t / 4100) * 0.25; }
      if (RM.matches) tx = ty = 0;
      st.cx = lerp(st.cx, tx, k * 0.6); st.cy = lerp(st.cy, ty, k * 0.6);
      /* amp kept modest; layers oversized in CSS so extremes never bare an edge */
      const mx = innerWidth * 0.07, my = innerHeight * 0.045;
      sc.querySelectorAll(".vw-layer").forEach((l) => {
        const d = +l.dataset.d;
        l.style.transform = `translate3d(${-st.cx * mx * d}px,${-st.cy * my * d}px,0) scale(${1.04 + d * 0.03})`;
      });
    } else if (cur === "arch") {
      st.p = lerp(st.p, st.tp, k);
      const p = st.p, face = sc.querySelector(".ar-face"), beyond = sc.querySelector(".ar-beyond");
      const dolly = sc.querySelector(".ar-dolly");
      /* v17f: same two-depth walk as v17e (near gate faster than far plaza around
         eye-height VP 50% 64%), plus rest framing so the doorway sill (plate
         v≈0.912) sits on the stage bottom — no wide cobble band under the arch
         for the beyond-road to slide against. Sf scales both planes together
         around the VP; sill contact is still pinned with translateY. */
      dolly.style.transform = "none";
      const ZF = 1.0, ZB = 2.45, dMax = 0.68;
      const B0 = 1.1;
      const origin = 0.64, SILL_V = 0.912;
      const sillNy = archPlateNy(face, SILL_V);
      const botNy = archStageBotNy(face);
      const Sf = clamp((botNy - origin) / Math.max(1e-4, sillNy - origin), 1, 2.4);
      const d = p * dMax;
      const faceScale = Sf / (1 - d / ZF);
      const beyondScale = (B0 * Sf) / (1 - d / ZB);
      face.style.transform = `scale(${faceScale})`;
      face.style.opacity = String(clamp(1 - (p - 0.72) / 0.22, 0, 1));
      const faceSill = origin + (sillNy - origin) * faceScale;
      const beyondSill = origin + (sillNy - origin) * beyondScale;
      const dyPct = (faceSill - beyondSill) * 100;
      beyond.style.transform = `translateY(${dyPct.toFixed(3)}%) scale(${beyondScale})`;
      meter.style.transform = `scaleX(${p})`;
    } else if (cur === "julia") {
      st.p = lerp(st.p, st.tp, k);
      const tr = sc.querySelector(".ju-track"), nr = sc.querySelector(".ju-near");
      const tw = tr.offsetWidth, nw = innerWidth * 2.7;
      nr.style.width = nw + "px";
      tr.style.transform = `translate3d(${-st.p * (tw - innerWidth)}px,0,0)`;
      nr.style.transform = `translate3d(${innerWidth * 0.2 - st.p * (nw - innerWidth * 0.6)}px,0,0)`;
      meter.style.transform = `scaleX(${st.p})`;
    }
    raf = requestAnimationFrame(tick);
  }

  /* plate row → layer-box ny (0..1) for arch-face; cached per size + plateV.
     Used to pin the portal sill (≈0.912) so threshold stays on the road.
     Honours object-fit cover|contain (portrait cover framing in v17f). */
  let plateNyCache = {};
  function archPlateNy(face, plateV) {
    const im = face.querySelector("img"), W = face.offsetWidth, H = face.offsetHeight;
    const key = W + "x" + H + dlg.className + "@" + plateV + "@" + (im && getComputedStyle(im).objectFit);
    if (plateNyCache[key] != null) return plateNyCache[key];
    const cs = getComputedStyle(im), a = 16 / 9;
    const iw = im.offsetWidth, ih = im.offsetHeight;
    const fit = cs.objectFit || "contain";
    const rw = fit === "cover" ? Math.max(iw, ih * a) : Math.min(iw, ih * a), rh = rw / a;
    const py = (cs.objectPosition.split(" ")[1] || "50%");
    const top = py.endsWith("%") ? (ih - rh) * parseFloat(py) / 100 : parseFloat(py);
    let y = top + plateV * rh;                                   // in img box
    const m = cs.transform && cs.transform !== "none" ? new DOMMatrix(cs.transform) : null;
    if (m) { const oy = parseFloat(cs.transformOrigin.split(" ")[1]) || ih / 2; y = oy + (y - oy) * m.d + m.f; }
    const v = (im.offsetTop + y) / H;
    plateNyCache[key] = v;
    return v;
  }
  /* stage bottom as ny inside the face layer box (accounts for inset:-6%). */
  function archStageBotNy(face) {
    const scene = face.closest(".vw-scene");
    const H = face.offsetHeight;
    if (!scene || !H) return 1;
    return (scene.offsetHeight - face.offsetTop) / H;
  }
  addEventListener("resize", () => { plateNyCache = {}; });

  /* ---------- input ---------- */
  let drag = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    drag = { x: e.clientX, y: e.clientY, tilt: st.tTilt, rot: st.tRot, p: st.tp };
    stage.classList.add("is-drag"); stage.setPointerCapture(e.pointerId);
    if (cur === "saturn" && window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission && !st.asked) {
      st.asked = true; DeviceOrientationEvent.requestPermission().catch(() => {});
    }
  });
  stage.addEventListener("pointermove", (e) => {
    st.last = performance.now();
    if (cur === "saturn" && !st.gyro) {
      if (e.pointerType === "mouse" || drag) { st.tx = (e.clientX / innerWidth) * 2 - 1; st.ty = (e.clientY / innerHeight) * 2 - 1; }
    }
    if (!drag || RM.matches) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (cur === "floor") { st.tRot = drag.rot + dx * 0.25; st.tTilt = clamp(drag.tilt - dy * 0.15, 22, 66); }
    if (cur === "arch") st.tp = clamp(drag.p - (dy + dx) / (innerHeight * 1.4), 0, 1);
    if (cur === "julia") st.tp = clamp(drag.p - dx / (innerWidth * 1.6), 0, 1);
  });
  const end = () => { drag = null; stage.classList.remove("is-drag"); };
  stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);
  stage.addEventListener("wheel", (e) => {
    e.preventDefault(); if (RM.matches) return;
    const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) / 1400;
    if (cur === "arch" || cur === "julia") st.tp = clamp(st.tp + d, 0, 1);
    if (cur === "floor") st.tRot += d * 60;
  }, { passive: false });
  window.addEventListener("deviceorientation", (e) => {
    if (cur !== "saturn" || e.gamma == null || RM.matches) return;
    st.gyro = true; st.tx = clamp(e.gamma / 30, -1, 1); st.ty = clamp((e.beta - 45) / 30, -1, 1);
  });
  dlg.addEventListener("keydown", (e) => {
    if (!cur || RM.matches && /Arrow/.test(e.key)) return;
    const pan = cur === "arch" || cur === "julia";
    if (pan && /Arrow(Right|Down)/.test(e.key)) { st.tp = clamp(st.tp + 0.12, 0, 1); e.preventDefault(); }
    else if (pan && /Arrow(Left|Up)/.test(e.key)) { st.tp = clamp(st.tp - 0.12, 0, 1); e.preventDefault(); }
    else if (e.key === "ArrowRight" || e.key === "]") step(1);
    else if (e.key === "ArrowLeft" || e.key === "[") step(-1);
  });
  function step(n) { open(ORDER[(ORDER.indexOf(cur) + n + 4) % 4]); }
  dlg.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.close != null) close();
    else if (b.dataset.step) step(+b.dataset.step);
    else if (b.dataset.go) { if (b.dataset.go !== cur) open(b.dataset.go); }
    else if (b.dataset.board != null) {
      const bd = BOARDS[+b.dataset.board], lp = $(".ju-loupe");
      lp.querySelector("svg").innerHTML = bd.d; lp.querySelector("p").textContent = bd.cap; lp.classList.add("is-on");
    } else if (b.dataset.loupeClose != null) $(".ju-loupe").classList.remove("is-on");
  });

  /* take over the four landmark buttons before main.js opens the flat sheet */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-note]");
    if (!b || !ORDER.includes(b.dataset.note) || dlg.contains(b)) return;
    e.stopPropagation(); e.preventDefault();
    if (typeof closeMenus === "function") closeMenus();
    open(b.dataset.note);
  }, true);
  /* Warm the first midband plate once the list nears the viewport so the
     common first tap is not a cold 3840 fetch. */
  (function warmFloor() {
    const target = document.querySelector('.midband2, [data-note="floor"]');
    if (!target || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.type = "image/webp";
      link.href = `assets/viewers/floor-plan-1280.webp${V}`;
      link.imageSrcset = `assets/viewers/floor-plan-1280.webp${V} 1280w, assets/viewers/floor-plan-1920.webp${V} 1920w, assets/viewers/floor-plan.webp${V} 3072w`;
      link.imageSizes = "min(86vw, 112vh)";
      document.head.appendChild(link);
    }, { rootMargin: "200px 0px" });
    io.observe(target);
  })();
  window.__viewers = { open, state: st };
})();
