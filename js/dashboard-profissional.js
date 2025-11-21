// dashboard-profissional.js - VERSÃO COMPLETA COM TODAS FUNCIONALIDADES
class ProfessionalDashboard {
  constructor() {
    this.currentUser = null;
    this.todayAppointments = [];
    this.recentPatients = [];
    this.pendingTasks = [];
    this.init();
  }

  init() {
    this.checkAuthentication();
    this.loadUserData();
    this.initializeEventListeners();
    this.loadTodayAppointments();
    this.loadStatistics();
    this.loadRecentPatients();
    this.loadPendingTasks();
  }

  checkAuthentication() {
    const savedUser = localStorage.getItem("ubs_current_user");
    if (!savedUser) {
      window.location.href = "index.html";
      return;
    }

    this.currentUser = JSON.parse(savedUser);

    // Verificar se é profissional
    if (this.currentUser.type !== "profissional") {
      window.location.href = "dashboard.html";
      return;
    }
  }

  loadUserData() {
    // Atualizar header
    const userNameElement = document.querySelector("h1");
    const userSpecialtyElement = document.querySelector(
      "p.text-text-secondary-light"
    );

    if (userNameElement) {
      userNameElement.textContent = this.currentUser.name;
    }

    if (userSpecialtyElement) {
      userSpecialtyElement.textContent =
        this.currentUser.specialty || "Profissional de Saúde";
    }
  }

  initializeEventListeners() {
    // Botão FAB para nova consulta
    const fabButton = document.getElementById("fab");
    if (fabButton) {
      fabButton.addEventListener("click", () => {
        this.showQuickActionsModal();
      });
    }

    // Ações rápidas
    this.setupQuickActions();

    // Navegação inferior
    this.setupBottomNavigation();
  }

