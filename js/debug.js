// js/debug.js - VERSÃO LIMPA (apenas para desenvolvimento)
function debugAuth() {
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        console.log('=== DEBUG AUTH ===');

        const users = JSON.parse(localStorage.getItem('ubs_users')) || [];
        console.log('Usuários no sistema:', users);

        const currentUser = JSON.parse(localStorage.getItem('ubs_current_user'));
        console.log('Usuário atual:', currentUser);

        console.log('=== FIM DEBUG ===');
    }
}

// Só executa em ambiente de desenvolvimento
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se está em localhost (desenvolvimento)
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        debugAuth();

        // Opcional: Adiciona atalho de teclado para debug (Ctrl+Shift+D)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                debugAuth();
            }
        });

        console.log('Debug ativo - Use Ctrl+Shift+D para debug');
    }
});