module.exports = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#005EA2",
                "background-light": "#FFFFFF",
                "background-dark": "#101622",
                "card-light": "#F0F0F0",
                "card-dark": "#1E293B",
                "text-primary-light": "#333333",
                "text-primary-dark": "#F0F2F5",
                "text-secondary-light": "#555555",
                "text-secondary-dark": "#94A3B8",
                "success": "#2E7D32",
                "warning": "#FFC107",
                "ubs-blue": "#2A75A5",
                "ubs-green": "#00A859",
                "ubs-gray-text": "#333333",
                "ubs-gray-placeholder": "#AAAAAA",
                "ubs-gray-border": "#DDDDDD",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}