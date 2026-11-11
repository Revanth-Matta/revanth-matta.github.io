(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.querySelector(".theme-toggle");
  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    const label = themeToggle?.querySelector(".theme-label");
    if (label) {
      label.textContent = theme === "dark" ? "Dark" : "Light";
    }
    themeToggle?.setAttribute(
      "aria-label",
      `Current mode: ${theme === "dark" ? "Dark" : "Light"}. Switch to ${theme === "dark" ? "light" : "dark"} mode.`
    );
  };

  const stored = localStorage.getItem("theme");
  applyTheme(stored === "light" ? "light" : "dark");

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll spy ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a[href^='#']");

  const spy = () => {
    let current = "";
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140 && rect.bottom >= 140) {
        current = section.id;
      }
    });
    navAnchors.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---------- Impact toggles ---------- */
  const impactToggles = document.querySelectorAll(".impact-toggle");
  const impactPanels = document.querySelectorAll(".impact-panel");

  const closeAllImpact = () => {
    impactToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    impactPanels.forEach((panel) => (panel.hidden = true));
  };

  impactToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.impactTarget;
      const panel = document.getElementById(targetId);
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      closeAllImpact();

      if (!isOpen && panel) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  /* ---------- Capability tabs ---------- */
  const capabilityTabs = document.querySelectorAll(".capability-tab");
  const capabilityPanels = document.querySelectorAll(
    ".capability-card, .capability-overview"
  );

  const closeAllCapabilities = () => {
    capabilityTabs.forEach((tab) => tab.setAttribute("aria-selected", "false"));
    capabilityPanels.forEach((panel) => (panel.hidden = true));
  };

  capabilityTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.capabilityTarget;
      const panel = document.getElementById(targetId);
      const isSelected = tab.getAttribute("aria-selected") === "true";

      closeAllCapabilities();

      if (!isSelected && panel) {
        tab.setAttribute("aria-selected", "true");
        panel.hidden = false;
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllImpact();
      closeAllCapabilities();
      closeExperienceDetail();
    }
  });

  /* ---------- Experience — master-detail fade ---------- */
  const experienceToggles = document.querySelectorAll(".experience-toggle");
  const experienceDetail = document.getElementById("experience-detail");
  const experiencePrompt = document.getElementById("experience-detail-prompt");
  const experienceContents = document.querySelectorAll(
    ".experience-detail-content"
  );

  const closeExperienceDetail = () => {
    experienceToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    experienceContents.forEach((content) => {
      content.classList.remove("visible");
      content.hidden = true;
    });
    if (experiencePrompt) {
      experiencePrompt.hidden = false;
    }
  };

  experienceToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.experienceTarget;
      const content = document.getElementById(`experience-detail-${targetId}`);
      const isActive = btn.getAttribute("aria-expanded") === "true";

      closeExperienceDetail();

      if (!isActive && content) {
        btn.setAttribute("aria-expanded", "true");
        experiencePrompt.hidden = true;
        content.hidden = false;
        requestAnimationFrame(() => {
          content.classList.add("visible");
        });
      }
    });
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector(".back-to-top");

  window.addEventListener("scroll", () => {
    backToTop?.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  });

  /* ---------- Image viewer ---------- */
  const viewer = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerTitle = document.getElementById("viewer-title");
  const viewerCaption = document.getElementById("viewer-caption");
  const viewerOriginal = document.getElementById("viewer-original");
  const viewerPrev = document.getElementById("viewer-prev");
  const viewerNext = document.getElementById("viewer-next");
  const viewerCounter = document.getElementById("viewer-counter");
  const viewerStatus = document.getElementById("viewer-status");
  const viewerClose = document.getElementById("viewer-close");

  let currentImages = [];
  let currentIndex = 0;

  const updateViewer = () => {
    const src = currentImages[currentIndex];
    viewerImage.src = src;
    viewerOriginal.href = src;
    viewerCounter.textContent = `Image ${currentIndex + 1} of ${currentImages.length}`;
    viewerCounter.hidden = currentImages.length < 2;
    viewerPrev.hidden = currentImages.length < 2;
    viewerNext.hidden = currentImages.length < 2;
    viewerStatus.textContent = `Showing image ${currentIndex + 1} of ${currentImages.length}`;
  };

  document.querySelectorAll(".image-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const images = (btn.dataset.images || "").split(",").map((s) => s.trim()).filter(Boolean);
      currentImages = images;
      currentIndex = 0;
      viewerTitle.textContent = btn.dataset.caption || "Image viewer";
      viewerCaption.textContent = btn.dataset.caption || "";
      updateViewer();
      viewer.showModal();
    });
  });

  viewerPrev?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateViewer();
  });

  viewerNext?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateViewer();
  });

  viewerClose?.addEventListener("click", () => viewer.close());

  viewer?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") viewerPrev?.click();
    if (event.key === "ArrowRight") viewerNext?.click();
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
