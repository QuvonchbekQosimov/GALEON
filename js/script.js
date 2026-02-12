(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const header = $("#header");
  const menuBtn =
    $(".header-menu button") || $("#menuToggle") || $(".menu-btn");
  const searchInput = $(".header-search input");
  const searchBtn = $(".header-search");
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

  const state = {
    consent: true,
    toastEl: null,
    searchTimer: null,
    searchModal: null,
    searchOverlay: null,
    searchOpen: false,
    releaseTrap: null,
    megaOpen: false,
    megaOverlay: null,
    megaRoot: null,
    menuSvgOpen: null,
    menuSvgClose: `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="3.41406" y="3" width="22" height="2" transform="rotate(45 3.41406 3)" fill="white"/>
  <rect x="2" y="18.5563" width="22" height="2" transform="rotate(-45 2 18.5563)" fill="white"/>
</svg>`,
  };

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

  const stickyHeader = () => {
    if (!header) return;
    const onScroll = () => {
      const y = window.scrollY || 0;
      header.classList.toggle("is-sticky", y > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  const setConsent = (val) => {
    state.consent = !!val;
    if (!checkboxRow || !checkboxIcon) return;
    checkboxIcon.style.opacity = state.consent ? "1" : "0";
    checkboxRow.classList.toggle("active", state.consent);
  };

  const bindConsent = () => {
    if (!checkboxRow) return;
    const toggle = () => setConsent(!state.consent);
    setConsent(true);

    checkboxRow.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    checkboxRow.setAttribute("tabindex", "0");
    checkboxRow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  };

  const ensureMegaOverlay = () => {
    if (state.megaOverlay) return state.megaOverlay;

    const o = document.createElement("div");
    o.id = "galeon-mega-overlay";

    o.style.position = "fixed";
    o.style.left = "0";
    o.style.right = "0";
    o.style.bottom = "0";
    o.style.background = "rgba(0,0,0,.35)";
    o.style.opacity = "0";
    o.style.pointerEvents = "none";
    o.style.transition = "opacity 0.2s ease";
    o.style.zIndex = "9998";

    document.body.appendChild(o);
    state.megaOverlay = o;
    return o;
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
    go.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M12.0021 7.0605L5.54683 13.5157L4.48633 12.4553L10.9408 6H5.25208V4.5H13.5021V12.75H12.0021V7.0605Z" fill="white"/>
</svg>`;

    const imgWrap = document.createElement("div");
    imgWrap.className = "mm-card__img";

    const IMG_BASE = new URL("../img/", document.baseURI).href;

    const toImgUrl = (p) => {
      if (!p) return "";
      const s = String(p).trim();

      if (/^https?:\/\//i.test(s) || s.startsWith("data:")) return s;

      if (s.startsWith("../img/")) return new URL(s, document.baseURI).href;
      if (s.startsWith("/")) return new URL(s, window.location.origin).href;

      const file = s.split("/").pop();
      return new URL(file, IMG_BASE).href;
    };

    const img = document.createElement("img");
    img.alt = cfg.title || "product";
    img.src = toImgUrl(cfg.img || "");
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

    const isTabletOrMobile = () =>
      window.matchMedia("(max-width: 1024px)").matches;
    const CATALOG_PAGE_HREF = "./catalog.html";

    const mega = document.createElement("div");
    mega.id = "galeon-mega";

    const inner = document.createElement("div");
    inner.className = "container mega-inner";

    const buildTabletMenu = () => {
      mega.classList.add("mega--tablet");

      const left = document.createElement("div");
      left.className = "mega-left mega-left--tablet";

      const mkLink = (text, href, onClick) => {
        const a = document.createElement("a");
        a.className = "mega-mob__link";
        a.href = href || "#";
        a.textContent = text;
        a.addEventListener("click", (e) => {
          if (typeof onClick === "function") onClick(e);
        });
        return a;
      };

      const aHome = mkLink("Главная", "./index.html", () => setMegaMenu(false));

      const aInfo = mkLink("Информация", "./additional.html", (e) => {
        e.preventDefault();
        window.location.href = "./additional.html";
        setMegaMenu(false);
      });

      const catRow = document.createElement("button");
      catRow.type = "button";
      catRow.className = "mega-mob__row";
      catRow.innerHTML = `
      <span class="mega-mob__rowtxt">Каталог</span>
      <span class="mega-mob__chev">▾</span>
    `;

      const catSub = document.createElement("div");
      catSub.className = "mega-mob__sub";

      const catItems = [
        { text: "Все кейсы", href: CATALOG_PAGE_HREF },
        { text: "Мини кейсы", href: CATALOG_PAGE_HREF },
        { text: "Средние кейсы", href: CATALOG_PAGE_HREF },
        { text: "Большие кейсы", href: CATALOG_PAGE_HREF },
        { text: "Длинные кейсы", href: CATALOG_PAGE_HREF },
        { text: "Кейсы для ноутбуков", href: CATALOG_PAGE_HREF },
        { text: "Контейнеры", href: CATALOG_PAGE_HREF },
        { text: "• Контейнеры СМС", href: CATALOG_PAGE_HREF },
        { text: "• Контейнеры RACK", href: CATALOG_PAGE_HREF },
        { text: "• Контейнеры ПСС", href: CATALOG_PAGE_HREF },
        { text: "• Контейнеры СТС", href: CATALOG_PAGE_HREF },
        { text: "• Рабочие мобильные места", href: CATALOG_PAGE_HREF },
        { text: "• Мобильный госпиталь", href: CATALOG_PAGE_HREF },
      ];

      catItems.forEach((it) => {
        const a = document.createElement("a");
        a.className = "mega-mob__sublink all-products__link";
        a.href = it.href || CATALOG_PAGE_HREF;
        a.textContent = it.text;

        a.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = it.href || CATALOG_PAGE_HREF;
          setMegaMenu(false);
        });

        catSub.appendChild(a);
      });

      catRow.addEventListener("click", (e) => {
        e.preventDefault();
        left.classList.toggle("is-cat-open");
      });

      const aProd = mkLink("Производство", "./product.html", () =>
        setMegaMenu(false),
      );
      aProd.classList.add("mega-mob__link--strong");

      const aContacts = mkLink("Контакты", "./contact.html", (e) => {
        e.preventDefault();
        window.location.href = "./contact.html";
        setMegaMenu(false);
      });
      aContacts.classList.add("mega-mob__link--strong");

      const infoBlock = document.createElement("div");
      infoBlock.className = "mega-mob__contacts";
      infoBlock.innerHTML = `
      <div class="mega-mob__ctitle">Контакты</div>

      <a class="mega-mob__citem" href="tel:+74950236793">
        <span class="mega-mob__icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M10.4216 14C9.3553 14 8.04715 13.509 6.60596 12.5415C3.69206 10.5862 0.282053 6.57326 0.0177589 3.8617C-0.0667661 2.99449 0.150715 2.29473 0.664253 1.78117L2.44545 0L6.07232 3.62687L5.78232 3.91692C5.31969 4.37962 4.56159 5.1361 4.01959 5.67442C4.51819 6.40664 5.48069 7.48869 6.19086 8.19886C6.86308 8.87049 7.64093 9.48187 8.34196 9.95013C8.84697 9.4418 9.52671 8.76 10.0826 8.20286L10.3731 7.91258L14 11.5403L12.2404 13.2998C11.7722 13.7681 11.1541 14 10.4216 14Z" fill="#131A23"/>
</svg></span>
        <span>+7 495 023 67 93</span>
      </a>

      <div class="mega-mob__citem mega-mob__citem--muted">
        <span class="mega-mob__icon"></span>
        <span>ПН–ПТ: с 10:00 до 18:00</span>
      </div>

      <div class="mega-mob__citem mega-mob__citem--muted">
        <span class="mega-mob__icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <g clip-path="url(#clip0_142_1374)">
    <path d="M7 0C5.60818 0.00185206 4.2739 0.55557 3.28974 1.53974C2.30557 2.5239 1.75185 3.85818 1.75 5.25C1.75 9.01906 6.64125 13.7397 6.84906 13.9388C6.88948 13.978 6.94363 14 7 14C7.05637 14 7.11052 13.978 7.15094 13.9388C7.35875 13.7397 12.25 9.01906 12.25 5.25C12.2481 3.85818 11.6944 2.5239 10.7103 1.53974C9.7261 0.55557 8.39182 0.00185206 7 0ZM7 7.65625C6.52409 7.65625 6.05887 7.51513 5.66316 7.25072C5.26745 6.98632 4.95904 6.61052 4.77692 6.17083C4.59479 5.73115 4.54714 5.24733 4.63999 4.78056C4.73283 4.3138 4.962 3.88504 5.29852 3.54852C5.63504 3.212 6.0638 2.98283 6.53056 2.88999C6.99733 2.79714 7.48115 2.84479 7.92083 3.02691C8.36052 3.20904 8.73632 3.51745 9.00072 3.91316C9.26513 4.30887 9.40625 4.77409 9.40625 5.25C9.40584 5.88805 9.1522 6.49986 8.70103 6.95103C8.24986 7.4022 7.63805 7.65584 7 7.65625Z" fill="#131A23"/>
  </g>
  <defs>
    <clipPath id="clip0_142_1374">
      <rect width="14" height="14" fill="white"/>
    </clipPath>
  </defs>
</svg></span>
        <span color="#131A23">г.Москва ул. Плеханова д.7, эт 1, пом. I ком 25</span>
      </div>
    `;

      left.appendChild(aHome);
      left.appendChild(aInfo);
      left.appendChild(catRow);
      left.appendChild(catSub);
      left.appendChild(aProd);
      left.appendChild(aContacts);
      left.appendChild(infoBlock);

      inner.appendChild(left);
    };

    const buildDesktopMenu = () => {
      const left = document.createElement("div");
      left.className = "mega-left";

      const leftTitle = document.createElement("div");
      leftTitle.className = "mega-left__title";
      leftTitle.textContent = "Разделы";
      left.appendChild(leftTitle);

      const home = document.createElement("a");
      home.className = "mega-left__link";
      home.href = "./index.html";
      home.textContent = "Главная";
      home.addEventListener("click", () => setMegaMenu(false));
      left.appendChild(home);

      const info = document.createElement("a");
      info.className = "mega-left__link";
      info.href = "./additional.html";
      info.textContent = "Информация";
      info.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./additional.html";
        setMegaMenu(false);
      });
      left.appendChild(info);

      const prodRow = document.createElement("div");
      prodRow.className = "mega-left__prodrow";

      const prodLink = document.createElement("a");
      prodLink.className = "mega-left__toggle";
      prodLink.href = "./product.html";
      prodLink.innerHTML = `<span>Производство</span>`;
      prodLink.addEventListener("click", () => setMegaMenu(false));

      const chevBtn = document.createElement("button");
      chevBtn.type = "button";
      chevBtn.className = "mega-left__chevbtn";
      chevBtn.setAttribute("aria-label", "Toggle submenu");
      chevBtn.innerHTML = `<span class="mega-left__chev">▾</span>`;

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

      chevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        left.classList.toggle("is-open");
      });

      prodRow.appendChild(prodLink);
      prodRow.appendChild(chevBtn);

      left.appendChild(prodRow);
      left.appendChild(sub);

      const contacts = document.createElement("a");
      contacts.className = "mega-left__link";
      contacts.href = "./contact.html";
      contacts.textContent = "Контакты";
      contacts.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./contact.html";
        setMegaMenu(false);
      });
      left.appendChild(contacts);

      const right = document.createElement("div");
      right.className = "mega-right";

      const rightTop = document.createElement("div");
      rightTop.className = "mega-right__top";

      const rtTitle = document.createElement("div");
      rtTitle.className = "mega-right__title";
      rtTitle.textContent = "Каталог";

      const rtAll = document.createElement("a");
      rtAll.className = "mega-right__all";
      rtAll.href = CATALOG_PAGE_HREF;
      rtAll.textContent = "Все кейсы";
      rtAll.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = CATALOG_PAGE_HREF;
        setMegaMenu(false);
      });

      rightTop.appendChild(rtTitle);
      rightTop.appendChild(rtAll);

      const grid = document.createElement("div");
      grid.id = "galeon-mega-grid";

      const from = getFromAllProducts();

      const fallback = [
        {
          title: "Мини кейсы",
          img: "../img/all-products1.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Средние кейсы",
          img: "../img/all-products2.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Большие кейсы",
          img: "../img/all-products3.png",
          href: "#",
          sizeClass: "mm-card--sm",
        },
        {
          title: "Длинные кейсы",
          img: "../img/all-products4.png",
          href: "#",
          sizeClass: "mm-card--md",
        },
        {
          title: "Кейсы для ноутбуков",
          img: "../img/all-products5.png",
          href: "#",
          sizeClass: "mm-card--md",
        },
        {
          title: "Контейнеры",
          img: "../img/all-products6.png",
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
              sub: fallback[5].sub,
            },
          ]
        : fallback;

      data.forEach((cfg) => grid.appendChild(buildCard(cfg)));

      right.appendChild(rightTop);
      right.appendChild(grid);

      inner.appendChild(left);
      inner.appendChild(right);
    };

    if (isTabletOrMobile()) buildTabletMenu();
    else buildDesktopMenu();

    mega.appendChild(inner);
    mega.addEventListener("click", (e) => e.stopPropagation());

    document.body.appendChild(mega);
    state.megaRoot = mega;

    if (!state.__megaResizeBound) {
      state.__megaResizeBound = true;

      const isTabletOrMobileLocal = () =>
        window.matchMedia("(max-width: 1024px)").matches;
      const getMode = () => (isTabletOrMobileLocal() ? "tm" : "desk");
      let lastMode = getMode();

      window.addEventListener("resize", () => {
        const mode = getMode();
        if (mode === lastMode) return;
        lastMode = mode;

        if (state.megaRoot) {
          state.megaRoot.remove();
          state.megaRoot = null;
        }
        buildMegaMenu();
        if (state.megaOpen) setMegaMenu(true);
      });
    }

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

      overlay.style.top = `${topPx}px`;
      overlay.style.height = `calc(100vh - ${topPx}px)`;
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

    window.addEventListener("resize", () => {
      if (!state.megaOpen) return;
      setMegaMenu(true);
    });
  };

  const bindChanceNav = () => {
    if (!chanceWrap || !chancePrev || !chanceNext) return;

    const step = () => {
      const first = $(".chance-card", chanceWrap);
      if (!first) return 320;

      const style = getComputedStyle(chanceWrap);
      const gap = parseFloat(style.gap || style.columnGap || "24") || 24;

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

    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    let raf = 0;
    let targetLeft = 0;

    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let momentumRaf = 0;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const stopMomentum = () => {
      if (momentumRaf) cancelAnimationFrame(momentumRaf);
      momentumRaf = 0;
    };

    const scheduleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        chanceWrap.scrollLeft = targetLeft;
      });
    };

    const snapToNearest = () => {
      const stepPx = step();
      const i = Math.round(chanceWrap.scrollLeft / stepPx);
      chanceWrap.scrollTo({ left: i * stepPx, behavior: "smooth" });
    };

    chanceWrap.style.cursor = "grab";
    chanceWrap.style.touchAction = "pan-y";
    chanceWrap.style.webkitOverflowScrolling = "touch";

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      e.preventDefault();
      isDown = true;
      moved = false;

      stopMomentum();

      startX = e.clientX;
      startLeft = chanceWrap.scrollLeft;
      targetLeft = startLeft;

      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;

      chanceWrap.classList.add("is-dragging");
      chanceWrap.style.userSelect = "none";
      chanceWrap.style.cursor = "grabbing";
      chanceWrap.style.touchAction = "none";

      try {
        chanceWrap.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    const onMove = (e) => {
      if (!isDown) return;

      e.preventDefault();

      const now = performance.now();
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;

      const max = chanceWrap.scrollWidth - chanceWrap.clientWidth;
      targetLeft = clamp(startLeft - dx, 0, max);
      scheduleScroll();

      const dt = now - lastT || 16;
      const vx = (e.clientX - lastX) / dt;
      velocity = velocity * 0.8 + vx * 0.2;

      lastX = e.clientX;
      lastT = now;
    };

    const startMomentum = () => {
      let v = -velocity * 28;
      const friction = 0.95;
      const minV = 0.1;

      const tick = () => {
        const max = chanceWrap.scrollWidth - chanceWrap.clientWidth;

        if (Math.abs(v) < minV) {
          momentumRaf = 0;
          snapToNearest();
          return;
        }

        const next = clamp(chanceWrap.scrollLeft + v, 0, max);
        chanceWrap.scrollLeft = next;

        if (next <= 0 || next >= max) v *= 0.5;
        v *= friction;

        momentumRaf = requestAnimationFrame(tick);
      };

      momentumRaf = requestAnimationFrame(tick);
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;

      chanceWrap.classList.remove("is-dragging");
      chanceWrap.style.userSelect = "";
      chanceWrap.style.cursor = "grab";
      chanceWrap.style.touchAction = "pan-y";

      startMomentum();
    };

    chanceWrap.addEventListener("pointerdown", onDown, { passive: false });
    chanceWrap.addEventListener("pointermove", onMove, { passive: false });
    chanceWrap.addEventListener("pointerup", onUp, { passive: true });
    chanceWrap.addEventListener("pointercancel", onUp, { passive: true });

    chanceWrap.addEventListener(
      "click",
      (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
        moved = false;
      },
      true,
    );

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

      if (shouldScroll)
        firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
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

  const ensureLeadModalStyles = () => {
    const STYLE_ID = "galeon-lead-modal-style";
    if (document.getElementById(STYLE_ID)) return;

    const st = document.createElement("style");
    st.id = STYLE_ID;
    st.textContent = `
.galeon-lead-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.45);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:18px;}
.galeon-lead-modal{width:min(660px,82vw);background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.15);position:relative;padding:10px 15px;box-sizing:border-box;height:auto;display:flex;flex-direction:column;gap:10px;}
.galeon-lead-modal *{margin-top:0!important;margin-bottom:0!important;}
.galeon-lead-close{position:absolute;top:18px;right:18px;width:34px;height:34px;border-radius:50%;border:1px solid #e9eef2;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:transform 120ms ease,box-shadow 120ms ease;}
.galeon-lead-close:hover{}
.galeon-lead-close svg{display:block; color:#23A8B3; width:14px;height:14px;}
.galeon-lead-title{font-size:56px;line-height:1.05;font-weight:800;color:#0f1822;margin:0 54px 10px 0;letter-spacing:-0.5px;}
.galeon-lead-subtitle{font-size:16px;line-height:1.5;color:#9aa3ab;margin:0 0 18px 0;}
.galeon-lead-field{width:100%;background:#f3f6f8;border:1px solid #eef2f5;padding:16px 18px;font-size:16px;outline:none;color:#0f1822;box-sizing:border-box;}
.galeon-lead-field::placeholder{color:#aab2ba;}
.galeon-lead-phone{display:flex;align-items:center;gap:12px;background:#f3f6f8;border:1px solid #eef2f5;border-radius:10px;padding:10px 14px;box-sizing:border-box;}
.galeon-lead-flag{width:26px;height:18px;overflow:hidden;flex:0 0 auto;box-shadow:0 6px 14px rgba(0,0,0,.10);}
.galeon-lead-phone input{border:none;outline:none;background:transparent;font-size:16px;width:100%;padding:10px 0;color:#0f1822;}
.galeon-lead-phone input::placeholder{color:#aab2ba;}
.galeon-lead-textarea{min-height:120px;resize:none;}
.galeon-lead-submit{width:100%;border:none;padding:18px 16px;font-size:18px;font-weight:700;cursor:pointer;background:#23A8B3;color:#fff;transition:all .3s ease;margin-top:14px;}
.galeon-lead-submit:hover{background:#1e8f97;}
.galeon-lead-consent{display:flex;align-items:flex-start;gap:12px;margin-top:14px;color:#8f98a1;font-size:14px;line-height:1.45;}
.galeon-lead-consent a{color:#8f98a1;text-decoration:underline;text-underline-offset:3px;}
.galeon-lead-check{width:22px;height:22px;border:1px solid #dbe5eb;background:#fff;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;margin-top:1px;}
.galeon-lead-check.is-on{background:#23A8B3;border-color:#23A8B3;}
.galeon-lead-check svg{width:14px;height:14px;opacity:0;}
.galeon-lead-check.is-on svg{opacity:1;}
@media (max-width:640px){.galeon-lead-modal{padding:20px 18px 16px;}.galeon-lead-title{font-size:36px;}}
`;
    document.head.appendChild(st);
  };

  const ruFlagSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="26" height="18" preserveAspectRatio="none">
  <rect width="3" height="2" fill="#fff"/>
  <rect width="3" height="0.6667" y="0.6667" fill="#1C57A7"/>
  <rect width="3" height="0.6667" y="1.3334" fill="#D52B1E"/>
</svg>`;

  const maskRUPhone = (digits) => {
    const d = String(digits || "").replace(/\D/g, "");
    const core = d.startsWith("8") ? "7" + d.slice(1) : d;
    const n = core.startsWith("7") ? core : core;
    const p = n.padEnd(11, "_").slice(0, 11);
    const a = p.slice(1, 4);
    const b = p.slice(4, 7);
    const c = p.slice(7, 9);
    const e = p.slice(9, 11);
    return `+7 ${a} ${b} ${c} ${e}`.replace(/_/g, "");
  };

  const openLeadModal = (prefill = {}) => {
    ensureLeadModalStyles();

    const overlay = document.createElement("div");
    overlay.className = "galeon-lead-overlay";

    const modal = document.createElement("div");
    modal.className = "galeon-lead-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Оставить заявку");
    const isMobile = window.matchMedia("(max-width: 900px)").matches;

    if (isMobile) {
      modal.style.width = "92vw";
      modal.style.maxWidth = "92vw";
      modal.style.minWidth = "0";
    } else {
      modal.style.width = "580px";
      modal.style.maxWidth = "580px";
      modal.style.minWidth = "580px";
      modal.style.padding = "40px";
    }

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

  const bindAdditionalButtonsToLeadModal = () => {
    const selectors =
      ".additional-main__banner .button1, .additional-card__button";

    $$(selectors).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();

        const cardTitle =
          btn
            .closest(".additional-card__top")
            ?.querySelector(".additional-card__title")
            ?.textContent?.trim() || "";

        openLeadModal({
          message: cardTitle
            ? `Заявка: ${cardTitle}`
            : (btn.textContent || "").trim(),
        });
      });
    });
  };

  const bindCallLink = () => {
    if (!callLink) return;
    callLink.addEventListener("click", (e) => {
      e.preventDefault();
      openLeadModal();
    });
  };

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

  const bindToTop = () => {
    if (!toTopBtn) return;
    toTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const ensureHeaderBadgeStyles = () => {
    const ID = "galeon-header-badge-style-catalog";
    let st = document.getElementById(ID);

    if (!st) {
      st = document.createElement("style");
      st.id = ID;
      document.head.appendChild(st);
    }

    st.textContent = `
.header-icon{position:relative!important;overflow:visible!important;}
.header-icon .galeon-badge{
  position:absolute!important;
  top:3px!important;
  right:3px!important;
  transform:translate(50%,-50%)!important;
  height:18px!important;
  min-width:18px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  border-radius:50%;
  background:#23A8B3!important;
  color:#fff!important;
  font-size:11px!important;
  font-weight:700!important;
  line-height:1!important;
  box-shadow:0 8px 18px rgba(0,0,0,.14)!important;
  pointer-events:none!important;
  white-space:nowrap!important;
}
`;
  };

  const getHeaderFavIcon = () => {
    return (
      document.querySelector(".header-icon--fav") ||
      document.querySelectorAll(".header-icon")[1] ||
      null
    );
  };

  const getHeaderCartIcon = () => {
    return (
      document.querySelector(".header-icon--cart") ||
      document.querySelectorAll(".header-icon")[2] ||
      null
    );
  };

  const ensureBadge = (iconEl) => {
    if (!iconEl) return null;
    let b = iconEl.querySelector(".galeon-badge");
    if (!b) {
      b = document.createElement("span");
      b.className = "galeon-badge";
      b.textContent = "0";
      iconEl.appendChild(b);
    }
    return b;
  };

  const headerCounters = (() => {
    ensureHeaderBadgeStyles();

    const favIcon = getHeaderFavIcon();
    const cartIcon = getHeaderCartIcon();

    const favBadge = ensureBadge(favIcon);
    const cartBadge = ensureBadge(cartIcon);

    const state2 = { fav: 0, cart: 0 };

    const setBadge = (badgeEl, val) => {
      if (!badgeEl) return;
      const n = Math.max(0, Math.round(Number(val) || 0));
      badgeEl.textContent = String(n);
      badgeEl.style.display = n > 0 ? "inline-flex" : "none";
    };

    setBadge(favBadge, 0);
    setBadge(cartBadge, 0);

    return {
      setFav(n) {
        state2.fav = Math.max(0, Math.round(Number(n) || 0));
        setBadge(favBadge, state2.fav);
      },
      setCart(n) {
        state2.cart = Math.max(0, Math.round(Number(n) || 0));
        setBadge(cartBadge, state2.cart);
      },
      bumpFav(delta) {
        this.setFav(state2.fav + (Number(delta) || 0));
      },
      bumpCart(delta) {
        this.setCart(state2.cart + (Number(delta) || 0));
      },
      get() {
        return { ...state2 };
      },
    };
  })();

  window.GaleonHeaderCounters = window.GaleonHeaderCounters || headerCounters;

  document.addEventListener("galeon:fav", (e) => {
    const d = e?.detail || {};
    if (typeof d.delta === "number") headerCounters.bumpFav(d.delta);
    if (typeof d.value === "number") headerCounters.setFav(d.value);
  });

  document.addEventListener("galeon:cart", (e) => {
    const d = e?.detail || {};
    if (typeof d.delta === "number") headerCounters.bumpCart(d.delta);
    if (typeof d.value === "number") headerCounters.setCart(d.value);
  });

  const bindHeaderIcons = () => {
    const icons = $$(".header-icon");
    if (!icons.length) return;

    icons.forEach((icon, idx) => {
      icon.addEventListener("click", (e) => {
        if (idx === 0) {
          toast("Личный кабинет");
          return;
        }

        if (idx === 1) {
          headerCounters.bumpFav(-1);
          toast("Избранное: -1");
          return;
        }

        if (idx === 2) {
          headerCounters.bumpCart(-1);
          toast("Корзина: -1");
          return;
        }

        if (icon.classList.contains("header-icon--fav")) {
          headerCounters.bumpFav(-1);
          toast("Избранное: -1");
          return;
        }

        if (icon.classList.contains("header-icon--cart")) {
          headerCounters.bumpCart(-1);
          toast("Корзина: -1");
          return;
        }
      });
    });
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
      const msgv = (formMsg?.value || "").trim();

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
      if (msgv.length < 3) {
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

      openLeadModal({
        name: (formName?.value || "").trim(),
        phone: (formTel?.value || "").trim(),
        message: (formMsg?.value || "").trim(),
      });

      if (formName) formName.value = "";
      if (formTel) formTel.value = "";
      if (formMsg) formMsg.value = "";
      setConsent(true);
    });
  };

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

  const bindMainAnimations = () => {
    const wrap = $(".main-animations");
    if (!wrap) return;

    const isTabletOrMobile = () =>
      window.matchMedia("(max-width: 1024px)").matches;

    if (isTabletOrMobile()) {
      wrap.style.display = "none";
      return;
    } else {
      wrap.style.display = "";
    }

    const items = $$(".main-animations .main-animation", wrap);
    if (!items.length) return;

    const STYLE_ID = "galeon-main-animations-style";
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement("style");
      st.id = STYLE_ID;
      st.textContent = `
.main-animations{position:absolute!important;inset:0!important;z-index:6!important;pointer-events:none!important;}
.main-animations .main-animation{position:absolute!important;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;z-index:10;cursor:default;pointer-events:auto!important;}
.main-animations .main-animation svg{display:block;position:relative;z-index:2;cursor:pointer;}
.main-animations .main-animation::before,.main-animations .main-animation::after{content:"";position:absolute;inset:50%;width:26px;height:26px;border-radius:50%;transform:translate(-50%,-50%) scale(1);background:rgba(35,168,179,.22);z-index:1;animation:galeonRipple 2.4s ease-out infinite;pointer-events:none;}
.main-animations .main-animation::after{animation-delay:1.2s;background:rgba(35,168,179,.16);}
@keyframes galeonRipple{0%{transform:translate(-50%,-50%) scale(1);opacity:.9;}70%{transform:translate(-50%,-50%) scale(2.8);opacity:.15;}100%{transform:translate(-50%,-50%) scale(3.1);opacity:0;}}
.main-animations .main-animation .galeon-tip{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%) translateY(6px);opacity:0;pointer-events:none;transition:opacity 180ms ease,transform 180ms ease;z-index:20;background:transparent!important;padding:0!important;border-radius:0!important;box-shadow:none!important;color:#fff;font-size:14px;line-height:1.25;font-weight:500;text-shadow:0 10px 24px rgba(0,0,0,.55),0 2px 6px rgba(0,0,0,.5);min-width:260px;max-width:360px;white-space:normal;text-align:center;}
.main-animations .main-animation:hover .galeon-tip,.main-animations .main-animation:focus-within .galeon-tip{opacity:1;transform:translateX(-50%) translateY(0);}
@media (max-width:1024px){.main-animations{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}}
`;
      document.head.appendChild(st);
    }

    const pos = [
      { top: "25%", left: "75%" },
      { top: "75%", left: "75%" },
      { top: "84%", left: "58%" },
      { top: "63%", left: "57%" },
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

    const onResize = () => {
      if (window.matchMedia("(max-width: 1024px)").matches)
        wrap.style.display = "none";
      else wrap.style.display = "";
    };
    window.addEventListener("resize", onResize);
  };

  const bindHeaderBadgeDecreaseByCatalogClicks = () => {
    const bindOnce = () => {
      const cards = $$(".product-card");
      if (!cards.length) return;

      cards.forEach((card) => {
        if (card.dataset.__galeonBoundCartMinus === "1") return;

        const btn = $(".product-card__button", card);
        const qtyEl = $(".card-number__value", card);

        if (!btn) return;

        card.dataset.__galeonBoundCartMinus = "1";

        btn.addEventListener("contextmenu", (e) => {
          e.preventDefault();

          let qty = 1;
          if (qtyEl) {
            const n = Number(
              String(qtyEl.textContent || "").replace(/[^\d]/g, ""),
            );
            qty = Number.isFinite(n) && n > 0 ? n : 1;
          }

          headerCounters.bumpCart(-qty);
          toast(`Корзина: -${qty}`);
        });

        btn.addEventListener("auxclick", (e) => {
          if (e.button !== 1) return;

          let qty = 1;
          if (qtyEl) {
            const n = Number(
              String(qtyEl.textContent || "").replace(/[^\d]/g, ""),
            );
            qty = Number.isFinite(n) && n > 0 ? n : 1;
          }

          headerCounters.bumpCart(-qty);
          toast(`Корзина: -${qty}`);
        });
      });
    };

    bindOnce();

    const obs = new MutationObserver(() => bindOnce());
    obs.observe(document.body, { childList: true, subtree: true });
  };

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

  const bindCatalogCardActions = () => {
    const bindOnce = () => {
      const cards = $$(".product-card");
      if (!cards.length) return;

      cards.forEach((card) => {
        if (card.dataset.__galeonCardBound === "1") return;
        card.dataset.__galeonCardBound = "1";

        const likeBtn = $(".product-card__like", card);
        const cartBtn = $(".product-card__button", card);
        const qtyEl = $(".card-number__value", card);

        if (likeBtn) {
          if (!likeBtn.dataset.liked) likeBtn.dataset.liked = "0";

          // ✅ page load paytida ham to‘g‘ri holat ko‘rsatsin (optional)
          likeBtn.innerHTML =
            likeBtn.dataset.liked === "1" ? HEART_ON : HEART_OFF;

          likeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const liked = likeBtn.dataset.liked === "1";
            likeBtn.dataset.liked = liked ? "0" : "1";

            // ✅ faqat click bo‘lganda svg almashadi
            likeBtn.innerHTML = liked ? HEART_OFF : HEART_ON;

            document.dispatchEvent(
              new CustomEvent("galeon:fav", {
                detail: { delta: liked ? -1 : 1 },
              }),
            );
          });
        }

        if (cartBtn) {
          cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            let qty = 1;
            if (qtyEl) {
              const n = Number(
                String(qtyEl.textContent || "").replace(/[^\d]/g, ""),
              );
              qty = Number.isFinite(n) && n > 0 ? n : 1;
            }

            document.dispatchEvent(
              new CustomEvent("galeon:cart", { detail: { delta: qty } }),
            );
          });
        }
      });
    };

    bindOnce();
    const obs = new MutationObserver(() => bindOnce());
    obs.observe(document.body, { childList: true, subtree: true });
  };

  const init = () => {
    bindMegaMenu();
    bindDesktopSearch();
    initSearchModal();
    bindChanceNav();
    bindCatalogButtons();
    bindCatalogCardActions(); // <-- SHUNI qo‘shasiz
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
    bindAdditionalButtonsToLeadModal();
    setMenuBtnUI(false);
    document.body.classList.remove("mega-open");
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
