
/* =========================================================
   AJIT VISUAL SYNC — MAIN JAVASCRIPT

   All website interactions are controlled from this file.

   HTML: index.html
   CSS: css/style.css
   CONFIG: js/site-config.js

   SECTIONS:
   01. Configuration and Helpers
   02. Single-file Page Navigation
   03. Floating Navbar
   04. Hamburger Menu and Theme Switch
   05. Scroll Reveal Animations
   06. Tech / Creator Journey
   07. Certificate Slideshow
   08. Contact Links
   09. Initialization
   ========================================================= */

(() => {
  "use strict";


  /* =======================================================
     01. CONFIGURATION AND HELPERS
     ======================================================= */

  const CONFIG = window.SITE_CONFIG || {};

  const DEFAULTS = {
    contact: {
      phoneDisplay: "8376068040",
      whatsappNumber: "918376068040",
      email: "ajitkush999@gmail.com",
      linkedinUrl: "https://www.linkedin.com/in/ajit-kushwaha-b9888b262/"
    },

    assets: {
      certificates: [
        "images/certificate1.jpg",
        "images/certificate2.jpg",
        "images/certificate3.jpg",
        "images/certificate4.jpg",
        "images/certificate5.jpg",
        "images/certificate6.jpg"
      ],

      hireImage: "images/hire_me.jpg"
    },

    certificateIntervalMs: 3600
  };


  // Select one HTML element.
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);


  // Select multiple HTML elements.
  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


  // Safely read browser storage.
  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }


  // Safely save browser storage.
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // The current page still works if storage is unavailable.
    }
  }


  // Respect visitors who prefer reduced animations.
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  // Use config values, or fallback values if config is missing.
  const contactConfig = {
    ...DEFAULTS.contact,
    ...(CONFIG.contact || {})
  };

  const assetConfig = {
    ...DEFAULTS.assets,
    ...(CONFIG.assets || {})
  };

  const certificateInterval = Math.max(
    1000,
    Number(CONFIG.certificateIntervalMs) ||
      DEFAULTS.certificateIntervalMs
  );



  /* =======================================================
     02. SINGLE-FILE PAGE NAVIGATION

     All pages are inside index.html.
     No separate HTML files are required.

     Supported pages:
     home, tech, creator, contact, thoughts,
     tech-resume, creator-resume.
     ======================================================= */

  const PAGE_IDS = {
    home: "homePage",
    tech: "techPage",
    creator: "creatorPage",
    contact: "contactPage",
    thoughts: "thoughtsPage",
    "tech-resume": "techResumePage",
    "creator-resume": "creatorResumePage"
  };


  const PAGE_TITLES = {
    home: "Ajit Visual Sync",
    tech: "Tech | Ajit Visual Sync",
    creator: "Creator | Ajit Visual Sync",
    contact: "Contact | Ajit Visual Sync",
    thoughts: "My Thoughts | Ajit Visual Sync",
    "tech-resume": "Tech Resume | Ajit Visual Sync",
    "creator-resume": "Creator Resume | Ajit Visual Sync"
  };


  const pageViews = Object.entries(PAGE_IDS)
    .map(([name, id]) => ({
      name,
      element: document.getElementById(id)
    }))
    .filter(page => page.element);


  let currentPage = "home";


  // Close the dropdown menu.
  function closeNavigationMenu() {
    const menu = $("#navMenu");
    const toggle = $("#menuToggle");

    if (menu) {
      menu.hidden = true;
    }

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }


  // Show one page and hide all other page views.
  function showPage(pageName, options = {}) {

    const pageExists = pageViews.some(
      page => page.name === pageName
    );

    if (!pageExists) {
      pageName = "home";
    }

    currentPage = pageName;


    pageViews.forEach(page => {
      const isActive = page.name === pageName;

      page.element.hidden = !isActive;
      page.element.classList.toggle("is-active", isActive);
    });


    // Update browser tab title.
    document.title =
      PAGE_TITLES[pageName] || PAGE_TITLES.home;


    closeNavigationMenu();

    observeRevealElements();

    updateFloatingNavbar();


    // Start the selected page from the top.
    if (options.scrollToTop !== false) {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    }
  }


  // Handle all internal page navigation links.
  document.addEventListener("click", event => {

    const pageLink = event.target.closest("[data-page-link]");

    if (!pageLink) {
      return;
    }


    // Keep modified clicks and new-tab behaviour normal.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }


    const pageName = pageLink.dataset.pageLink;

    if (!PAGE_IDS[pageName]) {
      return;
    }


    event.preventDefault();


    // Update URL without loading another HTML file.
    const nextHash = `#${pageName}`;

    if (window.location.hash !== nextHash) {
      history.pushState(
        { page: pageName },
        "",
        nextHash
      );
    }


    showPage(pageName);
  });


  // Support browser Back and Forward buttons.
  function handleBrowserNavigation() {

    const hashName = window.location.hash.replace("#", "");

    if (PAGE_IDS[hashName]) {
      showPage(hashName);
      return;
    }


    // Hashes like #journey and #contact are Home sections,
    // not separate page views.
    if (currentPage !== "home") {
      showPage("home", { scrollToTop: false });
    }


    if (hashName) {
      requestAnimationFrame(() => {

        const target = document.getElementById(hashName);

        target?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });

      });
    }
  }


  window.addEventListener("popstate", handleBrowserNavigation);

  window.addEventListener("hashchange", handleBrowserNavigation);


  // Load the page requested in the URL.
  function initializePageNavigation() {

    const hashName = window.location.hash.replace("#", "");

    if (PAGE_IDS[hashName]) {
      showPage(hashName, { scrollToTop: false });
    } else {
      showPage("home", { scrollToTop: false });
    }
  }



  /* =======================================================
     03. FLOATING NAVBAR

     On Home:
     Appears after 35% scroll progress.

     On other page views:
     Remains visible for navigation.
     ======================================================= */

  const floatingNav = $("#floatingNav");


  function getHomeScrollProgress() {

    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (totalHeight <= 0) {
      return 0;
    }

    return Math.min(
      1,
      Math.max(0, window.scrollY / totalHeight)
    );
  }


  function updateFloatingNavbar() {

    if (!floatingNav) {
      return;
    }

    const shouldShow =
      currentPage !== "home" ||
      getHomeScrollProgress() >= 0.35;

    floatingNav.classList.toggle(
      "is-visible",
      shouldShow
    );
  }


  window.addEventListener(
    "scroll",
    updateFloatingNavbar,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updateFloatingNavbar,
    { passive: true }
  );



  /* =======================================================
     04. HAMBURGER MENU AND DARK/LIGHT MODE
     ======================================================= */

  const menuToggle = $("#menuToggle");
  const navMenu = $("#navMenu");
  const themeToggle = $("#themeToggle");


  // Open or close the hamburger dropdown.
  function toggleNavigationMenu() {

    if (!menuToggle || !navMenu) {
      return;
    }

    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    const shouldOpen = !isOpen;

    navMenu.hidden = !shouldOpen;

    menuToggle.setAttribute(
      "aria-expanded",
      String(shouldOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      shouldOpen ? "Close menu" : "Open menu"
    );
  }


  menuToggle?.addEventListener(
    "click",
    toggleNavigationMenu
  );


  // Close menu when clicking outside.
  document.addEventListener("click", event => {

    if (!navMenu || navMenu.hidden) {
      return;
    }

    const clickedInside = navMenu.contains(event.target);
    const clickedToggle = menuToggle?.contains(event.target);

    if (!clickedInside && !clickedToggle) {
      closeNavigationMenu();
    }
  });


  // Close menu with Escape key.
  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      closeNavigationMenu();
    }

  });


  // Apply Dark or Light theme.
  function applyTheme(themeName) {

    if (themeName === "light") {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }


    // Save the visitor's preference.
    writeStorage("ajit-visual-sync-theme", themeName);


    // Update browser theme colour.
    const themeMeta = $('meta[name="theme-color"]');

    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        themeName === "light" ? "#EEF4FA" : "#080D18"
      );
    }
  }


  // Load saved theme. Dark mode is the default.
  const savedTheme = readStorage("ajit-visual-sync-theme");

  applyTheme(savedTheme === "light" ? "light" : "light");


  // Theme toggle button.
  themeToggle?.addEventListener("click", () => {

    const currentTheme =
      document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";

    const nextTheme =
      currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

  });



  /* =======================================================
     05. SCROLL REVEAL ANIMATIONS

     Elements with .reveal appear smoothly when they enter
     the visitor's screen.

     IntersectionObserver keeps scrolling efficient.
     ======================================================= */

  let revealObserver = null;


  function revealImmediately(element) {
    element.classList.add("is-visible");
  }


  function observeRevealElements(scope = document) {

    const elements = $$(".reveal", scope);


    // Fallback for reduced motion or older browsers.
    if (
      prefersReducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach(revealImmediately);
      return;
    }


    if (!revealObserver) {

      revealObserver = new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");

            // Do not keep observing an already revealed element.
            revealObserver.unobserve(entry.target);

          });

        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -35px 0px"
        }
      );

    }


    elements.forEach(element => {

      if (!element.classList.contains("is-visible")) {
        revealObserver.observe(element);
      }

    });

  }



  /* =======================================================
     06. TECH / CREATOR JOURNEY SWITCH

     Only one journey is visible at a time.
     Timeline milestones appear one by one.
     ======================================================= */

  const journeyTabs = $$(".journey-tab");

  const journeyPanels = $$(".journey-panel");


  // Reveal timeline milestones in sequence.
  function revealTimeline(panel) {

    if (!panel) {
      return;
    }

    const items = $$(".timeline-item", panel);


    items.forEach((item, index) => {

      item.classList.remove("is-revealed");


      if (prefersReducedMotion) {
        item.classList.add("is-revealed");
        return;
      }


      window.setTimeout(() => {

        // Do not animate a panel after it has been hidden.
        if (!panel.hidden) {
          item.classList.add("is-revealed");
        }

      }, 100 + index * 180);

    });

  }


  // Activate the selected journey.
  function activateJourney(journeyName) {

    journeyTabs.forEach(tab => {

      const selected =
        tab.dataset.journey === journeyName;

      tab.classList.toggle("is-active", selected);

      tab.setAttribute(
        "aria-selected",
        String(selected)
      );

      tab.tabIndex = selected ? 0 : -1;

    });


    journeyPanels.forEach(panel => {

      const selected =
        panel.dataset.journeyPanel === journeyName;

      panel.hidden = !selected;

      panel.classList.toggle("is-active", selected);

      if (selected) {
        revealTimeline(panel);
      }

    });

  }


  journeyTabs.forEach(tab => {

    tab.addEventListener("click", () => {
      activateJourney(tab.dataset.journey);
    });

  });


  // Keyboard navigation for Tech and Creator tabs.
  journeyTabs.forEach((tab, index) => {

    tab.addEventListener("keydown", event => {

      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }

      event.preventDefault();

      const direction =
        event.key === "ArrowRight" ? 1 : -1;

      const nextIndex =
        (index + direction + journeyTabs.length) %
        journeyTabs.length;

      journeyTabs[nextIndex].focus();
      journeyTabs[nextIndex].click();

    });

  });



  /* =======================================================
     07. CERTIFICATE SLIDESHOW

     Slides 1–6:
     certificate1.jpg ... certificate6.jpg

     Slide 7:
     hire_me.jpg

     Behaviour:
     - Automatic change every 2 seconds.
     - Stops at slide 7.
     - Does not automatically loop.
     - Previous and Next controls work manually.
     - Manual navigation stops automatic playback.
     ======================================================= */

  const certificateImage = $("#certificateImage");

  const certificateFallback = $("#certificateFallback");

  const hireSlide = $("#hireSlide");

  const hireImage = $("#hireImage");

  const certificateCount = $("#certificateCount");

  const previousButton = $("#certificatePrev");

  const nextButton = $("#certificateNext");


  const certificatePaths = Array.isArray(assetConfig.certificates)
    ? assetConfig.certificates.filter(Boolean)
    : [];


  // One final Hire Me slide is added after the certificates.
  const totalSlides = certificatePaths.length + 1;


  let currentSlide = 0;

  let slideshowTimer = null;

  let slideshowStopped = false;

  let transitionTimer = null;


  // Load the final Hire Me image.
  if (hireImage && assetConfig.hireImage) {
    hireImage.src = assetConfig.hireImage;
  }


  // Preload the next certificate to reduce transition delay.
  function preloadCertificate(index) {

    if (
      index < 0 ||
      index >= certificatePaths.length
    ) {
      return;
    }

    const preloadImage = new Image();

    preloadImage.src = certificatePaths[index];
  }


  // Update slide number.
  function updateSlideCounter() {

    if (!certificateCount) {
      return;
    }

    const current = String(currentSlide + 1).padStart(2, "0");

    const total = String(totalSlides).padStart(2, "0");

    certificateCount.textContent = `${current} / ${total}`;
  }


  // Stop automatic slideshow.
  function stopSlideshow() {

    slideshowStopped = true;

    if (slideshowTimer !== null) {
      window.clearInterval(slideshowTimer);
      slideshowTimer = null;
    }

  }


  // Display the final Hire Me slide.
  function showHireSlide() {

    if (certificateImage) {
      certificateImage.hidden = true;
      certificateImage.classList.remove("is-changing");
    }

    if (certificateFallback) {
      certificateFallback.hidden = true;
    }

    if (hireSlide) {
      hireSlide.hidden = false;
    }

    // The slideshow must stop permanently at this slide.
    stopSlideshow();

  }


  // Display a certificate image.
  function showCertificateImage(index) {

    const imagePath = certificatePaths[index];


    if (!certificateImage || !imagePath) {

      if (certificateFallback) {
        certificateFallback.hidden = false;
      }

      return;
    }


    // Hide final slide and prepare certificate frame.
    if (hireSlide) {
      hireSlide.hidden = true;
    }

    if (certificateFallback) {
      certificateFallback.hidden = false;
    }

    certificateImage.hidden = false;

    certificateImage.classList.add("is-changing");


    // Set image handlers before changing its source.
    certificateImage.onload = () => {

      if (certificateFallback) {
        certificateFallback.hidden = true;
      }

      certificateImage.hidden = false;

      certificateImage.classList.remove("is-changing");

    };


    // Show a clean fallback if the image cannot be loaded.
    certificateImage.onerror = () => {

      certificateImage.hidden = true;

      if (certificateFallback) {
        certificateFallback.hidden = false;
      }

      certificateImage.classList.remove("is-changing");

    };


    // Load the selected image.
    certificateImage.src = imagePath;


    // Prepare the next image in the background.
    preloadCertificate(index + 1);

  }


  // Render any slide using its zero-based index.
  function renderSlide(index) {

    const safeIndex = Math.max(
      0,
      Math.min(totalSlides - 1, index)
    );

    currentSlide = safeIndex;

    updateSlideCounter();


    // Clear an earlier pending transition.
    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }


    // Slide 7 is always the final Hire Me slide.
    if (safeIndex === totalSlides - 1) {

      if (certificateImage) {
        certificateImage.classList.add("is-changing");
      }

      transitionTimer = window.setTimeout(() => {

        showHireSlide();

        transitionTimer = null;

      }, prefersReducedMotion ? 0 : 180);

      return;
    }


    // Hide Hire Me slide before showing a certificate.
    if (hireSlide) {
      hireSlide.hidden = true;
    }


    if (certificateImage) {
      certificateImage.classList.add("is-changing");
    }


    transitionTimer = window.setTimeout(() => {

      showCertificateImage(safeIndex);

      transitionTimer = null;

    }, prefersReducedMotion ? 0 : 180);

  }


  // Move to the next slide. No automatic looping.
  function nextSlide() {

    if (currentSlide >= totalSlides - 1) {
      return;
    }

    renderSlide(currentSlide + 1);

  }


  // Move to the previous slide.
  function previousSlide() {

    if (currentSlide <= 0) {
      return;
    }

    renderSlide(currentSlide - 1);

  }


  // Start automatic playback once.
  function startSlideshow() {

    if ( 
      slideshowTimer !== null ||
      slideshowStopped ||
      totalSlides <= 1
    ) {
      return;
    }


    slideshowTimer = window.setInterval(() => {

      if (currentSlide < totalSlides - 1) {
        nextSlide();
      } else {
        stopSlideshow();
      }

    }, certificateInterval);

  }


  // Manual controls stop automatic playback.
  previousButton?.addEventListener("click", () => {

    stopSlideshow();

    previousSlide();

  });


  nextButton?.addEventListener("click", () => {

    stopSlideshow();

    nextSlide();

  });


  // Initialize slideshow.
  if (certificateImage) {

    renderSlide(0);

    preloadCertificate(1);

    startSlideshow();

  }



  /* =======================================================
     08. CONTACT LINKS

     Change contact details in site-config.js.
     Do not edit the homepage HTML for normal link updates.
     ======================================================= */

  const whatsappLink = $("#whatsappLink");

  const emailLink = $("#emailLink");

  const linkedinLink = $("#linkedinLink");


  const phoneText = $("#phoneText");

  const emailText = $("#emailText");

  const linkedinText = $("#linkedinText");


  // WhatsApp number must include country code.
  const whatsappNumber = String(
    contactConfig.whatsappNumber || ""
  ).replace(/\D/g, "");


  if (whatsappLink && whatsappNumber) {

    whatsappLink.href =
      `https://wa.me/${whatsappNumber}`;

    whatsappLink.target = "_blank";

    whatsappLink.rel = "noopener noreferrer";

  }


  // Email opens the visitor's default email application.
  const emailAddress = String(
    contactConfig.email || ""
  ).trim();


  if (emailLink && emailAddress) {
    emailLink.href = `mailto:${emailAddress}`;
  }


  // Update visible contact details.
  if (phoneText) {
    phoneText.textContent =
      contactConfig.phoneDisplay || whatsappNumber;
  }

  if (emailText) {
    emailText.textContent = emailAddress;
  }


  // LinkedIn remains disabled until a real URL is added.
  const linkedinUrl = String(
    contactConfig.linkedinUrl || ""
  ).trim();


  if (linkedinLink) {

    if (linkedinUrl) {

      linkedinLink.href = linkedinUrl;

      linkedinLink.target = "_blank";

      linkedinLink.rel = "noopener noreferrer";

      linkedinLink.removeAttribute("aria-disabled");

      if (linkedinText) {
        linkedinText.textContent = "Visit my profile";
      }

    } else {

      linkedinLink.href = "#";

      linkedinLink.setAttribute("aria-disabled", "true");

      if (linkedinText) {
        linkedinText.textContent = "Profile link coming soon";
      }

      // Prevent an empty placeholder from jumping to the top.
      linkedinLink.addEventListener("click", event => {
        event.preventDefault();
      });

    }

  }



  /* =======================================================
     09. INITIALIZATION
     Run the essential setup after the HTML is available.
     ======================================================= */

  // Current year in footer.
  const yearElement = $("#year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  // Tech journey is selected by default.
  activateJourney("tech");


  // Set up scroll reveal effects.
  observeRevealElements();


  // Load the page requested by the current URL.
  initializePageNavigation();


  // Calculate navbar state after initial page layout.
  requestAnimationFrame(() => {
    updateFloatingNavbar();
  });


  // Preload first certificate.
  preloadCertificate(0);


  console.info(
    "Ajit Visual Sync initialized successfully."
  );

})();



