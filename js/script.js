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

    // CSS uchun class
    checkboxRow.classList.toggle("active", state.consent);
  };

  const bindConsent = () => {
    if (!checkboxRow) return;

    const toggle = () => setConsent(!state.consent);

    // start holat
    setConsent(true);

    checkboxRow.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    // keyboard support
    checkboxRow.setAttribute("tabindex", "0");
    checkboxRow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  };

  // =========================
  // STICKY/FIXED HEADER ON SCROLL (WORKING)
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

    const left = document.createElement("div");
    left.className = "mega-left";

    const leftTitle = document.createElement("div");
    leftTitle.className = "mega-left__title";
    leftTitle.textContent = "Разделы";

    left.appendChild(leftTitle);
    left.appendChild(makeLeftLink("Главная", "#header"));
    left.appendChild(makeLeftLink("Информация", ".about-banner__area"));

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
      {
        text: "Приборные панели, Конструктивные элементы из металла",
        target: ".chance-banner",
      },
      { text: "Пульты управления", target: ".chance-banner" },
      {
        text: "Системы охлаждения и системы нагрева",
        target: ".chance-banner",
      },
      {
        text: "Шкафы металлические и аксессуары для кейсов и панелей",
        target: ".chance-banner",
      },
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

    prodBtn.addEventListener("click", () => {
      left.classList.toggle("is-open");
    });

    left.appendChild(prodBtn);
    left.appendChild(sub);

    left.appendChild(makeLeftLink("Контакты", ".contact-banner__area"));

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
  // LEAD MODAL (Оставить заявку) — 1:1 like screenshot
  // =========================
  const ensureLeadModalStyles = () => {
    const STYLE_ID = "galeon-lead-modal-style";
    if (document.getElementById(STYLE_ID)) return;

    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = `
/* overlay */
.galeon-lead-overlay{
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

/* modal */
.galeon-lead-modal{
  width: min(760px, 92vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 55px rgba(0,0,0,.25);
  position: relative;
  padding: 28px 28px 22px;
}

/* close button */
.galeon-lead-close{
  position: absolute;
  top: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid #e9eef2;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 120ms ease;
}
.galeon-lead-close:hover{
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,.10);
}
.galeon-lead-close svg{ display:block; }

/* title/subtitle */
.galeon-lead-title{
  font-size: 56px;
  line-height: 1.05;
  font-weight: 800;
  color: #0f1822;
  margin: 0 54px 10px 0;
  letter-spacing: -0.5px;
}
.galeon-lead-subtitle{
  font-size: 16px;
  line-height: 1.5;
  color: #9aa3ab;
  margin: 0 0 18px 0;
}

/* fields */
.galeon-lead-field{
  width: 100%;
  background: #f3f6f8;
  border: 1px solid #eef2f5;
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 16px;
  outline: none;
  color: #0f1822;
  box-sizing: border-box;
}
.galeon-lead-field::placeholder{ color: #aab2ba; }
.galeon-lead-field:focus{
  border-color: rgba(35,168,179,.55);
  box-shadow: 0 0 0 4px rgba(35,168,179,.12);
}

/* phone with flag */
.galeon-lead-phone{
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f3f6f8;
  border: 1px solid #eef2f5;
  border-radius: 10px;
  padding: 10px 14px;
  box-sizing: border-box;
}
.galeon-lead-flag{
  width: 26px;
  height: 18px;
  border-radius: 3px;
  overflow: hidden;
  flex: 0 0 auto;
  box-shadow: 0 6px 14px rgba(0,0,0,.10);
}
.galeon-lead-phone input{
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  width: 100%;
  padding: 10px 0;
  color: #0f1822;
}
.galeon-lead-phone input::placeholder{ color:#aab2ba; }

/* textarea */
.galeon-lead-textarea{
  min-height: 120px;
  resize: vertical;
}

/* submit */
.galeon-lead-submit{
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 18px 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  background: #23A8B3;
  color: #fff;
  margin-top: 14px;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.galeon-lead-submit:hover{
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(35,168,179,.25);
}
.galeon-lead-submit:active{ transform: translateY(0); }

/* consent row */
.galeon-lead-consent{
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 14px;
  color: #8f98a1;
  font-size: 14px;
  line-height: 1.45;
}
.galeon-lead-consent a{
  color: #8f98a1;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.galeon-lead-check{
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid #dbe5eb;
  background: #fff;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 1px;
}
.galeon-lead-check.is-on{
  background: #23A8B3;
  border-color: #23A8B3;
}
.galeon-lead-check svg{
  width: 14px;
  height: 14px;
  opacity: 0;
}
.galeon-lead-check.is-on svg{ opacity: 1; }

@media (max-width: 640px){
  .galeon-lead-modal{ padding: 20px 18px 16px; }
  .galeon-lead-title{ font-size: 36px; }
}
`;
    document.head.appendChild(st);
  };

  const ruFlagSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="26" height="18" preserveAspectRatio="none">
  <rect width="3" height="2" fill="#fff"/>
  <rect width="3" height="0.6667" y="0.6667" fill="#1C57A7"/>
  <rect width="3" height="0.6667" y="1.3334" fill="#D52B1E"/>
