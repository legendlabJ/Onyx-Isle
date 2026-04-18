/* =====================================================================
   ONYX ISLE — VANILLA JS
   No framework. No build. Defensive everywhere.
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- 01. NAV: solid background on scroll ---------- */
  try {
    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () {
        if (window.scrollY > 40) nav.classList.add("nav--solid");
        else nav.classList.remove("nav--solid");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  } catch (e) {
    console.warn("[Onyx Isle] nav scroll setup failed:", e);
  }

  /* ---------- 02. PORTAL PASSWORD GATE ---------- */
  /* Ceremonial, not secure. Change the password below. */
  var GATE_PASSWORD = "threshold"; // Landyn: change this if you wish.
  var GATE_STORAGE_KEY = "onyx-isle-gate-passed";

  /* sessionStorage may throw on file:// or in private mode in some browsers.
     Wrap every access. */
  function safeGetSession(key) {
    try { return window.sessionStorage.getItem(key); }
    catch (e) { return null; }
  }
  function safeSetSession(key, value) {
    try { window.sessionStorage.setItem(key, value); }
    catch (e) { /* no-op */ }
  }

  try {
    var gate = document.querySelector(".gate");
    if (gate) {
      if (safeGetSession(GATE_STORAGE_KEY) === "yes") {
        gate.classList.add("hidden");
      }

      var form = gate.querySelector(".gate__form");
      var input = gate.querySelector(".gate__input");
      var error = gate.querySelector(".gate__error");

      if (form && input) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var value = (input.value || "").trim().toLowerCase();
          if (value === GATE_PASSWORD) {
            safeSetSession(GATE_STORAGE_KEY, "yes");
            gate.style.transition = "opacity 700ms ease";
            gate.style.opacity = "0";
            setTimeout(function () { gate.classList.add("hidden"); }, 700);
          } else {
            if (error) error.textContent = "Not quite. Try again.";
            input.value = "";
            input.focus();
          }
        });
      }
    }
  } catch (e) {
    console.warn("[Onyx Isle] gate setup failed:", e);
  }

  /* ---------- 03. FORM SUBMISSION (Formspree) ---------- */
  /* Replace YOUR_FORM_ID with your Formspree endpoint after creating
     a free account at formspree.io. Until then, forms log to console. */
  var FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

  try {
    var forms = document.querySelectorAll("form[data-oi-form]");
    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var formType = form.getAttribute("data-oi-form");
        var status = form.querySelector("[data-oi-status]");
        var submit = form.querySelector("button[type='submit']");
        if (status) status.textContent = "Sending...";
        if (submit) submit.disabled = true;

        var formData = new FormData(form);
        formData.append("_subject", "[Onyx Isle] " + formType);

        if (FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") !== -1) {
          var entries = {};
          formData.forEach(function (v, k) { entries[k] = v; });
          console.log("[Onyx Isle] form submission (placeholder mode):", entries);
          setTimeout(function () {
            if (status) status.textContent =
              "Received. Configure Formspree in js/main.js to enable live delivery.";
            form.reset();
            if (submit) submit.disabled = false;
          }, 600);
          return;
        }

        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        }).then(function (res) {
          if (res.ok) {
            if (status) status.textContent = "Received. We will be in touch shortly.";
            form.reset();
          } else {
            if (status) status.textContent =
              "Something went wrong. Please try again or write to us directly.";
          }
        }).catch(function () {
          if (status) status.textContent =
            "Network error. Please try again or write to us directly.";
        }).then(function () {
          if (submit) submit.disabled = false;
        });
      });
    });
  } catch (e) {
    console.warn("[Onyx Isle] form setup failed:", e);
  }

  /* ---------- 04. PORTAL NAV: active section highlighting ---------- */
  try {
    var portalLinks = document.querySelectorAll(".portal-nav__links a");
    if (portalLinks.length && "IntersectionObserver" in window) {
      var sections = [];
      Array.prototype.forEach.call(portalLinks, function (link) {
        var href = link.getAttribute("href") || "";
        var id = href.replace("#", "");
        var el = id ? document.getElementById(id) : null;
        if (el) sections.push(el);
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            Array.prototype.forEach.call(portalLinks, function (l) {
              l.classList.remove("active");
            });
            var link = document.querySelector(
              '.portal-nav__links a[href="#' + entry.target.id + '"]'
            );
            if (link) link.classList.add("active");
          }
        });
      }, { rootMargin: "-40% 0px -55% 0px" });

      sections.forEach(function (s) { io.observe(s); });
    }
  } catch (e) {
    console.warn("[Onyx Isle] portal nav setup failed:", e);
  }
})();
