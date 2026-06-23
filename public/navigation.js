

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const fabUpload = document.getElementById('fab-upload');

    // Gestion du clic sur la navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = item.getAttribute('data-target');
            
            // Actions publiques
            if (target === 'globe' || target === 'flow') {
                switchView(target);
            } 
            // Actions restreintes
            else {
                e.preventDefault();
                checkAccess(() => switchView(target));
            }
        });
    });

    // Gestion de l'upload
    fabUpload.addEventListener('click', () => {
        checkAccess(() => openUploadStudio());
    });
});

/**
 * Vérifie si l'utilisateur est connecté avant d'autoriser l'action
 */
function checkAccess(callback) {
    const token = localStorage.getItem('hu_token');
    
    if (!token) {
        console.log("[AuthGuard] Accès refusé - Utilisateur non connecté");
        showAuthModal(); // Affiche la modale de connexion/inscription
    } else {
        // Optionnel : On pourrait vérifier ici si le token est expiré
        callback();
    }
}

/**
 * Affiche la modale d'authentification (incluant le consentement)
 */
function showAuthModal() {
    // Si la modale de consentement n'est pas déjà dans le DOM, on peut la charger
    // Ici on suppose que le bloc 3 est caché par défaut dans l'index.html
    const modal = document.getElementById('consent-overlay');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('fade-in');
    } else {
        alert("Veuillez vous connecter pour agir sur le monde.");
        // Redirection vers login.html si tu as une page dédiée
    }
}

/**
 * Change de vue (Switch entre Globe, Flux, Profil, etc.)
 */
function switchView(viewName) {
    console.log(`Changement de vue vers : ${viewName}`);
    // Logique de masquage/affichage des conteneurs HTML
}
