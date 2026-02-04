(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const header = $("#header");
  const menuBtn =
    $(".header-menu button") || $("#menuToggle") || $(".menu-btn");
  const searchInput = $(".header-search input"); // desktop input
  const searchBtn = $(".header-search"); // mobile icon/button
  const callLink = $(".header-top__link");
  const mainCatalogBtn = $(".main-button");
  const productCatalogBtn = $(".product-link");
  const toTopBtn = $(".footer-bottom__link");

  const checkboxRow = $("#customCheckbox");
  const checkboxIcon = $("#customCheckbox svg");

  const chanceWrap = $(".chance-cards");
  const chancePrev = $(".chance-card__navigation .left");
  const chanceNext = $(".chance-card__navigation .right");

  const formName = $(".contact-info__name input");
  const formTel = $(".contact-info__number input[type='tel']");
  const formMsg = $(".contact-info__message input");
  const formSubmit = $(".contact-info .button button");

  // =========================
  // STATE
  // =========================
  const state = {
    consent: true,
    toastEl: null,
    searchTimer: null,

    // mobile search modal
    searchModal: null,
    searchOverlay: null,
    searchOpen: false,
    releaseTrap: null,

    // mega menu state
    megaOpen: false,
    megaOverlay: null,
    megaRoot: null,

    // menu button svg swap
    menuSvgOpen: null,
    menuSvgClose: `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="3.41406" y="3" width="22" height="2" transform="rotate(45 3.41406 3)" fill="white"/>
  <rect x="2" y="18.5563" width="22" height="2" transform="rotate(-45 2 18.5563)" fill="white"/>
</svg>`,
  };

  // =========================
  // HELPERS
  // =========================
  const smoothScrollTo = (elOrSelector) => {
    const el =
      typeof elOrSelector === "string" ? $(elOrSelector) : elOrSelector;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toast = (text) => {
    if (!state.toastEl) {
      const t = document.createElement("div");
      t.style.position = "fixed";
      t.style.left = "50%";
      t.style.bottom = "22px";
      t.style.transform = "translateX(-50%)";
      t.style.padding = "12px 14px";
      t.style.borderRadius = "12px";
      t.style.background = "rgba(19,26,35,.95)";
      t.style.color = "#fff";
      t.style.fontSize = "14px";
      t.style.lineHeight = "1.2";
      t.style.zIndex = "99999";
      t.style.maxWidth = "92vw";
      t.style.boxShadow = "0 12px 28px rgba(0,0,0,.25)";
      t.style.opacity = "0";
      t.style.pointerEvents = "none";
      t.style.transition = "opacity 180ms ease";
      document.body.appendChild(t);
      state.toastEl = t;
    }
    state.toastEl.textContent = text;
    state.toastEl.style.opacity = "1";
    clearTimeout(state.toastEl.__t);
    state.toastEl.__t = setTimeout(() => {
      state.toastEl.style.opacity = "0";
    }, 2000);
  };

  const normalizePhone = (v) => (v || "").replace(/[^\d+]/g, "");
  const isPhoneValid = (v) => {
    const n = normalizePhone(v);
    const digits = n.replace(/[^\d]/g, "");
    if (n.startsWith("+7") || n.startsWith("7") || n.startsWith("8"))
      return digits.length === 11;
    if (n.startsWith("+")) return digits.length >= 10 && digits.length <= 15;
    return digits.length >= 10 && digits.length <= 15;
  };

  const lockBody = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  };

  // =========================
  // CONSENT (Checkbox)
  // =========================
  const setConsent = (val) => {
    state.consent = !!val;
    if (!checkboxRow || !checkboxIcon) return;
    checkboxIcon.style.opacity = state.consent ? "1" : "0";
    checkboxIcon.style.backgroundColor = state.consent ? "#23A8B3" : "#AFAFAF";
  };

  const bindConsent = () => {
    if (!checkboxRow) return;
    setConsent(true);
    checkboxRow.addEventListener("click", () => setConsent(!state.consent));
  };

  // =========================
  // STICKY/FIXED HEADER ON SCROLL (WORKING)
  // ✅ fixed on scroll
  // ✅ spacer (no jump)
  // ✅ NO duplicate, NO scope issues
  // =========================
  const stickyHeader = () => {
    if (!header) return;

    // Inject FORCE CSS once
    const STYLE_ID = "galeon-fixed-header-style";
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement("style");
      st.id = STYLE_ID;
      st.textContent = `
  #header{
    transition: box-shadow 200ms ease, background-color 200ms ease !important;
  }

  #header.galeon-header-fixed{
    position: fixed !important;
    top: 0 !important;

    left: 50% !important;
    transform: translateX(-50%) !important;

    width: min(100%, 1280px) !important;

    z-index: 9996 !important;
    background: transparent !important;
    box-shadow: none !important;

    /* ❗ transform animatsiyasini o‘chiramiz */
    transition: box-shadow 200ms ease, background-color 200ms ease !important;
  }

  #header.galeon-header-fixed::before{
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    left: 50% !important;
    transform: translateX(-50%) !important;

    width: 100vw !important;
    height: 100% !important;

    background: #fff !important;
    box-shadow: 0 10px 28px rgba(0,0,0,.12) !important;
    z-index: -1 !important;
  }
`;

      document.head.appendChild(st);
    }

    // spacer
    let spacer = document.getElementById("galeon-header-spacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "galeon-header-spacer";
      spacer.style.width = "100%";
      spacer.style.height = "0px";
      spacer.style.display = "none";
      header.insertAdjacentElement("afterend", spacer);
    }

    const setSpacer = (on) => {
      if (on) {
        const h = Math.round(
          header.getBoundingClientRect().height || header.offsetHeight || 0,
        );
        spacer.style.height = `${h}px`;
        spacer.style.display = "block";
      } else {
        spacer.style.height = "0px";
        spacer.style.display = "none";
      }
    };

    const THRESHOLD = 60;

    const update = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > THRESHOLD) {
        setSpacer(true);
        header.classList.add("galeon-header-fixed");
      } else {
        header.classList.remove("galeon-header-fixed");
        setSpacer(false);
      }
    };

    update();

    let raf = null;
    window.addEventListener(
      "scroll",
      () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          update();
        });
      },
      { passive: true },
    );

    window.addEventListener("resize", () => {
      if ((window.pageYOffset || 0) > THRESHOLD) setSpacer(true);
      update();
    });
  };

  // =========================
  // MEGA MENU (LEFT + RIGHT CARDS)
  // =========================
  const ensureMegaOverlay = () => {
    if (state.megaOverlay) return state.megaOverlay;

    const o = document.createElement("div");
    o.id = "galeon-mega-overlay";
    o.addEventListener("click", () => setMegaMenu(false));

    document.body.appendChild(o);
    state.megaOverlay = o;
    return o;
  };

  const makeLeftLink = (text, target) => {
    const a = document.createElement("a");
    a.href = target;
    a.className = "mega-left__link";
    a.textContent = text;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo(target);
      setMegaMenu(false);
    });
    return a;
  };

  const buildCard = (cfg) => {
    const card = document.createElement("a");
    card.href = cfg.href || "#";
    card.className = `mm-card ${cfg.sizeClass}`;
    card.style.textDecoration = "none";
    card.style.color = "inherit";

    const title = document.createElement("div");
    title.className = "mm-card__title";
    title.textContent = cfg.title || "";

    const go = document.createElement("div");
    go.className = "mm-card__go";
    go.innerHTML = `<span>↗</span>`;

    const imgWrap = document.createElement("div");
    imgWrap.className = "mm-card__img";

    const img = document.createElement("img");
    img.alt = cfg.title || "product";
    img.src = cfg.img || "";
    imgWrap.appendChild(img);

    card.appendChild(title);

    if (cfg.sub && cfg.sub.length) {
      const sub = document.createElement("div");
      sub.className = "mm-card__sub";
      cfg.sub.forEach((it) => {
        const s = document.createElement("a");
        s.href = it.href || "#";
        s.textContent = it.text;
        s.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          setMegaMenu(false);
        });
        sub.appendChild(s);
      });
      card.appendChild(sub);
    }

    card.appendChild(go);
    card.appendChild(imgWrap);

    card.addEventListener("click", () => setMegaMenu(false));
    return card;
  };

  const getFromAllProducts = () => {
    const cards = $$(".all-products .product-card");
    if (!cards.length) return null;

    const take = (index) => {
      const c = cards[index];
      if (!c) return null;

      const title =
        c.querySelector(".product-card__title")?.textContent?.trim() ||
        c.querySelector("h3,h4")?.textContent?.trim() ||
        "Категория";

      const img =
        c.querySelector("img")?.getAttribute("src") ||
        c.querySelector("img")?.src ||
        "";

      const href = c.querySelector("a")?.getAttribute("href") || "#";

      return { title, img, href };
    };

    const a0 = take(0);
    const a1 = take(1);
    const a2 = take(2);
    const a3 = take(3);
    const a4 = take(4);
    const a5 = take(5);

    if (!a0 || !a1 || !a2) return null;

    return { a0, a1, a2, a3, a4, a5 };
  };

  const buildMegaMenu = () => {
  if (state.megaRoot) return state.megaRoot;

  const mega = document.createElement("div");
  mega.id = "galeon-mega";

  const inner = document.createElement("div");
  inner.className = "container mega-inner";

  // =========================
  // LEFT (rasmdek)
  // =========================
  const left = document.createElement("div");
  left.className = "mega-left";

  const leftTitle = document.createElement("div");
  leftTitle.className = "mega-left__title";
  leftTitle.textContent = "Разделы";

  left.appendChild(leftTitle);
  left.appendChild(makeLeftLink("Главная", "#header"));
  left.appendChild(makeLeftLink("Информация", ".about-banner__area"));

  // ✅ Производство => toggle + sub (rasmdagi kabi)
  const prodBtn = document.createElement("button");
  prodBtn.type = "button";
  prodBtn.className = "mega-left__toggle";
  prodBtn.innerHTML = `
    <span>Производство</span>
    <span class="mega-left__chev">▾</span>
  `;

  const sub = document.createElement("div");
  sub.className = "mega-left__sub";

  const prodItems = [
    { text: "Кейсы и контейнеры", target: ".chance-banner" },
    { text: "Ложементы любой сложности", target: ".chance-banner" },
    { text: "Кастомные MOLLE-панели", target: ".chance-banner" },
    { text: "Интерьерные (I/O) панели", target: ".chance-banner" },
    { text: "Приборные панели, Конструктивные элементы из металла", target: ".chance-banner" },
    { text: "Пульты управления", target: ".chance-banner" },
    { text: "Системы охлаждения и системы нагрева", target: ".chance-banner" },
    { text: "Шкафы металлические и аксессуары для кейсов и панелей", target: ".chance-banner" },
  ];

  prodItems.forEach((it) => {
    const a = document.createElement("a");
    a.href = it.target || "#";
    a.textContent = it.text;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollTo(it.target);
      setMegaMenu(false);
    });

    sub.appendChild(a);
  });

  // toggle open/close
  prodBtn.addEventListener("click", () => {
    left.classList.toggle("is-open");
  });

  left.appendChild(prodBtn);
  left.appendChild(sub);

  left.appendChild(makeLeftLink("Контакты", ".contact-banner__area"));

  // =========================
  // RIGHT (o‘zgarmagan)
  // =========================
  const right = document.createElement("div");
  right.className = "mega-right";

  const rightTop = document.createElement("div");
  rightTop.className = "mega-right__top";

  const rtTitle = document.createElement("div");
  rtTitle.className = "mega-right__title";
  rtTitle.textContent = "Каталог";

  const rtAll = document.createElement("a");
  rtAll.className = "mega-right__all";
  rtAll.href = "#";
  rtAll.textContent = "Все кейсы";
  rtAll.addEventListener("click", (e) => {
    e.preventDefault();
    smoothScrollTo(".all-products");
    setMegaMenu(false);
  });

  rightTop.appendChild(rtTitle);
  rightTop.appendChild(rtAll);

  const grid = document.createElement("div");
  grid.id = "galeon-mega-grid";

  const from = getFromAllProducts();

  const data = from
    ? [
        { ...from.a0, sizeClass: "mm-card--sm" },
        { ...from.a1, sizeClass: "mm-card--sm" },
        { ...from.a2, sizeClass: "mm-card--sm" },
        { ...(from.a3 || from.a0), sizeClass: "mm-card--md" },
        { ...(from.a4 || from.a1), sizeClass: "mm-card--md" },
        {
          ...(from.a5 || from.a2),
          sizeClass: "mm-card--lg",
          sub: [
            { text: "Контейнеры СМС", href: "#" },
            { text: "Контейнеры RACK", href: "#" },
            { text: "Контейнеры ПСС", href: "#" },
            { text: "Контейнеры СТС", href: "#" },
            { text: "Рабочие мобильные места", href: "#" },
            { text: "Мобильный госпиталь", href: "#" },
          ],
        },
      ]
    : [
        {
          title: "Мини кейсы",
          img: "/img/all-products1.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Средние кейсы",
          img: "/img/all-products2.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Большие кейсы",
          img: "/img/all-products3.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Длинные кейсы",
          img: "/img/all-products4.png",
          href: "#",
          sizeClass: "mm-card--md",
        },
        {
          title: "Кейсы для ноутбуков",
          img: "/img/all-products5.png",
          href: "#",
          sizeClass: "mm-card--md",
        },
        {
          title: "Контейнеры",
          img: "/img/all-products6.png",
          href: "#",
          sizeClass: "mm-card--lg",
          sub: [
            { text: "Контейнеры СМС", href: "#" },
            { text: "Контейнеры RACK", href: "#" },
            { text: "Контейнеры ПСС", href: "#" },
            { text: "Контейнеры СТС", href: "#" },
            { text: "Рабочие мобильные места", href: "#" },
            { text: "Мобильный госпиталь", href: "#" },
          ],
        },
      ];

  data.forEach((cfg) => grid.appendChild(buildCard(cfg)));

  right.appendChild(rightTop);
  right.appendChild(grid);

  inner.appendChild(left);
  inner.appendChild(right);

  mega.appendChild(inner);
  mega.addEventListener("click", (e) => e.stopPropagation());

  document.body.appendChild(mega);
  state.megaRoot = mega;
  return mega;
};


  // ✅ MENU BUTTON UI (SVG + BG) helpers
  const saveMenuOpenSvgOnce = () => {
    if (!menuBtn) return;
    if (state.menuSvgOpen !== null) return;

    const svg = menuBtn.querySelector("svg");
    state.menuSvgOpen = svg ? svg.outerHTML : menuBtn.innerHTML;
  };

  const setMenuBtnUI = (isOpen) => {
    if (!menuBtn) return;

    saveMenuOpenSvgOnce();

    if (isOpen) {
      menuBtn.classList.add("is-active");
      menuBtn.style.backgroundColor = "#142434";

      const svg = menuBtn.querySelector("svg");
      if (svg) svg.outerHTML = state.menuSvgClose;
      else menuBtn.innerHTML = state.menuSvgClose;
    } else {
      menuBtn.classList.remove("is-active");
      menuBtn.style.backgroundColor = "";

      const svg = menuBtn.querySelector("svg");
      if (svg && state.menuSvgOpen) svg.outerHTML = state.menuSvgOpen;
      else if (state.menuSvgOpen) menuBtn.innerHTML = state.menuSvgOpen;
    }
  };

  // ✅ FIXED setMegaMenu (NO DUPLICATE)
  const setMegaMenu = (open) => {
    const overlay = ensureMegaOverlay();
    const mega = buildMegaMenu();

    state.megaOpen = !!open;

    const headerRect = header ? header.getBoundingClientRect() : { bottom: 0 };
    const topPx = Math.max(0, Math.round(headerRect.bottom));

    if (state.megaOpen) {
      mega.style.top = `${topPx}px`;
      mega.style.height = `calc(100vh - ${topPx}px)`;
      mega.style.display = "block";

      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";

      lockBody(true);
      setMenuBtnUI(true);

      document.body.classList.add("mega-open");
    } else {
      mega.style.display = "none";

      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";

      lockBody(false);
      setMenuBtnUI(false);

      document.body.classList.remove("mega-open");
    }
  };

  const bindMegaMenu = () => {
    if (!menuBtn) return;

    menuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setMegaMenu(!state.megaOpen);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.megaOpen) setMegaMenu(false);
    });

    document.addEventListener("click", (e) => {
      if (!state.megaOpen) return;
      const mega = state.megaRoot;
      const inside =
        (mega && mega.contains(e.target)) ||
        (menuBtn && menuBtn.contains(e.target));
      if (!inside) setMegaMenu(false);
    });

    window.addEventListener("resize", () => {
      if (!state.megaOpen) return;
      setMegaMenu(true);
    });
  };

  // =========================
  // CHANCE SLIDER NAV
  // =========================
  const bindChanceNav = () => {
    if (!chanceWrap || !chancePrev || !chanceNext) return;

    const step = () => {
      const first = $(".chance-card", chanceWrap);
      if (!first) return 320;
      const style = getComputedStyle(chanceWrap);
      const gap = parseFloat(style.columnGap || style.gap || "24") || 24;
      return first.getBoundingClientRect().width + gap;
    };

    const scrollByStep = (dir) => {
      chanceWrap.scrollBy({ left: dir * step(), behavior: "smooth" });
    };

    chancePrev.addEventListener("click", () => scrollByStep(-1));
    chanceNext.addEventListener("click", () => scrollByStep(1));

    const updateNav = () => {
      const max = chanceWrap.scrollWidth - chanceWrap.clientWidth - 2;
      const atStart = chanceWrap.scrollLeft <= 2;
      const atEnd = chanceWrap.scrollLeft >= max;

      chancePrev.style.backgroundColor = atStart ? "#8d8d8d" : "#1f4567";
      chanceNext.style.backgroundColor = atEnd ? "#8d8d8d" : "#1f4567";

      chancePrev.style.pointerEvents = atStart ? "none" : "auto";
      chanceNext.style.pointerEvents = atEnd ? "none" : "auto";
    };

    chanceWrap.addEventListener("scroll", () => {
      clearTimeout(chanceWrap.__t);
      chanceWrap.__t = setTimeout(updateNav, 50);
    });

    window.addEventListener("resize", updateNav);
    updateNav();

    const cards = $$(".chance-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.style.transition = "all 0.3s ease";
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.filter = "blur(0px)";
          } else {
            entry.target.style.opacity = "0.4";
            entry.target.style.filter = "blur(2px)";
          }
        });
      },
      { root: chanceWrap, threshold: 0.95 },
    );

    cards.forEach((card) => observer.observe(card));
  };

  // =========================
  // DESKTOP SEARCH
  // =========================
  const bindDesktopSearch = () => {
    if (!searchInput) return;

    const allTextNodes = () => {
      const selectors = [
        ".main-title",
        ".main-description",
        ".chance-card__title",
        ".chance-card__description",
        ".product-card__title",
        ".product-card__type",
        ".about-subtitle",
        ".about-description",
        ".about-card__title",
        ".about-card__description",
        ".contact-info__subtitle",
        ".contact-info__description",
        ".footer-top2__item",
        ".footer-top3__item",
      ];
      const nodes = [];
      selectors.forEach((sel) => nodes.push(...$$(sel)));
      return nodes;
    };

    const clearMarks = () => {
      $$("mark[data-galeon='1']").forEach((m) => {
        const parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
    };

    const markText = (el, q) => {
      const text = el.textContent;
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if (idx < 0) return false;

      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + q.length);
      const after = text.slice(idx + q.length);

      el.textContent = "";
      if (before) el.appendChild(document.createTextNode(before));

      const m = document.createElement("mark");
      m.dataset.galeon = "1";
      m.textContent = match;
      m.style.padding = "0 2px";
      m.style.borderRadius = "4px";
      el.appendChild(m);

      if (after) el.appendChild(document.createTextNode(after));
      return true;
    };

    const run = (shouldScroll) => {
      const q = (searchInput.value || "").trim();
      clearMarks();
      if (!q) return;

      const nodes = allTextNodes();
      let firstHit = null;

      nodes.forEach((el) => {
        if (!el || !el.textContent) return;
        if (markText(el, q) && !firstHit) firstHit = el;
      });

      if (!firstHit) {
        toast("Ничего не найдено");
        return;
      }

      if (shouldScroll) {
        firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    searchInput.addEventListener("input", () => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(() => run(false), 250);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run(true);
      }
      if (e.key === "Escape") {
        searchInput.value = "";
        clearMarks();
        searchInput.blur();
      }
    });
  };

  // =========================
  // MOBILE SEARCH MODAL
  // =========================
  const initSearchModal = () => {
    if (!searchBtn) return;

    const isMobile = () => window.matchMedia("(max-width: 1024px)").matches;

    const bodyLock = (on) => {
      document.documentElement.style.overflow = on ? "hidden" : "";
      document.body.style.overflow = on ? "hidden" : "";
    };

    const trapFocus = (root, onClose) => {
      const focusables = () =>
        Array.from(
          root.querySelectorAll(
            `a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])`,
          ),
        ).filter((x) => x.offsetParent !== null);

      const onKey = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key !== "Tab") return;
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    };

    const build = () => {
      const o = document.createElement("div");
      o.className = "search-modal";
      document.body.appendChild(o);

      const panel = document.createElement("div");
      panel.className = "search-modal__panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-label", "Search");

      panel.innerHTML = `
        <div class="search-modal__top">
          <div class="search-modal__title">Поиск</div>
          <button class="search-modal__close" type="button" aria-label="Close">✕</button>
        </div>
        <input class="search-modal__input" type="text" placeholder="Введите запрос..." />
      `;

      o.appendChild(panel);

      state.searchModal = o;
      state.searchOverlay = o;

      o.addEventListener("click", (e) => {
        if (e.target === o) set(false);
      });

      panel
        .querySelector(".search-modal__close")
        .addEventListener("click", () => set(false));
    };

    const set = (val) => {
      if (val === state.searchOpen) return;
      state.searchOpen = val;

      if (!state.searchModal) build();

      if (state.searchOpen && !isMobile()) {
        state.searchOpen = false;
        return;
      }

      const modal = state.searchModal;
      const panel = modal.querySelector(".search-modal__panel");
      const input = modal.querySelector(".search-modal__input");

      if (state.searchOpen) {
        bodyLock(true);
        modal.classList.add("open");
        state.releaseTrap = trapFocus(panel, () => set(false));
        requestAnimationFrame(() => input.focus());
      } else {
        modal.classList.remove("open");
        bodyLock(false);
        if (state.releaseTrap) state.releaseTrap();
        state.releaseTrap = null;
      }
    };

    searchBtn.addEventListener("click", (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      set(true);
    });

    window.addEventListener("resize", () => {
      if (!isMobile() && state.searchOpen) {
        state.searchOpen = false;
        if (state.searchModal) state.searchModal.classList.remove("open");
        bodyLock(false);
        if (state.releaseTrap) state.releaseTrap();
        state.releaseTrap = null;
      }
    });
  };

  // =========================
  // CALLBACK MODAL
  // =========================
  const openCallbackModal = () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,.45)";
    overlay.style.backdropFilter = "blur(2px)";
    overlay.style.zIndex = "100000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "16px";

    const modal = document.createElement("div");
    modal.style.width = "min(520px, 92vw)";
    modal.style.background = "#fff";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 18px 50px rgba(0,0,0,.25)";
    modal.style.padding = "18px";

    const h = document.createElement("div");
    h.textContent = "Заказать звонок";
    h.style.fontSize = "18px";
    h.style.fontWeight = "800";
    h.style.marginBottom = "10px";
    h.style.color = "#131A23";

    const p = document.createElement("div");
    p.textContent = "Оставьте номер телефона — мы перезвоним в рабочее время.";
    p.style.color = "#8D8D8D";
    p.style.fontSize = "13px";
    p.style.marginBottom = "12px";
    p.style.lineHeight = "1.4";

    const input = document.createElement("input");
    input.type = "tel";
    input.placeholder = "+7 999 999 99 99";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.padding = "14px 14px";
    input.style.border = "1px solid #eee";
    input.style.borderRadius = "12px";
    input.style.outline = "none";
    input.style.fontSize = "14px";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.marginTop = "14px";
    row.style.justifyContent = "flex-end";

    const btn = (txt, primary, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = txt;
      b.style.padding = "12px 14px";
      b.style.borderRadius = "12px";
      b.style.cursor = "pointer";
      b.style.fontWeight = "700";
      b.style.border = primary ? "1px solid #23A8B3" : "1px solid #e8e8e8";
      b.style.background = primary ? "#23A8B3" : "#fff";
      b.style.color = primary ? "#fff" : "#131A23";
      b.addEventListener("click", onClick);
      return b;
    };

    const close = () => document.body.removeChild(overlay);

    row.appendChild(btn("Отмена", false, close));
    row.appendChild(
      btn("Отправить", true, () => {
        if (!isPhoneValid(input.value)) {
          toast("Введите корректный номер");
          input.focus();
          return;
        }
        toast("Заявка отправлена");
        close();
      }),
    );

    modal.appendChild(h);
    modal.appendChild(p);
    modal.appendChild(input);
    modal.appendChild(row);
    overlay.appendChild(modal);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") close();
      },
      { once: true },
    );

    document.body.appendChild(overlay);
    setTimeout(() => input.focus(), 0);
  };

  const bindCallLink = () => {
    if (!callLink) return;
    callLink.addEventListener("click", (e) => {
      e.preventDefault();
      openCallbackModal();
    });
  };

  // =========================
  // CATALOG BUTTONS
  // =========================
  const bindCatalogButtons = () => {
    const go = () => smoothScrollTo(".product-top");
    if (mainCatalogBtn) mainCatalogBtn.addEventListener("click", go);
    if (productCatalogBtn) productCatalogBtn.addEventListener("click", go);

    $$(".product-card, .product-card__link").forEach((el) => {
      el.addEventListener("click", (e) => {
        const card = e.currentTarget.classList.contains("product-card")
          ? e.currentTarget
          : e.currentTarget.closest(".product-card");
        if (!card) return;

        const title =
          $(".product-card__title", card)?.textContent?.trim() || "Категория";
        toast(`Открыть: ${title}`);
      });
    });

    $$(".product-card__type").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const t = e.currentTarget.textContent.trim();
        toast(`Вы выбрали: ${t}`);
      });
    });
  };

  // =========================
  // TO TOP
  // =========================
  const bindToTop = () => {
    if (!toTopBtn) return;
    toTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // =========================
  // HEADER ICONS
  // =========================
  const bindHeaderIcons = () => {
    $$(".header-icon").forEach((icon, idx) => {
      icon.addEventListener("click", () => {
        if (idx === 0) toast("Личный кабинет");
        if (idx === 1) toast("Избранное");
        if (idx === 2) toast("Корзина");
      });
    });
  };

  // =========================
  // PHONE MASK
  // =========================
  const maskRUPhone = (digits) => {
    const d = digits.replace(/\D/g, "");
    const core = d.startsWith("8") ? "7" + d.slice(1) : d;
    const n = core.startsWith("7") ? core : core;
    const p = n.padEnd(11, "_").slice(0, 11);
    const a = p.slice(1, 4);
    const b = p.slice(4, 7);
    const c = p.slice(7, 9);
    const e = p.slice(9, 11);
    return `+7 ${a} ${b} ${c} ${e}`.replace(/_/g, "");
  };

  const bindPhoneMask = () => {
    if (!formTel) return;

    const onInput = () => {
      const digits = formTel.value.replace(/\D/g, "");
      if (!digits) return;

      let out = "";
      if (digits[0] === "7" || digits[0] === "8") out = maskRUPhone(digits);
      else out = "+" + digits;

      formTel.value = out;
    };

    formTel.addEventListener("input", onInput);
    formTel.addEventListener("blur", onInput);
    formTel.addEventListener("focus", () => {
      if (!formTel.value) formTel.value = "+7 ";
    });
  };

  // =========================
  // FORM
  // =========================
  const bindForm = () => {
    if (!formSubmit) return;

    const setErr = (el, on) => {
      if (!el) return;
      el.style.outline = on ? "2px solid rgba(213,43,30,.55)" : "none";
      el.style.borderRadius = "4px";
    };

    const validate = () => {
      const name = (formName?.value || "").trim();
      const tel = (formTel?.value || "").trim();
      const msg = (formMsg?.value || "").trim();

      let ok = true;

      setErr(formName, false);
      setErr(formTel, false);
      setErr(formMsg, false);

      if (name.length < 2) {
        setErr(formName, true);
        ok = false;
      }
      if (!isPhoneValid(tel)) {
        setErr(formTel, true);
        ok = false;
      }
      if (msg.length < 3) {
        setErr(formMsg, true);
        ok = false;
      }
      if (!state.consent) ok = false;

      return { ok };
    };

    formSubmit.addEventListener("click", (e) => {
      e.preventDefault();
      const r = validate();
      if (!r.ok) {
        if (!state.consent) toast("Нужно согласие на обработку данных");
        else toast("Заполните все поля корректно");
        return;
      }
      toast("Заявка отправлена");
      if (formName) formName.value = "";
      if (formTel) formTel.value = "";
      if (formMsg) formMsg.value = "";
      setConsent(true);
    });
  };

  // =========================
  // FOOTER NAV
  // =========================
  const bindFooterNav = () => {
    const map = new Map([
      [".footer-top2__item:nth-child(1)", "Мини кейсы"],
      [".footer-top2__item:nth-child(2)", "Средние кейсы"],
      [".footer-top2__item:nth-child(3)", "Большие кейсы"],
      [".footer-top2__item:nth-child(4)", "Длинные кейсы"],
      [".footer-top2__item:nth-child(5)", "Кейсы для ноутбуков"],
      [".footer-top2__item:nth-child(6)", "Контейнеры"],
    ]);

    map.forEach((txt, sel) => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener("click", () => {
        smoothScrollTo(".product-top");
        setTimeout(() => {
          const titles = $$(".product-card__title");
          const hit = titles.find((t) => t.textContent.trim() === txt);
          if (hit)
            hit
              .closest(".product-card")
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 250);
      });
    });

    $$(".footer-top3__item").forEach((el) => {
      const text = el.textContent.trim().toLowerCase();
      el.addEventListener("click", () => {
        if (text.includes("глав")) smoothScrollTo("#header");
        else if (text.includes("информ")) smoothScrollTo(".about-banner__area");
        else if (text.includes("производ")) smoothScrollTo(".chance-banner");
        else if (text.includes("контакт"))
          smoothScrollTo(".contact-banner__area");
      });
    });

    const email = $(".footer-top4__email");
    const phone = $(".footer-top4__number");

    if (email) {
      email.addEventListener("click", () => {
        const addr = email.textContent.trim();
        window.location.href = `mailto:${addr}`;
      });
    }

    if (phone) {
      phone.addEventListener("click", () => {
        const raw = phone.textContent.trim().replace(/\s+/g, "");
        window.location.href = `tel:${raw}`;
      });
    }
  };

  // =========================
  // MAIN BOTTOM LINK
  // =========================
  const bindMainBottomLink = () => {
    const link = $(".main-bottom__link");
    if (!link) return;

    const getScrollTarget = () =>
      $(".chance-banner") ||
      $(".product-top") ||
      $(".about-banner__area") ||
      $(".contact-banner__area");

    const scrollToNext = () => {
      const target = getScrollTarget();
      if (target)
        return target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    };

    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToNext();
    });

    const updateVisibility = () => {
      const y = window.scrollY || 0;
      link.style.opacity = y > 120 ? "0" : "1";
      link.style.pointerEvents = y > 120 ? "none" : "auto";
    };

    window.addEventListener("scroll", () => {
      clearTimeout(updateVisibility.__t);
      updateVisibility.__t = setTimeout(updateVisibility, 40);
    });

    window.addEventListener("resize", updateVisibility);
    updateVisibility();
  };

  // =========================
  // INIT
  // =========================
  const init = () => {
    bindMegaMenu();

    bindDesktopSearch();
    initSearchModal();
    bindChanceNav();
    bindCatalogButtons();
    bindToTop();
    bindHeaderIcons();
    bindConsent();
    bindForm();
    bindCallLink();
    bindPhoneMask();
    bindFooterNav();
    bindMainBottomLink();

    stickyHeader();

    // start state UI (menu yopiq)
    setMenuBtnUI(false);

    // start state (menu yopiq) => class bo‘lmasin
    document.body.classList.remove("mega-open");
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
