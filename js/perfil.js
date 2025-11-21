// perfil.js - VERSÃO CORRIGIDA COM SETA VOLTAR FUNCIONAL
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.initializeEventListeners();
    }

    checkAuthentication() {
        const savedUser = localStorage.getItem('ubs_current_user');
        if (!savedUser) {
            window.location.href = 'index.html';
            return;
        }
        this.currentUser = JSON.parse(savedUser);
        console.log('👤 Usuário carregado:', this.currentUser);
    }

    loadUserData() {
        if (!this.currentUser) return;

        // Atualizar avatar
        this.updateUserAvatar();

        // Atualizar informações do perfil
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userEmail').textContent = this.currentUser.email;
        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('profileCPF').textContent = this.formatCPF(this.currentUser.cpf);
        document.getElementById('profilePhone').textContent = this.formatPhone(this.currentUser.phone);

        // Carregar estatísticas
        this.loadUserStats();
    }

    updateUserAvatar() {
        const avatarElement = document.getElementById('userAvatar');
        if (!avatarElement) return;

        const avatar = this.generateAvatar(this.currentUser.name);
        avatarElement.innerHTML = '';
        avatarElement.style.backgroundColor = avatar.color.background;
        avatarElement.style.color = avatar.color.text;
        avatarElement.textContent = avatar.initials;
    }

    generateAvatar(name) {
        const names = name.split(' ');
        let initials = '';

        if (names.length === 1) {
            initials = names[0].charAt(0).toUpperCase();
        } else {
            initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }

        const colors = [
            { background: '#2A75A5', text: '#FFFFFF' },
            { background: '#00A859', text: '#FFFFFF' },
            { background: '#FF6B35', text: '#FFFFFF' },
            { background: '#6A4C93', text: '#FFFFFF' },
            { background: '#1982C4', text: '#FFFFFF' },
            { background: '#8AC926', text: '#FFFFFF' },
            { background: '#FF595E', text: '#FFFFFF' },
            { background: '#6A0572', text: '#FFFFFF' },
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIndex = Math.abs(hash) % colors.length;

        return {
            initials: initials,
            color: colors[colorIndex]
        };
    }

    loadUserStats() {
        const appointments = this.getUserAppointments();

        const totalAppointments = document.getElementById('totalAppointments');
        const completedAppointments = document.getElementById('completedAppointments');

        if (totalAppointments) {
            totalAppointments.textContent = appointments.length;
        }

        if (completedAppointments) {
            const completed = appointments.filter(appt => {
                const appointmentDate = new Date(appt.data + 'T' + appt.horario);
                return appointmentDate < new Date() && appt.status === 'concluída';
            }).length;
            completedAppointments.textContent = completed;
        }
    }

    getUserAppointments() {
        try {
            let appointments = JSON.parse(localStorage.getItem('consultasAgendadas')) || [];
            return appointments.filter(appt =>
                appt.paciente && appt.paciente.cpf === this.currentUser.cpf
            );
        } catch (error) {
            console.error('Erro ao carregar consultas:', error);
            return [];
        }
    }

    initializeEventListeners() {
        // CORREÇÃO: Seta voltar para dashboard
        const backButton = document.querySelector('button[onclick*="history.back"]');
        if (backButton) {
            // Remover o onclick antigo
            backButton.removeAttribute('onclick');

            // Adicionar novo event listener
            backButton.addEventListener('click', () => {
                this.goBackToDashboard();
            });
        }

        // Também adicionar via HTML para garantir
        const headerButton = document.querySelector('header button');
        if (headerButton && !headerButton.hasAttribute('data-listener-added')) {
            headerButton.addEventListener('click', () => {
                this.goBackToDashboard();
            });
            headerButton.setAttribute('data-listener-added', 'true');
        }
    }

    goBackToDashboard() {
        console.log('🔙 Voltando para dashboard...');

        // Verificar se é paciente ou profissional
        if (this.currentUser.type === 'profissional') {
            window.location.href = 'dashboard-profissional.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    formatCPF(cpf) {
        if (!cpf) return 'Não informado';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatPhone(phone) {
        if (!phone) return 'Não informado';
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
}

// Funções globais para os botões - CORRIGIDAS
function editProfile() {
    const profileManager = new ProfileManager();
    profileManager.showEditProfileModal();
}

function changePassword() {
    const profileManager = new ProfileManager();
    profileManager.showChangePasswordModal();
}

function logout() {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
        localStorage.removeItem('ubs_current_user');
        window.location.href = 'index.html';
    }
}

// CORREÇÃO: Também adicionar event listener direto no botão de voltar do HTML
document.addEventListener('DOMContentLoaded', function() {
    // Configurar seta voltar
    const backButton = document.querySelector('header button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            const currentUser = JSON.parse(localStorage.getItem('ubs_current_user') || '{}');
            if (currentUser.type === 'profissional') {
                window.location.href = 'dashboard-profissional.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }
});

// Adicionar métodos ao ProfileManager (mantenha o resto do código igual)
ProfileManager.prototype.showEditProfileModal = function() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                        ✏️ Editar Perfil
                    </h3>
                    <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <form id="editProfileForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome Completo
                    </label>
                    <input type="text" id="editName" value="${this.currentUser.name}"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-mail
                    </label>
                    <input type="email" id="editEmail" value="${this.currentUser.email}"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefone
                    </label>
                    <input type="tel" id="editPhone" value="${this.currentUser.phone || ''}"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CPF (não editável)
                    </label>
                    <input type="text" value="${this.formatCPF(this.currentUser.cpf)}"
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        disabled>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">CPF não pode ser alterado</p>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Cancelar
                    </button>
                    <button type="submit" class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Configurar máscara de telefone
    const phoneInput = modal.querySelector('#editPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    }

    // Event listeners para fechar modal
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Submit do formulário
    const form = modal.querySelector('#editProfileForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfileChanges(modal);
    });
};

ProfileManager.prototype.saveProfileChanges = function(modal) {
    const name = modal.querySelector('#editName').value.trim();
    const email = modal.querySelector('#editEmail').value.trim();
    const phone = modal.querySelector('#editPhone').value.replace(/\D/g, '');

    // Validações
    if (!name) {
        alert('Por favor, informe seu nome.');
        return;
    }

    if (!this.validateEmail(email)) {
        alert('Por favor, informe um e-mail válido.');
        return;
    }

    if (phone && phone.length !== 11) {
        alert('Por favor, informe um telefone válido (com DDD).');
        return;
    }

    try {
        // Atualizar usuário atual
        this.currentUser.name = name;
        this.currentUser.email = email;
        this.currentUser.phone = phone;

        // Atualizar no localStorage
        localStorage.setItem('ubs_current_user', JSON.stringify(this.currentUser));

        // Atualizar na lista de usuários (se existir)
        const users = JSON.parse(localStorage.getItem('usuarios')) || [];
        const userIndex = users.findIndex(u => u.cpf === this.currentUser.cpf);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], name, email, phone };
            localStorage.setItem('usuarios', JSON.stringify(users));
        }

        // Atualizar a UI
        this.loadUserData();

        // Fechar modal e mostrar mensagem
        modal.remove();
        this.showMessage('Perfil atualizado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        this.showMessage('Erro ao atualizar perfil. Tente novamente.', 'error');
    }
};

ProfileManager.prototype.showChangePasswordModal = function() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                        🔒 Alterar Senha
                    </h3>
                    <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 close-modal">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <form id="changePasswordForm" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Senha Atual
                    </label>
                    <div class="relative">
                        <input type="password" id="currentPassword"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            required>
                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 toggle-password">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nova Senha
                    </label>
                    <div class="relative">
                        <input type="password" id="newPassword"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            required>
                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 toggle-password">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        A senha deve ter pelo menos 8 caracteres, incluindo letras e números
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nova Senha
                    </label>
                    <div class="relative">
                        <input type="password" id="confirmNewPassword"
                            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            required>
                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 toggle-password">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                        </button>
                    </div>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" class="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors close-modal">
                        Cancelar
                    </button>
                    <button type="submit" class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Alterar Senha
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Toggle password visibility
    modal.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.material-symbols-outlined');

            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    // Event listeners para fechar modal
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Submit do formulário
    const form = modal.querySelector('#changePasswordForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword(modal);
    });
};

