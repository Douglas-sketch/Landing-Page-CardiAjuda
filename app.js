document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     CARDIAJUDA — APP.JS
     Cadastro + Login + Onboarding + Área personalizada
     ========================================================= */

  const authView = document.querySelector("#auth-view");
  const onboardingView = document.querySelector("#onboarding-view");
  const dashboardView = document.querySelector("#dashboard-view");

  const loginForm = document.querySelector("#login-form");
  const signupForm = document.querySelector("#signup-form");

  const loginTab = document.querySelector("#login-tab");
  const signupTab = document.querySelector("#signup-tab");

  const authClose = document.querySelector("#auth-close");

  const checkinTitle = document.querySelector("#checkin-title");
  const checkinSubtitle = document.querySelector("#checkin-subtitle");

  const progressFill = document.querySelector("#progress-fill");
  const progressText = document.querySelector("#progress-text");

  const backButton = document.querySelector("#checkin-back");
  const nextButton = document.querySelector("#checkin-next");
  const skipButton = document.querySelector("#checkin-skip");
  const closeCheckinButton = document.querySelector("#checkin-close");

  const logoutButton = document.querySelector("#logout");

  let currentStep = 1;
  const totalSteps = 4;

  let onboardingData = {
    diagnosis: "",
    monitoring: "",
    tracking: [],
    support: ""
  };

  /* =========================================================
     STORAGE
     ========================================================= */

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("cardiajudaUser")) || null;
    } catch (error) {
      return null;
    }
  }

  function saveUser(user) {
    localStorage.setItem(
      "cardiajudaUser",
      JSON.stringify(user)
    );
  }

  function clearUser() {
    localStorage.removeItem("cardiajudaUser");
  }

  /* =========================================================
     AUTH
     ========================================================= */

  function setAuthMode(mode) {
    if (!loginForm || !signupForm) return;

    const loginMode = mode === "login";

    loginForm.classList.toggle("hidden", !loginMode);
    signupForm.classList.toggle("hidden", loginMode);

    loginTab?.classList.toggle("active", loginMode);
    signupTab?.classList.toggle("active", !loginMode);
  }

  function openAuth(mode = "login") {
    if (!authView) return;

    setAuthMode(mode);

    authView.classList.remove("hidden");

    document.body.classList.add("auth-open");

    /*
     * Impede que o clique no botão continue seguindo
     * para alguma âncora da página.
     */
    window.scrollTo({
      top: window.scrollY,
      behavior: "auto"
    });

    requestAnimationFrame(() => {
      authView.classList.add("show");
    });
  }

  function closeAuth() {
    if (!authView) return;

    authView.classList.remove("show");

    document.body.classList.remove("auth-open");

    setTimeout(() => {
      authView.classList.add("hidden");
    }, 250);
  }

  /* =========================================================
     BOTÕES DE LOGIN / CADASTRO
     ========================================================= */

  document.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-auth], #login-btn, #signup-btn, #create-account, #start-now"
    );

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    /*
     * Descobre qual tela deve abrir.
     */
    const action =
      button.dataset.auth ||
      button.dataset.action ||
      "";

    const text = button.textContent
      .trim()
      .toLowerCase();

    if (
      action === "signup" ||
      action === "register" ||
      action === "cadastro" ||
      text.includes("criar conta") ||
      text.includes("começar agora") ||
      text.includes("comece agora")
    ) {
      openAuth("signup");
      return;
    }

    openAuth("login");
  });

  /* =========================================================
     ABAS
     ========================================================= */

  loginTab?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    setAuthMode("login");
  });

  signupTab?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    setAuthMode("signup");
  });

  /* =========================================================
     FECHAR AUTH
     ========================================================= */

  authClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    closeAuth();
  });

  authView?.addEventListener("click", (event) => {
    if (event.target === authView) {
      closeAuth();
    }
  });

  /* =========================================================
     CADASTRO
     ========================================================= */

  signupForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput =
      document.querySelector("#signup-name") ||
      signupForm.querySelector(
        'input[name="name"], input[type="text"]'
      );

    const emailInput =
      document.querySelector("#signup-email") ||
      signupForm.querySelector(
        'input[name="email"], input[type="email"]'
      );

    const passwordInput =
      document.querySelector("#signup-password") ||
      signupForm.querySelector(
        'input[name="password"], input[type="password"]'
      );

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim().toLowerCase() || "";
    const password = passwordInput?.value || "";

    if (!name) {
      alert("Digite seu nome.");
      nameInput?.focus();
      return;
    }

    if (!email) {
      alert("Digite seu e-mail.");
      emailInput?.focus();
      return;
    }

    if (!password) {
      alert("Digite uma senha.");
      passwordInput?.focus();
      return;
    }

    const existingUser = getStoredUser();

    if (existingUser && existingUser.email === email) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    const user = {
      name: name,
      email: email,
      password: password,
      onboardingCompleted: false,
      onboarding: null
    };

    saveUser(user);

    closeAuth();

    setTimeout(() => {
      startOnboarding(user);
    }, 300);
  });

  /* =========================================================
     LOGIN
     ========================================================= */

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput =
      document.querySelector("#login-email") ||
      loginForm.querySelector('input[type="email"]');

    const passwordInput =
      document.querySelector("#login-password") ||
      loginForm.querySelector('input[type="password"]');

    const email =
      emailInput?.value.trim().toLowerCase() || "";

    const password =
      passwordInput?.value || "";

    const user = getStoredUser();

    if (!user) {
      alert(
        "Nenhuma conta foi encontrada. Crie sua conta primeiro."
      );

      setAuthMode("signup");
      return;
    }

    if (
      user.email !== email ||
      user.password !== password
    ) {
      alert("E-mail ou senha incorretos.");
      return;
    }

    closeAuth();

    setTimeout(() => {
      if (user.onboardingCompleted) {
        showDashboard(user);
      } else {
        startOnboarding(user);
      }
    }, 300);
  });

  /* =========================================================
     ONBOARDING
     ========================================================= */

  function startOnboarding(user) {
    if (!onboardingView) return;

    onboardingData = {
      diagnosis: "",
      monitoring: "",
      tracking: [],
      support: ""
    };

    currentStep = 1;

    onboardingView.classList.remove("hidden");
    dashboardView?.classList.add("hidden");

    document.body.classList.add("onboarding-open");

    const firstName =
      user?.name?.split(" ")[0] || "você";

    if (checkinTitle) {
      checkinTitle.textContent =
        `Olá, ${firstName}! Vamos conhecer um pouco mais sobre você.`;
    }

    if (checkinSubtitle) {
      checkinSubtitle.textContent =
        "Essas perguntas fazem parte de uma demonstração personalizada do CardiAjuda.";
    }

    showStep(1);
  }

  function showStep(step) {
    currentStep = step;

    const steps =
      document.querySelectorAll(".checkin-step");

    steps.forEach((item) => {
      const itemStep =
        Number(item.dataset.step);

      item.classList.toggle(
        "active",
        itemStep === step
      );
    });

    if (progressFill) {
      progressFill.style.width =
        `${(step / totalSteps) * 100}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${String(step).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`;
    }

    if (backButton) {
      backButton.classList.toggle(
        "hidden",
        step === 1
      );
    }

    if (nextButton) {
      nextButton.textContent =
        step === totalSteps
          ? "Finalizar"
          : "Continuar";
    }

    restoreSelections();
  }

  /* =========================================================
     RESTAURAR SELEÇÕES
     ========================================================= */

  function restoreSelections() {
    const step =
      document.querySelector(
        `.checkin-step[data-step="${currentStep}"]`
      );

    if (!step) return;

    const options =
      step.querySelectorAll(".checkin-option");

    options.forEach((option) => {
      const value = option.dataset.value;

      let selected = false;

      if (currentStep === 1) {
        selected =
          value === onboardingData.diagnosis;
      }

      if (currentStep === 2) {
        selected =
          value === onboardingData.monitoring;
      }

      if (currentStep === 3) {
        selected =
          onboardingData.tracking.includes(value);
      }

      if (currentStep === 4) {
        selected =
          value === onboardingData.support;
      }

      option.classList.toggle(
        "selected",
        selected
      );
    });
  }

  /* =========================================================
     SELECIONAR OPÇÃO
     ========================================================= */

  document.addEventListener("click", (event) => {
    const option =
      event.target.closest(".checkin-option");

    if (!option) return;

    const value =
      option.dataset.value;

    if (!value) return;

    chooseAnswer(value, option);
  });

  function chooseAnswer(value, element) {
    if (currentStep === 1) {
      onboardingData.diagnosis = value;

      document
        .querySelectorAll(
          '.checkin-step[data-step="1"] .checkin-option'
        )
        .forEach((option) => {
          option.classList.remove("selected");
        });

      element.classList.add("selected");
    }

    if (currentStep === 2) {
      onboardingData.monitoring = value;

      document
        .querySelectorAll(
          '.checkin-step[data-step="2"] .checkin-option'
        )
        .forEach((option) => {
          option.classList.remove("selected");
        });

      element.classList.add("selected");
    }

    if (currentStep === 3) {
      if (
        onboardingData.tracking.includes(value)
      ) {
        onboardingData.tracking =
          onboardingData.tracking.filter(
            (item) => item !== value
          );

        element.classList.remove("selected");
      } else {
        onboardingData.tracking.push(value);
        element.classList.add("selected");
      }
    }

    if (currentStep === 4) {
      onboardingData.support = value;

      document
        .querySelectorAll(
          '.checkin-step[data-step="4"] .checkin-option'
        )
        .forEach((option) => {
          option.classList.remove("selected");
        });

      element.classList.add("selected");
    }
  }

  /* =========================================================
     NAVEGAÇÃO DO ONBOARDING
     ========================================================= */

  nextButton?.addEventListener("click", (event) => {
    event.preventDefault();

    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
    } else {
      finishCheckin(false);
    }
  });

  backButton?.addEventListener("click", (event) => {
    event.preventDefault();

    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  });

  skipButton?.addEventListener("click", (event) => {
    event.preventDefault();

    finishCheckin(true);
  });

  closeCheckinButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      closeOnboarding();
    }
  );

  /* =========================================================
     FECHAR ONBOARDING
     ========================================================= */

  function closeOnboarding() {
    onboardingView?.classList.remove("show");

    setTimeout(() => {
      onboardingView?.classList.add("hidden");

      document.body.classList.remove(
        "onboarding-open"
      );
    }, 250);
  }

  /* =========================================================
     FINALIZAR ONBOARDING
     ========================================================= */

  function finishCheckin(skipped = false) {
    const user = getStoredUser();

    if (!user) return;

    user.onboardingCompleted = true;

    if (!skipped) {
      user.onboarding = {
        diagnosis: onboardingData.diagnosis,
        monitoring: onboardingData.monitoring,
        tracking: onboardingData.tracking,
        support: onboardingData.support
      };
    }

    saveUser(user);

    closeOnboarding();

    setTimeout(() => {
      showDashboard(user);
    }, 300);
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */

  function showDashboard(user) {
    if (!dashboardView) return;

    onboardingView?.classList.add("hidden");

    dashboardView.classList.remove("hidden");

    document.body.classList.add(
      "dashboard-open"
    );

    const firstName =
      user?.name?.split(" ")[0] || "você";

    document
      .querySelectorAll("[data-user-name]")
      .forEach((element) => {
        element.textContent = firstName;
      });

    buildPersonalSummary(user);
  }

  function buildPersonalSummary(user) {
    const data = user?.onboarding || {};

    const focusElement =
      document.querySelector("#personal-focus");

    const rhythmElement =
      document.querySelector("#personal-rhythm");

    const nextElement =
      document.querySelector("#personal-next");

    /* FOCO */

    let focus =
      "Seu bem-estar e acompanhamento";

    switch (data.diagnosis) {
      case "diabetes":
        focus =
          "Acompanhamento relacionado à glicose";
        break;

      case "hypertension":
      case "hipertensao":
        focus =
          "Acompanhamento da pressão arterial";
        break;

      case "both":
      case "ambos":
        focus =
          "Acompanhamento de pressão e glicose";
        break;

      case "none":
      case "nenhum":
        focus =
          "Prevenção e hábitos saudáveis";
        break;

      case "prefer-not":
      case "prefiro-nao-dizer":
        focus =
          "Um acompanhamento no seu ritmo";
        break;
    }

    if (focusElement) {
      focusElement.textContent = focus;
    }

    /* ROTINA */

    let rhythm =
      "Vamos construir uma rotina de acompanhamento.";

    switch (data.monitoring) {
      case "regular":
      case "regularmente":
        rhythm =
          "Você já mantém uma rotina regular de acompanhamento.";
        break;

      case "sometimes":
      case "as-vezes":
        rhythm =
          "Seu acompanhamento acontece de forma ocasional.";
        break;

      case "rarely":
      case "quase-nunca":
        rhythm =
          "Podemos ajudar você a organizar melhor sua rotina.";
        break;

      case "starting":
      case "comecando":
        rhythm =
          "Você está começando uma nova rotina de acompanhamento.";
        break;
    }

    if (rhythmElement) {
      rhythmElement.textContent = rhythm;
    }

    /* PRÓXIMO PASSO */

    let next =
      "Explore os recursos disponíveis no CardiAjuda.";

    switch (data.support) {
      case "reminders":
      case "lembretes":
        next =
          "Organize lembretes para ajudar na sua rotina.";
        break;

      case "alerts":
      case "alertas":
        next =
          "Acompanhe seus registros e fique atento aos alertas do sistema.";
        break;

      case "guidance":
      case "orientacoes":
        next =
          "Explore conteúdos e informações para acompanhar sua rotina.";
        break;

      case "history":
      case "historico":
        next =
          "Consulte seu histórico para visualizar seus registros.";
        break;
    }

    if (nextElement) {
      nextElement.textContent = next;
    }

    /* ITENS ACOMPANHADOS */

    const trackingContainer =
      document.querySelector(
        "#personal-tracking"
      );

    if (!trackingContainer) return;

    trackingContainer.innerHTML = "";

    const labels = {
      pressure: "Pressão",
      pressao: "Pressão",

      glucose: "Glicose",
      glicemia: "Glicemia",

      medications: "Medicamentos",
      medicamentos: "Medicamentos",

      habits: "Hábitos e rotina",
      rotina: "Hábitos e rotina"
    };

    if (
      data.tracking &&
      data.tracking.length
    ) {
      data.tracking.forEach((item) => {
        const badge =
          document.createElement("span");

        badge.className =
          "tracking-badge";

        badge.textContent =
          labels[item] || item;

        trackingContainer.appendChild(badge);
      });
    } else {
      const badge =
        document.createElement("span");

      badge.className =
        "tracking-badge";

      badge.textContent =
        "Nenhum item selecionado";

      trackingContainer.appendChild(badge);
    }
  }

  /* =========================================================
     MONITORAMENTO REAL
     ========================================================= */

  const monitorStorageKey = "cardiajudaMonitorData";

  function getMonitorData() {
    try {
      const existing = JSON.parse(localStorage.getItem(monitorStorageKey));

      return {
        glucose: Number(existing?.glucose ?? 96),
        pressure: {
          systolic: Number(existing?.pressure?.systolic ?? 120),
          diastolic: Number(existing?.pressure?.diastolic ?? 80)
        },
        pressureHistory: Array.isArray(existing?.pressureHistory) && existing.pressureHistory.length
          ? existing.pressureHistory.slice(-7)
          : [118, 122, 120, 121, 118, 124, 120]
      };
    } catch (error) {
      return {
        glucose: 96,
        pressure: { systolic: 120, diastolic: 80 },
        pressureHistory: [118, 122, 120, 121, 118, 124, 120]
      };
    }
  }

  function saveMonitorData(data) {
    localStorage.setItem(monitorStorageKey, JSON.stringify(data));
  }

  function updateGlucoseDisplay() {
    const data = getMonitorData();
    const glucoseValue = document.querySelector("#glucose-value");
    const glucoseZone = document.querySelector("#glucose-zone");
    const glucoseMarker = document.querySelector("#glucose-marker");

    if (!glucoseValue || !glucoseMarker) return;

    const value = Number(data.glucose);
    glucoseValue.textContent = String(value);

    const ratio = Math.min(100, Math.max(0, ((value - 40) / 210) * 100));
    glucoseMarker.style.left = `${ratio}%`;

    if (value < 80) {
      glucoseZone.textContent = "Baixa";
      glucoseZone.style.color = "#d79b8d";
    } else if (value > 140) {
      glucoseZone.textContent = "Alta";
      glucoseZone.style.color = "#d79b8d";
    } else {
      glucoseZone.textContent = "Faixa acompanhada";
      glucoseZone.style.color = "#3d9670";
    }

    const input = document.querySelector('[data-monitor-form="glucose"] input');
    if (input) input.value = value;
  }

  function updatePressureDisplay() {
    const data = getMonitorData();
    const valueNode = document.querySelector("#pressure-value");
    const statusNode = document.querySelector("#pressure-status");
    const bars = document.querySelectorAll(".bars i");

    if (!valueNode || !statusNode || !bars.length) return;

    const systolic = Number(data.pressure.systolic);
    const diastolic = Number(data.pressure.diastolic);
    const pressureText = `${systolic}/${diastolic}`;
    valueNode.textContent = pressureText;

    const avg = (systolic + diastolic) / 2;
    statusNode.textContent = avg > 110 ? "● estável" : "↗ acompanhamento";
    statusNode.style.color = avg > 110 ? "#d56e5c" : "#CF2390";

    const inputSystolic = document.querySelector('[data-monitor-form="pressure"] input[name="systolic"]');
    const inputDiastolic = document.querySelector('[data-monitor-form="pressure"] input[name="diastolic"]');

    if (inputSystolic) inputSystolic.value = systolic;
    if (inputDiastolic) inputDiastolic.value = diastolic;

    const values = data.pressureHistory.slice(-7);

    values.forEach((value, index) => {
      const bar = bars[index];
      if (!bar) return;
      const relativeHeight = Math.max(18, (value / 150) * 100);
      bar.style.height = `${relativeHeight}%`;
      bar.style.background = value > 130 ? "#e79a8b" : "#d7a7c8";
    });
  }

  function syncMonitorCard(type, value) {
    const data = getMonitorData();

    if (type === "glucose") {
      const nextValue = Number(value);
      data.glucose = Number.isFinite(nextValue) ? Math.min(250, Math.max(40, nextValue)) : data.glucose;
      saveMonitorData(data);
      updateGlucoseDisplay();
      return;
    }

    if (type === "pressure") {
      const nextSystolic = Number(value.systolic);
      const nextDiastolic = Number(value.diastolic);

      data.pressure = {
        systolic: Number.isFinite(nextSystolic) ? Math.min(220, Math.max(60, nextSystolic)) : data.pressure.systolic,
        diastolic: Number.isFinite(nextDiastolic) ? Math.min(140, Math.max(40, nextDiastolic)) : data.pressure.diastolic
      };

      const nextMeasurement = Math.max(data.pressure.systolic, data.pressure.diastolic);
      data.pressureHistory = [...data.pressureHistory.slice(-6), nextMeasurement];
      saveMonitorData(data);
      updatePressureDisplay();
    }
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-monitor-action]");
    if (!action) return;

    const type = action.dataset.monitorAction;
    const card = action.closest(".monitor-card");
    if (!card) return;

    card.classList.add("is-editing");
    const input = card.querySelector("input");
    input?.focus();
  });

  document.addEventListener("click", (event) => {
    const cancel = event.target.closest("[data-monitor-cancel]");
    if (!cancel) return;

    const type = cancel.dataset.monitorCancel;
    const card = cancel.closest(".monitor-card");
    if (!card) return;

    card.classList.remove("is-editing");
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-monitor-form]");
    if (!form) return;

    event.preventDefault();

    const type = form.dataset.monitorForm;
    const card = form.closest(".monitor-card");

    if (type === "glucose") {
      const value = form.querySelector('input[name="value"]')?.value;
      if (value === "" || Number.isNaN(Number(value))) {
        return;
      }

      syncMonitorCard("glucose", value);
    }

    if (type === "pressure") {
      const systolic = form.querySelector('input[name="systolic"]')?.value;
      const diastolic = form.querySelector('input[name="diastolic"]')?.value;

      if (!systolic || !diastolic) return;

      syncMonitorCard("pressure", {
        systolic,
        diastolic
      });
    }

    card?.classList.remove("is-editing");
  });

  document.addEventListener("DOMContentLoaded", () => {
    updateGlucoseDisplay();
    updatePressureDisplay();
  });

  /* =========================================================
     LOGOUT
     ========================================================= */

  logoutButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      clearUser();

      dashboardView?.classList.add(
        "hidden"
      );

      document.body.classList.remove(
        "dashboard-open"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );

  /* =========================================================
     VOLTAR PARA O SITE
     ========================================================= */

  document.addEventListener("click", (event) => {
    const button =
      event.target.closest(
        "[data-open-site], #back-to-site"
      );

    if (!button) return;

    event.preventDefault();

    dashboardView?.classList.add(
      "hidden"
    );

    document.body.classList.remove(
      "dashboard-open"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* =========================================================
     MENU MOBILE
     ========================================================= */

  const menuButton =
    document.querySelector("#menu-toggle");

  const mobileMenu =
    document.querySelector("#mobile-menu");

  menuButton?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      mobileMenu?.classList.toggle("open");
      menuButton.classList.toggle("active");
    }
  );

  mobileMenu
    ?.querySelectorAll("a")
    .forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          mobileMenu.classList.remove(
            "open"
          );

          menuButton?.classList.remove(
            "active"
          );
        }
      );
    });

  /* =========================================================
     SCROLL SUAVE
     ========================================================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const targetId =
            link.getAttribute("href");

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }

          /*
           * Não intercepta links usados
           * pelo sistema de autenticação.
           */
          if (
            link.dataset.auth ||
            link.id === "login-btn" ||
            link.id === "signup-btn" ||
            link.id === "create-account"
          ) {
            return;
          }

          const target =
            document.querySelector(
              targetId
            );

          if (!target) return;

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      );
    });

  /* =========================================================
     GSAP
     ========================================================= */

  function initAnimations() {
    if (
      typeof gsap === "undefined"
    ) {
      return;
    }

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    if (
      typeof ScrollTrigger !==
      "undefined"
    ) {
      gsap.registerPlugin(
        ScrollTrigger
      );
    }

    /* HERO */

    const heroElements =
      document.querySelectorAll(
        ".hero-content > *, .hero-image"
      );

    if (heroElements.length) {
      gsap.from(heroElements, {
        opacity: 0,
        y: 35,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out"
      });
    }

    /* SEÇÕES */

    if (
      typeof ScrollTrigger !==
      "undefined"
    ) {
      const elements =
        document.querySelectorAll(
          ".section-title, .section-description, .feature-card, .info-card, .about-content"
        );

      elements.forEach(
        (element) => {
          gsap.from(element, {
            opacity: 0,
            y: 35,
            duration: 0.8,
            ease: "power2.out",

            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true
            }
          });
        }
      );
    }

    /* LOGO */

    const logo =
      document.querySelector(
        ".logo"
      );

    if (logo) {
      gsap.to(logo, {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    /* IMAGEM HERO */

    const heroImage =
      document.querySelector(
        ".hero-image img"
      );

    if (heroImage) {
      gsap.to(heroImage, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }

  /* =========================================================
     BOTÕES MAGNÉTICOS
     ========================================================= */

  function initMagneticButtons() {
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const buttons =
      document.querySelectorAll(
        ".btn, .cta-button, .hero-button"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "mousemove",
        (event) => {
          const rect =
            button.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left -
            rect.width / 2;

          const y =
            event.clientY -
            rect.top -
            rect.height / 2;

          button.style.transform =
            `translate(${x * 0.08}px, ${y * 0.08}px)`;
        }
      );

      button.addEventListener(
        "mouseleave",
        () => {
          button.style.transform = "";
        }
      );
    });
  }

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  initAnimations();
  initMagneticButtons();

  console.log(
    "CardiAjuda iniciado com sucesso."
  );
});
