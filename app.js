/* =========================================================
   CARDIAJUDA — APP.JS
   Landing page + autenticação demo + onboarding personalizado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     ELEMENTOS
     ========================================================= */

  const authView = document.querySelector("#auth-view");
  const authCard = document.querySelector(".auth-card");

  const loginForm = document.querySelector("#login-form");
  const signupForm = document.querySelector("#signup-form");

  const loginTab = document.querySelector("#login-tab");
  const signupTab = document.querySelector("#signup-tab");

  const authClose = document.querySelector("#auth-close");

  const onboardingView = document.querySelector("#onboarding-view");
  const dashboardView = document.querySelector("#dashboard-view");

  const checkinTitle = document.querySelector("#checkin-title");
  const checkinSubtitle = document.querySelector("#checkin-subtitle");

  const progressFill = document.querySelector("#progress-fill");
  const progressText = document.querySelector("#progress-text");

  const backButton = document.querySelector("#checkin-back");
  const nextButton = document.querySelector("#checkin-next");
  const skipButton = document.querySelector("#checkin-skip");
  const closeCheckinButton = document.querySelector("#checkin-close");

  const logoutButton = document.querySelector("#logout");

  /* =========================================================
     ESTADO
     ========================================================= */

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
    localStorage.setItem("cardiajudaUser", JSON.stringify(user));
  }

  function clearUser() {
    localStorage.removeItem("cardiajudaUser");
  }

  /* =========================================================
     AUTENTICAÇÃO — DEMO
     ========================================================= */

  function setAuthMode(mode) {
    if (!loginForm || !signupForm) return;

    const isLogin = mode === "login";

    loginForm.classList.toggle("hidden", !isLogin);
    signupForm.classList.toggle("hidden", isLogin);

    loginTab?.classList.toggle("active", isLogin);
    signupTab?.classList.toggle("active", !isLogin);
  }

  function openAuth(mode = "login") {
    if (!authView) return;

    authView.classList.remove("hidden");
    document.body.classList.add("auth-open");

    setAuthMode(mode);

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

  loginTab?.addEventListener("click", () => {
    setAuthMode("login");
  });

  signupTab?.addEventListener("click", () => {
    setAuthMode("signup");
  });

  authClose?.addEventListener("click", closeAuth);

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

    const nameInput = document.querySelector("#signup-name");
    const emailInput = document.querySelector("#signup-email");
    const passwordInput = document.querySelector("#signup-password");

    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim().toLowerCase() || "";
    const password = passwordInput?.value || "";

    if (!name || !email || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    const existingUser = getStoredUser();

    if (existingUser && existingUser.email === email) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    const user = {
      name,
      email,
      password,
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

    const emailInput = document.querySelector("#login-email");
    const passwordInput = document.querySelector("#login-password");

    const email = emailInput?.value.trim().toLowerCase() || "";
    const password = passwordInput?.value || "";

    const user = getStoredUser();

    if (!user) {
      alert("Nenhuma conta demo encontrada. Crie uma conta primeiro.");
      setAuthMode("signup");
      return;
    }

    if (user.email !== email || user.password !== password) {
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

    const firstName = user?.name?.split(" ")[0] || "você";

    if (checkinTitle) {
      checkinTitle.innerHTML = `Olá, ${firstName}! Vamos conhecer um pouco mais sobre você.`;
    }

    if (checkinSubtitle) {
      checkinSubtitle.textContent =
        "Estas perguntas fazem parte de uma demonstração personalizada do CardiAjuda.";
    }

    showStep(currentStep);
  }

  function showStep(step) {
    currentStep = step;

    const steps = document.querySelectorAll(".checkin-step");

    steps.forEach((item) => {
      const itemStep = Number(item.dataset.step);

      item.classList.toggle("active", itemStep === step);
    });

    if (progressFill) {
      const percentage = (step / totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent =
        `${String(step).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`;
    }

    if (backButton) {
      backButton.classList.toggle("hidden", step === 1);
    }

    if (nextButton) {
      nextButton.textContent =
        step === totalSteps ? "Finalizar" : "Continuar";
    }

    restoreSelections();
  }

  function restoreSelections() {
    const activeStep = document.querySelector(
      `.checkin-step[data-step="${currentStep}"]`
    );

    if (!activeStep) return;

    const options = activeStep.querySelectorAll(
      ".checkin-option, input[type='checkbox']"
    );

    options.forEach((option) => {
      const value =
        option.value ||
        option.dataset.value ||
        option.closest(".checkin-option")?.dataset.value;

      let selected = false;

      if (currentStep === 1) {
        selected = value === onboardingData.diagnosis;
      }

      if (currentStep === 2) {
        selected = value === onboardingData.monitoring;
      }

      if (currentStep === 3) {
        selected = onboardingData.tracking.includes(value);
      }

      if (currentStep === 4) {
        selected = value === onboardingData.support;
      }

      option.classList?.toggle("selected", selected);

      if (option.matches?.("input[type='checkbox']")) {
        option.checked = selected;
      }

      const parent = option.closest(".checkin-option");

      if (parent) {
        parent.classList.toggle("selected", selected);
      }
    });
  }

  /* =========================================================
     ESCOLHAS DO CHECK-IN
     ========================================================= */

  document.addEventListener("click", (event) => {
    const option = event.target.closest(".checkin-option");

    if (!option) return;

    const value = option.dataset.value;

    if (!value) return;

    chooseAnswer(value, option);
  });

  function chooseAnswer(value, element) {
    if (currentStep === 1) {
      onboardingData.diagnosis = value;

      const options = document.querySelectorAll(
        `.checkin-step[data-step="1"] .checkin-option`
      );

      options.forEach((option) => {
        option.classList.remove("selected");
      });

      element.classList.add("selected");
    }

    if (currentStep === 2) {
      onboardingData.monitoring = value;

      const options = document.querySelectorAll(
        `.checkin-step[data-step="2"] .checkin-option`
      );

      options.forEach((option) => {
        option.classList.remove("selected");
      });

      element.classList.add("selected");
    }

    if (currentStep === 3) {
      if (onboardingData.tracking.includes(value)) {
        onboardingData.tracking =
          onboardingData.tracking.filter((item) => item !== value);

        element.classList.remove("selected");
      } else {
        onboardingData.tracking.push(value);
        element.classList.add("selected");
      }
    }

    if (currentStep === 4) {
      onboardingData.support = value;

      const options = document.querySelectorAll(
        `.checkin-step[data-step="4"] .checkin-option`
      );

      options.forEach((option) => {
        option.classList.remove("selected");
      });

      element.classList.add("selected");
    }
  }

  /* =========================================================
     BOTÕES DO ONBOARDING
     ========================================================= */

  nextButton?.addEventListener("click", () => {
    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
    } else {
      finishCheckin();
    }
  });

  backButton?.addEventListener("click", () => {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  });

  skipButton?.addEventListener("click", () => {
    finishCheckin(true);
  });

  closeCheckinButton?.addEventListener("click", () => {
    closeOnboarding();
  });

  function closeOnboarding() {
    onboardingView?.classList.remove("show");

    setTimeout(() => {
      onboardingView?.classList.add("hidden");
      document.body.classList.remove("onboarding-open");
    }, 250);
  }

  /* =========================================================
     FINALIZAR CHECK-IN
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
     DASHBOARD PERSONALIZADO
     ========================================================= */

  function showDashboard(user) {
    if (!dashboardView) return;

    onboardingView?.classList.add("hidden");

    dashboardView.classList.remove("hidden");
    document.body.classList.add("dashboard-open");

    const firstName = user?.name?.split(" ")[0] || "você";

    const nameElements = document.querySelectorAll("[data-user-name]");

    nameElements.forEach((element) => {
      element.textContent = firstName;
    });

    buildPersonalSummary(user);
  }

  function buildPersonalSummary(user) {
    const data = user?.onboarding || {};

    const focusElement = document.querySelector("#personal-focus");
    const rhythmElement = document.querySelector("#personal-rhythm");
    const nextElement = document.querySelector("#personal-next");

    /* -------------------------
       FOCO
       ------------------------- */

    let focus = "Seu bem-estar e acompanhamento";

    switch (data.diagnosis) {
      case "diabetes":
        focus = "Acompanhamento relacionado à glicose";
        break;

      case "hypertension":
        focus = "Acompanhamento da pressão arterial";
        break;

      case "both":
        focus = "Acompanhamento de pressão e glicose";
        break;

      case "none":
        focus = "Prevenção e hábitos saudáveis";
        break;

      case "prefer-not":
        focus = "Um acompanhamento no seu ritmo";
        break;
    }

    if (focusElement) {
      focusElement.textContent = focus;
    }

    /* -------------------------
       ROTINA
       ------------------------- */

    let rhythm = "Vamos construir uma rotina de acompanhamento.";

    switch (data.monitoring) {
      case "regular":
        rhythm = "Você já mantém uma rotina regular de acompanhamento.";
        break;

      case "sometimes":
        rhythm = "Seu acompanhamento acontece de forma ocasional.";
        break;

      case "rarely":
        rhythm = "Podemos ajudar você a organizar melhor sua rotina.";
        break;

      case "starting":
        rhythm = "Você está começando uma nova rotina de acompanhamento.";
        break;
    }

    if (rhythmElement) {
      rhythmElement.textContent = rhythm;
    }

    /* -------------------------
       PRÓXIMO PASSO
       ------------------------- */

    let next = "Explore os recursos disponíveis no CardiAjuda.";

    if (data.support === "reminders") {
      next = "Organize lembretes para ajudar na sua rotina.";
    }

    if (data.support === "alerts") {
      next = "Acompanhe seus registros e fique atento aos alertas do sistema.";
    }

    if (data.support === "guidance") {
      next = "Explore conteúdos e informações para acompanhar sua rotina.";
    }

    if (data.support === "history") {
      next = "Consulte seu histórico para visualizar seus registros.";
    }

    if (nextElement) {
      nextElement.textContent = next;
    }

    /* -------------------------
       ITENS SELECIONADOS
       ------------------------- */

    const trackingContainer =
      document.querySelector("#personal-tracking");

    if (trackingContainer) {
      trackingContainer.innerHTML = "";

      const labels = {
        pressure: "Pressão",
        glucose: "Glicose",
        medications: "Medicamentos",
        habits: "Hábitos e rotina"
      };

      if (data.tracking?.length) {
        data.tracking.forEach((item) => {
          const badge = document.createElement("span");

          badge.className = "tracking-badge";
          badge.textContent = labels[item] || item;

          trackingContainer.appendChild(badge);
        });
      } else {
        const empty = document.createElement("span");

        empty.className = "tracking-badge";
        empty.textContent = "Nenhum item selecionado";

        trackingContainer.appendChild(empty);
      }
    }
  }

  /* =========================================================
     LOGOUT
     ========================================================= */

  logoutButton?.addEventListener("click", () => {
    clearUser();

    dashboardView?.classList.add("hidden");
    document.body.classList.remove("dashboard-open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  /* =========================================================
     BOTÕES QUE ABREM LOGIN/CADASTRO
     ========================================================= */

  document.addEventListener("click", (event) => {
    const loginButton = event.target.closest("[data-auth='login']");
    const signupButton = event.target.closest("[data-auth='signup']");

    if (loginButton) {
      event.preventDefault();
      openAuth("login");
    }

    if (signupButton) {
      event.preventDefault();
      openAuth("signup");
    }
  });

  /* =========================================================
     GSAP
     ========================================================= */

  function initAnimations() {
    if (typeof gsap === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    /* -------------------------
       HERO
       ------------------------- */

    const heroElements = document.querySelectorAll(
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

    /* -------------------------
       SEÇÕES
       ------------------------- */

    if (typeof ScrollTrigger !== "undefined") {
      const animatedSections = document.querySelectorAll(
        ".section-title, .section-description, .feature-card, .info-card, .about-content"
      );

      animatedSections.forEach((element) => {
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
      });
    }

    /* -------------------------
       LOGO
       ------------------------- */

    const logo = document.querySelector(".logo");

    if (logo) {
      gsap.to(logo, {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    /* -------------------------
       IMAGEM PRINCIPAL
       ------------------------- */

    const heroImage = document.querySelector(".hero-image img");

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
     EFEITO MAGNÉTICO DOS BOTÕES
     ========================================================= */

  function initMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const buttons = document.querySelectorAll(
      ".btn, .cta-button, .hero-button"
    );

    buttons.forEach((button) => {
      button.addEventListener("mousemove", (event) => {
        const rect = button.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transform =
          `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* =========================================================
     MENU MOBILE
     ========================================================= */

  const menuButton = document.querySelector("#menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");

  menuButton?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("open");
    menuButton.classList.toggle("active");
  });

  document.querySelectorAll("#mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu?.classList.remove("open");
      menuButton?.classList.remove("active");
    });
  });

  /* =========================================================
     SCROLL SUAVE
     ========================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* =========================================================
     USUÁRIO JÁ LOGADO
     ========================================================= */

  const storedUser = getStoredUser();

  if (storedUser && storedUser.onboardingCompleted) {
    // Mantém a landing page como tela inicial.
    // O usuário pode abrir o dashboard pelo botão correspondente.
    const dashboardOpenButton = document.querySelector(
      "[data-open-dashboard]"
    );

    dashboardOpenButton?.addEventListener("click", (event) => {
      event.preventDefault();
      showDashboard(storedUser);
    });
  }

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  initAnimations();
  initMagneticButtons();

  console.log("CardiAjuda iniciado com sucesso.");
});
