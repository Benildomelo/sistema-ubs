class UsersDB {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('ubs_users')) || [];
        this.initializeDefaultUsers();
        // REMOVIDO: Não inicializa consultas de exemplo
    }

    initializeDefaultUsers() {
        if (this.users.length === 0) {
            const defaultUsers = [
                {
                    id: 1,
                    email: "paciente@teste.com",
                    cpf: "123.456.789-00",
                    password: "123456",
                    type: "paciente",
                    name: "Maria Silva",
                    firstName: "Maria",
                    phone: "(11) 99999-9999",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    email: "profissional@teste.com",
                    cpf: "987.654.321-00",
                    password: "123456",
                    type: "profissional",
                    name: "Dr. Carlos Souza",
                    firstName: "Carlos",
                    phone: "(11) 88888-8888",
                    crm: "SP-12345",
                    especialidade: "Clínico Geral",
                    createdAt: new Date().toISOString()
                }
            ];

            this.users = defaultUsers;
            this.saveToLocalStorage();
        }
    }

    // REMOVIDO: Método initializeSampleAppointments completamente

    saveToLocalStorage() {
        localStorage.setItem('ubs_users', JSON.stringify(this.users));
    }

    findUserByEmailOrCPF(identifier) {
        const cleanIdentifier = identifier.toLowerCase().trim();
        return this.users.find(user =>
            user.email.toLowerCase() === cleanIdentifier ||
            user.cpf === this.formatCPF(identifier) ||
            user.cpf.replace(/\D/g, '') === identifier.replace(/\D/g, '')
        );
    }

    findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    findUserByCPF(cpf) {
        return this.users.find(user => user.cpf === this.formatCPF(cpf));
    }

    addUser(user) {
        if (this.findUserByEmail(user.email)) {
            throw new Error('Já existe um usuário com este e-mail');
        }

        if (this.findUserByCPF(user.cpf)) {
            throw new Error('Já existe um usuário com este CPF');
        }

        user.id = this.generateId();
        user.cpf = this.formatCPF(user.cpf);

        // Processa o nome
        if (user.nome) {
            user.name = user.nome;
            user.firstName = user.nome.split(' ')[0] || '';
        }

        user.createdAt = new Date().toISOString();

        this.users.push(user);
        this.saveToLocalStorage();
        return user;
    }

    addMedicalProfessional(userData, professionalData) {
        if (this.findUserByEmail(userData.email)) {
            throw new Error('Já existe um usuário com este e-mail');
        }

        if (this.findUserByCPF(userData.cpf)) {
            throw new Error('Já existe um usuário com este CPF');
        }

        if (this.findProfessionalByCRM(professionalData.crm)) {
            throw new Error('Já existe um profissional com este CRM');
        }

        const user = {
            ...userData,
            id: this.generateId(),
            cpf: this.formatCPF(userData.cpf),
            type: "profissional",
            ...professionalData,
            createdAt: new Date().toISOString()
        };

        // Processa o nome
        if (user.nome) {
            user.name = user.nome;
            user.firstName = user.nome.split(' ')[0] || '';
        }

        this.users.push(user);
        this.saveToLocalStorage();
        this.saveMedicalProfessional(user);

        return user;
    }

    findProfessionalByCRM(crm) {
        return this.users.find(user =>
            user.type === 'profissional' && user.crm && user.crm.toLowerCase() === crm.toLowerCase()
        );
    }

    saveMedicalProfessional(medico) {
        let medicos = JSON.parse(localStorage.getItem('ubs_medicos')) || [];

        const exists = medicos.find(m => m.crm.toLowerCase() === medico.crm.toLowerCase());
        if (!exists) {
            const medicoData = {
                id: medico.id,
                nome: medico.name,
                crm: medico.crm,
                especialidade: medico.especialidade,
                dataCadastro: medico.createdAt,
                userId: medico.id
            };

            medicos.push(medicoData);
            localStorage.setItem('ubs_medicos', JSON.stringify(medicos));
        }
    }

    generateId() {
        return this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    }

    formatCPF(cpf) {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf;

        return cleaned.replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d)/, '($1) $2')
                         .replace(/(\d{5})(\d)/, '$1-$2');
        }
        return phone;
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    validatePassword(password) {
        return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    }

    validateCRM(crm) {
        const crmRegex = /^[A-Z]{2}-?\d{4,6}$/i;
        return crmRegex.test(crm);
    }

    getUserAppointments(userId) {
        const appointments = JSON.parse(localStorage.getItem('ubs_appointments')) || [];
        return appointments.filter(appt => appt.userId === userId);
    }

    getUserNextAppointment(userId) {
        const appointments = this.getUserAppointments(userId);
        const now = new Date();

        const futureAppointments = appointments
            .filter(appt => new Date(appt.date + ' ' + appt.time) > now)
            .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        return futureAppointments.length > 0 ? futureAppointments[0] : null;
    }

    createAppointment(appointmentData) {
        const appointments = JSON.parse(localStorage.getItem('ubs_appointments')) || [];

        const appointment = {
            id: this.generateAppointmentId(),
            ...appointmentData,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        appointments.push(appointment);
        localStorage.setItem('ubs_appointments', JSON.stringify(appointments));
        return appointment;
    }

    generateAppointmentId() {
        const appointments = JSON.parse(localStorage.getItem('ubs_appointments')) || [];
        return appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    }

    getAllUsers() {
        return this.users;
    }
}

const usersDB = new UsersDB();