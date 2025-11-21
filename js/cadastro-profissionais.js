class ProfessionalRegistration {
    constructor() {
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadSpecialties();
    }

    initializeEventListeners() {
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', this.handleProfessionalSignup.bind(this));
        }

        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', this.togglePasswordVisibility.bind(this));
        });

        this.initializeRealTimeValidation();
    }

    initializeRealTimeValidation() {
        const crmInput = document.getElementById('crm');
        if (crmInput) {
            crmInput.addEventListener('input', this.validateCRM.bind(this));
        }

        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', this.validatePasswordStrength.bind(this));
        }

        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', this.validatePasswordMatch.bind(this));
        }
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

    validateCRM() {
        const crm = document.getElementById('crm').value.trim();
        const isValid = usersDB.validateCRM(crm);

        this.toggleFieldValidation('crm', isValid,
            isValid ? 'CRM válido' : 'Formato inválido (ex: SP-12345)');

        return isValid;
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

    toggleFieldValidation(fieldId, isValid, message = '') {
        const field = document.getElementById(fieldId);
        const existingMessage = document.getElementById(`${fieldId}-message`);

        if (existingMessage) {
            existingMessage.remove();
        }

        field.classList.remove('border-red-500', 'border-green-500', 'border-ubs-gray-border');

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
        } else {
            field.classList.add('border-ubs-gray-border');
        }
    }

    loadSpecialties() {
        const specialtySelect = document.getElementById('especialidade');
        if (specialtySelect) {
            const specialties = JSON.parse(localStorage.getItem('ubs_especialidades')) || [
                'Clínico Geral', 'Pediatria', 'Ginecologia', 'Cardiologia', 'Odontologia',
                'Oftalmologia', 'Dermatologia', 'Ortopedia', 'Psiquiatria', 'Endocrinologia'
            ];

            while (specialtySelect.options.length > 1) {
                specialtySelect.remove(1);
            }

            specialties.forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty;
                option.textContent = specialty;
                specialtySelect.appendChild(option);
            });
        }
    }

    handleProfessionalSignup(event) {
        event.preventDefault();

        const formData = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('signupEmail').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('signupPassword').value,
            terms: document.getElementById('terms').checked
        };

        const professionalData = {
            crm: document.getElementById('crm').value.trim(),
            especialidade: document.getElementById('especialidade').value
        };

        if (!this.validateForm(formData, professionalData)) {
            return;
        }

        try {
            const newProfessional = usersDB.addMedicalProfessional(formData, professionalData);
            this.showMessage('Profissional cadastrado com sucesso! Redirecionando para login...', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    validateForm(formData, professionalData) {
        if (!formData.nome || formData.nome.length < 2) {
            this.showMessage('Por favor, digite seu nome (mínimo 2 caracteres)', 'error');
            return false;
        }

        if (!this.validateEmail(formData.email)) {
            this.showMessage('Por favor, digite um e-mail válido', 'error');
            return false;
        }

        if (!usersDB.validateCPF(formData.cpf)) {
            this.showMessage('Por favor, digite um CPF válido', 'error');
            return false;
        }

        if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
            this.showMessage('Por favor, digite um telefone válido', 'error');
            return false;
        }

        if (!usersDB.validateCRM(professionalData.crm)) {
            this.showMessage('Por favor, digite um CRM válido (ex: SP-12345)', 'error');
            return false;
        }

        if (!professionalData.especialidade) {
            this.showMessage('Por favor, selecione uma especialidade', 'error');
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

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
    new ProfessionalRegistration();
});