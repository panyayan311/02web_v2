(() => {
  "use strict";

  document.documentElement.classList.add("motion-ready");

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "メニューを開く";
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.querySelector(".sr-only").textContent = isOpen ? "メニューを開く" : "メニューを閉じる";
      mobileMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hero = document.querySelector(".hero");
  const heroSignature = document.querySelector(".hero-signature");
  const growthPath = document.querySelector(".growth-path");

  if (!reducedMotion && hero && heroSignature && growthPath) {
    let motionFrame = 0;

    const updateHeroMotion = () => {
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight - window.innerHeight * 0.45, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);

      heroSignature.style.setProperty("--signature-y", `${(progress * 24).toFixed(2)}px`);
      heroSignature.style.setProperty("--signature-rotate", `${(progress * -0.8).toFixed(2)}deg`);
      growthPath.style.setProperty("--path-progress", progress.toFixed(3));
      motionFrame = 0;
    };

    const requestHeroMotion = () => {
      if (motionFrame) return;
      motionFrame = window.requestAnimationFrame(updateHeroMotion);
    };

    window.addEventListener("scroll", requestHeroMotion, { passive: true });
    window.addEventListener("resize", requestHeroMotion);
    updateHeroMotion();
  } else if (growthPath) {
    growthPath.style.setProperty("--path-progress", "1");
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }

  const inquirySelect = document.querySelector("#inquiry-type");
  document.querySelectorAll("[data-contact-type]").forEach((link) => {
    link.addEventListener("click", () => {
      if (inquirySelect) inquirySelect.value = link.dataset.contactType || "";
    });
  });

  const form = document.querySelector("[data-contact-form]");
  const formStatus = document.querySelector("[data-form-status]");

  const messages = {
    name: "お名前を入力してください。",
    email: "有効なメールアドレスを入力してください。",
    "inquiry-type": "お問い合わせ種別を選択してください。",
    message: "お問い合わせ内容を入力してください。",
    privacy: "プライバシーポリシーへの同意が必要です。",
  };

  const showError = (field) => {
    const key = field.name === "inquiry_type" ? "inquiry-type" : field.name;
    const output = document.querySelector(`[data-error-for="${key}"]`);
    field.setAttribute("aria-invalid", "true");
    if (output) output.textContent = messages[key] || "入力内容を確認してください。";
  };

  const clearErrors = () => {
    form?.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
    document.querySelectorAll("[data-error-for]").forEach((output) => { output.textContent = ""; });
    formStatus?.classList.remove("is-visible", "is-success");
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      clearErrors();
      const honeypot = form.querySelector("[name='website']");
      if (honeypot?.value) {
        event.preventDefault();
        return;
      }

      const requiredFields = [...form.querySelectorAll("[required]")];
      const invalidFields = requiredFields.filter((field) => !field.checkValidity());
      if (invalidFields.length) {
        event.preventDefault();
        invalidFields.forEach(showError);
        invalidFields[0].focus();
        return;
      }

      const endpoint = form.getAttribute("action")?.trim();
      if (endpoint) return;

      event.preventDefault();
      if (formStatus) {
        formStatus.textContent = "送信画面の確認が完了しました。現在はデザイン確認用のため、公開時にFormspreeまたはSSGformの送信先を設定してください。";
        formStatus.classList.add("is-visible", "is-success");
      }
      form.reset();
    });

    form.addEventListener("input", (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
      if (!field.checkValidity()) return;
      const key = field.name === "inquiry_type" ? "inquiry-type" : field.name;
      field.removeAttribute("aria-invalid");
      const output = document.querySelector(`[data-error-for="${key}"]`);
      if (output) output.textContent = "";
    });
  }

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