ProfileManager.prototype.changePassword = function(modal) {
    const currentPassword = modal.querySelector('#currentPassword').value;
    const newPassword = modal.querySelector('#newPassword').value;
    const confirmNewPassword = modal.querySelector('#confirmNewPassword').value;

    // Validações
    if (!currentPassword) {
        alert('Por favor, informe sua senha atual.');
        return;
    }

    // Verificar senha atual
    if (currentPassword !== this.currentUser.password) {
        alert('Senha atual incorreta.');
        return;
    }

    if (!this.validatePassword(newPassword)) {
        alert('A nova senha deve ter pelo menos 8 caracteres, incluindo letras e números.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('As senhas não coincidem.');
        return;
    }

    if (currentPassword === newPassword) {
        alert('A nova senha deve ser diferente da senha atual.');
        return;
    }

    try {
        // Atualizar senha do usuário atual
        this.currentUser.password = newPassword;

        // Atualizar no localStorage
        localStorage.setItem('ubs_current_user', JSON.stringify(this.currentUser));

        // Atualizar na lista de usuários (se existir)
        const users = JSON.parse(localStorage.getItem('usuarios')) || [];
        const userIndex = users.findIndex(u => u.cpf === this.currentUser.cpf);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('usuarios', JSON.stringify(users));
        }

        // Fechar modal e mostrar mensagem
        modal.remove();
        this.showMessage('Senha alterada com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        this.showMessage('Erro ao alterar senha. Tente novamente.', 'error');
    }
};

ProfileManager.prototype.validateEmail = function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

ProfileManager.prototype.validatePassword = function(password) {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

ProfileManager.prototype.showMessage = function(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 4000);
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});