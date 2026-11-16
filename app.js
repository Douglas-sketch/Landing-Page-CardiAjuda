/* ==========================================================================
   CardiAjuda — Landing Page
   Módulos: header, menu mobile, acesso (demo), medição (demo), animações
   --------------------------------------------------------------------------
   - Sem dependências externas além de GSAP + ScrollTrigger (vendored).
   - Animações: fade + slide-up sutis (≤0.8s), stagger discreto, parallax
     leve no hero e contadores animados. Respeita prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================================
     Header — sombra sutil ao rolar
     ========================================================================== */
  function initHeader() {
    const header = $(".header");
    if (!header) return;

    let ticking = false;
    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ==========================================================================
     Menu mobile
     ========================================================================== */
  function initMobileMenu() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;

    let closeTimer = null;

    const open = () => {
      window.clearTimeout(closeTimer);
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      menu.hidden = false;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => menu.classList.add("is-open"))
      );
    };

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      menu.classList.remove("is-open");
      closeTimer = window.setTimeout(() => {
        if (!menu.classList.contains("is-open")) menu.hidden = true;
      }, 230);
    };

    toggle.addEventListener("click", () => {
      if (toggle.getAttribute("aria-expanded") === "true") close();
      else open();
    });

    $$("a, button", menu).forEach((element) =>
      element.addEventListener("click", close)
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        close();
        toggle.focus();
      }
    });
  }

  /* ==========================================================================
     Acesso (demonstração) — abrir/fechar modal, abas, validação, localStorage
     ========================================================================== */
  function initAuth() {
    const modal = $("#auth-modal");
    if (!modal) return;

    const dialog = $(".auth__dialog", modal);
    const loginForm = $('[data-auth-form="login"]', modal);
    const signupForm = $('[data-auth-form="signup"]', modal);
    const successBox = $("#auth-success", modal);
    const STORAGE_KEY = "cardiajudaUser";

    let lastFocused = null;

    const storedUser = () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch {
        return null;
      }
    };

    function setFeedback(form, message, type) {
      const feedback = $("[data-auth-feedback]", form);
      if (!feedback) return;
      feedback.textContent = message || "";
      feedback.classList.remove("is-error", "is-success");
      if (type) feedback.classList.add(`is-${type}`);
    }

    function setDialogLabelledBy(id) {
      if (id) dialog.setAttribute("aria-labelledby", id);
    }

    function switchTab(mode) {
      $$('[role="tab"]', modal).forEach((tab) => {
        const selected = tab.dataset.authTab === mode;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      loginForm.hidden = mode !== "login";
      signupForm.hidden = mode !== "signup";
      successBox.hidden = true;
      setDialogLabelledBy(mode === "login" ? "auth-title-login" : "auth-title-signup");
    }

    function openAuth(mode = "signup") {
      lastFocused = document.activeElement;
      switchTab(mode);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modal.classList.add("is-open"));
      const firstField = $(
        mode === "login" ? 'input[name="email"]' : 'input[name="name"]',
        mode === "login" ? loginForm : signupForm
      );
      window.setTimeout(() => firstField && firstField.focus(), 90);
    }

    function closeAuth() {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      window.setTimeout(() => {
        modal.hidden = true;
      }, 230);
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    function showSuccess(title, message) {
      loginForm.hidden = true;
      signupForm.hidden = true;
      $("#auth-success-title").textContent = title;
      $("#auth-success-message").textContent = message;
      successBox.hidden = false;
      setDialogLabelledBy("auth-success-title");
    }

    /* Aberturas (CTAs) e fechamentos (backdrop/botões) */
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-auth-open]");
      if (opener) {
        event.preventDefault();
        openAuth(opener.dataset.authOpen || "login");
        return;
      }
      if (event.target.closest("[data-auth-close]")) closeAuth();
    });

    /* Abas com navegação por setas */
    $$('[role="tab"]', modal).forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.authTab));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const otherMode = tab.dataset.authTab === "login" ? "signup" : "login";
        const otherTab = $(`[data-auth-tab="${otherMode}"]`, modal);
        if (otherTab) {
          otherTab.focus();
          otherTab.click();
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeAuth();
    });

    /* Cadastro */
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = $('input[name="name"]', signupForm);
      const emailInput = $('input[name="email"]', signupForm);
      const passwordInput = $('input[name="password"]', signupForm);

      const name = nameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      if (!name) {
        setFeedback(signupForm, "Digite seu nome.", "error");
        nameInput.focus();
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setFeedback(signupForm, "Digite um e-mail válido.", "error");
        emailInput.focus();
        return;
      }
      if (password.length < 6) {
        setFeedback(signupForm, "A senha precisa de pelo menos 6 caracteres.", "error");
        passwordInput.focus();
        return;
      }
      if (storedUser() && storedUser().email === email) {
        setFeedback(signupForm, "Este e-mail já está cadastrado. Tente entrar.", "error");
        return;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name, email, password, createdAt: Date.now() })
      );
      setFeedback(signupForm, "", null);
      showSuccess(
        "Conta criada!",
        `Bem-vindo(a), ${name.split(" ")[0]}! Esta é uma demonstração: sua conta existe apenas neste dispositivo.`
      );
    });

    /* Login */
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = $('input[name="email"]', loginForm).value.trim().toLowerCase();
      const password = $('input[name="password"]', loginForm).value;
      const user = storedUser();

      if (!user) {
        setFeedback(
          loginForm,
          "Nenhuma conta encontrada neste dispositivo. Crie a sua.",
          "error"
        );
        return;
      }
      if (user.email !== email || user.password !== password) {
        setFeedback(loginForm, "E-mail ou senha incorretos.", "error");
        return;
      }

      setFeedback(loginForm, "", null);
      showSuccess(
        "Bem-vindo de volta!",
        `Olá, ${user.name.split(" ")[0]}. Seu cuidado continua de onde parou.`
      );
    });
  }

  /* ==========================================================================
     Demonstração de medição — classificação automática (normal/atenção/alerta)
     ========================================================================== */
  function initMeasurementDemo() {
    const demoCard = $("#demo-card");
    if (!demoCard) return;

    const views = {
      pressure: {
        history: [118, 121, 116, 124, 119, 122, 118], // sistólica (últimas 7)
        unit: "mmHg",
        max: 160,
        last: null
      },
      glucose: {
        history: [92, 98, 95, 101, 97, 94, 96],
        unit: "mg/dL",
        max: 150,
        last: null
      }
    };

    const resultValue = $("#demo-result-value");
    const resultUnit = $("#demo-result-unit");
    const resultChip = $("#demo-result-chip");
    const resultClass = $("#demo-result-class");
    const resultMessage = $("#demo-result-message");
    const barsWrap = $("#demo-history-bars");

    const LEVELS = {
      normal: { label: "Normal", className: "chip--normal" },
      attention: { label: "Atenção", className: "chip--attention" },
      alert: { label: "Alerta", className: "chip--alert" }
    };

    /* ----------------------------------------------------------------------
       Referências usadas na classificação

       Pressão arterial — Diretrizes Brasileiras de Hipertensão Arterial
       (Sociedade Brasileira de Cardiologia, 2020), medida de consultório.
       A categoria é sempre a mais alta entre sistólica e diastólica:
         Ótima ............ < 120 e < 80
         Normal ........... 120–129 e/ou 80–84
         Pré-hipertensão .. 130–139 e/ou 85–89
         HAS estágio 1 .... 140–159 e/ou 90–99
         HAS estágio 2 .... 160–179 e/ou 100–109
         HAS estágio 3 .... ≥ 180 e/ou ≥ 110
         Hipotensão ....... < 90 e/ou < 60

       Glicemia de jejum — Sociedade Brasileira de Diabetes / OMS:
         Normal ........... 70–99 mg/dL
         Pré-diabetes ..... 100–125 mg/dL (glicemia de jejum alterada)
         Diabetes ......... ≥ 126 mg/dL (confirmar com segundo exame)
         Hipoglicemia ..... < 70 mg/dL
       ---------------------------------------------------------------------- */
    function classifyPressure(sys, dia) {
      /* Faixas de hipertensão vêm primeiro: em casos de hipertensão sistólica
         isolada (ex.: 180/55 mmHg) vale a categoria mais alta. */
      if (sys >= 180 || dia >= 110) {
        return {
          level: "alert",
          classification: "Hipertensão estágio 3 · ≥ 180/110 mmHg",
          message:
            "Nível muito elevado. Repita a medida após 5 minutos de repouso e, se o valor se mantiver — ou se houver dor no peito, falta de ar, visão turva ou dor de cabeça forte —, procure atendimento médico."
        };
      }
      if (sys >= 160 || dia >= 100) {
        return {
          level: "alert",
          classification: "Hipertensão estágio 2 · 160–179/100–109 mmHg",
          message:
            "Pressão bem acima do ideal. Refaça a medida com calma e converse com seu médico para ajustar o acompanhamento."
        };
      }
      if (sys >= 140 || dia >= 90) {
        return {
          level: "alert",
          classification: "Hipertensão estágio 1 · 140–159/90–99 mmHg",
          message:
            "Pressão acima da faixa considerada normal. Anote os valores de outros dias e leve o histórico ao seu médico."
        };
      }
      if (sys >= 130 || dia >= 85) {
        return {
          level: "attention",
          classification: "Pré-hipertensão · 130–139/85–89 mmHg",
          message:
            "Faixa que pede acompanhamento de perto: reforce os hábitos saudáveis e reavalie com um profissional."
        };
      }
      if (sys < 90 || dia < 60) {
        return {
          level: "attention",
          classification: "Hipotensão · abaixo de 90/60 mmHg",
          message:
            "Pressão abaixo da faixa esperada. Refaça a medida em repouso e, se o valor persistir ou vier com tontura e fraqueza, fale com seu médico."
        };
      }
      if (sys >= 120 || dia >= 80) {
        return {
          level: "normal",
          classification: "Pressão normal · 120–129/80–84 mmHg",
          message:
            "Dentro da faixa esperada. Continue com a rotina de medições e os hábitos saudáveis."
        };
      }
      return {
        level: "normal",
        classification: "Pressão ótima · abaixo de 120/80 mmHg",
        message: "Dentro da faixa esperada. Continue assim!"
      };
    }

    function classifyGlucose(value) {
      if (value < 70) {
        return {
          level: "alert",
          classification: "Hipoglicemia · abaixo de 70 mg/dL",
          message:
            "Glicemia abaixo do esperado. Em caso de tremor, suor frio, palidez ou confusão, procure ajuda; tenha sempre uma fonte de açúcar por perto."
        };
      }
      if (value >= 126) {
        return {
          level: "alert",
          classification: "Glicemia de jejum elevada · ≥ 126 mg/dL",
          message:
            "Valor compatível com diabetes, que precisa ser confirmado por um segundo exame. Procure seu médico e, se passar de 250 mg/dL ou houver muita sede, urina frequente, náusea ou vômito, procure atendimento."
        };
      }
      if (value >= 100) {
        return {
          level: "attention",
          classification: "Pré-diabetes · 100–125 mg/dL em jejum",
          message:
            "Faixa de atenção: nesse estágio, alimentação equilibrada e atividade física ajudam a reverter o quadro. Vale repetir o exame e conversar com seu médico."
        };
      }
      return {
        level: "normal",
        classification: "Glicemia de jejum normal · 70–99 mg/dL",
        message: "Dentro da faixa esperada em jejum. Continue assim!"
      };
    }

    function render(result, displayValue, unit, history, max) {
      resultValue.textContent = displayValue;
      resultUnit.textContent = unit;

      const level = LEVELS[result.level];
      resultChip.className = `chip ${level.className}`;
      resultChip.innerHTML = `<i></i>${level.label}`;
      if (resultClass) resultClass.textContent = result.classification || "";
      resultMessage.textContent = result.message;

      barsWrap.innerHTML = "";
      const last = history.slice(-7);
      last.forEach((value, index) => {
        const bar = document.createElement("i");
        bar.style.height = `${Math.max(12, Math.min(100, (value / max) * 100))}%`;
        if (index === last.length - 1) bar.className = `is-last is-last--${result.level}`;
        barsWrap.appendChild(bar);
      });
    }

    function setPanelFeedback(form, message) {
      const feedback = $(".demo-panel__feedback", form);
      if (feedback) feedback.textContent = message || "";
    }

    function record(type, result, displayValue) {
      const view = views[type];
      const lastValue = type === "pressure" ? Number(displayValue.split("/")[0]) : Number(displayValue);
      view.history = [...view.history, lastValue].slice(-7);
      view.last = { ...result, value: displayValue };
      render(view.last, view.last.value, view.unit, view.history, view.max);
    }

    function showView(type) {
      const view = views[type];
      if (view.last) {
        render(view.last, view.last.value, view.unit, view.history, view.max);
      } else {
        /* Valor inicial de cada aba (padrão do app) */
        const initial =
          type === "pressure"
            ? { ...classifyPressure(118, 76), value: "118/76" }
            : { ...classifyGlucose(96), value: "96" };
        render(initial, initial.value, view.unit, view.history, view.max);
      }
    }

    function handlePressure(form) {
      const sysInput = $('input[name="systolic"]', form);
      const diaInput = $('input[name="diastolic"]', form);
      const sys = Number(sysInput.value);
      const dia = Number(diaInput.value);

      if (!Number.isFinite(sys) || sys < 60 || sys > 260) {
        setPanelFeedback(form, "Informe uma pressão sistólica entre 60 e 260 mmHg.");
        sysInput.focus();
        return;
      }
      if (!Number.isFinite(dia) || dia < 40 || dia > 160) {
        setPanelFeedback(form, "Informe uma pressão diastólica entre 40 e 160 mmHg.");
        diaInput.focus();
        return;
      }
      setPanelFeedback(form, "");
      record("pressure", classifyPressure(sys, dia), `${sys}/${dia}`);
    }

    function handleGlucose(form) {
      const input = $('input[name="value"]', form);
      const value = Number(input.value);

      if (!Number.isFinite(value) || value < 40 || value > 300) {
        setPanelFeedback(form, "Informe uma glicemia entre 40 e 300 mg/dL.");
        input.focus();
        return;
      }
      setPanelFeedback(form, "");
      record("glucose", classifyGlucose(value), String(value));
    }

    $$("form", demoCard).forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (form.dataset.demoPanel === "glucose") handleGlucose(form);
        else handlePressure(form);
      });
    });

    /* Abas de tipo de medição */
    const tabs = $$("[data-demo-tab]", demoCard);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((other) => {
          const selected = other === tab;
          other.setAttribute("aria-selected", String(selected));
          other.tabIndex = selected ? 0 : -1;
        });
        $$("[data-demo-panel]", demoCard).forEach((panel) => {
          panel.hidden = panel.dataset.demoPanel !== tab.dataset.demoTab;
        });
        showView(tab.dataset.demoTab);
      });
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const index = tabs.indexOf(tab);
        const other = tabs[(index + tabs.length + (event.key === "ArrowRight" ? 1 : -1)) % tabs.length];
        other.focus();
        other.click();
      });
    });

    /* Estado inicial */
    showView("pressure");
  }

  /* ==========================================================================
     Animações — GSAP + ScrollTrigger (sutil, transform/opacity, ≤0.8s)
     ========================================================================== */
  function initAnimations() {
    if (typeof gsap === "undefined" || prefersReducedMotion()) return;
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    /* Hero — entrada suave (stagger discreto) */
    const heroCopyItems = $$(".hero__copy [data-hero]");
    if (heroCopyItems.length) {
      gsap.from(heroCopyItems, {
        opacity: 0,
        y: 26,
        duration: 0.65,
        stagger: 0.08,
        delay: 0.08,
        ease: "power2.out"
      });
    }

    const phone = $(".phone");
    if (phone) {
      gsap.from(phone, {
        opacity: 0,
        y: 22,
        duration: 0.65,
        delay: 0.25,
        ease: "power2.out"
      });
    }

    /* Cartões flutuantes: fade/escala (o y fica a cargo do parallax) */
    const floatCards = $$(".float-card");
    if (floatCards.length) {
      gsap.from(floatCards, {
        opacity: 0,
        scale: 0.94,
        duration: 0.5,
        delay: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      });
    }

    /* Desenho da linha do gráfico do hero */
    const chartLine = $("#hero-chart-line");
    if (chartLine) {
      gsap.from(chartLine, {
        strokeDashoffset: 1,
        duration: 0.8,
        delay: 0.55,
        ease: "power1.out"
      });
    }

    if (typeof ScrollTrigger === "undefined") return;

    /* Contadores animados */
    $$(".counter").forEach((element) => {
      const target = Number(element.dataset.count || 0);
      const prefix = element.dataset.prefix || "";
      const suffix = element.dataset.suffix || "";
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 0.8,
        ease: "power1.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true },
        onUpdate: () => {
          element.textContent = prefix + Math.round(counter.value) + suffix;
        }
      });
    });

    /* Revelações: fade + slide-up suave ao entrar na viewport */
    $$("[data-reveal]").forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 26,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 88%", once: true }
      });
    });

    /* Grupos: stagger discreto nos filhos */
    $$("[data-reveal-stagger]").forEach((group) => {
      const items = $$("[data-reveal-item]", group);
      if (!items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: group, start: "top 85%", once: true }
      });
    });

    /* Parallax muito leve nos cartões flutuantes do hero */
    const hero = $(".hero");
    if (hero) {
      const alertCard = $(".float-card--alert");
      const consultCard = $(".float-card--consult");
      const parallax = (element, y) => {
        gsap.to(element, {
          y,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      };
      if (alertCard) parallax(alertCard, -16);
      if (consultCard) parallax(consultCard, 12);
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ==========================================================================
     Inicialização
     ========================================================================== */
  function init() {
    initHeader();
    initMobileMenu();
    initAuth();
    initMeasurementDemo();
    initAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
