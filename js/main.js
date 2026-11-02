/* Gold concept plates are the art. The supplied depth plates are a different
   drawing, so this page drifts the full composites instead of stacking them. */

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
  if (reducedMotion.matches) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const cards = document.querySelectorAll("[data-parallax]");
  const states = [];

  cards.forEach((card) => {
    const img = card.querySelector(".art img");
    states.push({
      card,
      img,
      tx: 0,
      ty: 0,
      cx: 0,
      cy: 0,
      mx: 0,
      my: 0
    });

    if (finePointer.matches) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const dx = (event.clientX - rect.left) / rect.width - 0.5;
        const dy = (event.clientY - rect.top) / rect.height - 0.5;
        const state = states.find((item) => item.card === card);
        state.mx = dx * -14;
        state.my = dy * -10;
        kick();
      });
      card.addEventListener("pointerleave", () => {
        const state = states.find((item) => item.card === card);
        state.mx = 0;
        state.my = 0;
        kick();
      });
    }
  });

  function scrollTargets() {
    states.forEach((state) => {
      const rect = state.card.getBoundingClientRect();
      const progress = (window.innerHeight * 0.5 - rect.top) / (window.innerHeight + rect.height);
      state.ty = progress * 36;
    });
  }

  let running = false;
  function frame() {
    if (reducedMotion.matches) {
      states.forEach((state) => {
        state.img.style.transform = "none";
      });
      running = false;
      return;
    }
    let moving = false;
    states.forEach((state) => {
      const targetX = state.mx;
      const targetY = state.my + state.ty;
      state.cx += (targetX - state.cx) * 0.08;
      state.cy += (targetY - state.cy) * 0.08;
      if (Math.abs(targetX - state.cx) > 0.05 || Math.abs(targetY - state.cy) > 0.05) {
        moving = true;
      }
      state.img.style.transform = `translate3d(${state.cx.toFixed(2)}px, ${state.cy.toFixed(2)}px, 0)`;
    });
    if (moving) requestAnimationFrame(frame);
    else running = false;
  }

  function kick() {
    scrollTargets();
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  kick();

  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    states.forEach((state) => {
      state.img.style.transform = "none";
    });
  });
}

initMenus();
initMobileNav();
initNotes();
initVisit();
initParallax();
