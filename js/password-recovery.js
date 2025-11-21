// Placeholder para recuperação de senha
class PasswordRecovery {
    constructor() {
        this.init();
    }

    init() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const recoveryForm = document.getElementById('recoveryForm');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', this.handleRecovery.bind(this));
        }
    }

    handleRecovery(event) {
        event.preventDefault();
        const email = document.getElementById('recoveryEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, digite um e-mail válido', 'error');
            return;
        }

        // Simulação de envio de e-mail
        this.showMessage('Instruções de recuperação enviadas para seu e-mail', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.recovery-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `recovery-message p-4 rounded-lg mb-4 text-center font-medium ${
            type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
            type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
            'bg-blue-100 text-blue-700 border border-blue-300'
        }`;
        messageDiv.textContent = message;

        const form = document.getElementById('recoveryForm');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PasswordRecovery();
});