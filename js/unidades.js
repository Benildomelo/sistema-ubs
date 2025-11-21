// unidades.js - VERSÃO COM BOTÃO VOLTAR CORRIGIDO
class UnitsManager {
    constructor() {
        this.unidades = [];
        this.init();
    }

    init() {
        this.loadUnits();
        this.initializeEventListeners();
        this.renderUnits();
    }

    loadUnits() {
        // Dados reais das UBSs de Teresina - PI
        this.unidades = [
            {
                id: 1,
                nome: "UBS Parque Piauí",
                endereco: "Rua 12, Parque Piauí - Teresina, PI",
                telefone: "(86) 3216-1650",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
                distancia: "2.1 km",
                lat: -5.0921,
                lng: -42.8038
            },
            {
                id: 2,
                nome: "UBS Vila Bandeirante",
                endereco: "Rua São Pedro, Vila Bandeirante - Teresina, PI",
                telefone: "(86) 3216-1651",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "3.5 km",
                lat: -5.0689,
                lng: -42.7972
            },
            {
                id: 3,
                nome: "UBS São Joaquim",
                endereco: "Av. Principal, São Joaquim - Teresina, PI",
                telefone: "(86) 3216-1652",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "4.2 km",
                lat: -5.1156,
                lng: -42.7758
            },
            {
                id: 4,
                nome: "UBS Mocambinho",
                endereco: "Rua 10, Mocambinho - Teresina, PI",
                telefone: "(86) 3216-1653",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
                distancia: "5.8 km",
                lat: -5.0572,
                lng: -42.7669
            },
            {
                id: 5,
                nome: "UBS Buenos Aires",
                endereco: "Rua São José, Buenos Aires - Teresina, PI",
                telefone: "(86) 3216-1654",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "1.8 km",
                lat: -5.0817,
                lng: -42.7894
            },
            {
                id: 6,
                nome: "UBS Poti Velho",
                endereco: "Av. Boa Esperança, Poti Velho - Teresina, PI",
                telefone: "(86) 3216-1655",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "3.2 km",
                lat: -5.0664,
                lng: -42.8111
            },
            {
                id: 7,
                nome: "UBS Santa Maria da Codipe",
                endereco: "Rua Santa Maria, Santa Maria da Codipe - Teresina, PI",
                telefone: "(86) 3216-1656",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "6.1 km",
                lat: -5.1233,
                lng: -42.7556
            },
            {
                id: 8,
                nome: "UBS Parque Sul",
                endereco: "Av. Central, Parque Sul - Teresina, PI",
                telefone: "(86) 3216-1657",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
                distancia: "4.5 km",
                lat: -5.0989,
                lng: -42.7550
            },
            {
                id: 9,
                nome: "UBS Gurupi",
                endereco: "Rua Principal, Gurupi - Teresina, PI",
                telefone: "(86) 3216-1658",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "7.2 km",
                lat: -5.1350,
                lng: -42.7889
            },
            {
                id: 10,
                nome: "UBS Saci",
                endereco: "Rua São Paulo, Saci - Teresina, PI",
                telefone: "(86) 3216-1659",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "2.8 km",
                lat: -5.0711,
                lng: -42.7722
            },
            {
                id: 11,
                nome: "UBS Vila Operária",
                endereco: "Rua da Paz, Vila Operária - Teresina, PI",
                telefone: "(86) 3216-1660",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h | Sábado: 7h às 12h",
                distancia: "1.5 km",
                lat: -5.0883,
                lng: -42.8000
            },
            {
                id: 12,
                nome: "UBS Promorar",
                endereco: "Av. dos Imigrantes, Promorar - Teresina, PI",
                telefone: "(86) 3216-1661",
                horarioFuncionamento: "Segunda a Sexta: 7h às 17h",
                distancia: "5.3 km",
                lat: -5.1056,
                lng: -42.7333
            }
        ];
    }

    initializeEventListeners() {
        // CORREÇÃO DO BOTÃO VOLTAR
        this.setupBackButton();

        // Busca em tempo real
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterUnits(e.target.value);
            });
        }
    }

    setupBackButton() {
        // CORREÇÃO: Buscar o botão de voltar de forma mais específica
        const backButton = document.querySelector('header button');
        if (backButton) {
            console.log('🔍 Botão voltar encontrado, adicionando event listener...');

            // Remover qualquer event listener anterior
            backButton.replaceWith(backButton.cloneNode(true));
            const newBackButton = document.querySelector('header button');

            // Adicionar novo event listener
            newBackButton.addEventListener('click', () => {
                console.log('🔙 Botão voltar clicado!');
                this.goBackToDashboard();
            });

            // Também adicionar via onclick para garantir
            newBackButton.onclick = () => {
                console.log('🔙 Botão voltar clicado (onclick)!');
                this.goBackToDashboard();
            };
        } else {
            console.error('❌ Botão voltar não encontrado no header');
        }
    }

    goBackToDashboard() {
        console.log('🔄 Voltando para dashboard...');
        const currentUser = JSON.parse(localStorage.getItem('ubs_current_user') || '{}');

        if (currentUser.type === 'profissional') {
            window.location.href = 'dashboard-profissional.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    filterUnits(searchTerm) {
        if (!searchTerm) {
            this.renderUnits();
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filteredUnits = this.unidades.filter(unidade =>
            unidade.nome.toLowerCase().includes(term) ||
            unidade.endereco.toLowerCase().includes(term)
        );

        this.renderUnits(filteredUnits);
    }

    renderUnits(unitsToRender = null) {
        const unitsList = document.getElementById('unitsList');
        if (!unitsList) return;

        const units = unitsToRender || this.unidades;

        if (units.length === 0) {
            unitsList.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2">search_off</span>
                    <p class="text-lg font-medium mb-2">Nenhuma unidade encontrada</p>
                    <p class="text-sm">Tente buscar com outros termos</p>
                </div>
            `;
            return;
        }

        unitsList.innerHTML = units.map(unidade => `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-gray-900 dark:text-white">${unidade.nome}</h3>
                    <span class="text-sm text-green-600 font-medium">${unidade.distancia}</span>
                </div>

                <div class="space-y-3 mb-4">
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span class="material-symbols-outlined text-base">location_on</span>
                        <span>${unidade.endereco}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span class="material-symbols-outlined text-base">phone</span>
                        <span>${unidade.telefone}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span class="material-symbols-outlined text-base">schedule</span>
                        <span>${unidade.horarioFuncionamento}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="unitsManager.callUnit('${unidade.telefone}')"
                        class="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <span class="material-symbols-outlined text-base">call</span>
                        Ligar
                    </button>
                    <button onclick="unitsManager.viewOnMap(${unidade.lat}, ${unidade.lng})"
                        class="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <span class="material-symbols-outlined text-base">map</span>
                        Mapa
                    </button>
                </div>
            </div>
        `).join('');
    }

    callUnit(telefone) {
        if (confirm(`Deseja ligar para ${telefone}?`)) {
            window.open(`tel:${telefone}`);
        }
    }

    viewOnMap(lat, lng) {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }
}

// CORREÇÃO: Também adicionar event listener global para garantir
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Unidades...');

    // Inicializar o manager
    window.unitsManager = new UnitsManager();

    // CORREÇÃO EXTRA: Adicionar event listener direto no botão
    const backButton = document.querySelector('header button');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔙 Botão voltar clicado (event listener global)');

            const currentUser = JSON.parse(localStorage.getItem('ubs_current_user') || '{}');
            if (currentUser.type === 'profissional') {
                window.location.href = 'dashboard-profissional.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }
});