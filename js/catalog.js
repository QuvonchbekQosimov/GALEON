const ensureHeaderBadgeStyles = () => {
  const ID = "galeon-header-badge-style";
  if (document.getElementById(ID)) return;

  const st = document.createElement("style");
  st.id = ID;
  st.textContent = `
.header-icon{position:relative;}
.header-icon .galeon-badge{
  position:absolute;
  top:-6px;
  right:-6px;
  min-width:18px;
  height:18px;
  padding:0 6px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  background:#23A8B3;
  color:#fff;
  font-size:12px;
  font-weight:700;
  line-height:1;
  box-shadow:0 8px 18px rgba(0,0,0,.14);
  pointer-events:none;
}
`;
  document.head.appendChild(st);
};

document.addEventListener("DOMContentLoaded", () => {
  const BRAND = "#23A8B3";
  const TRACK = "#d9e5ee";

  const HEART_OFF = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M13.2188 2.05469C15.3172 2.05469 17 3.7589 17 6.24121C16.9999 7.53032 16.4961 8.65655 15.4629 9.90332C14.4041 11.1809 12.8692 12.4934 10.9053 14.167C10.3273 14.6596 9.67856 15.2137 9 15.8037C8.3215 15.2137 7.6724 14.6593 7.09473 14.167C5.13078 12.4934 3.59589 11.1809 2.53711 9.90332C1.50392 8.65653 1.00013 7.5303 1 6.24121C1 3.7589 2.68276 2.05469 4.78125 2.05469C5.53145 2.05469 6.21282 2.2875 6.83105 2.76562C7.44011 3.23665 7.86415 3.85401 8.12305 4.32715L9 5.93066L9.87695 4.32715C10.1359 3.85401 10.5599 3.23664 11.1689 2.76562C11.7872 2.2875 12.4686 2.05469 13.2188 2.05469Z" stroke="#8D8D8D" stroke-width="2"/>
</svg>
`;

  const HEART_ON = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16" fill="none">
  <path d="M13.2188 0C12.242 0 11.3465 0.309516 10.5572 0.919969C9.80044 1.50521 9.29661 2.25063 9 2.79267C8.70339 2.2506 8.19956 1.50521 7.44282 0.919969C6.6535 0.309516 5.758 0 4.78125 0C2.05552 0 0 2.2295 0 5.18604C0 8.38013 2.5644 10.5655 6.44657 13.8738C7.10582 14.4356 7.85306 15.0724 8.62973 15.7516C8.73211 15.8413 8.86359 15.8906 9 15.8906C9.13641 15.8906 9.26789 15.8413 9.37027 15.7517C10.147 15.0724 10.8942 14.4356 11.5539 13.8734C15.4356 10.5655 18 8.38013 18 5.18604C18 2.2295 15.9445 0 13.2188 0Z" fill="#23A8B3"/>
</svg>
`;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toNumber = (value) => {
    if (value == null) return NaN;
    const cleaned = String(value)
      .replace(/\s/g, "")
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const getHeaderFavIcon = () =>
    document.querySelector(".header-icon--fav") ||
    document.querySelector(".header-fav") ||
    document.querySelector("[data-icon='fav']") ||
    null;

  const getHeaderCartIcon = () =>
    document.querySelector(".header-icon--cart") ||
    document.querySelector(".header-cart") ||
    document.querySelector("[data-icon='cart']") ||
    null;

  const ensureBadge = (iconEl) => {
    if (!iconEl) return null;
    const anchor = iconEl.querySelector("a") || iconEl;
    anchor.style.position = "relative";
    anchor.style.overflow = "visible";

    let badgeEl = anchor.querySelector(":scope > .galeon-badge");
    if (!badgeEl) {
      badgeEl = document.createElement("span");
      badgeEl.className = "galeon-badge";
      badgeEl.textContent = "0";
      anchor.appendChild(badgeEl);
    }
    return badgeEl;
  };

  ensureHeaderBadgeStyles();

  const favBadgeEl = ensureBadge(getHeaderFavIcon());
  const cartBadgeEl = ensureBadge(getHeaderCartIcon());

  const setHeaderBadge = (type, value) => {
    const n = Math.max(0, Math.round(Number(value) || 0));
    const txt = n > 99 ? "99+" : String(n);

    const el = type === "fav" ? favBadgeEl : cartBadgeEl;
    if (!el) return;

    el.textContent = txt;
    el.style.display = n > 0 ? "inline-flex" : "none";
  };

  const getHeaderBadge = (type) => {
    const el = type === "fav" ? favBadgeEl : cartBadgeEl;
    if (!el) return 0;
    const t = String(el.textContent || "0").replace("+", "");
    const n = Number(t);
    return Number.isFinite(n) ? n : 0;
  };

  const bumpHeaderBadge = (type, delta) => {
    setHeaderBadge(type, getHeaderBadge(type) + (Number(delta) || 0));
  };

  setHeaderBadge("fav", 0);
  setHeaderBadge("cart", 0);

  const filterBlocks = [
    ".products-filter__category",
    ".products-filter__price",
    ".products-filter__length",
    ".products-filter__width",
    ".products-filter__height",
    ".products-filter__weight",
    ".products-filter__variant",
  ];

  filterBlocks.forEach((blockSelector) => {
    const block = qs(blockSelector);
    if (!block) return;

    const title =
      qs(".filter-category__title", block) ||
      qs(".filter-price__title", block) ||
      qs(".filter-length__title", block) ||
      qs(".filter-width__title", block) ||
      qs(".filter-height__title", block) ||
      qs(".filter-weight__title", block) ||
      qs(".filter-variant__title", block);

    if (!title) return;

    title.style.display = "flex";
    title.style.alignItems = "center";
    title.style.justifyContent = "space-between";
    title.style.cursor = "pointer";
    title.style.userSelect = "none";

    if (!title.dataset.hasChevron) {
      const chevron = document.createElement("span");
      chevron.setAttribute("aria-hidden", "true");
      chevron.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="5" viewBox="0 0 9 5" fill="none">
          <path d="M4.16726 4.16663L8.33398 -5.43594e-05L0.000664122 -5.5088e-05L4.16726 4.16663Z" fill="#8E949B"/>
        </svg>
      `;
      chevron.style.display = "inline-flex";
      chevron.style.transition = "transform .15s ease";
      chevron.className = "js-filter-chevron";
      title.appendChild(chevron);
      title.dataset.hasChevron = "1";
    }

    const chevron = qs(".js-filter-chevron", title);
    const contentNodes = Array.from(block.children).filter((el) => el !== title);

    const setCollapsed = (collapsed) => {
      block.dataset.collapsed = collapsed ? "1" : "0";
      contentNodes.forEach((node) => (node.style.display = collapsed ? "none" : ""));
      if (chevron) chevron.style.transform = collapsed ? "rotate(-90deg)" : "rotate(0deg)";
    };

    setCollapsed(false);

    title.addEventListener("click", () => {
      const isCollapsed = block.dataset.collapsed === "1";
      setCollapsed(!isCollapsed);
    });
  });

  function makeDualRange({ blockSelector, rangeId, minMax, placeholders, gap = 0 }) {
    const block = qs(blockSelector);
    if (!block) return null;

    const rangeMin = qs(`#${rangeId}`, block);
    if (!rangeMin) return null;

    const startWrap =
      qs(".filter-price__start", block) ||
      qs(".filter-length__start", block) ||
      qs(".filter-width__start", block) ||
      qs(".filter-height__start", block) ||
      qs(".filter-weight__start", block);

    const endWrap =
      qs(".filter-price__end", block) ||
      qs(".filter-length__end", block) ||
      qs(".filter-width__end", block) ||
      qs(".filter-height__end", block) ||
      qs(".filter-weight__end", block);

    const inputMin = startWrap ? qs('input[type="number"]', startWrap) : null;
    const inputMax = endWrap ? qs('input[type="number"]', endWrap) : null;

    const sliderWrap =
      qs(".filter-price__slider", block) ||
      qs(".filter-length__slider", block) ||
      qs(".filter-width__slider", block) ||
      qs(".filter-height__slider", block) ||
      qs(".filter-weight__slider", block);

    if (!inputMin || !inputMax || !sliderWrap) return null;

    if (placeholders) {
      if (placeholders.min != null) inputMin.placeholder = String(placeholders.min);
      if (placeholders.max != null) inputMax.placeholder = String(placeholders.max);
    }

    const MIN = Number(minMax.min);
    const MAX = Number(minMax.max);

    rangeMin.min = String(MIN);
    rangeMin.max = String(MAX);

    let rangeMax = qs(`#${rangeId}Max`, block);
    if (!rangeMax) {
      rangeMax = rangeMin.cloneNode(true);
      rangeMax.id = `${rangeId}Max`;
      sliderWrap.appendChild(rangeMax);
    }

    rangeMax.min = String(MIN);
    rangeMax.max = String(MAX);

    sliderWrap.style.position = "relative";
    sliderWrap.style.height = "18px";
    sliderWrap.style.userSelect = "none";
    sliderWrap.style.webkitUserSelect = "none";
    sliderWrap.style.overflow = "visible";

    const ensureTrack = (className) => {
      let el = qs(`.${className}`, sliderWrap);
      if (!el) {
        el = document.createElement("div");
        el.className = className;
        sliderWrap.appendChild(el);
      }
      el.style.position = "absolute";
      el.style.left = "0";
      el.style.right = "0";
      el.style.top = "50%";
      el.style.height = "4px";
      el.style.transform = "translateY(-50%)";
      el.style.borderRadius = "999px";
      el.style.pointerEvents = "none";
      return el;
    };

    const baseTrack = ensureTrack(`${rangeId}-track`);
    const fillTrack = ensureTrack(`${rangeId}-fill`);

    baseTrack.style.background = TRACK;
    baseTrack.style.zIndex = "1";

    fillTrack.style.background = BRAND;
    fillTrack.style.zIndex = "2";
    fillTrack.style.left = "0";
    fillTrack.style.right = "auto";
    fillTrack.style.width = "0%";

    const styleRange = (rangeEl, zIndex) => {
      rangeEl.style.position = "absolute";
      rangeEl.style.left = "0";
      rangeEl.style.top = "0";
      rangeEl.style.width = "100%";
      rangeEl.style.height = "18px";
      rangeEl.style.margin = "0";
      rangeEl.style.background = "transparent";
      rangeEl.style.pointerEvents = "auto";
      rangeEl.style.zIndex = String(zIndex);
      rangeEl.style.outline = "none";
      rangeEl.style.boxShadow = "none";
      rangeEl.style.border = "0";
      rangeEl.style.webkitTapHighlightColor = "transparent";
      rangeEl.style.appearance = "none";
      rangeEl.style.webkitAppearance = "none";
      rangeEl.style.touchAction = "none";
      rangeEl.style.overflow = "visible";
    };

    styleRange(rangeMin, 3);
    styleRange(rangeMax, 4);

    const styleThumbs = () => {
      const styleId = `dual-range-style-${rangeId}`;
      if (document.getElementById(styleId)) return;

      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
#${rangeId}, #${rangeId}Max { -webkit-appearance:none; appearance:none; background:transparent; overflow:visible; }
#${rangeId}::-webkit-slider-runnable-track, #${rangeId}Max::-webkit-slider-runnable-track { height:18px; background:transparent; border:0; }
#${rangeId}::-moz-range-track, #${rangeId}Max::-moz-range-track { height:18px; background:transparent; border:0; }

#${rangeId}::-webkit-slider-thumb,
#${rangeId}Max::-webkit-slider-thumb {
  -webkit-appearance:none;
  appearance:none;
  width:14px;
  height:14px;
  border-radius:50%;
  background:${BRAND};
  border:2px solid ${BRAND};
  box-shadow:0 4px 10px rgba(0,0,0,.12);
  cursor:pointer;
  margin-top:2px;
}

#${rangeId}::-moz-range-thumb,
#${rangeId}Max::-moz-range-thumb {
  width:14px;
  height:14px;
  border-radius:50%;
  background:${BRAND};
  border:2px solid ${BRAND};
  box-shadow:0 4px 10px rgba(0,0,0,.12);
  cursor:pointer;
}

#${rangeId}::-moz-range-progress, #${rangeId}Max::-moz-range-progress { background:transparent; }
`;
      document.head.appendChild(styleEl);
    };

    styleThumbs();

    const pctByClientX = (clientX) => {
      const rect = sliderWrap.getBoundingClientRect();
      const w = rect.width || 1;
      return clamp((clientX - rect.left) / w, 0, 1);
    };

    const valueByClientX = (clientX) => MIN + pctByClientX(clientX) * (MAX - MIN);

    const pickActiveThumb = (clientX) => {
      const v = valueByClientX(clientX);
      const vMin = Number(rangeMin.value);
      const vMax = Number(rangeMax.value);

      if (Math.abs(v - vMin) <= Math.abs(v - vMax)) {
        rangeMin.style.zIndex = "6";
        rangeMax.style.zIndex = "5";
        return rangeMin;
      }
      rangeMax.style.zIndex = "6";
      rangeMin.style.zIndex = "5";
      return rangeMax;
    };

    const paint = () => {
      let vMin = Number(rangeMin.value);
      let vMax = Number(rangeMax.value);

      if (vMin > vMax - gap) {
        const active = document.activeElement;
        if (active === rangeMin) vMin = vMax - gap;
        else vMax = vMin + gap;

        vMin = clamp(vMin, MIN, MAX);
        vMax = clamp(vMax, MIN, MAX);
        rangeMin.value = String(vMin);
        rangeMax.value = String(vMax);
      }

      const denom = (MAX - MIN) || 1;
      const pMin = ((vMin - MIN) / denom) * 100;
      const pMax = ((vMax - MIN) / denom) * 100;

      const rect = sliderWrap.getBoundingClientRect();
      const w = rect.width || 1;

      const THUMB = 14;
      const R = THUMB / 2;

      const xMin = (pMin / 100) * w;
      const xMax = (pMax / 100) * w;

      if (xMax - xMin <= 2 * R) {
        fillTrack.style.left = `calc(${pMin}% + ${R}px)`;
        fillTrack.style.width = `0px`;
      } else {
        fillTrack.style.left = `calc(${pMin}% + ${R}px)`;
        fillTrack.style.width = `calc(${pMax - pMin}% - ${2 * R}px)`;
      }

      inputMin.value = String(Math.round(vMin));
      inputMax.value = String(Math.round(vMax));
    };

    const setFromInputs = () => {
      let vMin = toNumber(inputMin.value);
      let vMax = toNumber(inputMax.value);

      if (!Number.isFinite(vMin)) vMin = Number(rangeMin.value);
      if (!Number.isFinite(vMax)) vMax = Number(rangeMax.value);

      vMin = clamp(vMin, MIN, MAX);
      vMax = clamp(vMax, MIN, MAX);

      if (vMin > vMax - gap) vMin = clamp(vMax - gap, MIN, MAX);

      rangeMin.value = String(vMin);
      rangeMax.value = String(vMax);
      paint();
    };

    const attachPointerDrag = (rangeEl) => {
      rangeEl.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        const active = pickActiveThumb(e.clientX);

        const move = (ev) => {
          const v = Math.round(valueByClientX(ev.clientX));
          const curMin = Number(rangeMin.value);
          const curMax = Number(rangeMax.value);

          if (active === rangeMin) rangeMin.value = String(clamp(v, MIN, curMax - gap));
          else rangeMax.value = String(clamp(v, curMin + gap, MAX));

          paint();
        };

        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
      });
    };

    attachPointerDrag(rangeMin);
    attachPointerDrag(rangeMax);

    rangeMin.addEventListener("input", paint);
    rangeMax.addEventListener("input", paint);

    inputMin.addEventListener("input", setFromInputs);
    inputMax.addEventListener("input", setFromInputs);
    inputMin.addEventListener("blur", setFromInputs);
    inputMax.addEventListener("blur", setFromInputs);

    rangeMin.value = String(MIN);
    rangeMax.value = String(MAX);
    inputMin.value = String(MIN);
    inputMax.value = String(MAX);

    requestAnimationFrame(() => paint());

    return {
      getValues: () => ({ min: Number(rangeMin.value), max: Number(rangeMax.value) }),
      reset: () => {
        rangeMin.value = String(MIN);
        rangeMax.value = String(MAX);
        paint();
      },
    };
  }

  const priceDual = makeDualRange({
    blockSelector: ".products-filter__price",
    rangeId: "priceRange",
    minMax: { min: 0, max: 100000 },
    placeholders: { min: 0, max: 100000 },
    gap: 1,
  });

  const lengthDual = makeDualRange({
    blockSelector: ".products-filter__length",
    rangeId: "lengthRange",
    minMax: { min: 0, max: 2000 },
    placeholders: { min: 0, max: 2000 },
    gap: 1,
  });

  const widthDual = makeDualRange({
    blockSelector: ".products-filter__width",
    rangeId: "widthRange",
    minMax: { min: 0, max: 1000 },
    placeholders: { min: 0, max: 1000 },
    gap: 1,
  });

  const heightDual = makeDualRange({
    blockSelector: ".products-filter__height",
    rangeId: "heightRange",
    minMax: { min: 0, max: 1000 },
    placeholders: { min: 0, max: 1000 },
    gap: 1,
  });

  const weightDual = makeDualRange({
    blockSelector: ".products-filter__weight",
    rangeId: "weightRange",
    minMax: { min: 0, max: 1000 },
    placeholders: { min: 0, max: 1000 },
    gap: 1,
  });

  const categoryItems = qsa(".filter-category__item");
  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      categoryItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      applyFilters();
    });
  });

  const variantItems = qsa(".filter-variant__item");
  variantItems.forEach((item) => {
    item.classList.remove("is-selected");
    const boxSvg = qs("svg", item);
    if (boxSvg) {
      boxSvg.style.background = "#fff";
      boxSvg.style.borderColor = "#DCE3EC";
    }

    item.addEventListener("click", () => {
      item.classList.toggle("is-selected");
      const selected = item.classList.contains("is-selected");
      if (boxSvg) {
        boxSvg.style.background = selected ? BRAND : "#fff";
        boxSvg.style.borderColor = selected ? BRAND : "#DCE3EC";
      }
      applyFilters();
    });
  });

  const getSelectedVariants = () => {
    const map = {
      пустой: ["пустой"],
      "с пропластом": ["пропласт", "пропластом"],
      "с поропластом": ["поропласт", "поропластом"],
      "с делителями": ["делител"],
      "с колесами": ["колес"],
      "с органайзером": ["органайзер"],
    };

    const selected = variantItems
      .filter((i) => i.classList.contains("is-selected"))
      .map((i) => i.textContent.trim().toLowerCase());

    return selected.map((label) => map[label] || [label]);
  };

  const cards = qsa(".product-card");

  const initHeartIcons = () => {
    const likes = qsa(".product-card__like");
    likes.forEach((like) => {
      if (like.dataset.liked !== "0" && like.dataset.liked !== "1") like.dataset.liked = "0";
      like.innerHTML = like.dataset.liked === "1" ? HEART_ON : HEART_OFF;
    });
  };

  initHeartIcons();

  document.addEventListener("click", (e) => {
    const like = e.target.closest(".product-card__like");
    if (!like) return;

    e.preventDefault();
    e.stopPropagation();

    if (like.dataset.liked !== "0" && like.dataset.liked !== "1") {
      like.dataset.liked = "0";
      like.innerHTML = HEART_OFF;
    }

    const liked = like.dataset.liked === "1";
    like.dataset.liked = liked ? "0" : "1";
    like.innerHTML = liked ? HEART_OFF : HEART_ON;

    bumpHeaderBadge("fav", liked ? -1 : 1);
  });

  cards.forEach((card) => {
    const minus = qs(".card-number__minus", card);
    const plus = qs(".card-number__plus", card);
    let valEl = qs(".card-number__value", card);

    const ensureQtyInput = () => {
      const el = qs(".card-number__value", card);
      if (!el) return null;

      if (el.tagName === "INPUT") {
        el.type = "number";
        el.min = "1";
        el.max = "999";
        el.inputMode = "numeric";
        el.autocomplete = "off";
        el.spellcheck = false;
        return el;
      }

      const startVal = toNumber(el.textContent) || toNumber(card.dataset.qty) || 1;

      const input = document.createElement("input");
      input.className = el.className;
      input.type = "number";
      input.min = "1";
      input.max = "999";
      input.value = String(Math.max(1, Math.round(startVal)));
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.spellcheck = false;

      input.style.width = "44px";
      input.style.textAlign = "center";
      input.style.border = "1px solid #DCE3EC";
      input.style.borderRadius = "8px";
      input.style.height = "28px";
      input.style.outline = "none";
      input.style.boxShadow = "none";
      input.style.background = "#fff";

      el.replaceWith(input);
      return input;
    };

    valEl = ensureQtyInput();

    const readQty = () => {
      if (!valEl) return 1;
      return toNumber(valEl.value) || 1;
    };

    const writeQty = (n) => {
      const qty = clamp(Math.round(n), 1, 999);
      if (valEl) valEl.value = String(qty);
      card.dataset.qty = String(qty);
    };

    writeQty(readQty());

    if (valEl) {
      const sync = () => writeQty(readQty());
      valEl.addEventListener("input", sync);
      valEl.addEventListener("blur", sync);
      valEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          valEl.blur();
        }
      });
    }

    if (minus) {
      minus.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        writeQty(readQty() - 1);
      });
    }

    if (plus) {
      plus.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        writeQty(readQty() + 1);
      });
    }

    const btn = qs(".product-card__button", card);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        btn.style.transform = "scale(0.98)";
        setTimeout(() => (btn.style.transform = ""), 120);

        bumpHeaderBadge("cart", Number(card.dataset.qty || 1) || 1);
      });
    }
  });

  const searchInput = qs(".catalog-products__area .header-search input") || qs(".header-search input");

  function parseCardPrice(card) {
    const priceEl = qs(".product-card__price-value", card);
    if (!priceEl) return Infinity;
    const t = priceEl.textContent.trim().toLowerCase();
    if (t.includes("по запрос")) return Infinity;
    const n = toNumber(t);
    return Number.isFinite(n) ? n : Infinity;
  }

  function parseCardSize(card) {
    const sizeEl = qs(".product-card__size", card);
    if (!sizeEl) return { l: NaN, w: NaN, h: NaN };
    const nums = (sizeEl.textContent.match(/\d+/g) || []).map((x) => Number(x));
    return { l: nums[0] ?? NaN, w: nums[1] ?? NaN, h: nums[2] ?? NaN };
  }

  function cardMatchesVariants(card, selectedVariantKeywords) {
    if (!selectedVariantKeywords.length) return true;
    const title = (qs(".product-card__title", card)?.textContent || "").trim().toLowerCase();
    return selectedVariantKeywords.some((keywords) => keywords.some((k) => title.includes(k)));
  }

  function cardMatchesSearch(card) {
    const q = (searchInput?.value || "").trim().toLowerCase();
    if (!q) return true;
    const title = (qs(".product-card__title", card)?.textContent || "").trim().toLowerCase();
    return title.includes(q);
  }

  function applyFilters() {
    const p = priceDual ? priceDual.getValues() : { min: 0, max: Infinity };
    const len = lengthDual ? lengthDual.getValues() : { min: 0, max: Infinity };
    const wid = widthDual ? widthDual.getValues() : { min: 0, max: Infinity };
    const hei = heightDual ? heightDual.getValues() : { min: 0, max: Infinity };
    void weightDual;

    const selectedVariantKeywords = getSelectedVariants();

    let shown = 0;
    cards.forEach((card) => {
      const price = parseCardPrice(card);
      const { l, w, h } = parseCardSize(card);

      const okPrice = price >= p.min && price <= p.max;
      const okLen = !Number.isFinite(l) ? true : l >= len.min && l <= len.max;
      const okWid = !Number.isFinite(w) ? true : w >= wid.min && w <= wid.max;
      const okHei = !Number.isFinite(h) ? true : h >= hei.min && h <= hei.max;

      const okVariants = cardMatchesVariants(card, selectedVariantKeywords);
      const okSearch = cardMatchesSearch(card);

      const visible = okPrice && okLen && okWid && okHei && okVariants && okSearch;

      card.style.display = visible ? "" : "none";
      if (visible) shown += 1;
    });

    const foundEl = qs(".products-filter__find .number");
    if (foundEl) foundEl.textContent = `${shown} позиций`;
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);

  const showBtn = qs(".products-filter__button");
  if (showBtn) showBtn.addEventListener("click", applyFilters);

  const resetBtn = qs(".products-filter__reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (priceDual) priceDual.reset();
      if (lengthDual) lengthDual.reset();
      if (widthDual) widthDual.reset();
      if (heightDual) heightDual.reset();
      if (weightDual) weightDual.reset();

      variantItems.forEach((item) => {
        item.classList.remove("is-selected");
        const boxSvg = qs("svg", item);
        if (boxSvg) {
          boxSvg.style.background = "#fff";
          boxSvg.style.borderColor = "#DCE3EC";
        }
      });

      if (categoryItems.length) {
        categoryItems.forEach((i) => i.classList.remove("active"));
        const all = categoryItems.find((i) => i.textContent.trim().toLowerCase() === "все кейсы");
        (all || categoryItems[0]).classList.add("active");
      }

      if (searchInput) searchInput.value = "";

      cards.forEach((c) => (c.style.display = ""));
      const foundEl = qs(".products-filter__find .number");
      if (foundEl) foundEl.textContent = `${cards.length} позиций`;
    });
  }

  cards.forEach((c) => (c.style.display = ""));
  const foundEl = qs(".products-filter__find .number");
  if (foundEl) foundEl.textContent = `${cards.length} позиций`;
});
