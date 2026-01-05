/* static/js/main.js (CLEAN — no duplicates) */

(function () {
  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(() => {
    // -----------------------------
    // Footer year
    // -----------------------------
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // -----------------------------
    // Mobile nav toggle
    // -----------------------------
    const navToggle = $("#navToggle");
    const siteNav = $("#siteNav");
    if (navToggle && siteNav) {
      navToggle.addEventListener("click", () => {
        siteNav.classList.toggle("open");
      });

      $$("#siteNav a").forEach((a) => {
        a.addEventListener("click", () => siteNav.classList.remove("open"));
      });
    }

    // -----------------------------
    // Theme toggle (dark/light)
    // -----------------------------
    const themeToggle = $("#themeToggle");
    const THEME_KEY = "yi_theme";

    const applyTheme = (mode) => {
      document.body.classList.toggle("light-mode", mode === "light");
      if (themeToggle) {
        themeToggle.innerHTML =
          mode === "light"
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>';
      }
    };

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.contains("light-mode");
        const next = isLight ? "dark" : "light";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
      });
    }

    // -----------------------------
    // Scroll-in animations
    // -----------------------------
    const animated = $$("[data-animate]");
    if (animated.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("animate-in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      animated.forEach((el) => io.observe(el));
    }

    // -----------------------------
    // Resume modal (UPDATED labels + descriptions; no "Product")
    // -----------------------------
    const resumeModal = $("#resumeModal");
    const resumeBackdrop = $("#resumeBackdrop");
    const resumeClose = $("#resumeClose");
    const resumeFrame = $("#resumeFrame");
    const resumeTitle = $("#resumeModalTitle");
    const resumeDesc = $("#resumeModalDesc");
    const resumeDownloadBtn = $("#resumeDownloadBtn");
    const resumeFallbackLink = $("#resumeFallbackLink");
    const resumeTriggers = $$("[data-resume-trigger]");
    const resumeTabs = $$(".resume-tab");

    const resumeMap = {
      embedded: {
        title: "Embedded Systems Resume",
        desc:
          "Embedded Linux (Yocto), C/C++ services/firmware, camera + sensor bring-up, real-time pipelines, and production validation/debugging.",
        url: "assets/resume/Yash_Ingle_Embedded.pdf",
      },
      fullstack: {
        title: "Software Engineering Resume",
        desc:
          "Backend + platform work: Python/Java APIs, databases (MySQL/MongoDB), worker queues, Docker, CI/CD, and reliability patterns (idempotency, retries, observability).",
        url: "assets/resume/Yash_Ingle_Fullstack.pdf",
      },
    };

    let activeResumeKey = "embedded";

    function setResume(which = "embedded") {
      if (!resumeModal) return;
      const key = resumeMap[which] ? which : "embedded";
      const cfg = resumeMap[key];
      activeResumeKey = key;

      if (resumeTitle) resumeTitle.textContent = cfg.title;
      if (resumeDesc) resumeDesc.textContent = cfg.desc;

      if (resumeDownloadBtn) {
        resumeDownloadBtn.href = cfg.url;
        resumeDownloadBtn.setAttribute("download", cfg.url.split("/").pop());
      }
      if (resumeFallbackLink) resumeFallbackLink.href = cfg.url;

      // Ensure iframe refresh when switching tabs
      if (resumeFrame) {
        resumeFrame.removeAttribute("src");
        resumeFrame.src = cfg.url;
      }

      resumeTabs.forEach((t) => {
        const on = t.dataset.resume === key;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
    }

    function openResume(which = "embedded") {
      if (!resumeModal) return;
      setResume(which);
      resumeModal.classList.add("open");
      resumeModal.setAttribute("aria-hidden", "false");
    }

    function closeResume() {
      if (!resumeModal) return;
      resumeModal.classList.remove("open");
      resumeModal.setAttribute("aria-hidden", "true");
      if (resumeFrame) resumeFrame.removeAttribute("src");
    }

    resumeTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        openResume(btn.getAttribute("data-resume-trigger") || "embedded");
      });
    });

    resumeTabs.forEach((tab) => {
      tab.addEventListener("click", () => setResume(tab.dataset.resume || "embedded"));
    });

    if (resumeBackdrop) resumeBackdrop.addEventListener("click", closeResume);
    if (resumeClose) resumeClose.addEventListener("click", closeResume);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeResume();
    });

    // -----------------------------
    // PROJECTS (Filter + Details) — single handler
    // -----------------------------
    const projectsRoot = $("#projects");
    if (projectsRoot) {
      const filterButtons = $$(".filter-btn", projectsRoot);
      const cards = $$(".project-card", projectsRoot);

      const applyFilter = (filter) => {
        cards.forEach((card) => {
          const cats = (card.dataset.category || "")
            .split(/\s+/)
            .filter(Boolean);
          const show = filter === "all" || cats.includes(filter);
          card.style.display = show ? "" : "none";
        });
      };

      // filter clicks
      filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          applyFilter(btn.dataset.filter || "all");
        });
      });

      // toggle label update without duplicating text
      function setToggleLabel(btn, isOpen) {
        const more = btn.getAttribute("data-more") || "Show details";
        const less = btn.getAttribute("data-less") || "Hide details";
        const next = isOpen ? less : more;

        // Update only the first text node (keep icon intact)
        let updated = false;
        btn.childNodes.forEach((n) => {
          if (!updated && n.nodeType === Node.TEXT_NODE) {
            n.textContent = next + " ";
            updated = true;
          }
        });

        // If no text node exists (rare), fallback safely:
        if (!updated) {
          btn.insertBefore(document.createTextNode(next + " "), btn.firstChild);
        }
      }

      // details toggle (event delegation)
      projectsRoot.addEventListener("click", (e) => {
        const toggle = e.target.closest("[data-project-toggle]");
        if (!toggle) return;

        const card = toggle.closest(".project-card");
        if (!card) return;

        const details = $(".project-details", card);
        if (!details) return;

        const isOpen = card.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        details.setAttribute("aria-hidden", String(!isOpen));
        setToggleLabel(toggle, isOpen);
      });

      // default
      applyFilter("all");
    }

    // -----------------------------
    // Typewriter / rotating line (safe no-op unless element exists)
    // Usage (HTML example):
    // <span id="heroRotate"
    //   data-type-rotate
    //   data-phrases="I build low-latency perception pipelines.,I bring up boards + sensors end-to-end.,I ship production-ready tooling for hardware teams."></span>
    // -----------------------------
    const typeEl =
      document.querySelector("[data-type-rotate]") || document.getElementById("heroRotate");

    if (typeEl) {
      const raw = typeEl.getAttribute("data-phrases") || "";
      const phrases = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (phrases.length) {
        typeEl.classList.add("typewriter-caret");

        let p = 0;
        let i = 0;
        let deleting = false;

        const TYPE_MS = 26;      // typing speed
        const DELETE_MS = 18;    // backspace speed
        const HOLD_MS = 950;     // pause at full phrase
        const GAP_MS = 260;      // pause before typing next

        const tick = () => {
          const text = phrases[p];
          if (!deleting) {
            i++;
            typeEl.textContent = text.slice(0, i);
            if (i >= text.length) {
              deleting = true;
              setTimeout(tick, HOLD_MS);
              return;
            }
            setTimeout(tick, TYPE_MS);
          } else {
            i--;
            typeEl.textContent = text.slice(0, i);
            if (i <= 0) {
              deleting = false;
              p = (p + 1) % phrases.length;
              setTimeout(tick, GAP_MS);
              return;
            }
            setTimeout(tick, DELETE_MS);
          }
        };

        tick();
      }
    }
  });
})();

