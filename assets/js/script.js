/* Saparé · Travel Atelier — interactions & premium motion */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Hero title word stagger ---------- */
  var heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    var words = heroTitle.querySelectorAll(".w");
    words.forEach(function (w, i) { w.style.transitionDelay = (0.15 + i * 0.055) + "s"; });
    requestAnimationFrame(function () {
      setTimeout(function () { heroTitle.classList.add("in"); }, 120);
    });
  }

  /* ---------- Hero slider (crossfade + Ken Burns) ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsWrap = document.getElementById("heroDots");
  if (slides.length && dotsWrap) {
    var current = 0;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Слайд " + (i + 1));
      if (i === 0) b.classList.add("active");
      b.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");

    function go(n) {
      if (n === current) return;
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("active");
      current = n;
      slides[current].classList.add("is-active");
      dots[current].classList.add("active");
    }
    function next() { go((current + 1) % slides.length); }
    var timer = setInterval(next, 5200);
    // pause on hover for usability
    var hero = document.getElementById("hero");
    hero.addEventListener("mouseenter", function () { clearInterval(timer); });
    hero.addEventListener("mouseleave", function () { timer = setInterval(next, 5200); });
  }

  /* ---------- Scroll reveal with per-group stagger ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var sibs = Array.prototype.slice.call(parent.children).filter(function (c) { return c.classList.contains("reveal"); });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = (idx * 0.08) + "s";
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  function formatNum(v, dec) {
    if (dec) return v.toFixed(dec).replace(".", ".");
    return Math.round(v).toLocaleString("ru-RU").replace(/,/g, " ");
  }
  function runCounter(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var plus = el.getAttribute("data-plus") ? "+" : "";
    if (reduceMotion) { el.textContent = formatNum(to, dec) + plus; return; }
    var start = performance.now(), dur = 1500;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(to * eased, dec) + (p === 1 ? plus : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var nums = document.querySelectorAll(".num");
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io2.observe(n); });
  } else {
    nums.forEach(runCounter);
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var ans = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var open = item.classList.contains("open");
      faqItems.forEach(function (it) {
        it.classList.remove("open");
        it.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        it.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  });

  /* ---------- Forms (no backend → friendly confirmation + WhatsApp) ---------- */
  function flash(btn, text) {
    var orig = btn.innerHTML;
    btn.innerHTML = text;
    btn.disabled = true;
    setTimeout(function () { btn.innerHTML = orig; btn.disabled = false; }, 2600);
  }
  var searchForm = document.getElementById("searchWidget");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var dir = document.getElementById("sw-dir").value;
      var when = document.getElementById("sw-date").value || "ближайшие даты";
      var msg = encodeURIComponent("Здравствуйте! Хочу подобрать тур: " + dir + ", " + when + ". Пришлите, пожалуйста, 3 варианта.");
      flash(searchForm.querySelector(".sw-submit"), "Готовим варианты…");
      setTimeout(function () { window.open("https://wa.me/77010000000?text=" + msg, "_blank"); }, 700);
    });
  }
  var ctaForm = document.getElementById("ctaForm");
  if (ctaForm) {
    ctaForm.addEventListener("submit", function (e) {
      e.preventDefault();
      flash(ctaForm.querySelector(".btn"), "Заявка отправлена ✓");
      ctaForm.reset();
    });
  }
})();
