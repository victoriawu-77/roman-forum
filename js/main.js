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
  const states = cards.map((card) => ({
    card,
    mode: card.dataset.parallax,
    layers: Array.from(card.querySelectorAll(".art .layer")).map((el) => ({
      el,
      depth: parseFloat(el.dataset.depth) || 0
    })),
    px: 0,
    py: 0,
    tx: 0,
    ty: 0,
    scroll: 0,
    ready: false
  }));

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
    const art = state.card.querySelector(".art");
    Promise.all(state.layers.map(({ el }) => whenDecoded(el)))
      .then(() => {
        state.ready = true;
        art.classList.add("is-ready");
        measureScroll();
        apply(state);
      })
      .catch(() => {
        state.ready = false;
      });
  });

  // Pointer reach as a share of the card, for the nearest layer.
  const POINTER_X = { hero: 0.015, end: 0.01 };
  const POINTER_Y = { hero: 0.008, end: 0.006 };
  // Scroll reach as a share of the card height.
  const SCROLL = { hero: 0.08, end: 0.055 };

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

  function apply(state) {
    if (!state.ready) return;
    const reach = SCROLL[state.mode] * (state.h || 0) * state.scroll;
    state.layers.forEach(({ el, depth }) => {
      let x = state.px * depth;
      let y = state.py * depth;
      if (state.mode === "end") y += reach * depth; // nearer layers lead
      else y += reach * (1 - depth); // farther layers lag
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
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

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) reset();
    else onScroll();
  });

  if (reducedMotion.matches) reset();
  else onScroll();

  // Test hook: lets a screenshot script pin the pointer without real input.
  window.__parallax = {
    pointer(mode, dx, dy) {
      states.forEach((state) => {
        if (state.mode !== mode) return;
        const rect = state.card.getBoundingClientRect();
        state.tx = state.px = dx * -2 * POINTER_X[state.mode] * rect.width;
        state.ty = state.py = dy * -2 * POINTER_Y[state.mode] * rect.height;
        apply(state);
      });
    },
    update() {
      measureScroll();
      states.forEach(apply);
    }
  };
}

initMenus();
initMobileNav();
initNotes();
initVisit();
initParallax();