  setupQuickActions() {
    const actionButtons = document.querySelectorAll(".grid.grid-cols-3 button");
    actionButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const actions = [
          "newPatient",
          "viewMedicalRecord",
          "issuePrescription",
        ];
        if (actions[index]) {
          this[actions[index]]();
        }
      });
    });
  }

  setupBottomNavigation() {
    const navLinks = document.querySelectorAll(".bottom-nav a");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        // Se for a página atual, não faz nada
        if (href === "dashboard-profissional.html") {
          return;
        }

        // Para outras páginas, verifica se existe
        e.preventDefault();

        if (href && href !== "#") {
          // Tenta carregar a página
          fetch(href, { method: "HEAD" })
            .then((response) => {
              if (response.ok) {
                window.location.href = href;
              } else {
                // Se a página não existe, mostra mensagem
                this.showSimpleMessage(
                  "Página em desenvolvimento: " + href.replace(".html", "")
                );
              }
            })
            .catch(() => {
              // Se houve erro, mostra mensagem
              this.showSimpleMessage(
                "Página em desenvolvimento: " + href.replace(".html", "")
              );
            });
        }
      });
    });
  }

  // Método auxiliar para mostrar mensagem
  showSimpleMessage(message) {
    alert(message);
  }

  loadTodayAppointments() {
    // Carregar consultas do dia do localStorage
    const allAppointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
    const today = new Date().toISOString().split("T")[0];

    this.todayAppointments = allAppointments.filter((appt) => {
      return (
        appt.data === today &&
        (appt.status === "agendada" || appt.status === "confirmada")
      );
    });

    this.renderTodayAppointments();
  }

  renderTodayAppointments() {
    const container = document.getElementById("today-agenda-list");
    if (!container) return;

    if (this.todayAppointments.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">event_available</span>
                    <p class="text-lg font-medium mb-2">Nenhuma consulta para hoje</p>
                    <p class="text-sm">Aproveite para organizar sua agenda</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.todayAppointments
      .map((appt) => {
        const statusClass =
          appt.status === "confirmada" ? "status-confirmed" : "status-pending";
        const statusText =
          appt.status === "confirmada" ? "Confirmada" : "Pendente";

        return `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-card-light dark:bg-card-dark mx-2 mb-2 hover:shadow-md transition-shadow cursor-pointer" onclick="professionalDashboard.viewAppointmentDetails('${appt.id}')">
                    <div class="flex flex-col items-center justify-center min-w-16">
                        <span class="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">${appt.horario}</span>
                        <span class="text-text-secondary-light dark:text-text-secondary-dark text-xs">30 min</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-text-primary-light dark:text-text-primary-dark font-medium">${appt.paciente.nome}</h3>
                        <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">${appt.especialidade}</p>
                        <p class="text-text-secondary-light dark:text-text-secondary-dark text-xs">${appt.unidade}</p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${statusText}</span>
                </div>
            `;
      })
      .join("");
  }

  loadStatistics() {
    const allAppointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
    const today = new Date().toISOString().split("T")[0];

    // Consultas de hoje
    const todayAppointments = allAppointments.filter(
      (appt) => appt.data === today
    );

    // Consultas pendentes (hoje com status agendada)
    const pendingAppointments = todayAppointments.filter(
      (appt) => appt.status === "agendada"
    );

    // Atualizar estatísticas
    const todayCountElement = document.querySelector(
      ".stats-card:first-child span.text-2xl"
    );
    const pendingCountElement = document.querySelector(
      ".stats-card:last-child span.text-2xl"
    );

    if (todayCountElement) {
      todayCountElement.textContent = todayAppointments.length;
    }

    if (pendingCountElement) {
      pendingCountElement.textContent = pendingAppointments.length;
    }
  }

  loadRecentPatients() {
    // Buscar pacientes das consultas recentes
    const allAppointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];

    // Pegar últimos 3 pacientes únicos
    const uniquePatients = [];
    const patientMap = new Map();

    allAppointments
      .sort(
        (a, b) =>
          new Date(b.data + "T" + b.horario) -
          new Date(a.data + "T" + a.horario)
      )
      .forEach((appt) => {
        if (!patientMap.has(appt.paciente.cpf) && uniquePatients.length < 3) {
          patientMap.set(appt.paciente.cpf, true);
          uniquePatients.push({
            nome: appt.paciente.nome,
            ultimaConsulta: appt.data,
            cpf: appt.paciente.cpf,
          });
        }
      });

    // Se não houver pacientes reais, usar dados simulados
    this.recentPatients =
      uniquePatients.length > 0
        ? uniquePatients
        : [
            {
              nome: "Carlos Mendes",
              ultimaConsulta: "15/03/2024",
              cpf: "123.456.789-00",
            },
            {
              nome: "Fernanda Lima",
              ultimaConsulta: "14/03/2024",
              cpf: "987.654.321-00",
            },
            {
              nome: "Roberto Santos",
              ultimaConsulta: "13/03/2024",
              cpf: "456.123.789-00",
            },
          ];

    this.renderRecentPatients();
  }

  renderRecentPatients() {
    const container = document.getElementById("recent-patients-list");
    if (!container) return;

    if (this.recentPatients.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">group</span>
                    <p class="text-sm">Nenhum paciente recente</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.recentPatients
      .map(
        (patient) => `
            <div class="flex items-center gap-3 p-3 rounded-xl bg-card-light dark:bg-card-dark mx-2 mb-2">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <span class="material-symbols-outlined text-primary text-lg">person</span>
                </div>
                <div class="flex-1">
                    <h3 class="text-text-primary-light dark:text-text-primary-dark font-medium">${
                      patient.nome
                    }</h3>
                    <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">Última: ${this.formatDate(
                      patient.ultimaConsulta
                    )}</p>
                </div>
                <button class="text-primary hover:text-primary/80 transition-colors" onclick="professionalDashboard.viewPatient('${
                  patient.nome
                }', '${patient.cpf}')">
                    <span class="material-symbols-outlined text-lg">visibility</span>
                </button>
            </div>
        `
      )
      .join("");
  }

  loadPendingTasks() {
    // Simulação de tarefas pendentes (em um sistema real viria do backend)
    this.pendingTasks = [
      {
        tipo: "Prontuário",
        paciente: "Ana Costa",
        dias: "2",
        descricao: "Preencher evolução da consulta",
        prioridade: "alta",
      },
      {
        tipo: "Laudo de Exame",
        paciente: "José Oliveira",
        dias: "1",
        descricao: "Laudo de hemograma completo",
        prioridade: "media",
      },
      {
        tipo: "Receita Controlada",
        paciente: "Carlos Mendes",
        dias: "3",
        descricao: "Renovação de medicamento",
        prioridade: "baixa",
      },
    ];

    this.renderPendingTasks();
  }

  renderPendingTasks() {
    const container = document.getElementById("pending-tasks-list");
    if (!container) return;

    if (this.pendingTasks.length === 0) {
      container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">assignment_turned_in</span>
                    <p class="text-sm">Nenhuma tarefa pendente</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.pendingTasks
      .map((task) => {
        const priorityColor = {
          alta: "red",
          media: "orange",
          baixa: "blue",
        }[task.prioridade];

        return `
                <div class="flex items-center gap-3 p-3 rounded-xl bg-card-light dark:bg-card-dark mx-2 mb-2 hover:shadow-md transition-shadow cursor-pointer" onclick="professionalDashboard.viewTaskDetails('${
                  task.tipo
                }', '${task.paciente}')">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30">
                        <span class="material-symbols-outlined text-${priorityColor}-600 dark:text-${priorityColor}-400 text-lg">description</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-text-primary-light dark:text-text-primary-dark font-medium">${
                          task.tipo
                        }</h3>
                        <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm">${
                          task.paciente
                        } - ${task.descricao}</p>
                    </div>
                    <span class="text-text-secondary-light dark:text-text-secondary-dark text-sm">${
                      task.dias
                    } ${task.dias === "1" ? "dia" : "dias"}</span>
                </div>
            `;
      })
      .join("");
  }

  // FUNÇÕES DE INTERAÇÃO
  showQuickActionsModal() {
    const actions = [
      { icon: "person_add", label: "Novo Paciente", action: "newPatient" },
      {
        icon: "clinical_notes",
        label: "Prontuário",
        action: "viewMedicalRecord",
      },
      { icon: "description", label: "Receitas", action: "issuePrescription" },
      { icon: "vaccines", label: "Prescrições", action: "prescribeMedication" },
      { icon: "assignment", label: "Solicitar Exames", action: "requestExams" },
      { icon: "schedule", label: "Minha Agenda", action: "viewSchedule" },
    ];

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            ⚡ Ações Rápidas
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div class="p-6 grid grid-cols-2 gap-4">
                    ${actions
                      .map(
                        (action) => `
                        <button class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onclick="professionalDashboard.${action.action}()">
                            <span class="material-symbols-outlined text-2xl text-primary">${action.icon}</span>
                            <span class="text-text-primary-light dark:text-text-primary-dark text-sm font-medium text-center">${action.label}</span>
                        </button>
                    `
                      )
                      .join("")}
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Fechar modal
    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => modal.remove());
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  showNotifications() {
    const notifications = [
      { type: "info", message: "Nova solicitação de consulta", time: "5 min" },
      {
        type: "warning",
        message: "Resultado de exame disponível",
        time: "1 hora",
      },
      {
        type: "success",
        message: "Consulta confirmada para amanhã",
        time: "2 horas",
      },
    ];

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            🔔 Notificações
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div class="overflow-y-auto max-h-96">
                    ${notifications
                      .map(
                        (notif) => `
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-start gap-3">
                                <span class="material-symbols-outlined text-${
                                  notif.type === "warning"
                                    ? "orange"
                                    : notif.type === "success"
                                    ? "green"
                                    : "blue"
                                }-500">
                                    ${
                                      notif.type === "warning"
                                        ? "warning"
                                        : notif.type === "success"
                                        ? "check_circle"
                                        : "info"
                                    }
                                </span>
                                <div class="flex-1">
                                    <p class="text-text-primary-light dark:text-text-primary-dark">${
                                      notif.message
                                    }</p>
                                    <p class="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">${
                                      notif.time
                                    } atrás</p>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors close-modal">
                        Marcar todas como lidas
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Fechar modal
    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => modal.remove());
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  viewPatient(patientName, patientCPF) {
    // Redirecionar para página de prontuário
    window.location.href = `prontuario.html?paciente=${encodeURIComponent(
      patientName
    )}&cpf=${patientCPF}`;
  }

  viewAppointmentDetails(appointmentId) {
    const appointment = this.todayAppointments.find(
      (appt) => appt.id == appointmentId
    );
    if (appointment) {
      this.showAppointmentDetailsModal(appointment);
    }
  }

  viewTaskDetails(taskType, patientName) {
    this.showTaskDetailsModal(taskType, patientName);
  }

  // AÇÕES RÁPIDAS FUNCIONAIS
  newPatient() {
    this.showNewPatientModal();
  }

  viewMedicalRecord(patientName = "") {
    if (patientName) {
      window.location.href = `prontuario.html?paciente=${encodeURIComponent(
        patientName
      )}`;
    } else {
      this.showPatientSelectionModal();
    }
  }

  issuePrescription() {
    this.showPrescriptionModal();
  }

  prescribeMedication() {
    this.showPrescriptionModal();
  }

  requestExams() {
    this.showExamRequestModal();
  }

  viewSchedule() {
    this.showScheduleModal();
  }

  // FUNÇÃO DE LOGOUT - NOVA
  logout() {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("ubs_current_user");
      this.showToast("Saindo do sistema...", "info");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  }

  // MODAL DE NOVO PACIENTE
  showNewPatientModal() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            👤 Cadastrar Novo Paciente
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form id="newPatientForm" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Completo
                        </label>
                        <input type="text" id="patientName"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Digite o nome do paciente" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CPF
                        </label>
                        <input type="text" id="patientCPF"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="000.000.000-00" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Data de Nascimento
                        </label>
                        <input type="date" id="patientBirthDate"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Telefone
                        </label>
                        <input type="tel" id="patientPhone"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="(11) 99999-9999" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observações
                        </label>
                        <textarea id="patientNotes" rows="3"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Observações iniciais..."></textarea>
                    </div>
                </form>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Cancelar
                    </button>
                    <button type="submit" form="newPatientForm" class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Cadastrar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Configurar máscaras
    this.setupCPFMask(modal.querySelector("#patientCPF"));
    this.setupPhoneMask(modal.querySelector("#patientPhone"));

    // Submit do formulário
    modal.querySelector("#newPatientForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveNewPatient(modal);
    });

    // Fechar modal
    this.setupModalClose(modal);
  }

  saveNewPatient(modal) {
    const formData = {
      nome: modal.querySelector("#patientName").value,
      cpf: modal.querySelector("#patientCPF").value,
      dataNascimento: modal.querySelector("#patientBirthDate").value,
      telefone: modal.querySelector("#patientPhone").value,
      observacoes: modal.querySelector("#patientNotes").value,
      dataCadastro: new Date().toISOString(),
      profissionalResponsavel: this.currentUser.name,
    };

    // Salvar no localStorage
    let patients = JSON.parse(localStorage.getItem("ubs_patients")) || [];
    patients.push({
      id: Date.now(),
      ...formData,
    });
    localStorage.setItem("ubs_patients", JSON.stringify(patients));

    // Feedback
    this.showToast("Paciente cadastrado com sucesso!", "success");
    modal.remove();

    // Atualizar lista de pacientes recentes
    this.loadRecentPatients();
  }

  // MODAL DE SELEÇÃO DE PACIENTE PARA PRONTUÁRIO
  showPatientSelectionModal() {
    const patients = JSON.parse(localStorage.getItem("ubs_patients")) || [];
    const appointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];

    // Combinar pacientes cadastrados com pacientes de consultas
    const allPatients = [...patients];
    appointments.forEach((appt) => {
      if (!allPatients.find((p) => p.cpf === appt.paciente.cpf)) {
        allPatients.push({
          nome: appt.paciente.nome,
          cpf: appt.paciente.cpf,
          fromAppointment: true,
        });
      }
    });

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            📋 Selecionar Paciente
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div class="p-4 overflow-y-auto max-h-96">
                    ${
                      allPatients.length > 0
                        ? `
                        <div class="space-y-2">
                            ${allPatients
                              .map(
                                (patient) => `
                                <div class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer patient-item"
                                    data-name="${patient.nome}" data-cpf="${
                                  patient.cpf
                                }">
                                    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">person</span>
                                    </div>
                                    <div class="flex-1">
                                        <h4 class="font-medium text-gray-900 dark:text-white">${
                                          patient.nome
                                        }</h4>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">CPF: ${
                                          patient.cpf
                                        }</p>
                                        ${
                                          patient.fromAppointment
                                            ? '<span class="text-xs text-green-600">● Paciente de consulta</span>'
                                            : ""
                                        }
                                    </div>
                                    <span class="material-symbols-outlined text-gray-400">chevron_right</span>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    `
                        : `
                        <div class="text-center py-8 text-gray-500">
                            <span class="material-symbols-outlined text-4xl mb-2">group_off</span>
                            <p class="mb-4">Nenhum paciente encontrado</p>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 new-patient-btn">
                                Cadastrar Primeiro Paciente
                            </button>
                        </div>
                    `
                    }
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Selecionar paciente
    modal.querySelectorAll(".patient-item").forEach((item) => {
      item.addEventListener("click", () => {
        const name = item.getAttribute("data-name");
        const cpf = item.getAttribute("data-cpf");
        modal.remove();
        window.location.href = `prontuario.html?paciente=${encodeURIComponent(
          name
        )}&cpf=${cpf}`;
      });
    });

    // Botão novo paciente
    const newPatientBtn = modal.querySelector(".new-patient-btn");
    if (newPatientBtn) {
      newPatientBtn.addEventListener("click", () => {
        modal.remove();
        this.newPatient();
      });
    }

    this.setupModalClose(modal);
  }

  // MODAL DE PRESCRIÇÃO DE MEDICAMENTOS (ATUALIZADO)
  showPrescriptionModal() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            💊 Prescrição de Medicamentos
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form id="prescriptionForm" class="p-6 space-y-4 overflow-y-auto max-h-96">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Paciente *
                            </label>
                            <select id="prescriptionPatient" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                <option value="">Selecione o paciente</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data de Validade *
                            </label>
                            <input type="date" id="prescriptionExpiry"
                                min="${new Date().toISOString().split("T")[0]}"
                                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Receita
                            </label>
                            <select id="prescriptionType" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="comum">Receita Comum</option>
                                <option value="controlada">Receita Controlada</option>
                                <option value="antibiotico">Antibiótico</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Via de Administração
                            </label>
                            <select id="administrationRoute" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="oral">Oral</option>
                                <option value="topica">Tópica</option>
                                <option value="inalatoria">Inalatória</option>
                                <option value="parental">Parental</option>
                                <option value="retal">Retal</option>
                            </select>
                        </div>
                    </div>

                    <div id="medicationList">
                        <div class="flex items-center justify-between mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Medicamentos Prescritos
                            </label>
                            <button type="button" class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm add-medication">
                                <span class="material-symbols-outlined text-lg">add</span>
                                Adicionar Medicamento
                            </button>
                        </div>

                        <div class="medication-item space-y-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-3">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <input type="text" placeholder="Nome do medicamento *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-name" required>
                                </div>
                                <div>
                                    <input type="text" placeholder="Dosagem (ex: 500mg) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-dosage" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-3 gap-3">
                                <div>
                                    <input type="text" placeholder="Posologia (ex: 1x ao dia) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-posology" required>
                                </div>
                                <div>
                                    <input type="text" placeholder="Duração (ex: 7 dias) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-duration" required>
                                </div>
                                <div>
                                    <input type="number" placeholder="Quantidade *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-quantity" min="1" required>
                                </div>
                            </div>
                            <div>
                                <textarea placeholder="Observações do medicamento (opcional)" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-notes" rows="2"></textarea>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observações Gerais
                        </label>
                        <textarea id="prescriptionNotes" rows="3"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Instruções adicionais, contraindicações, etc..."></textarea>
                    </div>

                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <span class="material-symbols-outlined text-yellow-600 mt-0.5">warning</span>
                            <div>
                                <p class="text-sm text-yellow-800 dark:text-yellow-300 font-medium">Atenção</p>
                                <p class="text-xs text-yellow-700 dark:text-yellow-400">Verifique a dosagem e contraindicações antes de prescrever.</p>
                            </div>
                        </div>
                    </div>
                </form>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Cancelar
                    </button>
                    <button type="submit" form="prescriptionForm" class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Emitir Prescrição
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.loadPatientsIntoSelect(modal.querySelector("#prescriptionPatient"));
    this.setupMedicationManagement(modal);
    this.setupPrescriptionForm(modal);
    this.setupModalClose(modal);
  }

  setupMedicationManagement(modal) {
    const addButton = modal.querySelector(".add-medication");
    const medicationList = modal.querySelector("#medicationList");

    addButton.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className =
        "medication-item space-y-3 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-3";
      newItem.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Novo Medicamento</span>
                    <button type="button" class="text-red-600 hover:text-red-800 remove-medication">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <input type="text" placeholder="Nome do medicamento *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-name" required>
                    </div>
                    <div>
                        <input type="text" placeholder="Dosagem (ex: 500mg) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-dosage" required>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <input type="text" placeholder="Posologia (ex: 1x ao dia) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-posology" required>
                    </div>
                    <div>
                        <input type="text" placeholder="Duração (ex: 7 dias) *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-duration" required>
                    </div>
                    <div>
                        <input type="number" placeholder="Quantidade *" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-quantity" min="1" required>
                    </div>
                </div>
                <div>
                    <textarea placeholder="Observações do medicamento (opcional)" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white medication-notes" rows="2"></textarea>
                </div>
            `;

      medicationList.appendChild(newItem);

      // Remover medicamento
      newItem
        .querySelector(".remove-medication")
        .addEventListener("click", () => {
          newItem.remove();
        });
    });
  }

  setupPrescriptionForm(modal) {
    modal.querySelector("#prescriptionForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.savePrescription(modal);
    });
  }

  savePrescription(modal) {
    const pacienteSelect = modal.querySelector("#prescriptionPatient");
    const pacienteText =
      pacienteSelect.options[pacienteSelect.selectedIndex].text;

    const formData = {
      paciente: pacienteText.split(" (")[0],
      pacienteCPF: pacienteSelect.value,
      dataValidade: modal.querySelector("#prescriptionExpiry").value,
      tipoReceita: modal.querySelector("#prescriptionType").value,
      viaAdministracao: modal.querySelector("#administrationRoute").value,
      observacoes: modal.querySelector("#prescriptionNotes").value,
      medicamentos: [],
      dataEmissao: new Date().toISOString(),
      profissional: this.currentUser.name,
      crm: this.currentUser.crm,
      tipo: "prescricao",
    };

    // Coletar medicamentos
    modal.querySelectorAll(".medication-item").forEach((item) => {
      formData.medicamentos.push({
        nome: item.querySelector(".medication-name").value,
        dosagem: item.querySelector(".medication-dosage").value,
        posologia: item.querySelector(".medication-posology").value,
        duracao: item.querySelector(".medication-duration").value,
        quantidade: item.querySelector(".medication-quantity").value,
        observacoes: item.querySelector(".medication-notes").value,
      });
    });

    // Salvar no localStorage
    let prescriptions =
      JSON.parse(localStorage.getItem("ubs_prescriptions")) || [];
    prescriptions.push({
      id: Date.now(),
      ...formData,
    });
    localStorage.setItem("ubs_prescriptions", JSON.stringify(prescriptions));

    this.showToast("Prescrição emitida com sucesso!", "success");
    modal.remove();
  }

  // MODAL DE SOLICITAÇÃO DE EXAMES (COMPLETO)
  showExamRequestModal() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            🩺 Solicitação de Exames
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <form id="examRequestForm" class="p-6 space-y-6 overflow-y-auto max-h-96">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Paciente *
                            </label>
                            <select id="examPatient" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                                <option value="">Selecione o paciente</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Prevista *
                            </label>
                            <input type="date" id="examDate"
                                min="${new Date().toISOString().split("T")[0]}"
                                class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tipo de Exame
                            </label>
                            <select id="examType" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="laboratorial">Laboratorial</option>
                                <option value="imagem">Imagem</option>
                                <option value="funcional">Funcional</option>
                                <option value="endoscopia">Endoscopia</option>
                                <option value="outros">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Urgência
                            </label>
                            <select id="examUrgency" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <option value="rotina">Rotina</option>
                                <option value="urgente">Urgente</option>
                                <option value="emergencia">Emergência</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Exames Solicitados
                        </label>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <!-- Exames Laboratoriais -->
                            <div class="exam-category">
                                <h4 class="font-medium text-gray-900 dark:text-white mb-2 text-sm">🧪 Laboratoriais</h4>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Hemograma completo">
                                        <span class="ml-2 text-sm">Hemograma completo</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Glicemia">
                                        <span class="ml-2 text-sm">Glicemia</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Colesterol total">
                                        <span class="ml-2 text-sm">Colesterol total</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Triglicerídeos">
                                        <span class="ml-2 text-sm">Triglicerídeos</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="TGO/TGP">
                                        <span class="ml-2 text-sm">TGO/TGP</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Urina tipo 1">
                                        <span class="ml-2 text-sm">Urina tipo 1</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Exames de Imagem -->
                            <div class="exam-category">
                                <h4 class="font-medium text-gray-900 dark:text-white mb-2 text-sm">📷 Imagem</h4>
                                <div class="space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Raio-X de tórax">
                                        <span class="ml-2 text-sm">Raio-X de tórax</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Ultrassom abdominal">
                                        <span class="ml-2 text-sm">Ultrassom abdominal</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="ECO cardiograma">
                                        <span class="ml-2 text-sm">ECO cardiograma</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Tomografia">
                                        <span class="ml-2 text-sm">Tomografia</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" class="exam-checkbox" value="Ressonância">
                                        <span class="ml-2 text-sm">Ressonância</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Exames Personalizados -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Exames Personalizados
                            </label>
                            <div class="flex gap-2">
                                <input type="text" id="customExam"
                                    placeholder="Digite um exame específico"
                                    class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <button type="button" id="addCustomExam" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    Adicionar
                                </button>
                            </div>
                            <div id="customExamsList" class="mt-2 space-y-1"></div>
                        </div>

                        <!-- Exames Selecionados -->
                        <div id="selectedExams" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 class="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm">📋 Exames Selecionados</h4>
                            <div id="selectedExamsList" class="text-sm text-blue-800 dark:text-blue-400">
                                <p class="text-gray-500">Nenhum exame selecionado</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Justificativa Clínica *
                        </label>
                        <textarea id="examJustification" rows="3"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Descreva a justificativa clínica para os exames solicitados..." required></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Preparo do Paciente
                        </label>
                        <textarea id="examPreparation" rows="2"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Instruções de preparo (jejum, medicamentos, etc)..."></textarea>
                    </div>

                    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div class="flex items-start gap-2">
                            <span class="material-symbols-outlined text-blue-600 mt-0.5">info</span>
                            <div>
                                <p class="text-sm text-blue-800 dark:text-blue-300 font-medium">Informação</p>
                                <p class="text-xs text-blue-700 dark:text-blue-400">O paciente receberá instruções sobre onde e quando realizar os exames.</p>
                            </div>
                        </div>
                    </div>
                </form>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Cancelar
                    </button>
                    <button type="submit" form="examRequestForm" class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Solicitar Exames
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.loadPatientsIntoSelect(modal.querySelector("#examPatient"));
    this.setupExamManagement(modal);
    this.setupExamForm(modal);
    this.setupModalClose(modal);
  }

  setupExamManagement(modal) {
    const selectedExams = new Set();
    const selectedExamsList = modal.querySelector("#selectedExamsList");
    const customExamInput = modal.querySelector("#customExam");
    const addCustomExamBtn = modal.querySelector("#addCustomExam");
    const customExamsList = modal.querySelector("#customExamsList");

    // Atualizar lista de exames selecionados
    function updateSelectedExamsList() {
      if (selectedExams.size === 0) {
        selectedExamsList.innerHTML =
          '<p class="text-gray-500">Nenhum exame selecionado</p>';
      } else {
        selectedExamsList.innerHTML = Array.from(selectedExams)
          .map(
            (exam) =>
              `<div class="flex items-center justify-between py-1">
                        <span>• ${exam}</span>
                        <button type="button" class="text-red-500 hover:text-red-700 remove-exam" data-exam="${exam}">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>`
          )
          .join("");

        // Adicionar event listeners para remover exames
        selectedExamsList.querySelectorAll(".remove-exam").forEach((btn) => {
          btn.addEventListener("click", function () {
            const examToRemove = this.getAttribute("data-exam");
            selectedExams.delete(examToRemove);

            // Desmarcar checkbox correspondente
            const checkbox = modal.querySelector(
              `.exam-checkbox[value="${examToRemove}"]`
            );
            if (checkbox) checkbox.checked = false;

            updateSelectedExamsList();
          });
        });
      }
    }

    // Adicionar exames dos checkboxes
    modal.querySelectorAll(".exam-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          selectedExams.add(this.value);
        } else {
          selectedExams.delete(this.value);
        }
        updateSelectedExamsList();
      });
    });

    // Adicionar exames personalizados
    addCustomExamBtn.addEventListener("click", function () {
      const customExam = customExamInput.value.trim();
      if (customExam && !selectedExams.has(customExam)) {
        selectedExams.add(customExam);
        customExamInput.value = "";
        updateSelectedExamsList();
      }
    });

    // Enter para adicionar exame personalizado
    customExamInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addCustomExamBtn.click();
      }
    });

    updateSelectedExamsList();
  }

  setupExamForm(modal) {
    modal.querySelector("#examRequestForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveExamRequest(modal);
    });
  }

  saveExamRequest(modal) {
    const pacienteSelect = modal.querySelector("#examPatient");
    const pacienteText =
      pacienteSelect.options[pacienteSelect.selectedIndex].text;

    // Coletar exames selecionados
    const selectedExams = new Set();
    modal.querySelectorAll(".exam-checkbox:checked").forEach((checkbox) => {
      selectedExams.add(checkbox.value);
    });

    const formData = {
      paciente: pacienteText.split(" (")[0],
      pacienteCPF: pacienteSelect.value,
      dataPrevista: modal.querySelector("#examDate").value,
      tipoExame: modal.querySelector("#examType").value,
      urgencia: modal.querySelector("#examUrgency").value,
      exames: Array.from(selectedExams),
      justificativa: modal.querySelector("#examJustification").value,
      preparo: modal.querySelector("#examPreparation").value,
      dataSolicitacao: new Date().toISOString(),
      profissional: this.currentUser.name,
      crm: this.currentUser.crm,
      tipo: "exame",
      status: "solicitado",
    };

    // Salvar no localStorage
    let examRequests =
      JSON.parse(localStorage.getItem("ubs_exam_requests")) || [];
    examRequests.push({
      id: Date.now(),
      ...formData,
    });
    localStorage.setItem("ubs_exam_requests", JSON.stringify(examRequests));

    this.showToast("Solicitação de exames realizada com sucesso!", "success");
    modal.remove();
  }

  // MODAL SIMPLIFICADO PARA AGENDA
  showScheduleModal() {
    const appointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
    const professionalAppointments = appointments.filter(
      (appt) =>
        appt.profissional.id == this.currentUser.id ||
        appt.profissional.nome === this.currentUser.name
    );

    let content = "";
    if (professionalAppointments.length > 0) {
      content = `
                <div class="space-y-3">
                    ${professionalAppointments
                      .map(
                        (appt) => `
                        <div class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium">${
                                      appt.paciente.nome
                                    }</p>
                                    <p class="text-sm text-gray-600">${
                                      appt.especialidade
                                    }</p>
                                    <p class="text-sm text-gray-600">${this.formatDate(
                                      appt.data
                                    )} às ${appt.horario}</p>
                                </div>
                                <span class="px-2 py-1 text-xs rounded-full ${
                                  appt.status === "confirmada"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }">
                                    ${appt.status}
                                </span>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
    } else {
      content =
        '<p class="text-center text-gray-500 py-4">Nenhuma consulta agendada</p>';
    }

    this.showSimpleModal("📅 Minha Agenda", content, "Fechar");
  }

  showSimpleModal(title, content, buttonText) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">${title}</h3>
                </div>
                <div class="p-6">
                    ${content}
                </div>
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors close-modal">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.setupModalClose(modal);
  }

  // FUNÇÕES AUXILIARES
  loadPatientsIntoSelect(selectElement) {
    const patients = JSON.parse(localStorage.getItem("ubs_patients")) || [];
    const appointments =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];

    patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.cpf;
      option.textContent = `${patient.nome} (${patient.cpf})`;
      selectElement.appendChild(option);
    });

    // Adicionar pacientes de consultas que não estão cadastrados
    appointments.forEach((appt) => {
      if (!patients.find((p) => p.cpf === appt.paciente.cpf)) {
        const option = document.createElement("option");
        option.value = appt.paciente.cpf;
        option.textContent = `${appt.paciente.nome} (${appt.paciente.cpf}) - Consulta`;
        selectElement.appendChild(option);
      }
    });
  }

  setupCPFMask(input) {
    input.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      }
      e.target.value = value;
    });
  }

  setupPhoneMask(input) {
    input.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length <= 11) {
        value = value
          .replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2");
      }
      e.target.value = value;
    });
  }

  setupModalClose(modal) {
    modal.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => modal.remove());
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success"
        ? "bg-green-500 text-white"
        : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showAppointmentDetailsModal(appointment) {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
    modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            📅 Detalhes da Consulta
                        </h3>
                        <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Paciente</label>
                        <p class="text-gray-900 dark:text-white font-medium">${
                          appointment.paciente.nome
                        }</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Especialidade</label>
                        <p class="text-gray-900 dark:text-white">${
                          appointment.especialidade
                        }</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Data e Horário</label>
                        <p class="text-gray-900 dark:text-white">${this.formatDate(
                          appointment.data
                        )} às ${appointment.horario}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Unidade</label>
                        <p class="text-gray-900 dark:text-white">${
                          appointment.unidade
                        }</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === "confirmada"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }">
                            ${appointment.status}
                        </span>
                    </div>
                </div>

                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors close-modal">
                        Fechar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    this.setupModalClose(modal);
  }

  showTaskDetailsModal(taskType, patientName) {
    this.showSimpleModal(
      `📋 ${taskType}`,
      `Detalhes da tarefa para o paciente: <strong>${patientName}</strong><br><br>
            Esta funcionalidade está em desenvolvimento e em breve permitirá:
            <ul class="list-disc list-inside mt-2 text-sm">
                <li>Visualizar detalhes completos da tarefa</li>
                <li>Marcar como concluída</li>
                <li>Adicionar observações</li>
                <li>Definir prazos</li>
            </ul>`,
      "Entendido"
    );
  }

  // UTILITÁRIOS
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }
}

// Inicializar dashboard quando a página carregar
window.professionalDashboard = new ProfessionalDashboard();

// Função global para modo escuro (se necessário)
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}
