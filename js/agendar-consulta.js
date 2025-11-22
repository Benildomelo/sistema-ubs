// agendar-consulta.js - VERSÃO COM UNIDADES FUNCIONANDO
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
  }

  // CARREGAR UNIDADES IMEDIATAMENTE
  carregarUnidadesNoSelect();

  const especialidadeSelect = document.getElementById("especialidade");
  const profissionalSelect = document.getElementById("profissional");
  const dataInput = document.getElementById("data");
  const horarioSelect = document.getElementById("horario");
  const ubsSelect = document.getElementById("ubs");

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

  // Preencher dados do reagendamento APÓS carregar unidades
  if (isReschedule && rescheduleData.especialidade) {
    setTimeout(() => {
      preencherDadosReagendamento(rescheduleData);
    }, 100);
  }

  // FUNÇÃO SIMPLIFICADA PARA CARREGAR UNIDADES
  function carregarUnidadesNoSelect() {
    console.log("🚀 Carregando unidades no select...");

    const ubsSelect = document.getElementById("ubs");
    if (!ubsSelect) {
      console.error("❌ Select UBS não encontrado!");
      return;
    }

    // Dados das UBSs (mesmo do unidades.js)
    const unidades = [
      { id: 1, nome: "UBS Parque Piauí" },
      { id: 2, nome: "UBS Vila Bandeirante" },
      { id: 3, nome: "UBS São Joaquim" },
      { id: 4, nome: "UBS Mocambinho" },
      { id: 5, nome: "UBS Buenos Aires" },
      { id: 6, nome: "UBS Poti Velho" },
      { id: 7, nome: "UBS Santa Maria da Codipe" },
      { id: 8, nome: "UBS Parque Sul" },
      { id: 9, nome: "UBS Gurupi" },
      { id: 10, nome: "UBS Saci" },
      { id: 11, nome: "UBS Vila Operária" },
      { id: 12, nome: "UBS Promorar" },
    ];

    // Limpar select
    ubsSelect.innerHTML = '<option value="">Selecione a UBS</option>';

    // Adicionar unidades
    unidades.forEach((unidade) => {
      const option = document.createElement("option");
      option.value = unidade.id;
      option.textContent = unidade.nome;
      ubsSelect.appendChild(option);
    });

    console.log("✅ Select UBS preenchido com", unidades.length, "unidades");
    console.log(
      "📋 Unidades carregadas:",
      unidades.map((u) => u.nome)
    );
  }

  // Preencher dados do reagendamento
  function preencherDadosReagendamento(data) {
    console.log("📝 Preenchendo dados do reagendamento:", data);

    // Preencher especialidade
    if (data.especialidade) {
      especialidadeSelect.value = data.especialidade;
      // Disparar evento para carregar profissionais
      const event = new Event("change");
      especialidadeSelect.dispatchEvent(event);
    }

    // Preencher profissional
    setTimeout(() => {
      if (data.profissionalId) {
        profissionalSelect.value = data.profissionalId;

        // BLOQUEAR SELECT DO PROFISSIONAL NO REAGENDAMENTO
        profissionalSelect.disabled = true;
        profissionalSelect.title =
          "Não é possível alterar o profissional no reagendamento";
        profissionalSelect.style.backgroundColor = "#f3f4f6";
        profissionalSelect.style.cursor = "not-allowed";

        // HABILITAR DATA E HORÁRIO
        dataInput.disabled = false;
        horarioSelect.disabled = false;
      }
    }, 300);

    // Preencher unidade - CORREÇÃO MELHORADA
    if (data.ubs) {
      console.log("🔍 Tentando preencher UBS:", data.ubs);

      // Pequeno delay para garantir que o select foi preenchido
      setTimeout(() => {
        let ubsIdParaPreencher = null;

        if (typeof data.ubs === "object") {
          ubsIdParaPreencher = data.ubs.id;
          console.log("✅ UBS encontrada por objeto:", data.ubs.id);
        } else {
          // Se for string, tentar encontrar pelo nome
          const unidades = [
            { id: 1, nome: "UBS Parque Piauí" },
            { id: 2, nome: "UBS Vila Bandeirante" },
            { id: 3, nome: "UBS São Joaquim" },
            { id: 4, nome: "UBS Mocambinho" },
            { id: 5, nome: "UBS Buenos Aires" },
            { id: 6, nome: "UBS Poti Velho" },
            { id: 7, nome: "UBS Santa Maria da Codipe" },
            { id: 8, nome: "UBS Parque Sul" },
            { id: 9, nome: "UBS Gurupi" },
            { id: 10, nome: "UBS Saci" },
            { id: 11, nome: "UBS Vila Operária" },
            { id: 12, nome: "UBS Promorar" },
          ];

          const unidadeEncontrada = unidades.find(
            (u) => u.nome === data.ubs || u.id == data.ubs
          );

          if (unidadeEncontrada) {
            ubsIdParaPreencher = unidadeEncontrada.id;
            console.log("✅ UBS encontrada por nome/ID:", unidadeEncontrada.id);
          } else {
            console.log("❌ UBS não encontrada:", data.ubs);
          }
        }

        // Preencher o select
        if (ubsIdParaPreencher) {
          ubsSelect.value = ubsIdParaPreencher;
          console.log("🎯 UBS preenchida no select:", ubsIdParaPreencher);
        }
      }, 200);
    }

    // Preencher data original
    if (data.dataOriginal) {
      dataInput.value = data.dataOriginal;
      console.log("📅 Data original preenchida:", data.dataOriginal);

      // Disparar evento para carregar horários
      setTimeout(() => {
        const event = new Event("change");
        dataInput.dispatchEvent(event);

        // Preencher horário original
        if (data.horarioOriginal) {
          setTimeout(() => {
            horarioSelect.value = data.horarioOriginal;
            console.log(
              "⏰ Horário original preenchido:",
              data.horarioOriginal
            );
          }, 200);
        }
      }, 100);
    }

    // Atualizar título da página
    const titulo = document.querySelector("h1");
    titulo.textContent = "Reagendar Consulta";
    titulo.innerHTML +=
      ' <span class="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded ml-2">Reagendamento</span>';
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

    // Se for reagendamento, manter o profissional bloqueado mas habilitar outros campos
    if (isReschedule) {
      profissionalSelect.disabled = true;
      dataInput.disabled = false;
      horarioSelect.disabled = false;
    } else {
      profissionalSelect.disabled = !this.value;
      dataInput.disabled = !profissionalSelect.value;
      horarioSelect.disabled = !dataInput.value;
    }
  });

  // Configurar data mínima (hoje)
  const hoje = new Date();
  const hojeAjustado = new Date(
    hoje.getTime() - hoje.getTimezoneOffset() * 60000
  );
  dataInput.min = hojeAjustado.toISOString().split("T")[0];

  // Form submission
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

    // Verificar se é reagendamento
    if (isReschedule && originalAppointmentId) {
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
        const consultaOriginal = consultas[consultaIndex];

        consultas[consultaIndex] = {
          ...consultaOriginal,
          ...novosDados,
          id: consultaOriginal.id,
          paciente: consultaOriginal.paciente,
        };

        localStorage.setItem("consultasAgendadas", JSON.stringify(consultas));
        console.log("✅ Consulta atualizada:", consultas[consultaIndex]);

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

  // NO agendar-consulta.js - ATUALIZE A FUNÇÃO mostrarConfirmacao
  function mostrarConfirmacao(consulta, isReschedule) {
    // CORREÇÃO DO FUSO HORÁRIO - Formatar data corretamente
    const dataObj = new Date(consulta.data + "T00:00:00"); // Adiciona horário para evitar problemas de fuso
    const dataFormatada = dataObj.toLocaleDateString("pt-BR");

    // DEBUG: Verificar datas
    console.log("📅 Debug de datas:", {
      dataOriginal: consulta.data,
      dataObj: dataObj,
      dataFormatada: dataFormatada,
      timezoneOffset: dataObj.getTimezoneOffset(),
    });

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

  // Configurar dependências dos campos
  function configurarDependenciasCampos() {
    console.log("⚙️ Configurando dependências dos campos...");

    // Estado inicial
    profissionalSelect.disabled = !especialidadeSelect.value;
    dataInput.disabled = !profissionalSelect.value;
    horarioSelect.disabled = !dataInput.value;

    if (isReschedule) {
      profissionalSelect.disabled = true;
      dataInput.disabled = false;
      horarioSelect.disabled = false;
    }

    especialidadeSelect.addEventListener("change", function () {
      if (isReschedule) {
        profissionalSelect.disabled = true;
        dataInput.disabled = false;
        horarioSelect.disabled = false;
      } else {
        profissionalSelect.disabled = !this.value;
        dataInput.disabled = !profissionalSelect.value;
        horarioSelect.disabled = !dataInput.value;
      }
    });

    profissionalSelect.addEventListener("change", function () {
      if (isReschedule) {
        dataInput.disabled = false;
        horarioSelect.disabled = false;
      } else {
        dataInput.disabled = !this.value;
        horarioSelect.disabled = !dataInput.value;
      }
    });

    dataInput.addEventListener("change", function () {
      if (isReschedule) {
        horarioSelect.disabled = false;
      } else {
        horarioSelect.disabled = !this.value;
      }
    });
  }

  configurarDependenciasCampos();

  function configurarHorariosDisponiveis() {
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

      horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';

      if (dataSelecionada.getDay() === 0) {
        alert(
          "As unidades não funcionam aos domingos. Por favor, selecione outra data."
        );
        this.value = "";
        return;
      }

      let horariosDisponiveis = [];

      if (dataSelecionada.getDay() >= 1 && dataSelecionada.getDay() <= 5) {
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
        horariosDisponiveis = [
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
        ];
      }

      horariosDisponiveis.forEach((horario) => {
        const option = document.createElement("option");
        option.value = horario;
        option.textContent = horario;
        horarioSelect.appendChild(option);
      });

      horarioSelect.disabled = false;
    });
  }

  configurarHorariosDisponiveis();
});
