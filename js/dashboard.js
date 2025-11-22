// dashboard.js - VERSÃO CORRIGIDA COMPLETA
class PatientDashboard {
  constructor() {
    this.currentUser = null;
    this.todayAppointments = [];
    this.init();
  }

  init() {
    this.checkAuthentication();
    this.loadUserData();
    this.initializeEventListeners();
    this.loadAppointments();
    this.checkTodayAppointments();
  }

  checkAuthentication() {
    const savedUser = localStorage.getItem("ubs_current_user");
    if (!savedUser) {
      window.location.href = "index.html";
      return;
    }
    this.currentUser = JSON.parse(savedUser);
    console.log("👤 Usuário logado:", this.currentUser);
  }

  loadUserData() {
    const userNameElement = document.querySelector("h1");
    const welcomeMessageElement = document.querySelector("p.text-sm");

    if (userNameElement && this.currentUser) {
      const firstName =
        this.currentUser.firstName || this.currentUser.name.split(" ")[0];
      userNameElement.textContent = `Olá, ${firstName}!`;

      if (welcomeMessageElement) {
        welcomeMessageElement.textContent = "Seja bem-vindo(a)!";
      }
    }

    this.updateUserAvatar();
    this.setupLogoutButton();
    this.setupNotifications();
  }

  generateAvatar(name) {
    const names = name.split(" ");
    let initials = "";

    if (names.length === 1) {
      initials = names[0].charAt(0).toUpperCase();
    } else {
      initials = (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    }

    const colors = [
      { background: "#2A75A5", text: "#FFFFFF" },
      { background: "#00A859", text: "#FFFFFF" },
      { background: "#FF6B35", text: "#FFFFFF" },
      { background: "#6A4C93", text: "#FFFFFF" },
      { background: "#1982C4", text: "#FFFFFF" },
      { background: "#8AC926", text: "#FFFFFF" },
      { background: "#FF595E", text: "#FFFFFF" },
      { background: "#6A0572", text: "#FFFFFF" },
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;

    return {
      initials: initials,
      color: colors[colorIndex],
    };
  }

  updateUserAvatar() {
    const avatarContainer = document.querySelector(
      ".flex.items-center.gap-3 .flex.size-10"
    );

    if (avatarContainer && this.currentUser) {
      avatarContainer.innerHTML = "";

      const avatar = this.generateAvatar(this.currentUser.name);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("class", "aspect-square rounded-full size-10");
      svg.setAttribute(
        "style",
        `background-color: ${avatar.color.background};`
      );

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", "50");
      text.setAttribute("y", "60");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", avatar.color.text);
      text.setAttribute("font-size", "40");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("font-family", "Arial, sans-serif");
      text.textContent = avatar.initials;

      svg.appendChild(text);
      avatarContainer.appendChild(svg);
    }
  }

  setupLogoutButton() {
    const header = document.querySelector("header");
    const existingLogoutBtn = header.querySelector(".logout-btn");

    if (existingLogoutBtn) {
      existingLogoutBtn.remove();
    }

    const logoutBtn = document.createElement("button");
    logoutBtn.className =
      "logout-btn flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors";
    logoutBtn.innerHTML = `
            <span class="material-symbols-outlined text-gray-600 dark:text-gray-300">logout</span>
        `;
    logoutBtn.title = "Sair";
    logoutBtn.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja sair?")) {
        localStorage.removeItem("ubs_current_user");
        window.location.href = "index.html";
      }
    });