</svg>`;

  const openLeadModal = (prefill = {}) => {
    ensureLeadModalStyles();

    const overlay = document.createElement("div");
    overlay.className = "galeon-lead-overlay";

    const modal = document.createElement("div");
    modal.className = "galeon-lead-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Оставить заявку");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "galeon-lead-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M12.5 3.5L3.5 12.5" stroke="#8FA0AE" stroke-width="2" stroke-linecap="round"/>
  <path d="M3.5 3.5L12.5 12.5" stroke="#8FA0AE" stroke-width="2" stroke-linecap="round"/>
</svg>`;

    const title = document.createElement("h2");
    title.className = "galeon-lead-title";
    title.textContent = "Оставить заявку";

    const subtitle = document.createElement("p");
    subtitle.className = "galeon-lead-subtitle";
    subtitle.textContent =
      "Заполните форму – мы свяжемся с вами в кратчайшие сроки и предоставим консультацию";

    const nameInput = document.createElement("input");
    nameInput.className = "galeon-lead-field";
    nameInput.type = "text";
    nameInput.placeholder = "Ваше имя*";
    nameInput.value = prefill.name || "";

    const phoneWrap = document.createElement("div");
    phoneWrap.className = "galeon-lead-phone";

    const flag = document.createElement("div");
    flag.className = "galeon-lead-flag";
    flag.innerHTML = ruFlagSvg;

    const phoneInput = document.createElement("input");
    phoneInput.type = "tel";
    phoneInput.placeholder = "+7 999 999 99 99*";
    phoneInput.value = prefill.phone || "";

    phoneWrap.appendChild(flag);
    phoneWrap.appendChild(phoneInput);

    const msg = document.createElement("textarea");
    msg.className = "galeon-lead-field galeon-lead-textarea";
    msg.placeholder = "Комментарий";
    msg.value = prefill.message || "";

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "galeon-lead-submit";
    submit.textContent = "Оставить заявку";

    let consentOn = true;

    const consentRow = document.createElement("div");
    consentRow.className = "galeon-lead-consent";

    const check = document.createElement("div");
    check.className = "galeon-lead-check is-on";
    check.setAttribute("role", "checkbox");
    check.setAttribute("tabindex", "0");
    check.setAttribute("aria-checked", "true");
    check.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
  <path d="M3 8.5L6.2 11.7L13 4.9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    const consentText = document.createElement("div");
    consentText.innerHTML = `Нажимая кнопку «Отправить», вы даете согласие на <a href="#" onclick="return false;">обработку персональных данных</a>`;

    const setConsentUI = (on) => {
      consentOn = !!on;
      check.classList.toggle("is-on", consentOn);
      check.setAttribute("aria-checked", consentOn ? "true" : "false");
    };

    const toggleConsent = () => setConsentUI(!consentOn);

    check.addEventListener("click", toggleConsent);
    check.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleConsent();
      }
    });

    consentRow.appendChild(check);
    consentRow.appendChild(consentText);

    const setErr = (el, on) => {
      if (!el) return;
      el.style.outline = on ? "2px solid rgba(213,43,30,.55)" : "none";
      el.style.borderRadius = "6px";
    };

    const onPhoneInput = () => {
      const digits = phoneInput.value.replace(/\D/g, "");
      if (!digits) return;

      let out = "";
      if (digits[0] === "7" || digits[0] === "8") out = maskRUPhone(digits);
      else out = "+" + digits;

      phoneInput.value = out;
    };

    phoneInput.addEventListener("input", onPhoneInput);
    phoneInput.addEventListener("blur", onPhoneInput);
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value) phoneInput.value = "+7 ";
    });

    const close = () => {
      document.removeEventListener("keydown", onEsc);
      if (overlay && overlay.parentNode)
        overlay.parentNode.removeChild(overlay);
      lockBody(false);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const focusables = Array.from(
          modal.querySelectorAll(
            `button,input,textarea,[tabindex]:not([tabindex="-1"])`,
          ),
        ).filter((x) => x.offsetParent !== null);

        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    submit.addEventListener("click", () => {
      const n = (nameInput.value || "").trim();
      const p = (phoneInput.value || "").trim();
      const m = (msg.value || "").trim();

      setErr(nameInput, false);
      setErr(phoneWrap, false);
      setErr(msg, false);

      let ok = true;

      if (n.length < 2) {
        setErr(nameInput, true);
        ok = false;
      }
      if (!isPhoneValid(p)) {
        setErr(phoneWrap, true);
        ok = false;
      }

      // msg optional (sizda majburiy bo‘lmasa qoldiramiz)
      if (!consentOn) ok = false;

      if (!ok) {
        if (!consentOn) toast("Нужно согласие на обработку данных");
        else toast("Заполните все поля корректно");
        return;
      }

      toast("Заявка отправлена");
      close();
    });

    modal.appendChild(closeBtn);
    modal.appendChild(title);
    modal.appendChild(subtitle);

    modal.appendChild(nameInput);
    modal.appendChild(document.createElement("div")).style.height = "14px";

    modal.appendChild(phoneWrap);
    modal.appendChild(document.createElement("div")).style.height = "14px";

    modal.appendChild(msg);
    modal.appendChild(submit);
    modal.appendChild(consentRow);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", onEsc);

    lockBody(true);
    setTimeout(() => nameInput.focus(), 0);
  };

  // =========================
  // OPEN MODAL TRIGGERS (header-top__link + form button)
  // =========================
  const bindCallLink = () => {
    if (!callLink) return;
    callLink.addEventListener("click", (e) => {
      e.preventDefault();
      // ✅ RASMDAGI modal
      openLeadModal();
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

      // ✅ Valid bo‘lsa: RASMDAGI modal ochiladi (prefill bilan)
      openLeadModal({
        name: (formName?.value || "").trim(),
        phone: (formTel?.value || "").trim(),
        message: (formMsg?.value || "").trim(),
      });

      // Sizdagi eski yuborish logikasi o‘zgarmasin desangiz, pastdagilarni olib tashlamadik:
      // (Lekin modal ochilgandan keyin fieldlarni tozalash keraksiz bo‘lsa — shu blokni o‘chirishingiz mumkin)
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

    const scrollToBottom = () => {
      const footer =
        document.querySelector("footer") || document.querySelector("#footer");
      if (footer) footer.scrollIntoView({ behavior: "smooth", block: "start" });
      else
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
    };

    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToBottom();
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
  // MAIN ANIMATIONS (RIPPLE + TOOLTIP + POSITIONS)
  // =========================
  const bindMainAnimations = () => {
    const wrap = $(".main-animations");
    if (!wrap) return;

    const items = $$(".main-animations .main-animation", wrap);
    if (!items.length) return;

    const STYLE_ID = "galeon-main-animations-style";
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement("style");
      st.id = STYLE_ID;
      st.textContent = `
.main-animations{
  position: absolute !important;
  inset: 0 !important;
  z-index: 6 !important;
  pointer-events: none !important;
}

.main-animations .main-animation{
  position: absolute !important;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: default;
  pointer-events: auto !important;
}

.main-animations .main-animation svg{
  display: block;
  position: relative;
  z-index: 2;
  cursor:pointer;
}

.main-animations .main-animation::before,
.main-animations .main-animation::after{
  content: "";
  position: absolute;
  inset: 50%;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  transform: translate(-50%, -50%) scale(1);
  background: rgba(35,168,179,.22);
  z-index: 1;
  animation: galeonRipple 2.4s ease-out infinite;
  pointer-events: none;
}

.main-animations .main-animation::after{
  animation-delay: 1.2s;
  background: rgba(35,168,179,.16);
}

@keyframes galeonRipple{
  0%{ transform: translate(-50%, -50%) scale(1); opacity: .9; }
  70%{ transform: translate(-50%, -50%) scale(2.8); opacity: .15; }
  100%{ transform: translate(-50%, -50%) scale(3.1); opacity: 0; }
}

/* ✅ tooltip: 2 satr + width kattaroq */
.main-animations .main-animation .galeon-tip{
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%) translateY(6px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
  z-index: 20;

  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;

  color: #fff;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 500;

  text-shadow: 0 10px 24px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.5);
  min-width: 260px;
  max-width: 360px;

  white-space: normal;
  text-align: center;
}

.main-animations .main-animation .galeon-tip::after{
  display: none !important;
}

.main-animations .main-animation:hover .galeon-tip,
.main-animations .main-animation:focus-within .galeon-tip{
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.main-animations .main-animation:focus{
  outline: none;
}
.main-animations .main-animation:focus-visible{
  outline: 2px solid rgba(35,168,179,.65);
  outline-offset: 4px;
  border-radius: 999px;
}
`;
      document.head.appendChild(st);
    }

    const pos = [
      { top: "100px", right: "200px" },
      { bottom: "100px", right: "270px" },
      { bottom: "80px", right: "400px" },
      { bottom: "140px", right: "560px" },
    ];

    const texts2Lines = [
      "Мягкий поропласт<br>для надежной фиксации груза",
      "Класс защиты IP67 и выше",
      "Созданы из высокопрочных полимеров",
      "Производятся в России",
    ];

    items.slice(0, 4).forEach((item, i) => {
      item.style.top = "";
      item.style.right = "";
      item.style.bottom = "";
      item.style.left = "";

      const p = pos[i];
      if (p.top) item.style.top = p.top;
      if (p.bottom) item.style.bottom = p.bottom;
      if (p.right) item.style.right = p.right;
      if (p.left) item.style.left = p.left;

      if (!item.hasAttribute("tabindex")) item.setAttribute("tabindex", "0");

      let tip = item.querySelector(".galeon-tip");
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "galeon-tip";
        item.appendChild(tip);
      }

      tip.innerHTML = texts2Lines[i] || "";
    });
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

    bindMainAnimations();

    stickyHeader();

    setMenuBtnUI(false);
    document.body.classList.remove("mega-open");
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