// ===== Hero Typed Rotator (resume-accurate phrases) =====
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("heroType");
  if (!el) return;

  // Keep these tightly aligned to your resume (max 5)
  const phrases = [
    "embedded systems software (Linux + C/C++)",
    "computere vision pipelines",
    "backend APIs + cloud (Python, CI/CD, DB)",
    "MCU firmware for hardware"
  ];

  // Respect reduced motion preferences
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    el.textContent = phrases[0];
    return;
  }

  let i = 0;          // phrase index
  let j = 0;          // char index
  let deleting = false;

  const TYPE_SPEED = 26;       // smaller = faster typing
  const DELETE_SPEED = 17;     // smaller = faster deleting
  const HOLD_FULL = 1100;      // pause on full phrase
  const HOLD_EMPTY = 250;      // pause before typing next

  function tick() {
    const current = phrases[i];

    if (!deleting) {
      j++;
      el.textContent = current.slice(0, j);

      if (j >= current.length) {
        deleting = true;
        setTimeout(tick, HOLD_FULL);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      j--;
      el.textContent = current.slice(0, j);

      if (j <= 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        setTimeout(tick, HOLD_EMPTY);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  // Start
  el.textContent = "";
  tick();
});


/* =========================================================
   Projects: Collapsed Preview + Expand/Collapse
   UPDATED — replaces your old IIFE
   Paste at END of main.js
   ========================================================= */
(function () {
  const section = document.querySelector("[data-projects-section]");
  if (!section) return;

  const clip = section.querySelector("[data-projects-clip]");
  const buttons = Array.from(section.querySelectorAll("[data-projects-expand-btn]"));
  if (!clip || buttons.length === 0) return;

  const setBtnState = (expanded) => {
    buttons.forEach((btn) => {
      const more = btn.getAttribute("data-more") || "Show all projects";
      const less = btn.getAttribute("data-less") || "Show fewer projects";
      const next = expanded ? less : more;

      btn.setAttribute("aria-expanded", expanded ? "true" : "false");

      const icon = btn.querySelector("i");
      if (icon) icon.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";

      // Replace ONLY the first text node (preserve icon)
      const textNode = Array.from(btn.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.nodeValue = next + " ";
      } else {
        btn.insertBefore(document.createTextNode(next + " "), btn.firstChild);
      }
    });
  };

  const firstRowBottom = (cards) => {
    if (!cards.length) return 0;

    const top0 = cards[0].offsetTop;
    const rowCards = cards.filter((c) => c.offsetTop === top0);

    const bottom = rowCards.reduce((m, c) => Math.max(m, c.offsetTop + c.offsetHeight), 0);
    return bottom;
  };

  const syncHeights = () => {
    const expandedH = clip.scrollHeight;
    section.style.setProperty("--projects-expanded-h", expandedH + "px");

    const cards = Array.from(section.querySelectorAll(".projects-grid > .project-card--tab"))
      .filter((c) => c.offsetParent !== null); // visible cards only

    if (!cards.length) {
      section.style.setProperty("--projects-collapsed-h", Math.min(expandedH, 900) + "px");
      return;
    }

    const rowBottom = firstRowBottom(cards);
    const buffer = 140;
    section.style.setProperty("--projects-collapsed-h", (rowBottom + buffer) + "px");
  };

  const expand = () => {
    syncHeights();
    section.classList.remove("projects-collapsed");
    section.classList.add("projects-expanded");
    setBtnState(true);

    window.setTimeout(syncHeights, 450);
  };

  const collapse = () => {
    syncHeights();
    section.classList.remove("projects-expanded");
    section.classList.add("projects-collapsed");
    setBtnState(false);

    const y = section.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Initial state
  section.classList.add("projects-collapsed");
  section.classList.remove("projects-expanded");
  setBtnState(false);

  // Click handlers
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isExpanded = section.classList.contains("projects-expanded");
      if (isExpanded) collapse();
      else expand();
    });
  });

  // Keep heights correct on resize / orientation change
  window.addEventListener("resize", () => syncHeights());

  // When filters or details toggles change layout while expanded, resync
  section.addEventListener("click", (e) => {
    const t = e.target.closest("[data-project-toggle], .filter-btn");
    if (!t) return;
    if (!section.classList.contains("projects-expanded")) return;
    window.setTimeout(syncHeights, 350);
  });

  // One more pass after images/fonts load
  window.addEventListener("load", () => syncHeights());
})();

