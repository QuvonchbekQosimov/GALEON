(function () {
  const container = document.querySelector(".chance-cards");
  const leftBtn = document.querySelector(".chance-card__navigation .left");
  const rightBtn = document.querySelector(".chance-card__navigation .right");
  const cards = document.querySelectorAll(".chance-card");

  if (!container || !leftBtn || !rightBtn) return;

  const scrollAmount = 444;

  function updateNavigationColors() {
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    leftBtn.style.backgroundColor = scrollLeft <= 10 ? "#8d8d8d" : "#1f4567";
    rightBtn.style.backgroundColor = scrollLeft >= maxScroll - 10 ? "#8d8d8d" : "#1f4567";
  }

  rightBtn.onclick = () => container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  leftBtn.onclick = () => container.scrollBy({ left: -scrollAmount, behavior: "smooth" });

  container.addEventListener("scroll", updateNavigationColors);
  window.addEventListener("resize", updateNavigationColors);

  const observer = new IntersectionObserver((entries) => {
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
  }, { root: container, threshold: 0.95 });

  cards.forEach((card) => observer.observe(card));
  updateNavigationColors();
})();

// Checkbox elementini ID orqali tanlab olamiz
const customCheckbox = document.getElementById('customCheckbox');
// SVG elementini uning ichidan tanlab olamiz
const checkboxSVG = customCheckbox.querySelector('svg');

// Aktiv holatni kuzatib borish uchun o'zgaruvchi
let isChecked = false;
const activeColor = '#23A8B3';
const defaultColor = '#AFAFAF';

// Klik hodisasini tinglaymiz
customCheckbox.addEventListener('click', function() {
    // Holatni o'zgartiramiz (true -> false yoki false -> true)
    isChecked = !isChecked;

    // SVG fon rangini holatga qarab o'zgartiramiz
    if (isChecked) {
        checkboxSVG.style.backgroundColor = activeColor;
    } else {
        checkboxSVG.style.backgroundColor = defaultColor;
    }
});





