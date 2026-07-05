/* ==========================================================================
   XING FLOORS — main.js
   Vanilla JS, no build step, no external dependencies. Progressive
   enhancement: all core content/links already work as plain HTML — this
   file only adds animation, filtering, and interactive niceties.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIG — placeholder business details.
     Replace these two values with your real details, everything on the
     page (floating button, footer CTA, contact card) reads from here.
     ------------------------------------------------------------------ */
  var CONFIG = {
    whatsappNumber: "65XXXXXXXX", // digits only, country code first, e.g. "6591234567"
    whatsappDefaultMessage: "Hi Xing Floors, I'd like to enquire about your flooring products."
  };

  function waLink(message) {
    var text = encodeURIComponent(message || CONFIG.whatsappDefaultMessage);
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + text;
  }

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    initHeaderScroll();
    initMobileNav();
    initReveal();
    initCounters();
    initProductFilter();
    initProductModal();
    initGalleryFilters();
    initBeforeAfterSliders();
    initForm();
    initWhatsappLinks();
    initBackToTop();
    initFloatingCtaVisibility();
    initFocusHelpers();
    initRecommender();
    initHeroParallax();
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function setYear() {
    var y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---- Header shrink-on-scroll ---- */
  function initHeaderScroll() {
    var header = $("#siteHeader");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  function initMobileNav() {
    var toggle = $("#navToggle");
    var nav = $("#mobileNav");
    var header = $("#siteHeader");
    if (!toggle || !nav) return;
    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (header) header.classList.remove("menu-open");
    }
    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (header) header.classList.add("menu-open");
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      isOpen ? close() : open();
    });
    $all("a", nav).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var targets = $all(".reveal, .reveal-stagger");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- Animated counters ---- */
  function initCounters() {
    var counters = $all("[data-counter]");
    if (!counters.length) return;
    var done = new WeakSet();
    function animate(el) {
      if (done.has(el)) return;
      done.add(el);
      var target = parseFloat(el.getAttribute("data-target"));
      var isDecimal = target % 1 !== 0;
      var suffixEl = el.querySelector(".suffix");
      var suffixHTML = suffixEl ? suffixEl.outerHTML : "";
      var start = 0;
      var duration = 1400;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = start + (target - start) * eased;
        el.innerHTML = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffixHTML;
        if (progress < 1) requestAnimationFrame(step);
        else el.innerHTML = (isDecimal ? target.toFixed(1) : target) + suffixHTML;
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---- Product tab filter ---- */
  function initProductFilter() {
    var tabs = $all(".product-tabs .tab-chip");
    var cards = $all(".product-card", $("#productGrid"));
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var filter = tab.getAttribute("data-filter");
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-cat") || "").split(" ");
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---- Product data + modal ---- */
  var PRODUCTS = {
    vinyl: {
      name: "Vinyl Flooring", cat: "Flooring", mat: "mat-vinyl",
      desc: "Waterproof, wood-look luxury vinyl planks and tiles that click or glue down over almost any existing subfloor — our most popular option for HDB and condo homes.",
      features: ["100% waterproof core", "Click-lock or glue-down installation", "Wide range of wood and stone visuals", "Installed in as little as 1 day for a typical flat"]
    },
    hybrid: {
      name: "Hybrid Engineered Wood", cat: "Flooring", mat: "mat-hybrid",
      desc: "A rigid, multi-layer core topped with a genuine timber-look surface — more dent- and scratch-resistant than standard laminate, with the warmth of real wood.",
      features: ["Dimensionally stable rigid core", "High dent & scratch resistance", "Authentic timber texture and tone", "Suitable for living rooms, bedrooms and offices"]
    },
    decking: {
      name: "Decking", cat: "Outdoor", mat: "mat-decking",
      desc: "Weather-resistant composite and timber decking for balconies, patios, rooftops and alfresco areas built to handle Singapore's climate.",
      features: ["UV and moisture resistant", "Low maintenance — no sanding or staining", "Slip-resistant surface finish", "Ideal for balconies, rooftops and gardens"]
    },
    wallpanel: {
      name: "Wall Panels", cat: "Panels", mat: "mat-wallpanel",
      desc: "3D-textured wall panels that install quickly over existing walls — instant visual impact for feature walls, TV consoles, headboards and retail interiors.",
      features: ["Quick installation over existing walls", "Multiple textures and tones available", "Hides minor wall imperfections", "Great for feature walls and retail fit-outs"]
    },
    fluted: {
      name: "Fluted Panels", cat: "Panels", mat: "mat-fluted",
      desc: "Vertical ribbed panels for a soft, architectural look — a favourite for cafés, offices and homes wanting a modern statement wall.",
      features: ["Distinctive vertical ribbed profile", "Softens acoustics slightly in a room", "Pairs well with warm lighting", "Popular for feature walls & reception areas"]
    },
    carpet: {
      name: "Carpets", cat: "Soft Furnishing", mat: "mat-carpet",
      desc: "Roll carpet and carpet tiles for bedrooms, offices and hospitality spaces — softer underfoot, quieter, and warmer in feel than hard flooring.",
      features: ["Roll carpet and modular carpet tiles", "Improves acoustic comfort in a room", "Wide range of colours and pile textures", "Great for bedrooms, offices and hotels"]
    },
    grass: {
      name: "Grass Carpet", cat: "Outdoor", mat: "mat-grass",
      desc: "Realistic artificial turf for balconies, gardens, playgrounds and event spaces — evergreen year-round, with no watering or mowing required.",
      features: ["UV-stabilised, fade resistant", "No watering, mowing or fertilising", "Soft, safe surface for kids and pets", "Great for balconies, gardens & event decor"]
    }
  };

  function initProductModal() {
    var modal = $("#productModal");
    if (!modal) return;
    var media = $("#modalMedia");
    var cat = $("#modalCat");
    var title = $("#modalTitle");
    var desc = $("#modalDesc");
    var features = $("#modalFeatures");
    var lastFocused = null;

    function open(key) {
      var p = PRODUCTS[key];
      if (!p) return;
      media.className = "placeholder-art " + p.mat;
      media.innerHTML = '<span class="ph-tag">Dummy image</span>';
      cat.textContent = p.cat;
      title.textContent = p.name;
      desc.textContent = p.desc;
      features.innerHTML = p.features.map(function (f) {
        return '<li><svg class="icon"><use href="#i-check"/></svg>' + f + "</li>";
      }).join("");
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var closeBtn = modal.querySelector(".product-modal-close");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    $all("[data-open-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () { open(btn.getAttribute("data-open-modal")); });
    });
    $all("[data-open-modal-link]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        open(link.getAttribute("data-open-modal-link"));
      });
    });
    $all("[data-close-modal]", modal).forEach(function (btn) {
      btn.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* ---- Gallery filters (type AND product) ---- */
  function initGalleryFilters() {
    var grid = $("#galleryGrid");
    if (!grid) return;
    var items = $all(".gallery-item", grid);
    var typeButtons = $all("[data-gfilter-type]");
    var productButtons = $all("[data-gfilter-product]");
    var state = { type: "all", product: "all" };
    var emptyMsg = $("#galleryEmpty");

    function apply() {
      var visibleCount = 0;
      items.forEach(function (item) {
        var typeOk = state.type === "all" || item.getAttribute("data-type") === state.type;
        var productOk = state.product === "all" || item.getAttribute("data-product") === state.product;
        var show = typeOk && productOk;
        item.classList.toggle("is-hidden", !show);
        if (show) visibleCount++;
      });
      if (emptyMsg) emptyMsg.classList.toggle("is-visible", visibleCount === 0);
    }
    typeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        typeButtons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.type = btn.getAttribute("data-gfilter-type");
        apply();
      });
    });
    productButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        productButtons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.product = btn.getAttribute("data-gfilter-product");
        apply();
      });
    });
  }

  /* ---- Before / after sliders ---- */
  function initBeforeAfterSliders() {
    $all("[data-ba]").forEach(function (slider) {
      var handle = slider.querySelector(".ba-handle");
      var after = slider.querySelector(".ba-after");
      var dragging = false;

      function setPosition(clientX) {
        var rect = slider.getBoundingClientRect();
        var pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * 100;
        after.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
      }
      function start(e) { dragging = true; move(e); }
      function move(e) {
        if (!dragging) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setPosition(clientX);
      }
      function end() { dragging = false; }

      handle.addEventListener("mousedown", start);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);
      handle.addEventListener("touchstart", start, { passive: true });
      window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("touchend", end);
      slider.addEventListener("click", function (e) { setPosition(e.clientX); });
    });
  }

  /* ---- Form validation + fake submit ---- */
  function initForm() {
    var form = $("#mainForm");
    if (!form) return;
    var success = $("#formSuccess");
    var resetBtn = $("#formReset");
    var fileInput = $("#fFile");
    var fileDrop = $("#fileDrop");
    var fileNameLabel = $("#fileName");

    var validators = {
      name: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return /^[0-9+()\-\s]{7,20}$/.test(v.trim()); },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
    };

    function validateField(fieldEl) {
      var name = fieldEl.getAttribute("data-field");
      var input = fieldEl.querySelector("input, select, textarea");
      var validator = validators[name];
      var valid = validator ? validator(input.value) : true;
      fieldEl.classList.toggle("has-error", !valid);
      return valid;
    }

    $all("[data-field]", form).forEach(function (fieldEl) {
      var input = fieldEl.querySelector("input, textarea");
      if (input) input.addEventListener("blur", function () { validateField(fieldEl); });
    });

    if (fileInput && fileDrop) {
      fileInput.addEventListener("change", function () {
        if (fileInput.files && fileInput.files[0]) {
          fileNameLabel.textContent = fileInput.files[0].name;
        }
      });
      ["dragenter", "dragover"].forEach(function (evt) {
        fileDrop.addEventListener(evt, function (e) {
          e.preventDefault();
          fileDrop.classList.add("is-dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (evt) {
        fileDrop.addEventListener(evt, function (e) {
          e.preventDefault();
          fileDrop.classList.remove("is-dragover");
        });
      });
      fileDrop.addEventListener("drop", function (e) {
        var dt = e.dataTransfer;
        if (dt && dt.files && dt.files[0]) {
          fileInput.files = dt.files;
          fileNameLabel.textContent = dt.files[0].name;
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var requiredFields = $all("[data-field]", form).filter(function (f) {
        return f.querySelector("[required]");
      });
      var allValid = true;
      requiredFields.forEach(function (f) { if (!validateField(f)) allValid = false; });

      var consent = $("#fConsent");
      if (consent && !consent.checked) {
        allValid = false;
        showToast("Please agree to be contacted before submitting.");
      }
      if (!allValid) {
        var firstError = form.querySelector(".has-error");
        if (firstError) firstError.querySelector("input,select,textarea").focus();
        return;
      }

      var submitBtn = $("#formSubmit");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      setTimeout(function () {
        form.classList.add("is-hidden");
        success.classList.add("is-visible");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg class="icon"><use href="#i-send"/></svg> Submit Enquiry';
      }, 500);
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        if (fileNameLabel) fileNameLabel.textContent = "";
        $all(".has-error", form).forEach(function (f) { f.classList.remove("has-error"); });
        success.classList.remove("is-visible");
        form.classList.remove("is-hidden");
      });
    }
  }

  /* ---- WhatsApp links ---- */
  function initWhatsappLinks() {
    var floating = $("#floatingWhatsapp");
    var convertLink = $("#convertWhatsapp");
    var link = waLink();
    if (floating) floating.href = link;
    if (convertLink) convertLink.href = link;
  }

  /* ---- Back to top ---- */
  function initBackToTop() {
    var btn = $("#backToTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Hide floating quote/WhatsApp buttons while the hero itself is
     visible, so they never overlap the hero's own CTAs/stats ---- */
  function initFloatingCtaVisibility() {
    var container = $(".floating-ctas");
    var hero = $("#top");
    if (!container || !hero) return;
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        container.classList.toggle("in-hero", entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    io.observe(hero);
  }

  /* ---- Focus helpers (Send Floor Plan / Book Consultation CTAs) ---- */
  function initFocusHelpers() {
    $all("[data-focus-upload]").forEach(function (el) {
      el.addEventListener("click", function () {
        setTimeout(function () {
          var drop = $("#fileDrop");
          if (drop) drop.focus();
        }, 500);
      });
    });
    $all("[data-focus]").forEach(function (el) {
      el.addEventListener("click", function () {
        setTimeout(function () {
          var target = document.getElementById("f" + el.getAttribute("data-focus").charAt(0).toUpperCase() + el.getAttribute("data-focus").slice(1));
          if (target) target.focus();
        }, 500);
      });
    });
  }

  /* ---- Flooring recommender ---- */
  function initRecommender() {
    var submit = $("#recSubmit");
    if (!submit) return;
    var spaceSel = $("#recSpace");
    var prioritySel = $("#recPriority");
    var result = $("#recResult");

    var RULES = {
      "Living Room|Waterproof": "vinyl", "Living Room|Budget-Friendly": "vinyl",
      "Living Room|Premium Look": "hybrid", "Living Room|Low Maintenance": "vinyl",
      "Living Room|Soft & Cozy": "carpet",
      "Bedroom|Waterproof": "vinyl", "Bedroom|Budget-Friendly": "vinyl",
      "Bedroom|Premium Look": "hybrid", "Bedroom|Low Maintenance": "vinyl",
      "Bedroom|Soft & Cozy": "carpet",
      "Office|Waterproof": "vinyl", "Office|Budget-Friendly": "vinyl",
      "Office|Premium Look": "hybrid", "Office|Low Maintenance": "vinyl",
      "Office|Soft & Cozy": "carpet",
      "Retail/Commercial|Waterproof": "vinyl", "Retail/Commercial|Budget-Friendly": "vinyl",
      "Retail/Commercial|Premium Look": "hybrid", "Retail/Commercial|Low Maintenance": "vinyl",
      "Retail/Commercial|Soft & Cozy": "carpet",
      "Balcony/Outdoor|Waterproof": "decking", "Balcony/Outdoor|Budget-Friendly": "grass",
      "Balcony/Outdoor|Premium Look": "decking", "Balcony/Outdoor|Low Maintenance": "grass",
      "Balcony/Outdoor|Soft & Cozy": "grass"
    };

    submit.addEventListener("click", function () {
      var space = spaceSel.value, priority = prioritySel.value;
      if (!space || !priority) {
        showToast("Please choose a space and a priority first.");
        return;
      }
      var key = RULES[space + "|" + priority] || "vinyl";
      var p = PRODUCTS[key];
      result.style.display = "block";
      result.innerHTML =
        '<strong style="display:block;margin-bottom:0.3rem">Suggested for you: ' + p.name + '</strong>' +
        '<span style="font-size:0.85rem;opacity:0.85">' + p.desc + '</span>' +
        '<div style="display:flex;gap:0.6rem;margin-top:0.9rem;flex-wrap:wrap">' +
        '<a class="btn btn-primary btn-sm" href="' + waLink("Hi Xing Floors, I'm looking for " + p.name + " for my " + space + ". Priority: " + priority + ".") + '" target="_blank" rel="noopener">Confirm on WhatsApp</a>' +
        '<button class="btn btn-outline on-dark btn-sm" data-open-modal="' + key + '">View Product</button>' +
        '</div>';
      var modalBtn = result.querySelector("[data-open-modal]");
      if (modalBtn) {
        modalBtn.addEventListener("click", function () {
          document.querySelector('[data-open-modal="' + key + '"]').click();
        });
      }
    });
  }

  /* ---- Subtle hero parallax (mouse move, desktop only, respects reduced motion) ---- */
  function initHeroParallax() {
    var planks = $("#heroPlanks");
    if (!planks) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 900px)").matches) return;
    document.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 12;
      var y = (e.clientY / window.innerHeight - 0.5) * 12;
      planks.style.transform = "translate(" + x + "px," + y + "px)";
    });
  }

  /* ---- Toast ---- */
  var toastTimer = null;
  function showToast(message) {
    var toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3200);
  }

  window.XingFloors = { showToast: showToast, waLink: waLink };
})();
