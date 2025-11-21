// prontuario.js - VERSÃO COMPLETA COM IMPRESSÃO
class MedicalRecord {
    constructor() {
        this.patientData = null;
        this.currentTab = 'historico';
        this.init();
    }

    init() {
        this.loadPatientData();
        this.initializeEventListeners();
        this.loadTabContent();
    }

    loadPatientData() {
        // Simular dados do paciente (em um sistema real viria da URL ou localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        const patientName = urlParams.get('paciente') || 'Carlos Mendes';
        const patientCPF = urlParams.get('cpf') || '123.456.789-00';

        this.patientData = {
            nome: patientName,
            cpf: patientCPF,
            idade: '45 anos',
            telefone: '(86) 99999-9999',
            historico: [
                {
                    data: '15/03/2024',
                    tipo: 'Consulta de Rotina',
                    diagnostico: 'Hipertensão Arterial',
                    conduta: 'Prescrito Losartana 50mg. Orientado sobre dieta hipossódica.',
                    profissional: 'Dr. João Silva'
                },
                {
                    data: '28/02/2024',
                    tipo: 'Retorno',
                    diagnostico: 'Controle de Hipertensão',
                    conduta: 'PA controlada. Manter medicação. Retorno em 30 dias.',
                    profissional: 'Dr. João Silva'
                },
                {
                    data: '15/01/2024',
                    tipo: 'Consulta de Rotina',
                    diagnostico: 'Check-up Anual',
                    conduta: 'Solicitados exames de rotina. Paciente assintomático.',
                    profissional: 'Dr. João Silva'
                }
            ],
            prescricoes: [
                {
                    data: '15/03/2024',
                    medicamento: 'Losartana 50mg',
                    dosagem: '1 comprimido ao dia',
                    duracao: 'Uso contínuo',
                    profissional: 'Dr. João Silva'
                },
                {
                    data: '15/01/2024',
                    medicamento: 'Sinvastatina 20mg',
                    dosagem: '1 comprimido à noite',
                    duracao: 'Uso contínuo',
                    profissional: 'Dr. João Silva'
                }
            ],
            exames: [
                {
                    data: '20/01/2024',
                    tipo: 'Hemograma Completo',
                    resultado: 'Dentro dos parâmetros normais',
                    status: 'Concluído'
                },
                {
                    data: '20/01/2024',
                    tipo: 'Glicemia em Jejum',
                    resultado: '95 mg/dL (Normal)',
                    status: 'Concluído'
                },
                {
                    data: '18/03/2024',
                    tipo: 'Eletrocardiograma',
                    resultado: 'Pendente',
                    status: 'Solicitado'
                }
            ],
            alergias: [
                {
                    substancia: 'Penicilina',
                    tipo: 'Medicamentosa',
                    gravidade: 'Moderada',
                    observacao: 'Edema e urticária'
                },
                {
                    substancia: 'Dipirona',
                    tipo: 'Medicamentosa',
                    gravidade: 'Leve',
                    observacao: 'Rash cutâneo'
                }
            ]
        };

        this.updatePatientInfo();
    }

    updatePatientInfo() {
        document.getElementById('patientName').textContent = this.patientData.nome;
        document.getElementById('infoNome').textContent = this.patientData.nome;
        document.getElementById('infoIdade').textContent = this.patientData.idade;
        document.getElementById('infoCPF').textContent = this.patientData.cpf;
        document.getElementById('infoTelefone').textContent = this.patientData.telefone;
    }

