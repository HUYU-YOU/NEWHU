// Configuration sécurisée : Le token Mapbox public (Restreint aux URLs de ton domaine dans la console Mapbox)
mapboxgl.accessToken = 'TON_TOKEN_MAPBOX_PUBLIC';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11', // Un style sombre met en valeur les points lumineux
    center: [2.3522, 48.8566], // Paris par défaut
    zoom: 2,
    projection: 'globe' // Vue globe 3D
});

// Brouillard atmosphérique
map.on('style.load', () => {
    map.setFog({
        'color': 'rgb(5, 5, 5)', // Ciel noir
        'high-color': 'rgb(20, 20, 20)',
        'space-color': 'rgb(0, 0, 0)',
        'star-intensity': 0.2
    });
});

// Connexion WebSocket (Le token JWT est envoyé lors du Handshake)
const userToken = localStorage.getItem('hu_token'); // À remplacer par un système de session sécurisé
const socket = io({
    auth: { token: userToken }
});

socket.on('connect_error', (err) => {
    console.warn("Mode Spectateur :", err.message);
    document.getElementById('map').classList.add('world-blur');
    document.getElementById('ritual-banner').classList.remove('hidden');
});

// Écoute de la pulsation mondiale (Live)
socket.on('world-pulse', (emotionData) => {
    // Création d'un élément visuel (Marker lumineux)
    const el = document.createElement('div');
    el.className = 'emotion-pulse';
    el.style.width = '15px';
    el.style.height = '15px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = getEmotionColor(emotionData.type);
    el.style.boxShadow = `0 0 10px ${getEmotionColor(emotionData.type)}`;

    new mapboxgl.Marker(el)
        .setLngLat([emotionData.lng, emotionData.lat])
        .addTo(map);

    // Disparition douce après quelques secondes (éphémère)
    setTimeout(() => el.remove(), 5000);
});

// Outil de correspondance des couleurs
function getEmotionColor(type) {
    const colors = {
        'amour': '#FF69B4',
        'joie': '#FFD700',
        'sos': '#FF0000',
        'tristesse': '#4682B4'
    };
    return colors[type] || '#FFFFFF';
}

function openRitualWheel() {
    console.log("Ouverture du Vecteur des 8...");
    // Logique d'affichage Canvas ici
}

function toggleHumanFlow() {
    console.log("Basculement vers le Flux d'Humanité...");
    // Logique FlyTo Mapbox et affichage vidéo ici
}
