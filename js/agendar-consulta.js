// agendar-consulta.js - VERSÃO COM UNIDADES DINÂMICAS
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== INICIANDO AGENDAR CONSULTA ===");

  // Carregar unidades do localStorage ou do arquivo unidades.js
  const unidades = carregarUnidades();
  preencherSelectUnidades(unidades);

  // Preencher UBS automaticamente se uma foi selecionada
  const unidadeSelecionada = localStorage.getItem("unidadeSelecionada");
  if (unidadeSelecionada) {
    const unidade = JSON.parse(unidadeSelecionada);
    const selectUBS = document.getElementById("ubs");
    selectUBS.value = unidade.id;
    localStorage.removeItem("unidadeSelecionada");
  }

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

  // Configurar data mínima (hoje) - CORREÇÃO DO FUSO HORÁRIO
  const dataInput = document.getElementById("data");
  const hoje = new Date();
  // Ajustar para o fuso horário local
  const hojeAjustado = new Date(
    hoje.getTime() - hoje.getTimezoneOffset() * 60000
  );
  dataInput.min = hojeAjustado.toISOString().split("T")[0];
  console.log("Data mínima configurada:", dataInput.min);

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

    // VERIFICAÇÃO CORRIGIDA DA DATA - método mais robusto
    console.log("=== VALIDAÇÃO DE DATA NO SUBMIT ===");
    console.log("Data do input:", data);

    // Criar data de forma segura
    const partesData = data.split("-");
    const ano = parseInt(partesData[0]);
    const mes = parseInt(partesData[1]) - 1; // Mês é 0-indexed
    const dia = parseInt(partesData[2]);

    const dataSelecionada = new Date(ano, mes, dia);
    console.log("Data criada:", dataSelecionada);
    console.log("Dia da semana:", dataSelecionada.getDay());
    console.log("Nome do dia:", getNomeDiaSemana(dataSelecionada.getDay()));

    // Verificar se é domingo - CORREÇÃO PRINCIPAL
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

    // Criar objeto de consulta
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

    // Salvar consulta
    salvarConsulta(novaConsulta);
    mostrarConfirmacao(novaConsulta);
  });

  function salvarConsulta(consulta) {
    let consultas =
      JSON.parse(localStorage.getItem("consultasAgendadas")) || [];
    consultas.push(consulta);
    localStorage.setItem("consultasAgendadas", JSON.stringify(consultas));
    console.log("Consulta salva:", consulta);
  }

  function mostrarConfirmacao(consulta) {
    const dataFormatada = new Date(consulta.data).toLocaleDateString("pt-BR");

    const mensagem = `
            ✅ Consulta agendada com sucesso!

            📋 Detalhes da consulta:
            • Especialidade: ${consulta.especialidade}
            • Profissional: ${consulta.profissional.nome}
            • Data: ${dataFormatada}
            • Horário: ${consulta.horario}
            • Unidade: ${consulta.unidade.nome}

            Você receberá um lembrete 24h antes da consulta.
        `;

    alert(mensagem);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
  }

  // Configurar dependências dos campos
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

  // CONFIGURAÇÃO DE HORÁRIOS - VERSÃO CORRIGIDA
  function configurarHorariosDisponiveis() {
    const dataInput = document.getElementById("data");
    const horarioSelect = document.getElementById("horario");

    dataInput.addEventListener("change", function () {
      const dataValor = this.value;
      console.log("=== CHANGE DATA ===");
      console.log("Valor do input:", dataValor);

      if (!dataValor) {
        horarioSelect.innerHTML =
          '<option value="">Selecione o horário</option>';
        return;
      }

      // Criar data de forma segura - MESMA LÓGICA DO SUBMIT
      const partesData = dataValor.split("-");
      const ano = parseInt(partesData[0]);
      const mes = parseInt(partesData[1]) - 1;
      const dia = parseInt(partesData[2]);

      const dataSelecionada = new Date(ano, mes, dia);

      console.log("Data processada:", dataSelecionada);
      console.log("Dia da semana:", dataSelecionada.getDay());
      console.log("Nome do dia:", getNomeDiaSemana(dataSelecionada.getDay()));

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
        console.log("Horários: Segunda a Sexta");
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
        console.log("Horários: Sábado");
      }

      console.log("Horários disponíveis:", horariosDisponiveis);

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

  // Função auxiliar para debug
  function getNomeDiaSemana(dia) {
    const dias = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return dias[dia];
  }

  // DEBUG EXTRA: Mostrar info sempre que a data mudar
  dataInput.addEventListener("change", function () {
    const dataValor = this.value;
    console.log("=== DEBUG DATA ===");
    console.log("Input value:", dataValor);

    if (dataValor) {
      const partes = dataValor.split("-");
      const dataTeste = new Date(
        parseInt(partes[0]),
        parseInt(partes[1]) - 1,
        parseInt(partes[2])
      );
      console.log("Data testada:", dataTeste);
      console.log("Dia numérico:", dataTeste.getDay());
      console.log("É domingo?", dataTeste.getDay() === 0);
    }
  });

  // NOVAS FUNÇÕES PARA CARREGAR UNIDADES
  function carregarUnidades() {
    // Primeiro tenta carregar do localStorage (se já foi salvo)
    let unidadesSalvas = localStorage.getItem("ubs_unidades");

    if (unidadesSalvas) {
      console.log("Unidades carregadas do localStorage");
      return JSON.parse(unidadesSalvas);
    }

    // Se não encontrou no localStorage, usa os dados padrão do unidades.js
    console.log("Carregando unidades padrão...");
    const unidadesPadrao = [
      {
        id: 1,
        nome: "UBS Parque Piauí",
        endereco: "Rua 12, Parque Piauí - Teresina, PI",
        telefone: "(86) 3216-1650",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
        distancia: "2.1 km",
        lat: -5.0921,
        lng: -42.8038,
      },
      {
        id: 2,
        nome: "UBS Vila Bandeirante",
        endereco: "Rua São Pedro, Vila Bandeirante - Teresina, PI",
        telefone: "(86) 3216-1651",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "3.5 km",
        lat: -5.0689,
        lng: -42.7972,
      },
      {
        id: 3,
        nome: "UBS São Joaquim",
        endereco: "Av. Principal, São Joaquim - Teresina, PI",
        telefone: "(86) 3216-1652",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "4.2 km",
        lat: -5.1156,
        lng: -42.7758,
      },
      {
        id: 4,
        nome: "UBS Mocambinho",
        endereco: "Rua 10, Mocambinho - Teresina, PI",
        telefone: "(86) 3216-1653",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
        distancia: "5.8 km",
        lat: -5.0572,
        lng: -42.7669,
      },
      {
        id: 5,
        nome: "UBS Buenos Aires",
        endereco: "Rua São José, Buenos Aires - Teresina, PI",
        telefone: "(86) 3216-1654",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "1.8 km",
        lat: -5.0817,
        lng: -42.7894,
      },
      {
        id: 6,
        nome: "UBS Poti Velho",
        endereco: "Av. Boa Esperança, Poti Velho - Teresina, PI",
        telefone: "(86) 3216-1655",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "3.2 km",
        lat: -5.0664,
        lng: -42.8111,
      },
      {
        id: 7,
        nome: "UBS Santa Maria da Codipe",
        endereco: "Rua Santa Maria, Santa Maria da Codipe - Teresina, PI",
        telefone: "(86) 3216-1656",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "6.1 km",
        lat: -5.1233,
        lng: -42.7556,
      },
      {
        id: 8,
        nome: "UBS Parque Sul",
        endereco: "Av. Central, Parque Sul - Teresina, PI",
        telefone: "(86) 3216-1657",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
        distancia: "4.5 km",
        lat: -5.0989,
        lng: -42.755,
      },
      {
        id: 9,
        nome: "UBS Gurupi",
        endereco: "Rua Principal, Gurupi - Teresina, PI",
        telefone: "(86) 3216-1658",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "7.2 km",
        lat: -5.135,
        lng: -42.7889,
      },
      {
        id: 10,
        nome: "UBS Saci",
        endereco: "Rua São Paulo, Saci - Teresina, PI",
        telefone: "(86) 3216-1659",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "2.8 km",
        lat: -5.0711,
        lng: -42.7722,
      },
      {
        id: 11,
        nome: "UBS Vila Operária",
        endereco: "Rua da Paz, Vila Operária - Teresina, PI",
        telefone: "(86) 3216-1660",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
        distancia: "1.5 km",
        lat: -5.0883,
        lng: -42.8,
      },
      {
        id: 12,
        nome: "UBS Promorar",
        endereco: "Av. dos Imigrantes, Promorar - Teresina, PI",
        telefone: "(86) 3216-1661",
        horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
        distancia: "5.3 km",
        lat: -5.1056,
        lng: -42.7333,
      },
    ];

    // Salva no localStorage para uso futuro
    localStorage.setItem("ubs_unidades", JSON.stringify(unidadesPadrao));

    return unidadesPadrao;
  }

  function preencherSelectUnidades(unidades) {
    const selectUBS = document.getElementById("ubs");
    if (!selectUBS) return;

    // Limpa opções existentes (mantém a primeira opção padrão)
    selectUBS.innerHTML = '<option value="">Selecione a UBS</option>';

    // Adiciona cada unidade como opção
    unidades.forEach((unidade) => {
      const option = document.createElement("option");
      option.value = unidade.id;
      option.textContent = unidade.nome;
      selectUBS.appendChild(option);
    });

    console.log(`Select de UBS preenchido com ${unidades.length} unidades`);
  }
});
