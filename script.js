(() => {
  "use strict";

  function initializePortfolio() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    initializeYear();
    initializeNavigation();
    initializeProjectFilters();
    initializeExperience();
    initializeImageViewer();
    initializeAnimations();

    /* =====================================================
       1. Footer year
       ===================================================== */

    function initializeYear() {
      const year = document.getElementById("current-year");

      if (year) {
        year.textContent = new Date().getFullYear();
      }
    }

    /* =====================================================
       2. Mobile navigation and active-section indicator
       ===================================================== */

    function initializeNavigation() {
      const navbar = document.querySelector(".navbar");
      const toggle = document.querySelector(".nav-toggle");

      const navigation = document.getElementById(
        "primary-navigation"
      );

      if (!navbar || !toggle || !navigation) {
        return;
      }

      const links = Array.from(
        navigation.querySelectorAll('a[href^="#"]')
      );

      const mobileViewport = window.matchMedia(
        "(max-width: 900px)"
      );

      function setMenu(open, restoreFocus = false) {
        toggle.setAttribute("aria-expanded", String(open));

        toggle.setAttribute(
          "aria-label",
          open ? "Close navigation menu" : "Open navigation menu"
        );

        navigation.classList.toggle("is-open", open);

        if (restoreFocus) {
          toggle.focus();
        }
      }

      toggle.addEventListener("click", () => {
        const isOpen =
          toggle.getAttribute("aria-expanded") === "true";

        setMenu(!isOpen);
      });

      links.forEach((link) => {
        link.addEventListener("click", () => {
          setMenu(false);
        });
      });

      document.addEventListener("click", (event) => {
        if (
          mobileViewport.matches &&
          !navbar.contains(event.target)
        ) {
          setMenu(false);
        }
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          toggle.getAttribute("aria-expanded") === "true"
        ) {
          setMenu(false, true);
        }
      });

      navbar.addEventListener("focusout", () => {
        window.setTimeout(() => {
          if (
            mobileViewport.matches &&
            !navbar.contains(document.activeElement)
          ) {
            setMenu(false);
          }
        }, 0);
      });

      mobileViewport.addEventListener("change", () => {
        setMenu(false);
      });

      toggle.hidden = false;
      navbar.classList.add("nav-ready");

      const sections = links
        .map((link) => {
          const id = link.getAttribute("href").slice(1);

          return document.getElementById(id);
        })
        .filter(Boolean);

      let scrollQueued = false;

      function updateActiveSection() {
        const marker =
          navbar.getBoundingClientRect().height + 100;

        let activeId = "";

        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= marker) {
            activeId = section.id;
          }
        });

        const nearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 8;

        if (nearBottom && sections.length) {
          activeId = sections[sections.length - 1].id;
        }

        links.forEach((link) => {
          const active =
            link.getAttribute("href") === `#${activeId}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });

        scrollQueued = false;
      }

      function queueActiveSectionUpdate() {
        if (scrollQueued) {
          return;
        }

        scrollQueued = true;

        window.requestAnimationFrame(updateActiveSection);
      }

      window.addEventListener(
        "scroll",
        queueActiveSectionUpdate,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        queueActiveSectionUpdate
      );

      updateActiveSection();
    }

    /* =====================================================
       3. Project filters
       ===================================================== */

    function initializeProjectFilters() {
      const filterBar = document.querySelector(".filter-bar");

      const buttons = Array.from(
        document.querySelectorAll(".filter-btn")
      );

      const cards = Array.from(
        document.querySelectorAll(
          ".projects-grid .project-card"
        )
      );

      const status = document.getElementById(
        "project-filter-status"
      );

      if (!filterBar || !buttons.length || !cards.length) {
        return;
      }

      let filterAnimations = [];

      function applyFilter(button) {
        const filter = button.dataset.filter || "all";

        filterAnimations.forEach((animation) => {
          animation.cancel();
        });

        filterAnimations = [];

        buttons.forEach((item) => {
          const active = item === button;

          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        let visibleCount = 0;

        cards.forEach((card) => {
          const categories = (
            card.dataset.category || ""
          ).split(/\s+/);

          const show =
            filter === "all" || categories.includes(filter);

          card.hidden = !show;

          if (!show) {
            return;
          }

          visibleCount += 1;

          card.classList.remove("is-pending");
          card.classList.add("is-visible");

          if (!reducedMotion.matches && card.animate) {
            const animation = card.animate(
              [
                { transform: "translateY(14px)" },
                { transform: "translateY(0)" }
              ],
              {
                duration: 300,
                delay: (visibleCount - 1) * 55,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "backwards"
              }
            );

            filterAnimations.push(animation);
          }
        });

        if (status) {
          const label = button.textContent.trim();

          const noun =
            visibleCount === 1 ? "example" : "examples";

          status.textContent =
            `${visibleCount} work ${noun} shown. ` +
            `Filter: ${label}.`;
        }
      }

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          applyFilter(button);
        });
      });

      filterBar.hidden = false;
    }

    /* =====================================================
       4. Expandable experience timeline
       ===================================================== */

    function initializeExperience() {
      const entries = document.querySelectorAll(
        ".experience-details"
      );

      entries.forEach((details) => {
        const summary = details.querySelector(
          ".experience-summary"
        );

        if (!summary) {
          return;
        }

        let currentAnimation = null;
        let desiredOpen = details.open;

        function clearSizing() {
          details.style.height = "";
          details.style.overflow = "";
        }

        function completeImmediately(open) {
          if (currentAnimation) {
            currentAnimation.cancel();
            currentAnimation = null;
          }

          details.open = open;
          desiredOpen = open;

          clearSizing();
        }

        summary.addEventListener("click", (event) => {
          if (
            reducedMotion.matches ||
            typeof details.animate !== "function"
          ) {
            return;
          }

          event.preventDefault();

          const startHeight =
            details.getBoundingClientRect().height;

          desiredOpen = !desiredOpen;

          if (currentAnimation) {
            currentAnimation.cancel();
            currentAnimation = null;
          }

          clearSizing();

          let endHeight;

          if (desiredOpen) {
            details.open = true;

            endHeight =
              details.getBoundingClientRect().height;
          } else {
            details.open = false;

            endHeight =
              details.getBoundingClientRect().height;

            details.open = true;
          }

          details.style.height = `${startHeight}px`;
          details.style.overflow = "hidden";

          const animation = details.animate(
            [
              { height: `${startHeight}px` },
              { height: `${endHeight}px` }
            ],
            {
              duration: 320,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)"
            }
          );

          currentAnimation = animation;

          animation.onfinish = () => {
            if (currentAnimation !== animation) {
              return;
            }

            details.open = desiredOpen;
            currentAnimation = null;

            clearSizing();
          };
        });

        details.addEventListener("toggle", () => {
          if (!currentAnimation) {
            desiredOpen = details.open;
          }
        });

        window.addEventListener("resize", () => {
          if (currentAnimation) {
            completeImmediately(desiredOpen);
          }
        });

        reducedMotion.addEventListener("change", () => {
          if (reducedMotion.matches && currentAnimation) {
            completeImmediately(desiredOpen);
          }
        });
      });
    }

    /* =====================================================
       5. Project and recognition image viewer
       ===================================================== */

    function initializeImageViewer() {
      const viewer = document.getElementById("image-viewer");
      const image = document.getElementById("viewer-image");

      const caption = document.getElementById(
        "viewer-caption"
      );

      const closeButton = document.getElementById(
        "viewer-close"
      );

      const originalLink = document.getElementById(
        "viewer-original"
      );

      const stage = document.getElementById("viewer-stage");

      const status = document.getElementById(
        "viewer-status"
      );

      const triggers = Array.from(
        document.querySelectorAll("[data-lightbox]")
      );

      if (
        !viewer ||
        !image ||
        !caption ||
        !closeButton ||
        !originalLink ||
        !stage ||
        !status
      ) {
        return;
      }

      let lastTrigger = null;
      let requestId = 0;
      let pageWasLocked = false;

      const supportsDialog =
        typeof viewer.showModal === "function";

      function getSource(trigger) {
        const thumbnail = trigger.querySelector("img");

        const source =
          trigger.dataset.full ||
          thumbnail?.getAttribute("src");

        if (!source) {
          return null;
        }

        try {
          const url = new URL(source, document.baseURI);

          if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
          ) {
            return null;
          }

          return url.href;
        } catch {
          return null;
        }
      }

      function setStatus(message) {
        status.textContent = message;
        status.hidden = !message;
      }

      function openViewer(trigger) {
        const source = getSource(trigger);

        if (!source) {
          return;
        }

        if (!supportsDialog) {
          window.open(
            source,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        const thumbnail = trigger.querySelector("img");

        const description =
          trigger.dataset.caption ||
          thumbnail?.alt ||
          "Portfolio image";

        lastTrigger = trigger;

        const activeRequest = ++requestId;

        caption.textContent = description;
        originalLink.href = source;

        image.hidden = true;
        image.removeAttribute("src");
        image.alt = description;

        stage.setAttribute("aria-busy", "true");
        setStatus("Loading image…");

        if (!viewer.open) {
          pageWasLocked =
            document.body.classList.contains("viewer-open");

          viewer.showModal();

          document.body.classList.add("viewer-open");
        }

        closeButton.focus({ preventScroll: true });

        const loader = new Image();

        loader.onload = () => {
          if (
            activeRequest !== requestId ||
            !viewer.open
          ) {
            return;
          }

          image.src = source;
          image.hidden = false;

          stage.setAttribute("aria-busy", "false");
          setStatus("");
        };

        loader.onerror = () => {
          if (
            activeRequest !== requestId ||
            !viewer.open
          ) {
            return;
          }

          stage.setAttribute("aria-busy", "false");
          image.hidden = true;

          setStatus(
            "This image could not be loaded. " +
            "You can try opening the original image below."
          );
        };

        loader.src = source;
      }

      function closeViewer() {
        if (viewer.open) {
          viewer.close();
        }
      }

      function resetViewer() {
        requestId += 1;

        if (!pageWasLocked) {
          document.body.classList.remove("viewer-open");
        }

        image.hidden = true;
        image.removeAttribute("src");
        image.alt = "";

        caption.textContent = "";
        originalLink.removeAttribute("href");

        stage.setAttribute("aria-busy", "false");
        setStatus("");

        if (lastTrigger?.isConnected) {
          lastTrigger.focus({ preventScroll: true });
        }

        lastTrigger = null;
      }

      triggers.forEach((trigger) => {
        if (!getSource(trigger)) {
          return;
        }

        trigger.disabled = false;

        trigger.addEventListener("click", () => {
          openViewer(trigger);
        });
      });

      document
        .querySelectorAll(".achievement-tile-interactive")
        .forEach((tile) => {
          const trigger = tile.querySelector(
            ".achievement-trigger[data-lightbox]"
          );

          if (trigger && getSource(trigger)) {
            trigger.disabled = false;
          }
        });

      closeButton.addEventListener("click", closeViewer);

      let backdropPointerDown = false;

      function outsideViewer(event) {
        const bounds = viewer.getBoundingClientRect();

        return (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        );
      }

      viewer.addEventListener("pointerdown", (event) => {
        backdropPointerDown =
          event.target === viewer &&
          outsideViewer(event);
      });

      viewer.addEventListener("click", (event) => {
        if (
          backdropPointerDown &&
          event.target === viewer &&
          outsideViewer(event)
        ) {
          closeViewer();
        }

        backdropPointerDown = false;
      });

      viewer.addEventListener("close", resetViewer);

      viewer.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || !viewer.open) {
          return;
        }

        const focusable = Array.from(
          viewer.querySelectorAll(
            'button:not([disabled]), a[href], ' +
            '[tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => {
          return element.getClientRects().length > 0;
        });

        if (!focusable.length) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      });
    }

    /* =====================================================
       6. Hero and scroll animations
       ===================================================== */

    function initializeAnimations() {
      const motionElements = Array.from(
        document.querySelectorAll("[data-motion]")
      );

      const heroElements = Array.from(
        document.querySelectorAll(".hero-enter")
      );

      const heroPortrait = document.querySelector(
        ".hero-portrait-image"
      );

      let observer = null;
      const pending = new Set();

      function reveal(element) {
        element.classList.remove("is-pending");
        element.classList.add("is-visible");

        pending.delete(element);

        if (observer) {
          observer.unobserve(element);
        }
      }

      function clearHeroAnimation(element) {
        element.classList.remove(
          "is-pending",
          "is-entering"
        );
      }

      function revealEverything() {
        if (observer) {
          observer.disconnect();
        }

        motionElements.forEach(reveal);
        heroElements.forEach(clearHeroAnimation);

        if (heroPortrait) {
          clearHeroAnimation(heroPortrait);
        }
      }

      if (reducedMotion.matches) {
        revealEverything();
        return;
      }

      heroElements.forEach((element) => {
        element.classList.add("is-entering");

        window.setTimeout(() => {
          clearHeroAnimation(element);
        }, 1700);
      });

      if (heroPortrait) {
        const animatePortrait = () => {
          if (reducedMotion.matches) {
            return;
          }

          heroPortrait.classList.add("is-entering");

          window.setTimeout(() => {
            clearHeroAnimation(heroPortrait);
          }, 1000);
        };

        if (heroPortrait.complete) {
          if (heroPortrait.naturalWidth > 0) {
            animatePortrait();
          }
        } else {
          heroPortrait.addEventListener(
            "load",
            animatePortrait,
            { once: true }
          );
        }
      }

      reducedMotion.addEventListener("change", () => {
        if (reducedMotion.matches) {
          revealEverything();
        }
      });

      if (!("IntersectionObserver" in window)) {
        motionElements.forEach(reveal);
        return;
      }

      try {
        document
          .querySelectorAll("[data-stagger]")
          .forEach((group) => {
            Array.from(group.children).forEach(
              (element, index) => {
                element.style.setProperty(
                  "--motion-delay",
                  `${Math.min(index, 3) * 80}ms`
                );
              }
            );
          });

        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                reveal(entry.target);
              }
            });
          },
          {
            threshold: 0.05,
            rootMargin: "0px 0px -24px 0px"
          }
        );

        motionElements.forEach((element) => {
          element.classList.add("is-pending");
          pending.add(element);

          observer.observe(element);
        });

        document.addEventListener("focusin", (event) => {
          if (!(event.target instanceof Element)) {
            return;
          }

          const parent = event.target.closest(
            "[data-motion].is-pending"
          );

          if (parent) {
            reveal(parent);
          }
        });

        let checkQueued = false;

        function checkPendingElements() {
          const viewportHeight = window.innerHeight;

          Array.from(pending).forEach((element) => {
            if (element.hidden) {
              return;
            }

            const bounds = element.getBoundingClientRect();

            if (
              bounds.top < viewportHeight - 20 &&
              bounds.bottom > 0
            ) {
              reveal(element);
            }
          });

          checkQueued = false;
        }

        function queuePendingCheck() {
          if (!checkQueued && pending.size) {
            checkQueued = true;

            window.requestAnimationFrame(
              checkPendingElements
            );
          }
        }

        window.addEventListener(
          "scroll",
          queuePendingCheck,
          { passive: true }
        );

        window.addEventListener(
          "resize",
          queuePendingCheck
        );

        window.setTimeout(checkPendingElements, 200);
      } catch (error) {
        revealEverything();

        console.warn(
          "Entrance animations were disabled; " +
          "all portfolio content remains visible.",
          error
        );
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializePortfolio,
      { once: true }
    );
  } else {
    initializePortfolio();
  }
})();
