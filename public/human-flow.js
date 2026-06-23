JavaScript
function toggleHumanFlow() {
    const btn = document.getElementById('btn-human-flow');
    const isFlowActive = document.body.classList.toggle('flow-mode-active');
    
    if (isFlowActive) {
        // Logique de lecture vidéo type TikTok
        btn.innerHTML = '🌍 Retour au Globe';
        // Exemple : flyTo sur Paris pour simuler la géoloc de la vidéo en cours
        if(typeof map !== 'undefined') {
            map.flyTo({ center: [2.3522, 48.8566], zoom: 6, pitch: 45 });
        }
    } else {
        btn.innerHTML = '🎬 Flux d\'Humanité';
        if(typeof map !== 'undefined') {
            map.flyTo({ center: [2.3522, 48.8566], zoom: 2, pitch: 0 });
        }
    }
}
