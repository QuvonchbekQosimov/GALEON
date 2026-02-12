document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  const banner = $(".product-main__banner");
  const main = $(".product-main");
  const mainTitle = $(".product-main__subtitle");
  const mainDesc = $(".product-main__description");
  const mainBtn = $(".product-main__button");

  const setHeroInitial = () => {
    if (!banner || !main) return;

    // Initial state for animation (no CSS required)
    [mainTitle, mainDesc, mainBtn].forEach((el, idx) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = `translateY(${12 + idx * 6}px)`;
      el.style.transition = "opacity .6s ease, transform .6s ease";
      el.style.transitionDelay = `${idx * 80}ms`;
    });
  };

  const playHeroEnter = () => {
    if (!main) return;
    [mainTitle, mainDesc, mainBtn].forEach((el) => {
      if (!el) return;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  };

  if (!prefersReducedMotion()) {
    setHeroInitial();
    // small delay to allow render
    setTimeout(playHeroEnter, 80);
  }

  // Subtle parallax for banner background (creative, lightweight)
  if (banner && !prefersReducedMotion()) {
    const onScrollParallax = rafThrottle(() => {
      const y = window.scrollY || 0;
      // move bg slightly (0..40px)
      const shift = clamp(y * 0.08, 0, 40);
      banner.style.backgroundPosition = `center calc(50% + ${shift}px)`;
    });
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    onScrollParallax();
  }

  // Hero button smooth scroll to Favourite section
  if (mainBtn) {
    mainBtn.addEventListener("click", () => {
      const target =
        $(".product-favourite__subtitle") ||
        $(".product-favourite__grid") ||
        $(".product-favourite__bottom-row");
      if (!target) return;
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  // =========================
  // FAVOURITE – cards reveal + tilt + img CTA ripple
  // =========================
  const favouriteCards = $$(".product-favourite__grid .product-favourite__card")
    .concat($$(".product-favourite__bottom-row .product-favourite__card"));
  const favouriteImg = $(".product-favourite__img");
  const favouriteCta = $(".favourite-img__button");

  // Reveal on view (IntersectionObserver)
  const revealElements = [];
  favouriteCards.forEach((card) => revealElements.push(card));
  if (favouriteImg) revealElements.push(favouriteImg);

  const applyRevealBase = (el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    el.style.transition = "opacity .55s ease, transform .55s ease";
    el.style.willChange = "opacity, transform";
  };

  const reveal = (el, delay = 0) => {
    el.style.transitionDelay = `${delay}ms`;
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  };

  if (!prefersReducedMotion()) {
    revealElements.forEach(applyRevealBase);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const idx = revealElements.indexOf(el);
          reveal(el, clamp(idx * 60, 0, 240));
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((el) => io.observe(el));
  }

  // Card hover tilt (desktop only, creative)
  const enableTilt = !prefersReducedMotion() && window.matchMedia("(hover: hover)").matches;

  const addTilt = (card) => {
    card.style.transformStyle = "preserve-3d";
    card.style.transition = "transform .18s ease, box-shadow .18s ease";
    card.style.willChange = "transform";

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const rx = clamp(-dy * 4, -6, 6);
      const ry = clamp(dx * 4, -6, 6);

      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      card.style.boxShadow = "0 10px 30px rgba(19, 26, 35, 0.08)";
    };

    const onLeave = () => {
      card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
      card.style.boxShadow = "none";
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  };

  if (enableTilt) {
    favouriteCards.forEach(addTilt);
  }

  // CTA ripple on click
  const addRipple = (btn) => {
    btn.style.position = "relative";
    btn.style.overflow = "hidden";

    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 1.2;

      const ripple = document.createElement("span");
      ripple.style.position = "absolute";
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.borderRadius = "50%";
      ripple.style.background = "rgba(255,255,255,.35)";
      ripple.style.transform = "scale(0)";
      ripple.style.opacity = "1";
      ripple.style.pointerEvents = "none";
      ripple.style.transition = "transform .55s ease, opacity .7s ease";

      btn.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = "scale(1)";
        ripple.style.opacity = "0";
      });

      setTimeout(() => ripple.remove(), 750);
    });
  };

  if (favouriteCta) addRipple(favouriteCta);

  // Favourite CTA scroll to Improvement
  if (favouriteCta) {
    favouriteCta.addEventListener("click", () => {
      const target = $(".product-improvement__subtitle") || $(".product-improvement__cards");
      if (!target) return;
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    });
  }

  // =========================
  // IMPROVEMENT – equal image heights + modal preview (creative)
  // =========================
  const improvementCards = $$(".product-improvement__card");
  const improvementImgs = $$(".product-improvement__card .improvement-card__img img");

  // Make both images same height by using tallest natural ratio (safe)
  const syncImprovementHeights = () => {
    const wrappers = $$(".product-improvement__card .improvement-card__img");
    if (!wrappers.length) return;

    // On responsive, wrapper heights are already set in CSS; we only ensure equal in desktop
    const isDesktop = window.innerWidth > 992;
    if (!isDesktop) return;

    const heights = wrappers.map((w) => w.getBoundingClientRect().height);
    const maxH = Math.max(...heights, 0);
    wrappers.forEach((w) => (w.style.height = `${maxH}px`));
  };

  const onImgReady = () => syncImprovementHeights();
  improvementImgs.forEach((img) => {
    if (img.complete) onImgReady();
    else img.addEventListener("load", onImgReady, { once: true });
  });
  window.addEventListener("resize", rafThrottle(() => {
    if (window.innerWidth <= 992) {
      $$(".product-improvement__card .improvement-card__img").forEach((w) => (w.style.height = ""));
      return;
    }
    syncImprovementHeights();
  }));

  const createModal = () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(19,26,35,.72)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "18px";
    overlay.style.zIndex = "9999";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity .2s ease";

    const panel = document.createElement("div");
    panel.style.maxWidth = "1100px";
    panel.style.width = "100%";
    panel.style.maxHeight = "86vh";
    panel.style.background = "#fff";
    panel.style.borderRadius = "10px";
    panel.style.overflow = "hidden";
    panel.style.transform = "scale(.98)";
    panel.style.transition = "transform .2s ease";
    panel.style.boxShadow = "0 20px 60px rgba(0,0,0,.25)";

    const img = document.createElement("img");
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.maxHeight = "70vh";
    img.style.objectFit = "contain";
    img.style.background = "#0b0f14";

    const info = document.createElement("div");
    info.style.padding = "14px 16px";
    info.style.display = "flex";
    info.style.flexDirection = "column";
    info.style.gap = "6px";

    const title = document.createElement("div");
    title.style.fontSize = "16px";
    title.style.fontWeight = "700";
    title.style.color = "#131a23";

    const desc = document.createElement("div");
    desc.style.fontSize = "14px";
    desc.style.lineHeight = "1.45";
    desc.style.color = "#8d8d8d";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Закрыть";
    closeBtn.style.alignSelf = "flex-start";
    closeBtn.style.marginTop = "8px";
    closeBtn.style.padding = "10px 14px";
    closeBtn.style.borderRadius = "6px";
    closeBtn.style.border = "1px solid #e9eef3";
    closeBtn.style.background = "#fff";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontWeight = "700";
    closeBtn.style.color = "#131a23";

    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.borderColor = "#23a8b3";
      closeBtn.style.color = "#23a8b3";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.borderColor = "#e9eef3";
      closeBtn.style.color = "#131a23";
    });

    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(closeBtn);

    panel.appendChild(img);
    panel.appendChild(info);
    overlay.appendChild(panel);

    const open = ({ src, t, d }) => {
      img.src = src;
      title.textContent = t || "";
      desc.textContent = d || "";
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        overlay.style.opacity = "1";
        panel.style.transform = "scale(1)";
      });
    };

    const close = () => {
      overlay.style.opacity = "0";
      panel.style.transform = "scale(.98)";
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = "";
      }, 200);
    };

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.contains(overlay)) close();
    });

    return { open };
  };

  const modal = !prefersReducedMotion() ? createModal() : null;

  improvementCards.forEach((card) => {
    const imgEl = $(".improvement-card__img img", card);
    const titleEl = $(".improvement-card__title", card);
    const descEl = $(".improvement-card__description", card);
    const wrap = $(".improvement-card__img", card);

    if (wrap) {
      wrap.style.cursor = "zoom-in";
      wrap.addEventListener("click", () => {
        if (!modal || !imgEl) return;
        modal.open({
          src: imgEl.getAttribute("src"),
          t: titleEl ? titleEl.textContent.trim() : "",
          d: descEl ? descEl.textContent.trim() : "",
        });
      });
    }
  });

  // Improvement cards reveal (stagger)
  if (!prefersReducedMotion() && improvementCards.length) {
    improvementCards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(14px)";
      c.style.transition = "opacity .55s ease, transform .55s ease";
      c.style.willChange = "opacity, transform";
    });

    const io2 = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          improvementCards.forEach((c, i) => {
            setTimeout(() => {
              c.style.opacity = "1";
              c.style.transform = "translateY(0)";
            }, i * 90);
          });
          io2.disconnect();
        });
      },
      { threshold: 0.12 }
    );

    const trigger = $(".product-improvement__subtitle") || $(".product-improvement__cards");
    if (trigger) io2.observe(trigger);
  }
});
