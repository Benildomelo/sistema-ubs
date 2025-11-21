class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();

    if (typeof usersDB === "undefined") {
      console.error("❌ usersDB não encontrado!");
      //Tenta criar se não existir
      if (typeof UsersDB !== "undefined") {
        window.usersDB = new UsersDB();
      }
    }
    this.init();
  }

  init() {
    const savedUser = localStorage.getItem("ubs_current_user");
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.isAuthenticated = true;

        console.log("Usuário já logado:", this.currentUser.name);

        this.showContinueButton();
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        this.logout();
      }
    }

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const passwordToggle = document.querySelector(".password-toggle");
    if (passwordToggle) {
      passwordToggle.addEventListener(
        "click",
        this.togglePasswordVisibility.bind(this)
      );
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this));
    }

    const userTypeSelectors = document.querySelectorAll(
      'input[name="user-type-selector"]'
    );
    userTypeSelectors.forEach((radio) => {
      radio.addEventListener("change", this.handleUserTypeChange.bind(this));
    });
  }

  showContinueButton() {
    if (
      this.isAuthenticated &&
      window.location.pathname.includes("index.html")
    ) {
      const loginForm = document.getElementById("loginForm");
      if (loginForm) {
        const existingContinueBtn = document.getElementById("continueAsUser");
        if (existingContinueBtn) {
          existingContinueBtn.remove();
        }

        const continueButton = document.createElement("button");
        continueButton.id = "continueAsUser";
        continueButton.type = "button";
        continueButton.className =
          "w-full rounded-lg bg-ubs-green px-4 py-3.5 text-base font-semibold text-white shadow-sm h-14 mt-4 hover:bg-ubs-green/90 transition-colors";
        continueButton.innerHTML = `
                    <div class="flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">person</span>
                        Continuar como ${
                          this.currentUser.firstName ||
                          this.currentUser.name.split(" ")[0]
                        }
                    </div>
                `;

        continueButton.addEventListener("click", () => {
          this.redirectToDashboard();
        });

        loginForm.parentNode.insertBefore(
          continueButton,
          loginForm.nextSibling
        );

        this.showMessage(
          `Você já está logado como ${this.currentUser.name}. Clique no botão verde para continuar ou faça login com outra conta.`,
          "info"
        );
      }
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("loginPassword");
    const toggleIcon = document.querySelector(
      ".password-toggle .material-symbols-outlined"
    );

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.textContent = "visibility_off";
    } else {
      passwordInput.type = "password";
      toggleIcon.textContent = "visibility";
    }
  }

  handleUserTypeChange(event) {
    console.log("Tipo de usuário selecionado:", event.target.value);
  }

  handleLogin(event) {
    event.preventDefault();

    const identifier = document.getElementById("loginEmailCpf").value.trim();
    const password = document.getElementById("loginPassword").value;
    const userType = document.querySelector(
      'input[name="user-type-selector"]:checked'
    ).value;

    console.log("Tentativa de login:", { identifier, password, userType });

    if (!identifier) {
      this.showMessage("Por favor, digite seu e-mail ou CPF", "error");
      return;
    }

    if (!password) {
      this.showMessage("Por favor, digite sua senha", "error");
      return;
    }

    const loginSuccess = this.login(identifier, password, userType);

    if (loginSuccess) {
      this.showMessage(
        "Login realizado com sucesso! Redirecionando...",
        "success"
      );

      setTimeout(() => {
        this.redirectToDashboard();
      }, 1500);
    } else {
      this.showMessage("E-mail/CPF ou senha incorretos", "error");
    }
  }

  login(identifier, password, userType) {
    try {
      const user = usersDB.findUserByEmailOrCPF(identifier);
      console.log("Usuário encontrado:", user);

      if (user && user.password === password && user.type === userType) {
        this.currentUser = user;
        this.isAuthenticated = true;

        localStorage.setItem("ubs_current_user", JSON.stringify(user));
        console.log("Login bem-sucedido:", user);

        return true;
      }

      console.log(
        "Falha no login - usuário não encontrado ou credenciais inválidas"
      );
      return false;
    } catch (error) {
      console.error("Erro durante login:", error);
      return false;
    }
  }

  redirectToDashboard() {
    console.log("Redirecionando para dashboard...");

    if (this.currentUser.type === "paciente") {
      window.location.href = "dashboard.html";
    } else {
      this.checkPageExists("dashboard-profissional.html")
        .then((exists) => {
          if (exists) {
            window.location.href = "dashboard-profissional.html";
          } else {
            console.log(
              "Dashboard profissional não encontrado, usando dashboard padrão"
            );
            window.location.href = "dashboard.html";
          }
        })
        .catch(() => {
          console.log("Erro ao verificar página, usando fallback");
          window.location.href = "dashboard.html";
        });
    }
  }

  checkPageExists(url) {
    return new Promise((resolve) => {
      fetch(url, { method: "HEAD" })
        .then((response) => {
          resolve(response.ok);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem("ubs_current_user");
    window.location.href = "index.html";
  }

  showMessage(message, type = "info") {
    const existingMessage = document.querySelector(".login-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `login-message p-4 rounded-lg mb-4 text-center font-medium ${
      type === "error"
        ? "bg-red-100 text-red-700 border border-red-300"
        : type === "success"
        ? "bg-green-100 text-green-700 border border-green-300"
        : "bg-blue-100 text-blue-700 border border-blue-300"
    }`;
    messageDiv.textContent = message;

    const form = document.getElementById("loginForm");
    if (form) {
      form.parentNode.insertBefore(messageDiv, form);

      if (type !== "success") {
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.remove();
          }
        }, 5000);
      }
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  checkAuthentication() {
    return this.isAuthenticated;
  }
}

const authSystem = new AuthSystem();