    const headerActions = header.querySelector(".flex.w-12");
    if (headerActions) {
      headerActions.appendChild(logoutBtn);
    }
  }

  setupNotifications() {
    const notificationBtn = document.querySelector(
      "button .material-symbols-outlined"
    );
    if (notificationBtn && notificationBtn.parentElement) {
      this.updateNotificationBadge();
      notificationBtn.parentElement.addEventListener("click", () => {
        this.showNotificationsModal();
      });
    }
  }

  getUserAppointments() {
    try {
      let appointments =
        JSON.parse(localStorage.getItem("consultasAgendadas")) || [];

      if (appointments.length === 0) {
        appointments =
          JSON.parse(localStorage.getItem("ubs_appointments")) || [];
      }

      console.log("📋 Todas as consultas no sistema:", appointments);

      const userAppointments = appointments.filter((appt) => {
        const isUserAppointment =
          appt.paciente && appt.paciente.cpf === this.currentUser.cpf;
        console.log(
          "Consulta:",
          appt,
          "Pertence ao usuário?",
          isUserAppointment
        );
        return isUserAppointment;
      });

      console.log(
        "👤 Consultas do usuário:",
        userAppointments.length,
        userAppointments
      );
      return userAppointments;
    } catch (error) {
      console.error("❌ Erro ao carregar consultas:", error);
      return [];
    }
  }

  checkTodayAppointments() {
    const appointments = this.getUserAppointments();
    const today = new Date().toISOString().split("T")[0];

    this.todayAppointments = appointments.filter((appt) => {
      const appointmentDate = appt.data;
      const isToday = appointmentDate === today;
      const isValidStatus =
        appt.status === "agendada" || appt.status === "confirmada";

      return isToday && isValidStatus;
    });

    console.log("📅 Consultas de hoje:", this.todayAppointments);
    this.updateNotificationBadge();
    this.showTodayAppointmentsAlert();
  }

  updateNotificationBadge() {
    const notificationBtn = document.querySelector(
      "button .material-symbols-outlined"
    );
    if (!notificationBtn) return;

    const existingBadge = notificationBtn.parentElement.querySelector(
      ".notification-badge"
    );
    if (existingBadge) {
      existingBadge.remove();
    }

    if (this.todayAppointments.length > 0) {
      const badge = document.createElement("div");
      badge.className =
        "notification-badge absolute top-1 right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800";
      notificationBtn.parentElement.style.position = "relative";
      notificationBtn.parentElement.appendChild(badge);
    }
  }

  showTodayAppointmentsAlert() {
    const lastAlertDate = localStorage.getItem("ubs_last_alert_date");
    const today = new Date().toISOString().split("T")[0];

    if (this.todayAppointments.length > 0 && lastAlertDate !== today) {
      setTimeout(() => {
        const appointmentText =
          this.todayAppointments.length === 1
            ? "você tem 1 consulta agendada para hoje!"
            : `você tem ${this.todayAppointments.length} consultas agendadas para hoje!`;

        if (
          confirm(
            `📅 Olá ${
              this.currentUser.firstName || this.currentUser.name.split(" ")[0]
            }! ${appointmentText} Clique em OK para ver os detalhes.`
          )
        ) {
          this.showNotificationsModal();
        }

        localStorage.setItem("ubs_last_alert_date", today);
      }, 1000);
    }
  }

  showNotificationsModal() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            📅 Notificações
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div class="p-4 overflow-y-auto">
                    ${
                      this.todayAppointments.length > 0
                        ? `
                        <div class="mb-4">
                            <h4 class="font-semibold text-green-600 mb-2">Consultas de Hoje</h4>
                            ${this.todayAppointments
                              .map((appt) => {
                                // CORREÇÃO: Tratar unidade como objeto
                                let unidadeNome = appt.unidade;
                                if (
                                  typeof appt.unidade === "object" &&
                                  appt.unidade !== null
                                ) {
                                  unidadeNome =
                                    appt.unidade.nome ||
                                    "Unidade não especificada";
                                }

                                return `
                                <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-2">
                                    <p class="font-medium text-green-800 dark:text-green-300">${appt.especialidade}</p>
                                    <p class="text-sm text-green-600 dark:text-green-400">${appt.horario} - ${unidadeNome}</p>
                                    <p class="text-xs text-green-500 dark:text-green-500 mt-1">Com ${appt.profissional.nome}</p>
                                </div>
                            `;
                              })
                              .join("")}
                        </div>
                    `
                        : `
                        <div class="text-center py-8 text-gray-500">
                            <span class="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                            <p>Nenhuma notificação no momento</p>
                        </div>
                    `
                    }

                    ${
                      this.getUpcomingAppointments().length > 0
                        ? `
                        <div class="mt-4">
                            <h4 class="font-semibold text-blue-600 mb-2">Próximas Consultas</h4>
                            ${this.getUpcomingAppointments()
                              .map((appt) => {
                                // CORREÇÃO: Tratar unidade como objeto
                                let unidadeNome = appt.unidade;
                                if (
                                  typeof appt.unidade === "object" &&
                                  appt.unidade !== null
                                ) {
                                  unidadeNome =
                                    appt.unidade.nome ||
                                    "Unidade não especificada";
                                }

                                return `
                                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                                    <p class="font-medium text-blue-800 dark:text-blue-300">${
                                      appt.especialidade
                                    }</p>
                                    <p class="text-sm text-blue-600 dark:text-blue-400">${this.formatDate(
                                      appt.data
                                    )} às ${appt.horario}</p>
                                    <p class="text-xs text-blue-500 dark:text-blue-500 mt-1">${unidadeNome}</p>
                                </div>
                            `;
                              })
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors close-modal">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.remove();
      });
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  getUpcomingAppointments() {
    const appointments = this.getUserAppointments();
    const today = new Date();

    return appointments
      .filter((appt) => {
        const appointmentDate = new Date(appt.data + "T" + appt.horario);
        const isFuture = appointmentDate > today;
        const isValidStatus =
          appt.status === "agendada" || appt.status === "confirmada";
        const isNotToday = appt.data !== today.toISOString().split("T")[0];

        return isFuture && isValidStatus && isNotToday;
      })
      .slice(0, 3);
  }

  initializeEventListeners() {
    const fab = document.getElementById("fab");
    if (fab) {
      fab.addEventListener("click", () => {
        window.location.href = "agendar-consulta.html";
      });
    }
  }

  loadAppointments() {
    console.log("🔄 CARREGANDO AGENDAMENTOS...");
    this.loadMyAppointments();
    this.loadAppointmentHistory();
  }

  loadMyAppointments() {
    console.log("🎯 CARREGANDO MEUS AGENDAMENTOS...");
    const appointments = this.getUserAppointments();

    const futureAppointments = appointments.filter((appt) => {
      const appointmentDate = new Date(appt.data + "T" + appt.horario);
      const now = new Date();
      const isFuture = appointmentDate > now;
      const isValidStatus =
        appt.status === "agendada" || appt.status === "confirmada";

      return isFuture && isValidStatus;
    });

    futureAppointments.sort((a, b) => {
      const dateA = new Date(a.data + "T" + a.horario);
      const dateB = new Date(b.data + "T" + b.horario);
      return dateA - dateB;
    });

    console.log("✅ MEUS AGENDAMENTOS:", futureAppointments);
    this.renderAppointmentList(
      "my-appointments-list",
      futureAppointments,
      "agendadas"
    );
  }

  loadAppointmentHistory() {
    console.log("📚 CARREGANDO HISTÓRICO...");
    const appointments = this.getUserAppointments();

    const historico = appointments.filter((appt) => {
      const appointmentDate = new Date(appt.data + "T" + appt.horario);
      const now = new Date();
      const isPast = appointmentDate <= now;
      const isNotActive =
        appt.status !== "agendada" && appt.status !== "confirmada";

      return isPast || isNotActive;
    });

    historico.sort((a, b) => {
      const dateA = new Date(a.data + "T" + a.horario);
      const dateB = new Date(b.data + "T" + b.horario);
      return dateB - dateA;
    });

    console.log("✅ HISTÓRICO:", historico);
    this.renderAppointmentList(
      "appointment-history-list",
      historico,
      "historico"
    );
  }

  renderAppointmentList(containerId, appointments, tipo) {
    console.log(
      `🎨 RENDERIZANDO ${tipo} no container: ${containerId}`,
      appointments
    );

    const container = document.getElementById(containerId);
    if (!container) {
      console.error("❌ Container não encontrado:", containerId);
      return;
    }

    if (appointments.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">${
                      tipo === "agendadas" ? "calendar_today" : "history"
                    }</span>
                    <p class="mb-2 font-medium">${
                      tipo === "agendadas"
                        ? "Nenhuma consulta agendada"
                        : "Nenhuma consulta no histórico"
                    }</p>
                    ${
                      tipo === "agendadas"
                        ? `
                        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg mx-auto hover:bg-blue-700" onclick="window.location.href='agendar-consulta.html'">
                            Agendar Consulta
                        </button>
                    `
                        : ""
                    }
                </div>
            `;
      return;
    }

    container.innerHTML = appointments
      .map((appt) => {
        const statusConfig = {
          agendada: {
            text: "Agendada",
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
          },
          confirmada: {
            text: "Confirmada",
            color: "text-green-600",
            bgColor: "bg-green-100",
          },
          concluída: {
            text: "Concluída",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
          },
          cancelada: {
            text: "Cancelada",
            color: "text-red-600",
            bgColor: "bg-red-100",
          },
        };

        const status = statusConfig[appt.status] || statusConfig.agendada;

        // CORREÇÃO: Verificar se unidade é objeto ou string
        let unidadeNome = appt.unidade;
        if (typeof appt.unidade === "object" && appt.unidade !== null) {
          unidadeNome = appt.unidade.nome || "Unidade não especificada";
        }

        // CORREÇÃO: Formatar nome do profissional (remover "Dr."/ "Dra." duplicados)
        let profissionalNome = appt.profissional.nome;
        if (
          profissionalNome.startsWith("Dr. ") ||
          profissionalNome.startsWith("Dra. ")
        ) {
          profissionalNome = profissionalNome.replace(/^(Dr\. |Dra\. )/, "");
        }

        const botoes =
          tipo === "agendadas"
            ? `
                <div class="flex gap-2">
                    <button class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors cancel-btn" data-appointment-id="${appt.id}">
                        Cancelar
                    </button>
                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors reschedule-btn" data-appointment-id="${appt.id}">
                        Reagendar
                    </button>
                </div>
            `
            : "";

        return `
                <div class="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-2 hover:shadow-md transition-shadow">
                    <div class="text-blue-600 bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                        <span class="material-symbols-outlined">medical_services</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-bold text-gray-900 dark:text-white">${
                          appt.especialidade
                        }</p>
                        <p class="text-gray-600 dark:text-gray-300">${this.formatDate(
                          appt.data
                        )} às ${appt.horario}</p>
                        <p class="text-gray-600 dark:text-gray-300">${unidadeNome}</p>
                        <p class="text-gray-600 dark:text-gray-300">Dr(a). ${profissionalNome}</p>
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          status.color
                        } ${status.bgColor}">
                            ${status.text}
                        </span>
                    </div>
                    ${botoes}
                </div>
            `;
      })
      .join("");

    if (tipo === "agendadas") {
      container.querySelectorAll(".cancel-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const appointmentId = e.target.getAttribute("data-appointment-id");
          this.cancelAppointment(appointmentId);
        });
      });

      container.querySelectorAll(".reschedule-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const appointmentId = e.target.getAttribute("data-appointment-id");
          const appointment = appointments.find(
            (appt) => appt.id == appointmentId
          );
          if (appointment) {
            this.rescheduleAppointment(appointment);
          }
        });
      });
    }

    console.log("✅ RENDERIZADO COM SUCESSO!");
  }

  cancelAppointment(appointmentId) {
    if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
      try {
        let appointments =
          JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
        const appointmentIndex = appointments.findIndex(
          (appt) => appt.id == appointmentId
        );

        if (appointmentIndex !== -1) {
          appointments[appointmentIndex].status = "cancelada";
          localStorage.setItem(
            "consultasAgendadas",
            JSON.stringify(appointments)
          );

          alert("Consulta cancelada com sucesso!");
          this.loadAppointments();
        } else {
          alert("Erro: Consulta não encontrada.");
        }
      } catch (error) {
        console.error("Erro ao cancelar consulta:", error);
        alert("Erro ao cancelar consulta.");
      }
    }
  }

  rescheduleAppointment(appointment) {
    const rescheduleData = {
      especialidade: appointment.especialidade,
      profissionalId: appointment.profissional.id,
      profissionalNome: appointment.profissional.nome,
      ubs: appointment.unidade,
      originalAppointmentId: appointment.id,
      dataOriginal: appointment.data,
      horarioOriginal: appointment.horario,
    };

    // Salvar dados para reagendamento
    localStorage.setItem("ubs_reschedule_data", JSON.stringify(rescheduleData));

    // Ir direto para a tela de agendamento
    console.log("🔄 Indo para reagendamento...");
    window.location.href = "agendar-consulta.html?reschedule=true";
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

// CORREÇÃO: Inicialização única e global
let patientDashboard;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DASHBOARD INICIANDO...");
  patientDashboard = new PatientDashboard();
  window.patientDashboard = patientDashboard; // Tornar global
});
