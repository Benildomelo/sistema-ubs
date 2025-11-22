// agendar-consulta.js - VERSÃO COM REAGENDAMENTO CORRETO
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== INICIANDO AGENDAR CONSULTA ===");

  // Verificar se é um reagendamento
  const urlParams = new URLSearchParams(window.location.search);
  const isReschedule = urlParams.get("reschedule") === "true";
  let rescheduleData = null;
  let originalAppointmentId = null;

  if (isReschedule) {
    rescheduleData = JSON.parse(
      localStorage.getItem("ubs_reschedule_data") || "{}"
    );
    originalAppointmentId = rescheduleData.originalAppointmentId;
    console.log("🔄 MODO REAGENDAMENTO:", rescheduleData);

    if (rescheduleData.especialidade) {
      preencherDadosReagendamento(rescheduleData);
    }
  }

  // Carregar e preencher unidades
  carregarEPreencherUnidades();

  // Restante do código permanece igual...
  const especialidadeSelect = document.getElementById("especialidade");
  const profissionalSelect = document.getElementById("profissional");

  const profissionaisPorEspecialidade = {
    "Clínico Geral": [
      { id: 1, nome: "Dr. João Silva", crm: "SP-12345" },
      { id: 2, nome: "Dra. Maria Santos", crm: "SP-12346" },
      { id: 3, nome: "Dr. Pedro Oliveira", crm: "SP-12347" },
    ],
    Odontologia: [
      { id: 4, nome: "Dra. Ana Costa", crm: "SP-12348" },
      { id: 5, nome: "Dr. Carlos Lima", crm: "SP-12349" },
    ],
    Pediatria: [
      { id: 6, nome: "Dra. Fernanda Souza", crm: "SP-12350" },
      { id: 7, nome: "Dr. Roberto Alves", crm: "SP-12351" },
    ],
    Ginecologia: [
      { id: 8, nome: "Dra. Juliana Pereira", crm: "SP-12352" },
      { id: 9, nome: "Dra. Patricia Rodrigues", crm: "SP-12353" },
    ],
    Cardiologia: [
      { id: 10, nome: "Dr. Marcelo Fernandes", crm: "SP-12354" },
      { id: 11, nome: "Dra. Beatriz Castro", crm: "SP-12355" },
    ],
  };

  // Preencher dados do reagendamento
  function preencherDadosReagendamento(data) {
    console.log("📝 Preenchendo dados do reagendamento:", data);

    // Preencher especialidade
    if (data.especialidade) {
      especialidadeSelect.value = data.especialidade;
      especialidadeSelect.dispatchEvent(new Event("change"));
    }

    // Preencher profissional após um pequeno delay para carregar as opções
    setTimeout(() => {
      if (data.profissionalId) {
        profissionalSelect.value = data.profissionalId;
        profissionalSelect.dispatchEvent(new Event("change"));
      }
    }, 100);

    // Preencher unidade
    if (data.ubs) {
      const ubsSelect = document.getElementById("ubs");
      if (typeof data.ubs === "object") {
        ubsSelect.value = data.ubs.id;
      } else {
        ubsSelect.value = data.ubs;
      }
    }

    // Atualizar título da página
    document.querySelector("h1").textContent = "Reagendar Consulta";
  }

  // Atualizar profissionais quando especialidade mudar
  especialidadeSelect.addEventListener("change", function () {
    const especialidade = this.value;
    profissionalSelect.innerHTML =
      '<option value="">Selecione o profissional</option>';

    if (especialidade && profissionaisPorEspecialidade[especialidade]) {
      profissionaisPorEspecialidade[especialidade].forEach((profissional) => {
        const option = document.createElement("option");
        option.value = profissional.id;
        option.textContent = profissional.nome;
        profissionalSelect.appendChild(option);
      });
    }
  });

  // Configurar data mínima (hoje)
  const dataInput = document.getElementById("data");
  const hoje = new Date();
  const hojeAjustado = new Date(
    hoje.getTime() - hoje.getTimezoneOffset() * 60000
  );
  dataInput.min = hojeAjustado.toISOString().split("T")[0];

  // Form submission - CORREÇÃO PARA REAGENDAMENTO
  const agendarForm = document.getElementById("agendarForm");
  agendarForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const especialidade = document.getElementById("especialidade").value;
    const profissionalId = document.getElementById("profissional").value;
    const profissionalNome =
      document.getElementById("profissional").selectedOptions[0].textContent;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;
    const ubsId = document.getElementById("ubs").value;
    const ubsNome =
      document.getElementById("ubs").selectedOptions[0].textContent;

    // Validações básicas
    if (!especialidade || !profissionalId || !data || !horario || !ubsId) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Verificação da data
    const partesData = data.split("-");
    const ano = parseInt(partesData[0]);
    const mes = parseInt(partesData[1]) - 1;
    const dia = parseInt(partesData[2]);

    const dataSelecionada = new Date(ano, mes, dia);

    // Verificar se é domingo
    if (dataSelecionada.getDay() === 0) {
      alert(
        "As unidades não funcionam aos domingos. Por favor, selecione outra data."
      );
      return;
    }

    // Verificar se o usuário está logado
    const usuarioLogado = JSON.parse(localStorage.getItem("ubs_current_user"));
    if (!usuarioLogado) {
      alert("Por favor, faça login para agendar uma consulta.");
      window.location.href = "index.html";
      return;
    }

    // DIFERENÇA PRINCIPAL: Verificar se é reagendamento
    if (isReschedule && originalAppointmentId) {
      // REAGENDAMENTO: Atualizar consulta existente
      atualizarConsultaExistente(originalAppointmentId, {
        especialidade: especialidade,
        profissional: {
          id: profissionalId,
          nome: profissionalNome,
        },
        data: data,
        horario: horario,
        unidade: {
          id: ubsId,
          nome: ubsNome,
        },
        status: "agendada",
        dataReagendamento: new Date().toISOString(),
      });
    } else {
      // NOVO AGENDAMENTO: Criar nova consulta
      const novaConsulta = {
        id: Date.now(),
        paciente: {
          nome: usuarioLogado.nome,
          email: usuarioLogado.email,
          cpf: usuarioLogado.cpf,
        },
        especialidade: especialidade,
        profissional: {
          id: profissionalId,
          nome: profissionalNome,
        },
        data: data,
        horario: horario,
        unidade: {
          id: ubsId,
          nome: ubsNome,
        },
        status: "agendada",
        dataAgendamento: new Date().toISOString(),
      };

      salvarConsulta(novaConsulta);
      mostrarConfirmacao(novaConsulta, false);
    }
  });

  // FUNÇÃO PARA ATUALIZAR CONSULTA EXISTENTE
  function atualizarConsultaExistente(appointmentId, novosDados) {
    try {
      let consultas =
        JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
      const consultaIndex = consultas.findIndex(
        (consulta) => consulta.id == appointmentId
      );

      if (consultaIndex !== -1) {
        // Manter os dados originais que não foram alterados
        const consultaOriginal = consultas[consultaIndex];

        consultas[consultaIndex] = {
          ...consultaOriginal, // Mantém dados como id, paciente, etc.
          ...novosDados, // Atualiza com novos dados
          id: consultaOriginal.id, // Garante que o ID não mude
          paciente: consultaOriginal.paciente, // Mantém dados do paciente
        };

        localStorage.setItem("consultasAgendadas", JSON.stringify(consultas));
        console.log("✅ Consulta atualizada:", consultas[consultaIndex]);

        // Limpar dados de reagendamento
        localStorage.removeItem("ubs_reschedule_data");

        mostrarConfirmacao(consultas[consultaIndex], true);
      } else {
        alert("Erro: Consulta não encontrada para reagendamento.");
      }
    } catch (error) {
      console.error("Erro ao atualizar consulta:", error);
      alert("Erro ao reagendar consulta.");
    }
  }

  function salvarConsulta(consulta) {
    let consultas =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
    consultas.push(consulta);
    localStorage.setItem("consultasAgendadas", JSON.stringify(consultas));
    console.log("Consulta salva:", consulta);
  }

  function mostrarConfirmacao(consulta, isReschedule) {
    const dataFormatada = new Date(consulta.data).toLocaleDateString("pt-BR");

    const mensagem = `
            ✅ ${
              isReschedule ? "Consulta reagendada" : "Consulta agendada"
            } com sucesso!

            📋 Detalhes da consulta:
            • Especialidade: ${consulta.especialidade}
            • Profissional: ${consulta.profissional.nome}
            • Data: ${dataFormatada}
            • Horário: ${consulta.horario}
            • Unidade: ${
              typeof consulta.unidade === "object"
                ? consulta.unidade.nome
                : consulta.unidade
            }

            Você receberá um lembrete 24h antes da consulta.
        `;

    alert(mensagem);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  }

  // Restante do código (configurarDependenciasCampos, configurarHorariosDisponiveis, etc.)
  function configurarDependenciasCampos() {
    const campos = {
      especialidade: document.getElementById("especialidade"),
      profissional: document.getElementById("profissional"),
      data: document.getElementById("data"),
      horario: document.getElementById("horario"),
      ubs: document.getElementById("ubs"),
    };

    campos.profissional.disabled = true;
    campos.data.disabled = true;
    campos.horario.disabled = true;

    campos.especialidade.addEventListener("change", function () {
      campos.profissional.disabled = !this.value;
      if (!this.value) {
        campos.data.disabled = true;
        campos.horario.disabled = true;
      }
    });

    campos.profissional.addEventListener("change", function () {
      campos.data.disabled = !this.value;
      if (!this.value) {
        campos.horario.disabled = true;
      }
    });

    campos.data.addEventListener("change", function () {
      campos.horario.disabled = !this.value;
    });
  }

  configurarDependenciasCampos();

  function configurarHorariosDisponiveis() {
    const dataInput = document.getElementById("data");
    const horarioSelect = document.getElementById("horario");

    dataInput.addEventListener("change", function () {
      const dataValor = this.value;

      if (!dataValor) {
        horarioSelect.innerHTML =
          '<option value="">Selecione o horário</option>';
        return;
      }

      const partesData = dataValor.split("-");
      const ano = parseInt(partesData[0]);
      const mes = parseInt(partesData[1]) - 1;
      const dia = parseInt(partesData[2]);

      const dataSelecionada = new Date(ano, mes, dia);

      // Limpar horários
      horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';

      // Verificar se é domingo
      if (dataSelecionada.getDay() === 0) {
        alert(
          "As unidades não funcionam aos domingos. Por favor, selecione outra data."
        );
        this.value = "";
        return;
      }

      // Definir horários baseado no dia da semana
      let horariosDisponiveis = [];

      if (dataSelecionada.getDay() >= 1 && dataSelecionada.getDay() <= 5) {
        // Segunda a Sexta
        horariosDisponiveis = [
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
        ];
      } else if (dataSelecionada.getDay() === 6) {
        // Sábado
        horariosDisponiveis = [
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
        ];
      }

      // Adicionar horários ao select
      horariosDisponiveis.forEach((horario) => {
        const option = document.createElement("option");
        option.value = horario;
        option.textContent = horario;
        horarioSelect.appendChild(option);
      });
    });
  }

  configurarHorariosDisponiveis();

  // Funções para carregar unidades (manter as mesmas)
  function carregarUnidades() {
    let unidadesSalvas = localStorage.getItem("ubs_unidades");

    if (unidadesSalvas) {
      return JSON.parse(unidadesSalvas);
    }

    const unidadesPadrao = [
      // ... (mesmo array de unidades do código anterior)
    ];

    localStorage.setItem("ubs_unidades", JSON.stringify(unidadesPadrao));
    return unidadesPadrao;
  }

  function preencherSelectUnidades(unidades) {
    const selectUBS = document.getElementById("ubs");
    if (!selectUBS) return;

    selectUBS.innerHTML = '<option value="">Selecione a UBS</option>';

    unidades.forEach((unidade) => {
      const option = document.createElement("option");
      option.value = unidade.id;
      option.textContent = unidade.nome;
      selectUBS.appendChild(option);
    });
  }

  function carregarEPreencherUnidades() {
    const unidades = carregarUnidades();
    preencherSelectUnidades(unidades);
  }
});
