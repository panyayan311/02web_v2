(() => {
  "use strict";

  if (!document.body.classList.contains("philosophy-page")) return;

  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const revealItems = [...document.querySelectorAll("[data-vx-reveal]")];
  const evolution = document.querySelector("[data-evolution]");
  const evolutionSteps = [...document.querySelectorAll("[data-evolution-step]")];
  const mission = document.querySelector("[data-mission]");
  const method = document.querySelector("[data-method]");
  const founder = document.querySelector("[data-founder-quote]");
  const quoteLines = [...document.querySelectorAll("[data-quote-line]")];
  const heatAreas = [...document.querySelectorAll(".vx-hero, [data-vx-heat-area]")];
  const valueRows = [...document.querySelectorAll("[data-value-row]")];
  const pendingTimers = new Set();
  const completed = new WeakSet();

  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      pendingTimers.delete(timer);
      callback();
    }, delay);
    pendingTimers.add(timer);
  };

  const clearTimers = () => {
    pendingTimers.forEach((timer) => window.clearTimeout(timer));
    pendingTimers.clear();
  };

  const showAll = () => {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    evolutionSteps.forEach((step) => step.classList.remove("is-active"));
    evolutionSteps.at(-1)?.classList.add("is-active");
    evolution?.style.setProperty("--evolution-travel", "calc(100% - 2.5rem)");
    evolution?.style.setProperty("--evolution-travel-mobile", "calc(100% - 2.5rem)");
    mission?.classList.add("is-visible");
    method?.classList.add("is-complete");
    quoteLines.forEach((line) => line.classList.add("is-visible"));
    founder?.classList.add("door-open");
  };

  const activateEvolution = () => {
    if (!evolution || completed.has(evolution)) return;
    completed.add(evolution);
    const line = evolution.querySelector(".evolution-line");

    const activate = (index) => {
      evolutionSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
      if (!line) return;
      const horizontal = window.innerWidth > 680;
      const distance = Math.max((horizontal ? line.clientWidth : line.clientHeight) - 40, 0);
      const travel = `${(distance * index / Math.max(evolutionSteps.length - 1, 1)).toFixed(1)}px`;
      evolution.style.setProperty(horizontal ? "--evolution-travel" : "--evolution-travel-mobile", travel);
    };

    activate(0);
    later(() => activate(1), 420);
    later(() => activate(2), 840);
  };

  const activateMission = () => {
    if (!mission || completed.has(mission)) return;
    completed.add(mission);
    mission.classList.add("is-visible");
  };

  const activateMethod = () => {
    if (!method || completed.has(method)) return;
    completed.add(method);
    method.classList.add("is-complete");
  };

  const activateFounder = () => {
    if (!founder || completed.has(founder)) return;
    completed.add(founder);
    quoteLines.forEach((line, index) => later(() => line.classList.add("is-visible"), index * 260));
    later(() => founder.classList.add("door-open"), 760);
  };

  const reveal = (target) => {
    target.classList.add("is-visible");
    if (target === evolution || target.closest?.("[data-evolution]")) activateEvolution();
    if (target === mission || target.closest?.("[data-mission]")) activateMission();
    if (target === method || target.closest?.("[data-method]")) activateMethod();
    if (target === founder || target.closest?.("[data-founder-quote]")) activateFounder();
  };

  if (reduceQuery.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    document.documentElement.classList.add("motion-ready");
    const observed = new Set([...revealItems, evolution, mission, method, founder].filter(Boolean));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        const passedAboveViewport = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !passedAboveViewport) return;
        reveal(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .16, rootMargin: "0px 0px -8%" });
    observed.forEach((item) => observer.observe(item));

    let scrollFrame = 0;
    const revealPassedItems = () => {
      observed.forEach((item) => {
        if (item.classList.contains("is-visible")) return;
        if (item.getBoundingClientRect().top >= window.innerHeight * .92) return;
        reveal(item);
        observer.unobserve(item);
      });
      scrollFrame = 0;
    };
    const requestPassedCheck = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(revealPassedItems);
    };
    window.addEventListener("scroll", requestPassedCheck, { passive: true });
    window.addEventListener("resize", requestPassedCheck);
    revealPassedItems();
  }

  valueRows.forEach((row) => {
    const clear = () => row.classList.remove("is-heated");
    row.addEventListener("pointerenter", () => row.classList.add("is-heated"));
    row.addEventListener("pointerleave", clear);
    row.addEventListener("focusin", () => row.classList.add("is-heated"));
    row.addEventListener("focusout", (event) => {
      if (!row.contains(event.relatedTarget)) clear();
    });
    row.addEventListener("pointermove", (event) => {
      if (!finePointerQuery.matches || reduceQuery.matches) return;
      const bounds = row.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 100;
      row.style.setProperty("--heat-x", `${Math.min(Math.max(x, 0), 100).toFixed(1)}%`);
    }, { passive: true });
  });

  heatAreas.forEach((area) => {
    area.addEventListener("pointermove", (event) => {
      if (!finePointerQuery.matches || reduceQuery.matches) return;
      const bounds = area.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1);
      area.style.setProperty("--heat-x", `${(Math.min(Math.max(x, 0), 1) * 100).toFixed(1)}%`);
      area.style.setProperty("--heat-y", `${(Math.min(Math.max(y, 0), 1) * 100).toFixed(1)}%`);

      if (area.classList.contains("vx-hero")) {
        const mark = area.querySelector(".vx-hero-mark");
        mark?.style.setProperty("--mark-x", `${((x - .5) * 12).toFixed(1)}px`);
        mark?.style.setProperty("--mark-y", `${((y - .5) * 9).toFixed(1)}px`);
      }
    }, { passive: true });

    area.addEventListener("pointerleave", () => {
      area.style.setProperty("--heat-x", "50%");
      area.style.setProperty("--heat-y", "50%");
      const mark = area.querySelector(".vx-hero-mark");
      mark?.style.setProperty("--mark-x", "0px");
      mark?.style.setProperty("--mark-y", "0px");
    }, { passive: true });
  });

  reduceQuery.addEventListener?.("change", (event) => {
    if (!event.matches) return;
    clearTimers();
    showAll();
  });
})();