(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const header = $("#header");
  const menuBtn = $(".header-menu button");
  const searchInput = $(".header-search input");
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
    menuOpen: false,
    consent: true,
    drawer: null,
    overlay: null,
    toastEl: null,
    searchTimer: null
  };

  const cssEsc = (v) => {
    if (window.CSS && CSS.escape) return CSS.escape(v);
    return String(v).replace(/[^\w-]/g, "\\$&");
  };

  const smoothScrollTo = (elOrSelector) => {
    const el = typeof elOrSelector === "string" ? $(elOrSelector) : elOrSelector;
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

  const ensureOverlay = () => {
    if (state.overlay) return state.overlay;
    const o = document.createElement("div");
    o.id = "galeon-overlay";
    o.style.position = "fixed";
    o.style.inset = "0";
    o.style.background = "rgba(0,0,0,.45)";
    o.style.backdropFilter = "blur(2px)";
    o.style.zIndex = "9997";
    o.style.opacity = "0";
    o.style.pointerEvents = "none";
    o.style.transition = "opacity 200ms ease";
    o.addEventListener("click", () => setMenu(false));
    document.body.appendChild(o);
    state.overlay = o;
    return o;
  };

  const buildMenu = () => {
    if (state.drawer) return state.drawer;

    const drawer = document.createElement("div");
    drawer.id = "galeon-drawer";
    drawer.style.position = "fixed";
    drawer.style.top = "0";
    drawer.style.right = "0";
    drawer.style.height = "100vh";
    drawer.style.width = "min(360px, 92vw)";
    drawer.style.background = "#fff";
    drawer.style.zIndex = "9998";
    drawer.style.transform = "translateX(102%)";
    drawer.style.transition = "transform 220ms ease";
    drawer.style.boxShadow = "0 18px 50px rgba(0,0,0,.25)";
    drawer.style.display = "flex";
    drawer.style.flexDirection = "column";

    const head = document.createElement("div");
    head.style.display = "flex";
    head.style.alignItems = "center";
    head.style.justifyContent = "space-between";
    head.style.padding = "16px";
    head.style.borderBottom = "1px solid #eee";

    const title = document.createElement("div");
    title.textContent = "Меню";
    title.style.fontSize = "18px";
    title.style.fontWeight = "700";
    title.style.color = "#131A23";

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "✕";
    close.style.width = "36px";
    close.style.height = "36px";
    close.style.borderRadius = "10px";
    close.style.border = "1px solid #eee";
    close.style.background = "#fff";
    close.style.cursor = "pointer";
    close.addEventListener("click", () => setMenu(false));

    head.appendChild(title);
    head.appendChild(close);

    const list = document.createElement("div");
    list.style.padding = "10px 10px 14px";
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "6px";

    const links = [
      { text: "Главная", target: "#header" },
      { text: "Производственные возможности", target: ".chance-banner" },
      { text: "Наша продукция", target: ".product-top" },
      { text: "Преимущества", target: ".about-banner__area" },
      { text: "Контакты", target: ".contact-banner__area" }
    ];

    links.forEach((it) => {
      const a = document.createElement("a");
      a.href = it.target;
      a.textContent = it.text;
      a.style.padding = "12px 12px";
      a.style.borderRadius = "12px";
      a.style.textDecoration = "none";
      a.style.color = "#131A23";
      a.style.border = "1px solid #f0f0f0";
      a.style.background = "#fafafa";
      a.style.fontWeight = "600";
      a.addEventListener("click", (e) => {
        e.preventDefault();
        smoothScrollTo(it.target);
        setMenu(false);
      });
      list.appendChild(a);
    });

    const actions = document.createElement("div");
    actions.style.marginTop = "auto";
    actions.style.padding = "14px 16px";
    actions.style.borderTop = "1px solid #eee";
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.flexWrap = "wrap";

    const makeBtn = (txt, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = txt;
      b.style.padding = "12px 14px";
      b.style.borderRadius = "12px";
      b.style.border = "1px solid #e8e8e8";
      b.style.background = "#fff";
      b.style.cursor = "pointer";
      b.style.fontWeight = "600";
      b.addEventListener("click", onClick);
      return b;
    };

    actions.appendChild(
      makeBtn("Смотреть каталог", () => {
        smoothScrollTo(".product-top");
        setMenu(false);
      })
    );
    actions.appendChild(
      makeBtn("Связаться", () => {
        smoothScrollTo(".contact-banner__area");
        setMenu(false);
      })
    );

    drawer.appendChild(head);
    drawer.appendChild(list);
    drawer.appendChild(actions);

    document.body.appendChild(drawer);
    state.drawer = drawer;
    return drawer;
  };

  const setMenu = (open) => {
    const overlay = ensureOverlay();
    const drawer = buildMenu();
    state.menuOpen = !!open;

    if (state.menuOpen) {
      overlay.style.pointerEvents = "auto";
      overlay.style.opacity = "1";
      drawer.style.transform = "translateX(0)";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      drawer.style.transform = "translateX(102%)";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  };

  const normalizePhone = (v) => (v || "").replace(/[^\d+]/g, "");
  const isPhoneValid = (v) => {
    const n = normalizePhone(v);
    const digits = n.replace(/[^\d]/g, "");
    if (n.startsWith("+7") || n.startsWith("7") || n.startsWith("8")) return digits.length === 11;
    if (n.startsWith("+")) return digits.length >= 10 && digits.length <= 15;
    return digits.length >= 10 && digits.length <= 15;
  };

  const setConsent = (val) => {
    state.consent = !!val;
    if (!checkboxRow || !checkboxIcon) return;

    checkboxIcon.style.opacity = state.consent ? "1" : "0";
    const svg = checkboxIcon;
    svg.style.backgroundColor = state.consent ? "#23A8B3" : "#AFAFAF";
  };

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
      if (digits[0] === "7" || digits[0] === "8") {
        out = maskRUPhone(digits);
      } else {
        out = "+" + digits;
      }
      formTel.value = out;
    };

    formTel.addEventListener("input", onInput);
    formTel.addEventListener("blur", onInput);
    formTel.addEventListener("focus", () => {
      if (!formTel.value) formTel.value = "+7 ";
    });
  };

  const bindChanceNav = () => {
    if (!chanceWrap) return;

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

    if (chancePrev) chancePrev.addEventListener("click", () => scrollByStep(-1));
    if (chanceNext) chanceNext.addEventListener("click", () => scrollByStep(1));

    const updateNav = () => {
      if (!chancePrev || !chanceNext) return;
      const max = chanceWrap.scrollWidth - chanceWrap.clientWidth - 2;
      const atStart = chanceWrap.scrollLeft <= 2;
      const atEnd = chanceWrap.scrollLeft >= max;
      chancePrev.style.opacity = atStart ? "0.5" : "1";
      chanceNext.style.opacity = atEnd ? "0.5" : "1";
      chancePrev.style.pointerEvents = atStart ? "none" : "auto";
      chanceNext.style.pointerEvents = atEnd ? "none" : "auto";
    };

    chanceWrap.addEventListener("scroll", () => {
      clearTimeout(chanceWrap.__t);
      chanceWrap.__t = setTimeout(updateNav, 50);
    });

    window.addEventListener("resize", updateNav);
    updateNav();
  };

  const bindSearch = () => {
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
        ".footer-top3__item"
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

    const run = () => {
      const q = (searchInput.value || "").trim();
      clearMarks();
      if (!q) return;

      const nodes = allTextNodes();
      let firstHit = null;
      nodes.forEach((el) => {
        if (!el || !el.textContent) return;
        if (markText(el, q) && !firstHit) firstHit = el;
      });

      if (firstHit) {
        firstHit.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast("Ничего не найдено");
      }
    };

    searchInput.addEventListener("input", () => {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(run, 250);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      }
      if (e.key === "Escape") {
        searchInput.value = "";
        clearMarks();
        searchInput.blur();
      }
    });
  };

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
      })
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
      { once: true }
    );

    document.body.appendChild(overlay);
    setTimeout(() => input.focus(), 0);
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

        const title = $(".product-card__title", card)?.textContent?.trim() || "Категория";
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

  const bindHeaderIcons = () => {
    $$(".header-icon").forEach((icon, idx) => {
      icon.addEventListener("click", () => {
        if (idx === 0) toast("Личный кабинет");
        if (idx === 1) toast("Избранное");
        if (idx === 2) toast("Корзина");
      });
    });
  };

  const bindConsent = () => {
    if (!checkboxRow) return;
    setConsent(true);
    checkboxRow.addEventListener("click", () => setConsent(!state.consent));
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

      return { ok, name, tel, msg };
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

  const bindCallLink = () => {
    if (!callLink) return;
    callLink.addEventListener("click", (e) => {
      e.preventDefault();
      openCallbackModal();
    });
  };

  const bindMenu = () => {
    if (!menuBtn) return;
    menuBtn.addEventListener("click", () => setMenu(!state.menuOpen));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.menuOpen) setMenu(false);
    });
  };

  const stickyHeader = () => {
    if (!header) return;
    const h = header.offsetHeight || 70;

    const spacer = document.createElement("div");
    spacer.style.height = `${h}px`;
    spacer.style.display = "none";
    header.parentNode.insertBefore(spacer, header);

    const apply = () => {
      const y = window.scrollY || 0;
      if (y > 60) {
        header.style.position = "fixed";
        header.style.top = "0";
        header.style.left = "0";
        header.style.right = "0";
        header.style.zIndex = "9996";
        header.style.boxShadow = "0 10px 28px rgba(0,0,0,.12)";
        spacer.style.display = "block";
      } else {
        header.style.position = "";
        header.style.top = "";
        header.style.left = "";
        header.style.right = "";
        header.style.zIndex = "";
        header.style.boxShadow = "";
        spacer.style.display = "none";
      }
    };

    window.addEventListener("scroll", () => {
      clearTimeout(window.__hs);
      window.__hs = setTimeout(apply, 20);
    });
    window.addEventListener("resize", () => {
      spacer.style.height = `${header.offsetHeight || 70}px`;
      apply();
    });

    apply();
  };

  const bindFooterNav = () => {
    const map = new Map([
      [".footer-top2__item:nth-child(1)", "Мини кейсы"],
      [".footer-top2__item:nth-child(2)", "Средние кейсы"],
      [".footer-top2__item:nth-child(3)", "Большие кейсы"],
      [".footer-top2__item:nth-child(4)", "Длинные кейсы"],
      [".footer-top2__item:nth-child(5)", "Кейсы для ноутбуков"],
      [".footer-top2__item:nth-child(6)", "Контейнеры"]
    ]);

    map.forEach((txt, sel) => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener("click", () => {
        smoothScrollTo(".product-top");
        setTimeout(() => {
          const q = `.product-card__title`;
          const titles = $$(q);
          const hit = titles.find((t) => t.textContent.trim() === txt);
          if (hit) hit.closest(".product-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 250);
      });
    });

    $$(".footer-top3__item").forEach((el) => {
      const text = el.textContent.trim().toLowerCase();
      el.addEventListener("click", () => {
        if (text.includes("глав")) smoothScrollTo("#header");
        else if (text.includes("информ")) smoothScrollTo(".about-banner__area");
        else if (text.includes("производ")) smoothScrollTo(".chance-banner");
        else if (text.includes("контакт")) smoothScrollTo(".contact-banner__area");
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

  const init = () => {
    bindMenu();
    bindSearch();
    bindChanceNav();
    bindCatalogButtons();
    bindToTop();
    bindHeaderIcons();
    bindConsent();
    bindForm();
    bindCallLink();
    bindPhoneMask();
    bindFooterNav();
    stickyHeader();

    document.addEventListener("click", (e) => {
      if (!state.menuOpen) return;
      const drawer = state.drawer;
      if (!drawer) return;
      const clickInside = drawer.contains(e.target) || (menuBtn && menuBtn.contains(e.target));
      if (!clickInside) setMenu(false);
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

(() => {
  const link = document.querySelector(".main-bottom__link");
  if (!link) return;

  const getScrollTarget = () => {
    return (
      document.querySelector(".chance-banner") ||
      document.querySelector(".product-top") ||
      document.querySelector(".about-banner__area") ||
      document.querySelector(".contact-banner__area")
    );
  };

  const scrollToNext = () => {
    const target = getScrollTarget();
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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
})();


(() => {
  const searchBtn = document.querySelector(".header-search");
  if (!searchBtn) return;

  const modal = document.createElement("div");
  modal.className = "search-modal";
  modal.innerHTML = `
    <div class="search-modal__panel" role="dialog" aria-modal="true" aria-label="Search">
      <div class="search-modal__top">
        <div class="search-modal__title">Поиск</div>
        <button class="search-modal__close" type="button" aria-label="Close">✕</button>
      </div>
      <input class="search-modal__input" type="text" placeholder="Введите запрос..." />
    </div>
  `;
  document.body.appendChild(modal);

  const panel = modal.querySelector(".search-modal__panel");
  const input = modal.querySelector(".search-modal__input");
  const closeBtn = modal.querySelector(".search-modal__close");

  const open = () => {
    modal.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => input.focus(), 0);
  };

  const close = () => {
    modal.classList.remove("open");
    document.documentElement.style.overflow = "";
  };

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });

  closeBtn.addEventListener("click", close);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });

  panel.addEventListener("submit", (e) => e.preventDefault());
})();


const initSearchModal = () => {
  const searchBtn = document.querySelector(".header-search");
  if (!searchBtn) return;

  const isMobile = () => window.matchMedia("(max-width: 1024px)").matches;

  let open = false;
  let overlay = null;
  let modal = null;
  let releaseTrap = null;

  const createOverlay = (onClick) => {
    const o = document.createElement("div");
    o.style.position = "fixed";
    o.style.inset = "0";
    o.style.background = "rgba(0,0,0,.45)";
    o.style.backdropFilter = "blur(2px)";
    o.style.opacity = "0";
    o.style.transition = "opacity 180ms ease";
    o.style.zIndex = "100000";
    o.addEventListener("click", (e) => {
      if (e.target === o) onClick?.();
    });
    document.body.appendChild(o);
    requestAnimationFrame(() => (o.style.opacity = "1"));
    return o;
  };

  const destroyOverlay = (o) => {
    if (!o) return;
    o.style.opacity = "0";
    setTimeout(() => o.remove(), 180);
  };

  const bodyLock = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  };

  const trapFocus = (root, onClose) => {
    const focusables = () =>
      Array.from(
        root.querySelectorAll(
          `a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])`
        )
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
    modal = document.createElement("div");
    modal.className = "search-modal";
    modal.innerHTML = `
      <div class="search-modal__panel" role="dialog" aria-modal="true" aria-label="Search">
        <div class="search-modal__top">
          <div class="search-modal__title">Поиск</div>
          <button class="search-modal__close" type="button" aria-label="Close">✕</button>
        </div>
        <input class="search-modal__input" type="text" placeholder="Введите запрос..." />
      </div>
    `;
    document.body.appendChild(modal);
  };

  const close = () => set(false);

  const set = (val) => {
    if (val === open) return;
    open = val;

    if (!modal) build();

    const panel = modal.querySelector(".search-modal__panel");
    const input = modal.querySelector(".search-modal__input");
    const closeBtn = modal.querySelector(".search-modal__close");

    if (open) {
      if (!isMobile()) {
        open = false;
        return;
      }
      overlay = createOverlay(close);
      bodyLock(true);
      modal.classList.add("open");
      releaseTrap = trapFocus(panel, close);
      closeBtn.onclick = close;
      requestAnimationFrame(() => input.focus());
    } else {
      if (releaseTrap) releaseTrap();
      releaseTrap = null;
      modal.classList.remove("open");
      bodyLock(false);
      destroyOverlay(overlay);
      overlay = null;
      searchBtn.focus?.();
    }
  };

  searchBtn.addEventListener("click", (e) => {
    if (!isMobile()) return;        // desktopda umuman ochilmaydi
    e.preventDefault();
    set(true);
  });

  window.addEventListener("resize", () => {
    if (!isMobile() && open) set(false); // desktopga o‘tsa yopiladi
  });
};
