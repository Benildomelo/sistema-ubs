// agendar-consulta.js - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO AGENDAR CONSULTA ===');

    // Preencher UBS automaticamente se uma foi selecionada
    const unidadeSelecionada = localStorage.getItem('unidadeSelecionada');
    if (unidadeSelecionada) {
        const unidade = JSON.parse(unidadeSelecionada);
        const selectUBS = document.getElementById('ubs');
        selectUBS.value = unidade.nome;
        localStorage.removeItem('unidadeSelecionada');
    }

    // Carregar profissionais baseado na especialidade selecionada
    const especialidadeSelect = document.getElementById('especialidade');
    const profissionalSelect = document.getElementById('profissional');

    const profissionaisPorEspecialidade = {
        'Clínico Geral': [
            { id: 1, nome: 'Dr. João Silva', crm: 'SP-12345' },
            { id: 2, nome: 'Dra. Maria Santos', crm: 'SP-12346' },
            { id: 3, nome: 'Dr. Pedro Oliveira', crm: 'SP-12347' }
        ],
        'Odontologia': [
            { id: 4, nome: 'Dra. Ana Costa', crm: 'SP-12348' },
            { id: 5, nome: 'Dr. Carlos Lima', crm: 'SP-12349' }
        ],
        'Pediatria': [
            { id: 6, nome: 'Dra. Fernanda Souza', crm: 'SP-12350' },
            { id: 7, nome: 'Dr. Roberto Alves', crm: 'SP-12351' }
        ],
        'Ginecologia': [
            { id: 8, nome: 'Dra. Juliana Pereira', crm: 'SP-12352' },
            { id: 9, nome: 'Dra. Patricia Rodrigues', crm: 'SP-12353' }
        ],
        'Cardiologia': [
            { id: 10, nome: 'Dr. Marcelo Fernandes', crm: 'SP-12354' },
            { id: 11, nome: 'Dra. Beatriz Castro', crm: 'SP-12355' }
        ]
    };

    // Atualizar profissionais quando especialidade mudar
    especialidadeSelect.addEventListener('change', function() {
        const especialidade = this.value;
        profissionalSelect.innerHTML = '<option value="">Selecione o profissional</option>';

        if (especialidade && profissionaisPorEspecialidade[especialidade]) {
            profissionaisPorEspecialidade[especialidade].forEach(profissional => {
                const option = document.createElement('option');
                option.value = profissional.id;
                option.textContent = profissional.nome;
                profissionalSelect.appendChild(option);
            });
        }
    });

    // Configurar data mínima (hoje) - CORREÇÃO DO FUSO HORÁRIO
    const dataInput = document.getElementById('data');
    const hoje = new Date();
    // Ajustar para o fuso horário local
    const hojeAjustado = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000));
    dataInput.min = hojeAjustado.toISOString().split('T')[0];
    console.log('Data mínima configurada:', dataInput.min);

    // Form submission
    const agendarForm = document.getElementById('agendarForm');
    agendarForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const especialidade = document.getElementById('especialidade').value;
        const profissionalId = document.getElementById('profissional').value;
        const profissionalNome = document.getElementById('profissional').selectedOptions[0].textContent;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const ubs = document.getElementById('ubs').value;

        // Validações básicas
        if (!especialidade || !profissionalId || !data || !horario || !ubs) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // VERIFICAÇÃO CORRIGIDA DA DATA - método mais robusto
        console.log('=== VALIDAÇÃO DE DATA NO SUBMIT ===');
        console.log('Data do input:', data);

        // Criar data de forma segura
        const partesData = data.split('-');
        const ano = parseInt(partesData[0]);
        const mes = parseInt(partesData[1]) - 1; // Mês é 0-indexed
        const dia = parseInt(partesData[2]);

        const dataSelecionada = new Date(ano, mes, dia);
        console.log('Data criada:', dataSelecionada);
        console.log('Dia da semana:', dataSelecionada.getDay());
        console.log('Nome do dia:', getNomeDiaSemana(dataSelecionada.getDay()));

        // Verificar se é domingo - CORREÇÃO PRINCIPAL
        if (dataSelecionada.getDay() === 0) {
            alert('As unidades não funcionam aos domingos. Por favor, selecione outra data.');
            return;
        }

        // Verificar se o usuário está logado
        const usuarioLogado = JSON.parse(localStorage.getItem('ubs_current_user'));
        if (!usuarioLogado) {
            alert('Por favor, faça login para agendar uma consulta.');
            window.location.href = 'index.html';
            return;
        }

        // Criar objeto de consulta
        const novaConsulta = {
            id: Date.now(),
            paciente: {
                nome: usuarioLogado.nome,
                email: usuarioLogado.email,
                cpf: usuarioLogado.cpf
            },
            especialidade: especialidade,
            profissional: {
                id: profissionalId,
                nome: profissionalNome
            },
            data: data,
            horario: horario,
            unidade: ubs,
            status: 'agendada',
            dataAgendamento: new Date().toISOString()
        };

        // Salvar consulta
        salvarConsulta(novaConsulta);
        mostrarConfirmacao(novaConsulta);
    });

    function salvarConsulta(consulta) {
        let consultas = JSON.parse(localStorage.getItem('consultasAgendadas')) || [];
        consultas.push(consulta);
        localStorage.setItem('consultasAgendadas', JSON.stringify(consultas));
        console.log('Consulta salva:', consulta);
    }

    function mostrarConfirmacao(consulta) {
        const dataFormatada = new Date(consulta.data).toLocaleDateString('pt-BR');

        const mensagem = `
            ✅ Consulta agendada com sucesso!

            📋 Detalhes da consulta:
            • Especialidade: ${consulta.especialidade}
            • Profissional: ${consulta.profissional.nome}
            • Data: ${dataFormatada}
            • Horário: ${consulta.horario}
            • Unidade: ${consulta.unidade}

            Você receberá um lembrete 24h antes da consulta.
        `;

        alert(mensagem);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Configurar dependências dos campos
    function configurarDependenciasCampos() {
        const campos = {
            especialidade: document.getElementById('especialidade'),
            profissional: document.getElementById('profissional'),
            data: document.getElementById('data'),
            horario: document.getElementById('horario'),
            ubs: document.getElementById('ubs')
        };

        campos.profissional.disabled = true;
        campos.data.disabled = true;
        campos.horario.disabled = true;

        campos.especialidade.addEventListener('change', function() {
            campos.profissional.disabled = !this.value;
            if (!this.value) {
                campos.data.disabled = true;
                campos.horario.disabled = true;
            }
        });

        campos.profissional.addEventListener('change', function() {
            campos.data.disabled = !this.value;
            if (!this.value) {
                campos.horario.disabled = true;
            }
        });

        campos.data.addEventListener('change', function() {
            campos.horario.disabled = !this.value;
        });
    }

    configurarDependenciasCampos();

    // CONFIGURAÇÃO DE HORÁRIOS - VERSÃO CORRIGIDA
    function configurarHorariosDisponiveis() {
        const dataInput = document.getElementById('data');
        const horarioSelect = document.getElementById('horario');

        dataInput.addEventListener('change', function() {
            const dataValor = this.value;
            console.log('=== CHANGE DATA ===');
            console.log('Valor do input:', dataValor);

            if (!dataValor) {
                horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';
                return;
            }

            // Criar data de forma segura - MESMA LÓGICA DO SUBMIT
            const partesData = dataValor.split('-');
            const ano = parseInt(partesData[0]);
            const mes = parseInt(partesData[1]) - 1;
            const dia = parseInt(partesData[2]);

            const dataSelecionada = new Date(ano, mes, dia);

            console.log('Data processada:', dataSelecionada);
            console.log('Dia da semana:', dataSelecionada.getDay());
            console.log('Nome do dia:', getNomeDiaSemana(dataSelecionada.getDay()));

            // Limpar horários
            horarioSelect.innerHTML = '<option value="">Selecione o horário</option>';

            // Verificar se é domingo
            if (dataSelecionada.getDay() === 0) {
                alert('As unidades não funcionam aos domingos. Por favor, selecione outra data.');
                this.value = '';
                return;
            }

            // Definir horários baseado no dia da semana
            let horariosDisponiveis = [];

            if (dataSelecionada.getDay() >= 1 && dataSelecionada.getDay() <= 5) {
                // Segunda a Sexta
                horariosDisponiveis = [
                    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
                ];
                console.log('Horários: Segunda a Sexta');
            } else if (dataSelecionada.getDay() === 6) {
                // Sábado
                horariosDisponiveis = [
                    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30'
                ];
                console.log('Horários: Sábado');
            }

            console.log('Horários disponíveis:', horariosDisponiveis);

            // Adicionar horários ao select
            horariosDisponiveis.forEach(horario => {
                const option = document.createElement('option');
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
            'Domingo', 'Segunda-feira', 'Terça-feira',
            'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
        ];
        return dias[dia];
    }

    // DEBUG EXTRA: Mostrar info sempre que a data mudar
    dataInput.addEventListener('change', function() {
        const dataValor = this.value;
        console.log('=== DEBUG DATA ===');
        console.log('Input value:', dataValor);

        if (dataValor) {
            const partes = dataValor.split('-');
            const dataTeste = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            console.log('Data testada:', dataTeste);
            console.log('Dia numérico:', dataTeste.getDay());
            console.log('É domingo?', dataTeste.getDay() === 0);
        }
    });
});