    initializeEventListeners() {
        // Tabs
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.getAttribute('data-tab'));
            });
        });

        // Formulário de nova anotação
        const form = document.getElementById('newNoteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveNewNote();
            });
        }

        // Botão voltar
        const backButton = document.querySelector('button[onclick="history.back()"]');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }

        // Botão de impressão
        const printButton = document.querySelector('button[onclick="medicalRecord.printRecord()"]');
        if (printButton) {
            printButton.addEventListener('click', () => {
                this.printRecord();
            });
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Atualizar botões das tabs
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                button.classList.add('bg-primary', 'text-white');
            } else {
                button.classList.remove('bg-primary', 'text-white');
                button.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            }
        });

        this.loadTabContent();
    }

    loadTabContent() {
        const container = document.getElementById('tabContent');

        switch(this.currentTab) {
            case 'historico':
                container.innerHTML = this.renderHistorico();
                break;
            case 'prescricoes':
                container.innerHTML = this.renderPrescricoes();
                break;
            case 'exames':
                container.innerHTML = this.renderExames();
                break;
            case 'alergias':
                container.innerHTML = this.renderAlergias();
                break;
        }
    }

    renderHistorico() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Histórico de Consultas</h2>
                <div class="space-y-4">
                    ${this.patientData.historico.map(consulta => `
                        <div class="border-l-4 border-blue-500 pl-4 py-2">
                            <div class="flex justify-between items-start">
                                <h3 class="font-semibold text-gray-900 dark:text-white">${consulta.tipo}</h3>
                                <span class="text-sm text-gray-500">${consulta.data}</span>
                            </div>
                            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <strong>Diagnóstico:</strong> ${consulta.diagnostico}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                <strong>Conduta:</strong> ${consulta.conduta}
                            </p>
                            <p class="text-xs text-gray-500 mt-2">Profissional: ${consulta.profissional}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderPrescricoes() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">💊 Prescrições Médicas</h2>
                <div class="space-y-4">
                    ${this.patientData.prescricoes.map(prescricao => `
                        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-semibold text-gray-900 dark:text-white">${prescricao.medicamento}</h3>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${prescricao.dosagem}</p>
                                </div>
                                <span class="text-sm text-gray-500">${prescricao.data}</span>
                            </div>
                            <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                <p><strong>Duração:</strong> ${prescricao.duracao}</p>
                                <p class="text-xs text-gray-500 mt-1">Prescrito por: ${prescricao.profissional}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderExames() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🩺 Exames Solicitados</h2>
                <div class="space-y-3">
                    ${this.patientData.exames.map(exame => `
                        <div class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white">${exame.tipo}</h3>
                                <p class="text-sm text-gray-600 dark:text-gray-300">${exame.resultado}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full ${
                                exame.status === 'Concluído'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }">
                                ${exame.status}
                            </span>
                            <span class="text-sm text-gray-500">${exame.data}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAlergias() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Alergias e Reações</h2>
                <div class="space-y-3">
                    ${this.patientData.alergias.map(alergia => `
                        <div class="p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-semibold text-red-800 dark:text-red-300">${alergia.substancia}</h3>
                                    <p class="text-sm text-red-600 dark:text-red-400">${alergia.tipo} - ${alergia.gravidade}</p>
                                </div>
                                <span class="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-full">
                                    Alergia
                                </span>
                            </div>
                            <p class="text-sm text-red-600 dark:text-red-400 mt-2">${alergia.observacao}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    saveNewNote() {
        const tipo = document.getElementById('noteType').value;
        const anamnese = document.getElementById('noteAnamnese').value;
        const diagnostico = document.getElementById('noteDiagnostico').value;
        const conduta = document.getElementById('noteConduta').value;

        if (!anamnese || !diagnostico || !conduta) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Simular salvamento (em sistema real, enviaria para o backend)
        const novaConsulta = {
            data: new Date().toLocaleDateString('pt-BR'),
            tipo: document.getElementById('noteType').selectedOptions[0].text,
            diagnostico: diagnostico,
            conduta: conduta,
            profissional: 'Dr. João Silva' // Em sistema real, pegaria do usuário logado
        };

        this.patientData.historico.unshift(novaConsulta);

        // Limpar formulário
        document.getElementById('newNoteForm').reset();

        // Recarregar tab de histórico
        this.switchTab('historico');

        alert('Registro salvo com sucesso!');
    }

    printRecord() {
        this.generatePrintView();
    }

    generatePrintView() {
        // Criar uma nova janela para impressão
        const printWindow = window.open('', '_blank');
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const currentTime = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Gerar o conteúdo HTML para impressão
        const printContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Prontuário - ${this.patientData.nome}</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        font-size: 12px;
                    }

                    .header {
                        border-bottom: 2px solid #005EA2;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }

                    .header h1 {
                        color: #005EA2;
                        margin: 0;
                        font-size: 18px;
                    }

                    .header .subtitle {
                        color: #666;
                        font-size: 14px;
                        margin: 5px 0;
                    }

                    .patient-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 20px;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                    }

                    .info-group {
                        margin-bottom: 8px;
                    }

                    .info-label {
                        font-weight: bold;
                        color: #005EA2;
                        font-size: 11px;
                    }

                    .info-value {
                        color: #333;
                    }

                    .section {
                        margin-bottom: 25px;
                        page-break-inside: avoid;
                    }

                    .section-title {
                        background: #005EA2;
                        color: white;
                        padding: 8px 12px;
                        margin: 0;
                        font-size: 14px;
                        border-radius: 3px;
                    }

                    .consultation-item {
                        border-left: 3px solid #005EA2;
                        padding: 10px 0 10px 15px;
                        margin: 15px 0;
                    }

                    .consultation-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }

                    .consultation-type {
                        font-weight: bold;
                        color: #005EA2;
                    }

                    .consultation-date {
                        color: #666;
                        font-size: 11px;
                    }

                    .consultation-details {
                        margin: 5px 0;
                    }

                    .detail-label {
                        font-weight: bold;
                        color: #333;
                    }

                    .prescription-item {
                        background: #f8f9fa;
                        padding: 10px;
                        margin: 10px 0;
                        border-radius: 3px;
                        border-left: 3px solid #00A859;
                    }

                    .exame-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px;
                        margin: 5px 0;
                        border: 1px solid #ddd;
                        border-radius: 3px;
                    }

                    .exame-status {
                        padding: 2px 8px;
                        border-radius: 10px;
                        font-size: 10px;
                        font-weight: bold;
                    }

                    .status-concluido {
                        background: #d4edda;
                        color: #155724;
                    }

                    .status-solicitado {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .alergia-item {
                        background: #f8d7da;
                        padding: 8px;
                        margin: 5px 0;
                        border-radius: 3px;
                        border-left: 3px solid #dc3545;
                    }

                    .alergia-substance {
                        font-weight: bold;
                        color: #721c24;
                    }

                    .footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 10px;
                    }

                    .professional-signature {
                        margin-top: 40px;
                        text-align: center;
                    }

                    .signature-line {
                        border-top: 1px solid #333;
                        width: 300px;
                        margin: 40px auto 10px;
                    }

                    @media print {
                        body {
                            padding: 15px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>PRONTUÁRIO MÉDICO</h1>
                    <div class="subtitle">Sistema UBS - Unidade Básica de Saúde</div>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                        <div>Emitido em: ${currentDate} às ${currentTime}</div>
                        <div>Página: 1/1</div>
                    </div>
                </div>

                <div class="patient-info">
                    <div class="info-group">
                        <div class="info-label">NOME COMPLETO</div>
                        <div class="info-value">${this.patientData.nome}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">IDADE</div>
                        <div class="info-value">${this.patientData.idade}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">CPF</div>
                        <div class="info-value">${this.patientData.cpf}</div>
                    </div>
                    <div class="info-group">
                        <div class="info-label">TELEFONE</div>
                        <div class="info-value">${this.patientData.telefone}</div>
                    </div>
                </div>

                <!-- Histórico de Consultas -->
                <div class="section">
                    <h2 class="section-title">HISTÓRICO DE CONSULTAS</h2>
                    ${this.patientData.historico.map(consulta => `
                        <div class="consultation-item">
                            <div class="consultation-header">
                                <span class="consultation-type">${consulta.tipo}</span>
                                <span class="consultation-date">${consulta.data}</span>
                            </div>
                            <div class="consultation-details">
                                <div><span class="detail-label">Diagnóstico:</span> ${consulta.diagnostico}</div>
                                <div><span class="detail-label">Conduta:</span> ${consulta.conduta}</div>
                            </div>
                            <div style="font-size: 10px; color: #666; margin-top: 5px;">
                                Profissional: ${consulta.profissional}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Prescrições -->
                <div class="section">
                    <h2 class="section-title">PRESCRIÇÕES MÉDICAS</h2>
                    ${this.patientData.prescricoes.map(prescricao => `
                        <div class="prescription-item">
                            <div style="display: flex; justify-content: space-between;">
                                <strong>${prescricao.medicamento}</strong>
                                <span>${prescricao.data}</span>
                            </div>
                            <div style="margin-top: 5px;">
                                <strong>Posologia:</strong> ${prescricao.dosagem}
                            </div>
                            <div>
                                <strong>Duração:</strong> ${prescricao.duracao}
                            </div>
                            <div style="font-size: 10px; color: #666; margin-top: 3px;">
                                Prescrito por: ${prescricao.profissional}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Exames -->
                <div class="section">
                    <h2 class="section-title">EXAMES SOLICITADOS</h2>
                    ${this.patientData.exames.map(exame => `
                        <div class="exame-item">
                            <div>
                                <strong>${exame.tipo}</strong>
                                <div style="font-size: 11px; color: #666;">${exame.resultado}</div>
                            </div>
                            <div class="exame-status ${exame.status === 'Concluído' ? 'status-concluido' : 'status-solicitado'}">
                                ${exame.status}
                            </div>
                            <div style="font-size: 11px; color: #666;">${exame.data}</div>
                        </div>
                    `).join('')}
                </div>

                <!-- Alergias -->
                <div class="section">
                    <h2 class="section-title">ALERGIAS E REAÇÕES ADVERSAS</h2>
                    ${this.patientData.alergias.map(alergia => `
                        <div class="alergia-item">
                            <div class="alergia-substance">${alergia.substancia}</div>
                            <div style="font-size: 11px;">
                                <strong>Tipo:</strong> ${alergia.tipo} |
                                <strong>Gravidade:</strong> ${alergia.gravidade}
                            </div>
                            <div style="font-size: 11px; margin-top: 3px;">
                                <strong>Observações:</strong> ${alergia.observacao}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="professional-signature">
                    <div class="signature-line"></div>
                    <div style="margin-top: 5px;">
                        ${this.patientData.historico[0] ? this.patientData.historico[0].profissional : 'Profissional de Saúde'}
                    </div>
                    <div style="font-size: 10px; color: #666;">
                        CRM: ${this.getCurrentProfessionalCRM()}
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Documento gerado automaticamente pelo Sistema UBS</strong></p>
                    <p>Este é um documento confidencial. O sigilo das informações aqui contidas é garantido por lei.</p>
                    <p>Data de emissão: ${currentDate} - Hora: ${currentTime}</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    getCurrentProfessionalCRM() {
        // Em sistema real, pegaria do usuário logado
        try {
            const currentUser = JSON.parse(localStorage.getItem('ubs_current_user') || '{}');
            return currentUser.crm || 'CRM-PI 123456';
        } catch (error) {
            return 'CRM-PI 123456';
        }
    }
}

// Inicializar prontuário
let medicalRecord;
document.addEventListener('DOMContentLoaded', () => {
    medicalRecord = new MedicalRecord();
});