// EXPERIENCE: ensure company links open safely in a new tab
document.querySelectorAll('#experience a[data-company-link]').forEach(a => {
  if (!a.getAttribute('href') || a.getAttribute('href') === '#') return;
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener');
});


/* =========================================================
   EDUCATION TABS (safe, scoped)
   Paste at END of static/js/main.js
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const eduRoot = document.getElementById("education");
  if (!eduRoot) return;

  const tabs = eduRoot.querySelectorAll("[data-edu-tab]");
  const panes = eduRoot.querySelectorAll("[data-edu-pane]");
  if (!tabs.length || !panes.length) return;

  const setActive = (key) => {
    tabs.forEach((t) => {
      const on = (t.getAttribute("data-edu-tab") === key);
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });

    panes.forEach((p) => {
      const on = (p.getAttribute("data-edu-pane") === key);
      p.classList.toggle("is-active", on);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.getAttribute("data-edu-tab");
      if (key) setActive(key);
    });
  });

  // default
  setActive("csai");
});


/* =========================================================
   EXPERIENCE — Show more / Show less (projects-style)
   Paste at VERY END of main.js
   ========================================================= */
(function () {
  const expRoot = document.getElementById("experience");
  if (!expRoot) return;

  function setToggleLabel(btn, isOpen) {
    const more = btn.getAttribute("data-more") || "Show more";
    const less = btn.getAttribute("data-less") || "Show less";
    const next = isOpen ? less : more;

    // Update only the first text node (keep icon intact)
    let updated = false;
    btn.childNodes.forEach((n) => {
      if (!updated && n.nodeType === Node.TEXT_NODE) {
        n.textContent = next + " ";
        updated = true;
      }
    });
    if (!updated) btn.insertBefore(document.createTextNode(next + " "), btn.firstChild);
  }

  expRoot.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-exp-toggle]");
    if (!btn) return;

    const wrap = btn.closest(".exp-collapsible");
    if (!wrap) return;

    const collapsed = wrap.getAttribute("data-collapsed") !== "false";
    const nextOpen = collapsed; // if collapsed -> open

    wrap.setAttribute("data-collapsed", nextOpen ? "false" : "true");
    btn.setAttribute("aria-expanded", String(nextOpen));

    const details = wrap.querySelector(".exp-details");
    if (details) details.setAttribute("aria-hidden", String(!nextOpen));

    setToggleLabel(btn, nextOpen);
  });
})();

/* =========================================================
   EXPERIENCE — slightly stagger the scroll-in (slick “node added” feel)
   Safe: only touches #experience items
   Paste at VERY END of main.js
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const items = Array.from(document.querySelectorAll("#experience .timeline-item[data-animate]"));
  items.forEach((el, idx) => {
    // subtle stagger; cap so it never feels slow
    el.style.transitionDelay = `${Math.min(idx * 80, 280)}ms`;
  });
});
