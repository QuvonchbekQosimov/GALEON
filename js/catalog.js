document.addEventListener("DOMContentLoaded", () => {
  const BRAND = "#23A8B3";
  const TRACK = "#d9e5ee";

  const HEART_OFF = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M13.2188 2.05469C15.3172 2.05469 17 3.7589 17 6.24121C16.9999 7.53032 16.4961 8.65655 15.4629 9.90332C14.4041 11.1809 12.8692 12.4934 10.9053 14.167C10.3273 14.6596 9.67856 15.2137 9 15.8037C8.3215 15.2137 7.6724 14.6593 7.09473 14.167C5.13078 12.4934 3.59589 11.1809 2.53711 9.90332C1.50392 8.65653 1.00013 7.5303 1 6.24121C1 3.7589 2.68276 2.05469 4.78125 2.05469C5.53145 2.05469 6.21282 2.2875 6.83105 2.76562C7.44011 3.23665 7.86415 3.85401 8.12305 4.32715L9 5.93066L9.87695 4.32715C10.1359 3.85401 10.5599 3.23664 11.1689 2.76562C11.7872 2.2875 12.4686 2.05469 13.2188 2.05469Z"
            stroke="#8D8D8D" stroke-width="2"/>
    </svg>
  `;

  const HEART_ON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M13.2188 1.05469C12.242 1.05469 11.3465 1.3642 10.5572 1.97466C9.80044 2.5599 9.29661 3.30532 9 3.84736C8.70339 3.30528 8.19956 2.5599 7.44282 1.97466C6.6535 1.3642 5.758 1.05469 4.78125 1.05469C2.05552 1.05469 0 3.28419 0 6.24073C0 9.43481 2.5644 11.6202 6.44657 14.9285C7.10582 15.4903 7.85306 16.1271 8.62973 16.8063C8.73211 16.896 8.86359 16.9453 9 16.9453C9.13641 16.9453 9.26789 16.896 9.37027 16.8063C10.147 16.1271 10.8942 15.4903 11.5539 14.9281C15.4356 11.6202 18 9.43481 18 6.24073C18 3.28419 15.9445 1.05469 13.2188 1.05469Z"
            fill="#23A8B3"/>
    </svg>
  `;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toNum = (v) => {
    if (v == null) return NaN;
    const cleaned = String(v)
      .replace(/\s/g, "")
      .replace(/[^\d.,-]/g, "")
      .replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  };

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const ensureHeaderBadgeStyles = () => {
    const ID = "galeon-header-badge-style-catalog";
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

  const getHeaderFavIcon = () =>
    document.querySelector(".header-icon--fav") ||
    document.querySelector(".header-fav") ||
    document.querySelectorAll(".header-icon")[1] ||
    null;

  const getHeaderCartIcon = () =>
    document.querySelector(".header-icon--cart") ||
    document.querySelector(".header-cart") ||
    document.querySelectorAll(".header-icon")[2] ||
    null;

  const ensureBadge = (iconEl) => {
    if (!iconEl) return null;
    iconEl.style.position = "relative";
    iconEl.style.overflow = "visible";

    let b = iconEl.querySelector(".galeon-badge");
    if (!b) {
      b = document.createElement("span");
      b.className = "galeon-badge";
      b.textContent = "0";
      iconEl.appendChild(b);
    }
    return b;
  };

  ensureHeaderBadgeStyles();

  const favIconEl = getHeaderFavIcon();
  const cartIconEl = getHeaderCartIcon();

  const favBadgeEl = ensureBadge(favIconEl);
  const cartBadgeEl = ensureBadge(cartIconEl);

  const setHeaderBadge = (type, value) => {
    const n = Math.max(0, Math.round(Number(value) || 0));
    const el = type === "fav" ? favBadgeEl : cartBadgeEl;
    if (!el) return;
    el.textContent = n > 99 ? "99+" : String(n);
    el.style.display = n > 0 ? "inline-flex" : "none";
  };

  const getHeaderBadge = (type) => {
    const el = type === "fav" ? favBadgeEl : cartBadgeEl;
    if (!el) return 0;
    const t = String(el.textContent || "0").replace("+", "");
    const n = toNum(t);
    return Number.isFinite(n) ? n : 0;
  };

  const bumpHeaderBadge = (type, delta) => {
    setHeaderBadge(type, getHeaderBadge(type) + (Number(delta) || 0));
  };

  const bumpHeaderFav = (delta) => bumpHeaderBadge("fav", delta);
  const bumpHeaderCart = (delta) => bumpHeaderBadge("cart", delta);

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

  filterBlocks.forEach((blockSel) => {
    const block = qs(blockSel);
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
      contentNodes.forEach((n) => (n.style.display = collapsed ? "none" : ""));
      if (chevron) chevron.style.transform = collapsed ? "rotate(-90deg)" : "rotate(0deg)";

      const sliders = qsa('input[type="range"]', block);
      sliders.forEach((r) => {
        const ev = new Event("input", { bubbles: true });
        r.dispatchEvent(ev);
      });
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

    const inputMin = startWrap ? qs('input[type="text"], input[type="number"]', startWrap) : null;
    const inputMax = endWrap ? qs('input[type="text"], input[type="number"]', endWrap) : null;

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

    const THUMB_SIZE = 16;
    const THUMB_RADIUS = THUMB_SIZE / 2;
    const TRACK_HEIGHT = 4;
    const RANGE_HEIGHT = 18;

    rangeMin.type = "range";
    rangeMin.min = String(MIN);
    rangeMin.max = String(MAX);
    rangeMin.classList.add("slider");

    if (rangeMin.parentElement !== sliderWrap) {
      sliderWrap.appendChild(rangeMin);
    }

    let rangeMax = qs(`#${rangeId}Max`, block);
    if (!rangeMax) {
      rangeMax = rangeMin.cloneNode(true);
      rangeMax.id = `${rangeId}Max`;
      sliderWrap.appendChild(rangeMax);
    } else if (rangeMax.parentElement !== sliderWrap) {
      sliderWrap.appendChild(rangeMax);
    }

    rangeMax.type = "range";
    rangeMax.min = String(MIN);
    rangeMax.max = String(MAX);
    rangeMax.classList.add("slider");

    sliderWrap.style.position = "relative";
    sliderWrap.style.height = `${RANGE_HEIGHT}px`;
    sliderWrap.style.userSelect = "none";
    sliderWrap.style.webkitUserSelect = "none";
    sliderWrap.style.overflow = "visible";
    sliderWrap.style.boxSizing = "border-box";
    sliderWrap.style.paddingLeft = `${THUMB_RADIUS}px`;
    sliderWrap.style.paddingRight = `${THUMB_RADIUS}px`;

    const ensureTrack = (cls) => {
      let el = qs(`.${cls}`, sliderWrap);
      if (!el) {
        el = document.createElement("div");
        el.className = cls;
        sliderWrap.appendChild(el);
      }
      el.style.position = "absolute";
      el.style.left = `${THUMB_RADIUS}px`;
      el.style.right = `${THUMB_RADIUS}px`;
      el.style.top = "50%";
      el.style.height = `${TRACK_HEIGHT}px`;
      el.style.transform = "translateY(-50%)";
      el.style.borderRadius = "999px";
      el.style.pointerEvents = "none";
      return el;
    };

    const base = ensureTrack(`${rangeId}-track`);
    const fill = ensureTrack(`${rangeId}-fill`);

    base.style.background = TRACK;
    base.style.zIndex = "1";

    fill.style.background = BRAND;
    fill.style.zIndex = "2";

    const styleRange = (r, z) => {
      r.style.position = "absolute";
      r.style.left = "0";
      r.style.top = "0";
      r.style.width = "100%";
      r.style.height = `${RANGE_HEIGHT}px`;
      r.style.margin = "0";
      r.style.padding = "0";
      r.style.border = "0";
      r.style.background = "transparent";
      r.style.pointerEvents = "auto";
      r.style.zIndex = String(z);
      r.style.outline = "none";
      r.style.boxShadow = "none";
      r.style.webkitTapHighlightColor = "transparent";
      r.style.appearance = "none";
      r.style.webkitAppearance = "none";
      r.style.touchAction = "none";
      r.style.overflow = "visible";
      r.style.boxSizing = "border-box";
    };

    styleRange(rangeMin, 10);
    styleRange(rangeMax, 11);

    const styleThumbs = () => {
      const styleId = `dual-range-style-${rangeId}`;
      if (document.getElementById(styleId)) return;

      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
#${rangeId}, #${rangeId}Max { -webkit-appearance:none; appearance:none; background:transparent; padding:0; border:0; }
#${rangeId}:focus, #${rangeId}Max:focus { outline:none; }
#${rangeId}::-webkit-slider-runnable-track, #${rangeId}Max::-webkit-slider-runnable-track { height:${RANGE_HEIGHT}px; background:transparent; }
#${rangeId}::-moz-range-track, #${rangeId}Max::-moz-range-track { height:${RANGE_HEIGHT}px; background:transparent; }
#${rangeId}::-webkit-slider-thumb,
#${rangeId}Max::-webkit-slider-thumb {
  -webkit-appearance:none;
  appearance:none;
  width:${THUMB_SIZE}px;
  height:${THUMB_SIZE}px;
  border-radius:50%;
  background:${BRAND};
  border:2px solid #fff;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
  cursor:pointer;
  margin-top:${(RANGE_HEIGHT - THUMB_SIZE) / 2}px;
}
#${rangeId}::-moz-range-thumb,
#${rangeId}Max::-moz-range-thumb {
  width:${THUMB_SIZE}px;
  height:${THUMB_SIZE}px;
  border-radius:50%;
  background:${BRAND};
  border:2px solid #fff;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
  cursor:pointer;
}
`;
      document.head.appendChild(styleEl);
    };

    styleThumbs();

    const usable = () => {
      const rect = sliderWrap.getBoundingClientRect();
      const left = rect.left + THUMB_RADIUS;
      const right = rect.right - THUMB_RADIUS;
      const width = Math.max(1, right - left);
      return { left, right, width };
    };

    const pctByClientX = (clientX) => {
      const u = usable();
      return clamp((clientX - u.left) / u.width, 0, 1);
    };

    const valueByClientX = (clientX) => {
      const pct = pctByClientX(clientX);
      return MIN + pct * (MAX - MIN);
    };

    const pickActiveThumb = (clientX) => {
      const v = valueByClientX(clientX);
      const vMin = Number(rangeMin.value);
      const vMax = Number(rangeMax.value);

      if (Math.abs(v - vMin) <= Math.abs(v - vMax)) {
        rangeMin.style.zIndex = "12";
        rangeMax.style.zIndex = "11";
        return rangeMin;
      } else {
        rangeMax.style.zIndex = "12";
        rangeMin.style.zIndex = "11";
        return rangeMax;
      }
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

      const ratioMin = (vMin - MIN) / (MAX - MIN);
      const ratioMax = (vMax - MIN) / (MAX - MIN);

      fill.style.left = `${ratioMin * 100}%`;
      fill.style.right = `${(1 - ratioMax) * 100}%`;

      inputMin.value = String(Math.round(vMin));
      inputMax.value = String(Math.round(vMax));
    };

    const setFromInputs = () => {
      let vMin = toNum(inputMin.value);
      let vMax = toNum(inputMax.value);

      if (!Number.isFinite(vMin)) vMin = Number(rangeMin.value);
      if (!Number.isFinite(vMax)) vMax = Number(rangeMax.value);

      vMin = clamp(vMin, MIN, MAX);
      vMax = clamp(vMax, MIN, MAX);

      if (vMin > vMax - gap) vMin = clamp(vMax - gap, MIN, MAX);

      rangeMin.value = String(vMin);
      rangeMax.value = String(vMax);
      paint();
    };

    const onRangePointerDown = (e) => {
      e.preventDefault();
      const active = pickActiveThumb(e.clientX);

      const move = (ev) => {
        const v = Math.round(valueByClientX(ev.clientX));
        const curMin = Number(rangeMin.value);
        const curMax = Number(rangeMax.value);

        if (active === rangeMin) {
          rangeMin.value = String(clamp(v, MIN, curMax - gap));
        } else {
          rangeMax.value = String(clamp(v, curMin + gap, MAX));
        }
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
    };

    rangeMin.addEventListener("pointerdown", onRangePointerDown);
    rangeMax.addEventListener("pointerdown", onRangePointerDown);

    rangeMin.addEventListener("input", paint);
    rangeMax.addEventListener("input", paint);

    inputMin.addEventListener("input", setFromInputs);
    inputMax.addEventListener("input", setFromInputs);
    inputMin.addEventListener("blur", setFromInputs);
    inputMax.addEventListener("blur", setFromInputs);

    rangeMin.value = String(MIN);
    rangeMax.value = String(MAX);
    inputMin.value = String(Math.round(MIN));
    inputMax.value = String(Math.round(MAX));

    requestAnimationFrame(() => paint());
    setTimeout(() => paint(), 0);
    setTimeout(() => paint(), 60);

    return {
      getValues: () => ({ min: Number(rangeMin.value), max: Number(rangeMax.value) }),
      reset: () => {
        rangeMin.value = String(MIN);
        rangeMax.value = String(MAX);
        inputMin.value = String(MIN);
        inputMax.value = String(MAX);
        paint();
      },
      repaint: () => paint(),
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

  const normalize = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const getSelectedCategory = () => {
    const active = categoryItems.find((i) => i.classList.contains("active"));
    return normalize(active ? active.textContent : "");
  };

  const cardMatchesCategory = (card, categoryLabel) => {
    const label = normalize(categoryLabel);
    if (!label || label === "все кейсы") return true;

    const title = normalize(qs(".product-card__title", card)?.textContent || "");
    const sizeText = normalize(qs(".product-card__size", card)?.textContent || "");

    if (label === "мини кейсы") return title.includes("мини") || title.includes("mini");
    if (label === "средние кейсы") return title.includes("средн") || title.includes("middle") || title.includes("medium");
    if (label === "большие кейсы") return title.includes("больш") || title.includes("large") || title.includes("big");
    if (label === "длинные кейсы") return title.includes("длин") || title.includes("long");
    if (label === "кейсы для ноутбуков") return title.includes("ноут") || title.includes("laptop") || title.includes("macbook");
    if (label === "контейнеры") return title.includes("контейнер") || title.includes("container");

    if (sizeText) return sizeText.includes(label);
    return true;
  };

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
      "пустой": ["пустой"],
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

  cards.forEach((card) => {
    const like = qs(".product-card__like", card);
    if (!like) return;

    like.innerHTML = HEART_OFF;
    like.dataset.liked = "0";

    like.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const liked = like.dataset.liked === "1";
      like.dataset.liked = liked ? "0" : "1";
      like.innerHTML = liked ? HEART_OFF : HEART_ON;

      bumpHeaderFav(liked ? -1 : 1);
    });
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

      const startVal = toNum(el.textContent) || toNum(card.dataset.qty) || 1;

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
      return toNum(valEl.value) || 1;
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

        const qty = Number(card.dataset.qty || 1) || 1;
        bumpHeaderCart(qty);
      });
    }
  });

  const searchInput =
    qs(".catalog-products__area .header-search input") || qs(".header-search input");

  function parseCardPrice(card) {
    const priceEl = qs(".product-card__price-value", card);
    if (!priceEl) return { value: NaN, isRequest: true };

    const t = String(priceEl.textContent || "").trim().toLowerCase();
    if (t.includes("по запрос")) return { value: NaN, isRequest: true };

    const n = toNum(t);
    if (!Number.isFinite(n)) return { value: NaN, isRequest: true };

    return { value: n, isRequest: false };
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
    const selectedCategory = getSelectedCategory();

    const priceDefaultMax = 100000;
    const isDefaultPrice = Number(p.min) === 0 && Number(p.max) === priceDefaultMax;

    let shown = 0;

    cards.forEach((card) => {
      const priceObj = parseCardPrice(card);
      const priceVal = priceObj.value;

      const { l, w, h } = parseCardSize(card);

      const okPrice = priceObj.isRequest
        ? isDefaultPrice
        : priceVal >= p.min && priceVal <= p.max;

      const okLen = !Number.isFinite(l) ? true : l >= len.min && l <= len.max;
      const okWid = !Number.isFinite(w) ? true : w >= wid.min && w <= wid.max;
      const okHei = !Number.isFinite(h) ? true : h >= hei.min && h <= hei.max;

      const okVariants = cardMatchesVariants(card, selectedVariantKeywords);
      const okSearch = cardMatchesSearch(card);
      const okCategory = cardMatchesCategory(card, selectedCategory);

      const visible = okPrice && okLen && okWid && okHei && okVariants && okSearch && okCategory;

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
      priceDual?.reset();
      lengthDual?.reset();
      widthDual?.reset();
      heightDual?.reset();
      weightDual?.reset();

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
        const all = categoryItems.find(
          (i) => i.textContent.trim().toLowerCase() === "все кейсы"
        );
        (all || categoryItems[0]).classList.add("active");
      }

      if (searchInput) searchInput.value = "";

      cards.forEach((c) => (c.style.display = ""));
      const foundEl = qs(".products-filter__find .number");
      if (foundEl) foundEl.textContent = `${cards.length} позиций`;

      priceDual?.repaint?.();
      lengthDual?.repaint?.();
      widthDual?.repaint?.();
      heightDual?.repaint?.();
      weightDual?.repaint?.();

      applyFilters();
    });
  }

  cards.forEach((c) => (c.style.display = ""));
  const foundEl = qs(".products-filter__find .number");
  if (foundEl) foundEl.textContent = `${cards.length} позиций`;

  priceDual?.repaint?.();
  lengthDual?.repaint?.();
  widthDual?.repaint?.();
  heightDual?.repaint?.();
  weightDual?.repaint?.();

  applyFilters();
});
