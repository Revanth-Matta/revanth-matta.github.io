(() => {
  "use strict";

  function initializePortfolio() {
    initializeTheme();
    initializeYear();
    initializeNavigation();
    initializeBackToTop();
    initializeCapabilityTabs();
    initializeImpactDisclosure();
    initializeExperienceScrolls();
    initializeImageViewer();

    /* ===================================
       1. Theme
       =================================== */

    function initializeTheme() {
      const themeToggle = document.querySelector(".theme-toggle");
      const root = document.documentElement;

      if (!themeToggle) {
        return;
      }

      const storedTheme = localStorage.getItem("portfolio-theme");

      if (storedTheme === "light" || storedTheme === "dark") {
        root.setAttribute("data-theme", storedTheme);
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        root.setAttribute("data-theme", "light");
      } else {
        root.setAttribute("data-theme", "dark");
      }

      updateThemeToggle();

      themeToggle.addEventListener("click", () => {
        const currentTheme =
          root.getAttribute("data-theme") === "light" ? "light" : "dark";
        const nextTheme = currentTheme === "light" ? "dark" : "light";

        root.setAttribute("data-theme", nextTheme);
        localStorage.setItem("portfolio-theme", nextTheme);

        updateThemeToggle();
      });

      function updateThemeToggle() {
        const currentTheme = root.getAttribute("data-theme");
        const isLight = currentTheme === "light";

        themeToggle.setAttribute(
          "aria-label",
          isLight
            ? "Current mode: Light. Switch to dark mode."
            : "Current mode: Dark. Switch to light mode."
        );

        const themeLabel = themeToggle.querySelector(".theme-label");

        if (themeLabel) {
          themeLabel.textContent = isLight ? "Light" : "Dark";
        }
      }
    }

    /* ===================================
       2. Year
       =================================== */

    function initializeYear() {
      const yearElement = document.getElementById("current-year");

      if (!yearElement) {
        return;
      }

      yearElement.textContent = String(new Date().getFullYear());
    }

    /* ===================================
       3. Navigation
       =================================== */

    function initializeNavigation() {
      const navToggle = document.querySelector(".nav-toggle");
      const navLinks = document.getElementById("primary-navigation");
      const navLinkElements = Array.from(
        document.querySelectorAll(".nav-links a")
      );

      if (!navToggle || !navLinks) {
        return;
      }

      navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";

        navToggle.setAttribute("aria-expanded", String(!isOpen));
        navLinks.classList.toggle("nav-open", !isOpen);

        navToggle.setAttribute(
          "aria-label",
          isOpen ? "Open navigation menu" : "Close navigation menu"
        );
      });

      navLinkElements.forEach((link) => {
        link.addEventListener("click", () => {
          navToggle.setAttribute("aria-expanded", "false");
          navLinks.classList.remove("nav-open");
          navToggle.setAttribute("aria-label", "Open navigation menu");
        });
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          navToggle.getAttribute("aria-expanded") === "true"
        ) {
          navToggle.setAttribute("aria-expanded", "false");
          navLinks.classList.remove("nav-open");
          navToggle.setAttribute("aria-label", "Open navigation menu");
          navToggle.focus();
        }
      });

      const sections = Array.from(
        document.querySelectorAll("main section[id]")
      );

      function updateActiveLink() {
        const scrollPosition = window.scrollY + 140;

        let currentSectionId = "";

        sections.forEach((section) => {
          if (scrollPosition >= section.offsetTop) {
            currentSectionId = section.id;
          }
        });

        navLinkElements.forEach((link) => {
          const linkHref = link.getAttribute("href");

          if (
            linkHref &&
            linkHref.startsWith("#") &&
            linkHref.slice(1) === currentSectionId
          ) {
            link.classList.add("active");
            link.setAttribute("aria-current", "location");
          } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
          }
        });
      }

      window.addEventListener("scroll", updateActiveLink, {
        passive: true
      });

      updateActiveLink();
    }

    /* ===================================
       4. Back to top
       =================================== */

    function initializeBackToTop() {
      const backToTop = document.querySelector(".back-to-top");

      if (!backToTop) {
        return;
      }

      function updateBackToTop() {
        const shouldShow = window.scrollY > 420;

        backToTop.classList.toggle("visible", shouldShow);
      }

      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });

      window.addEventListener("scroll", updateBackToTop, {
        passive: true
      });

      updateBackToTop();
    }

    /* ===================================
       5. Capability tabs
       =================================== */

    function initializeCapabilityTabs() {
      const tabs = Array.from(
        document.querySelectorAll(".capability-tab")
      );

      const panels = Array.from(
        document.querySelectorAll(".capability-card")
      );

      const overview = document.getElementById("capability-overview");

      if (!tabs.length || !panels.length || !overview) {
        return;
      }

      let activeTab = null;

      function closeAllPanels() {
        panels.forEach((panel) => {
          panel.hidden = true;
        });

        tabs.forEach((tab) => {
          tab.setAttribute("aria-selected", "false");
        });

        overview.hidden = false;
        activeTab = null;
      }

      function openPanel(targetPanel) {
        panels.forEach((panel) => {
          panel.hidden = panel !== targetPanel;
        });

        tabs.forEach((tab) => {
          const isTarget =
            tab.dataset.capabilityTarget === targetPanel.id;

          tab.setAttribute("aria-selected", String(isTarget));
        });

        overview.hidden = true;
        activeTab = targetPanel;
      }

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const targetPanel = document.getElementById(
            tab.dataset.capabilityTarget
          );

          if (!targetPanel) {
            return;
          }

          if (activeTab === targetPanel) {
            closeAllPanels();
            return;
          }

          openPanel(targetPanel);
        });
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          activeTab &&
          !document.querySelector("dialog[open]")
        ) {
          closeAllPanels();
        }
      });
    }

    /* ===================================
       6. Impact disclosure
       =================================== */

    function initializeImpactDisclosure() {
      const toggles = Array.from(
        document.querySelectorAll(".impact-toggle")
      );

      const panels = Array.from(
        document.querySelectorAll(".impact-panel")
      );

      if (!toggles.length || !panels.length) {
        return;
      }

      let activePanel = null;

      function closePanel(panel) {
        panel.hidden = true;

        const toggle = document.querySelector(
          `.impact-toggle[data-impact-target="${panel.id}"]`
        );

        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
        }
      }

      function openPanel(panel) {
        panels.forEach((item) => {
          if (item !== panel) {
            closePanel(item);
          }
        });

        panel.hidden = false;

        const toggle = document.querySelector(
          `.impact-toggle[data-impact-target="${panel.id}"]`
        );

        if (toggle) {
          toggle.setAttribute("aria-expanded", "true");
        }

        activePanel = panel;
      }

      toggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const targetPanel = document.getElementById(
            toggle.dataset.impactTarget
          );

          if (!targetPanel) {
            return;
          }

          if (activePanel === targetPanel) {
            closePanel(targetPanel);
            activePanel = null;
            return;
          }

          openPanel(targetPanel);
        });
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          activePanel &&
          !document.querySelector("dialog[open]")
        ) {
          closePanel(activePanel);
          activePanel = null;
        }
      });
    }

    /* ===================================
       7. Experience scrolls and comparison
       =================================== */

    function initializeExperienceScrolls() {
      const scrolls = Array.from(
        document.querySelectorAll(".experience-scroll")
      );

      const compareToggle = document.getElementById("compare-toggle");
      const comparePanel = document.getElementById("compare-panel");
      const compareTrack = document.getElementById("compare-track");
      const compareStatus = document.getElementById("compare-status");
      const compareClose = document.querySelector(".compare-close");

      if (
        !scrolls.length ||
        !compareToggle ||
        !comparePanel ||
        !compareTrack ||
        !compareStatus ||
        !compareClose
      ) {
        return;
      }

      const selected = new Set();
      let compareOpen = false;

      function getScrollById(id) {
        return (
          scrolls.find(
            (scroll) => scroll.dataset.experienceId === id
          ) || null
        );
      }

      function closeScroll(scroll) {
        const toggle = scroll.querySelector(".scroll-toggle");
        const wrapper = scroll.querySelector(".scroll-content-wrapper");

        if (!toggle || !wrapper) {
          return;
        }

        toggle.setAttribute("aria-expanded", "false");
        wrapper.classList.remove("open");
        scroll.classList.remove("open");
      }

      function updateCompareControl() {
        const count = selected.size;
        const countLabel = compareToggle.querySelector(".compare-count");

        compareToggle.disabled = count < 2;

        if (countLabel) {
          countLabel.textContent = count > 0 ? `(${count})` : "";
        }

        if (count === 0) {
          compareStatus.textContent = "";
        } else if (count === 1) {
          compareStatus.textContent =
            "1 role selected. Select at least two roles to compare.";
        } else {
          compareStatus.textContent = `${count} roles selected.`;
        }
      }

      function buildCompareCard(scroll) {
        const id = scroll.dataset.experienceId;
        const content = scroll.querySelector(".scroll-content");

        if (!id || !content) {
          return null;
        }

        const card = document.createElement("article");
        card.className = "compare-card";
        card.dataset.compareFor = id;

        const header = document.createElement("header");
        header.className = "compare-card-header";
        header.setAttribute("aria-hidden", "true");

        const company = scroll.querySelector(".experience-company");
        const role = scroll.querySelector(".experience-role");
        const date = scroll.querySelector(".experience-date");

        const companyText = document.createElement("span");
        companyText.className = "compare-company";
        companyText.textContent = company ? company.textContent : "";

        const roleText = document.createElement("span");
        roleText.className = "compare-role";
        roleText.textContent = role ? role.textContent : "";

        const dateText = document.createElement("span");
        dateText.className = "compare-date";
        dateText.textContent = date ? date.textContent : "";

        header.append(companyText, roleText, dateText);
        card.appendChild(header);

        content.style.visibility = "visible";
        card.appendChild(content);

        return card;
      }

      function returnContentToScroll(card) {
        const content = card.querySelector(".scroll-content");
        const scroll = getScrollById(card.dataset.compareFor);

        if (content && scroll) {
          const wrapper = scroll.querySelector(".scroll-content-wrapper");

          if (wrapper) {
            wrapper.appendChild(content);
          }

          content.style.visibility = "";
        }

        card.remove();
      }

      function clearComparison() {
        Array.from(
          compareTrack.querySelectorAll(".compare-card")
        ).forEach(returnContentToScroll);
      }

      function openComparison() {
        if (selected.size < 2) {
          return;
        }

        scrolls.forEach(closeScroll);
        clearComparison();

        selected.forEach((id) => {
          const scroll = getScrollById(id);

          if (!scroll) {
            return;
          }

          const card = buildCompareCard(scroll);

          if (card) {
            compareTrack.appendChild(card);
          }
        });

        comparePanel.hidden = false;
        compareToggle.setAttribute("aria-expanded", "true");
        compareOpen = true;

        compareStatus.textContent = `Comparing ${selected.size} roles. Use the comparison panel to review each role.`;

        compareClose.focus({ preventScroll: true });
      }

      function closeComparison() {
        if (!compareOpen) {
          return;
        }

        clearComparison();

        comparePanel.hidden = true;
        compareToggle.setAttribute("aria-expanded", "false");
        compareOpen = false;

        updateCompareControl();
        compareToggle.focus({ preventScroll: true });
      }

      compareToggle.addEventListener("click", () => {
        if (compareOpen) {
          closeComparison();
        } else {
          openComparison();
        }
      });

      compareClose.addEventListener("click", closeComparison);

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          compareOpen &&
          !document.querySelector("dialog[open]")
        ) {
          closeComparison();
        }
      });

      scrolls.forEach((scroll) => {
        const toggle = scroll.querySelector(".scroll-toggle");
        const wrapper = scroll.querySelector(".scroll-content-wrapper");
        const checkbox = scroll.querySelector(".compare-checkbox");

        if (!toggle || !wrapper || !checkbox) {
          return;
        }

        toggle.addEventListener("click", () => {
          const isOpen =
            toggle.getAttribute("aria-expanded") === "true";

          toggle.setAttribute("aria-expanded", String(!isOpen));
          wrapper.classList.toggle("open", !isOpen);
          scroll.classList.toggle("open", !isOpen);
        });

        toggle.addEventListener("keydown", (event) => {
          if (
            event.key === "Escape" &&
            toggle.getAttribute("aria-expanded") === "true"
          ) {
            event.preventDefault();
            toggle.setAttribute("aria-expanded", "false");
            wrapper.classList.remove("open");
            scroll.classList.remove("open");
          }
        });

        checkbox.addEventListener("change", () => {
          const id = scroll.dataset.experienceId;

          if (checkbox.checked) {
            selected.add(id);

            if (compareOpen) {
              closeScroll(scroll);

              const card = buildCompareCard(scroll);

              if (card) {
                compareTrack.appendChild(card);
              }

              compareStatus.textContent = `Comparing ${selected.size} roles.`;
            }
          } else {
            selected.delete(id);

            if (compareOpen) {
              const card = compareTrack.querySelector(
                `.compare-card[data-compare-for="${id}"]`
              );

              if (card) {
                returnContentToScroll(card);
              }

              if (selected.size < 2) {
                closeComparison();
              } else {
                compareStatus.textContent = `Comparing ${selected.size} roles.`;
              }
            }
          }

          updateCompareControl();
        });
      });

      updateCompareControl();
    }

    /* ===================================
       8. Image viewer
       =================================== */

    function initializeImageViewer() {
      const viewer = document.getElementById("image-viewer");
      const triggers = Array.from(
        document.querySelectorAll("[data-lightbox]")
      );

      if (!viewer || !triggers.length) {
        return;
      }

      const viewerImage = document.getElementById("viewer-image");
      const viewerCaption = document.getElementById("viewer-caption");
      const viewerCounter = document.getElementById("viewer-counter");
      const viewerStatus = document.getElementById("viewer-status");
      const viewerOriginal = document.getElementById("viewer-original");
      const viewerPrev = document.getElementById("viewer-prev");
      const viewerNext = document.getElementById("viewer-next");
      const viewerClose = document.getElementById("viewer-close");
      const viewerStage = document.getElementById("viewer-stage");

      if (
        !viewerImage ||
        !viewerCaption ||
        !viewerCounter ||
        !viewerStatus ||
        !viewerOriginal ||
        !viewerPrev ||
        !viewerNext ||
        !viewerClose ||
        !viewerStage
      ) {
        return;
      }

      let currentImages = [];
      let currentIndex = 0;
      let lastFocusedElement = null;

      function updateViewer() {
        const currentImage = currentImages[currentIndex];

        if (!currentImage) {
          return;
        }

        viewerImage.src = currentImage;
        viewerImage.alt = viewerCaption.textContent || "Portfolio image";

        viewerCounter.textContent = `Image ${
          currentIndex + 1
        } of ${currentImages.length}`;
        viewerCounter.hidden = currentImages.length <= 1;

        viewerStatus.textContent = `Image ${
          currentIndex + 1
        } of ${currentImages.length}`;
        viewerStatus.hidden = false;

        viewerOriginal.href = currentImage;

        const hasMultipleImages = currentImages.length > 1;

        viewerPrev.hidden = !hasMultipleImages;
        viewerNext.hidden = !hasMultipleImages;
      }

      function openViewer(trigger) {
        const images = (trigger.dataset.images || "")
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean);

        if (!images.length) {
          return;
        }

        currentImages = images;
        currentIndex = 0;

        viewerCaption.textContent = trigger.dataset.caption || "";
        lastFocusedElement = trigger;

        updateViewer();
        viewer.showModal();

        viewerClose.focus();
      }

      function closeViewer() {
        viewer.close();
      }

      function showPreviousImage() {
        if (currentImages.length < 2) {
          return;
        }

        currentIndex =
          (currentIndex - 1 + currentImages.length) % currentImages.length;

        updateViewer();
      }

      function showNextImage() {
        if (currentImages.length < 2) {
          return;
        }

        currentIndex = (currentIndex + 1) % currentImages.length;

        updateViewer();
      }

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          openViewer(trigger);
        });
      });

      viewerClose.addEventListener("click", closeViewer);

      viewer.addEventListener("click", (event) => {
        if (event.target === viewer) {
          closeViewer();
        }
      });

      viewer.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeViewer();
        }

        if (event.key === "ArrowLeft") {
          showPreviousImage();
        }

        if (event.key === "ArrowRight") {
          showNextImage();
        }
      });

      viewerPrev.addEventListener("click", showPreviousImage);
      viewerNext.addEventListener("click", showNextImage);

      viewer.addEventListener("close", () => {
        if (
          lastFocusedElement &&
          typeof lastFocusedElement.focus === "function"
        ) {
          lastFocusedElement.focus();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initializePortfolio);
})();
