class FormValidation {
    constructor() {
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.initializeMasks();
    }

    initializeEventListeners() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
        }

        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', this.togglePasswordVisibility.bind(this));
        });

        this.initializeRealTimeValidation();
    }

    initializeMasks() {
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', this.maskCPF.bind(this));
        }

        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', this.maskPhone.bind(this));
        }
    }

    initializeRealTimeValidation() {
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', this.validatePasswordStrength.bind(this));
        }

        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', this.validatePasswordMatch.bind(this));
        }
    }

    maskCPF(event) {
        let value = event.target.value.replace(/\D/g, '');

        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d)/, '$1.$2')
                        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        event.target.value = value;
    }

    maskPhone(event) {
        let value = event.target.value.replace(/\D/g, '');

        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2')
                        .replace(/(\d{5})(\d)/, '$1-$2');
        }

        event.target.value = value;
    }

    togglePasswordVisibility(event) {
        const button = event.currentTarget;
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('.material-symbols-outlined');

        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            icon.textContent = 'visibility';
        }
    }

    validatePasswordStrength() {
        const password = document.getElementById('signupPassword').value;
        const isValid = usersDB.validatePassword(password);

        this.toggleFieldValidation('signupPassword', isValid,
            isValid ? 'Senha forte' : 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números');

        return isValid;
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const isValid = password === confirmPassword && password !== '';

        this.toggleFieldValidation('confirmPassword', isValid,
            isValid ? 'Senhas coincidem' : 'As senhas não coincidem');

        return isValid;
    }

    validateCPF(cpf) {
        return usersDB.validateCPF(cpf);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    toggleFieldValidation(fieldId, isValid, message = '') {
        const field = document.getElementById(fieldId);
        const existingMessage = document.getElementById(`${fieldId}-message`);

        if (existingMessage) {
            existingMessage.remove();
        }

        field.classList.remove('border-red-500', 'border-green-500');

        if (field.value.trim() !== '') {
            if (isValid) {
                field.classList.add('border-green-500');
            } else {
                field.classList.add('border-red-500');
            }

            if (message) {
                const messageDiv = document.createElement('div');
                messageDiv.id = `${fieldId}-message`;
                messageDiv.className = `mt-1 text-xs ${
                    isValid ? 'text-green-600' : 'text-red-600'
                }`;
                messageDiv.textContent = message;

                field.parentNode.appendChild(messageDiv);
            }
        }
    }

    handleSignup(event) {
        event.preventDefault();

        const formData = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('signupEmail').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('signupPassword').value,
            type: "paciente",
            terms: document.getElementById('terms').checked
        };

        if (!this.validateForm(formData)) {
            return;
        }

        try {
            const newUser = usersDB.addUser(formData);
            this.showMessage('Cadastro realizado com sucesso! Redirecionando para login...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    validateForm(formData) {
        if (!formData.nome || formData.nome.length < 2) {
            this.showMessage('Por favor, digite seu nome (mínimo 2 caracteres)', 'error');
            return false;
        }

        if (!this.validateEmail(formData.email)) {
            this.showMessage('Por favor, digite um e-mail válido', 'error');
            return false;
        }

        if (!this.validateCPF(formData.cpf)) {
            this.showMessage('Por favor, digite um CPF válido', 'error');
            return false;
        }

        if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
            this.showMessage('Por favor, digite um telefone válido', 'error');
            return false;
        }

        if (!usersDB.validatePassword(formData.password)) {
            this.showMessage('A senha deve ter pelo menos 8 caracteres, incluindo letras e números', 'error');
            return false;
        }

        const confirmPassword = document.getElementById('confirmPassword').value;
        if (formData.password !== confirmPassword) {
            this.showMessage('As senhas não coincidem', 'error');
            return false;
        }

        if (!formData.terms) {
            this.showMessage('Você deve aceitar os termos e condições', 'error');
            return false;
        }

        return true;
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message p-4 rounded-lg mb-4 text-center font-medium ${
            type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
            type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
            'bg-blue-100 text-blue-700 border border-blue-300'
        }`;
        messageDiv.textContent = message;

        const form = document.getElementById('signupForm');
        form.parentNode.insertBefore(messageDiv, form);

        if (type !== 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormValidation();
});