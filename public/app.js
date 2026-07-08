// public/app.js

// ---------------------------------------------------------------------------
// 1. CONFIGURATION INITIALE & SÉCURISATION
// ---------------------------------------------------------------------------

// En développement, on utilise une chaîne temporaire ou une variable globale.
// En production, assure-toi de restreindre ce token à ton domaine (ex: https://hu.org) 
// directement dans le tableau de bord Mapbox pour éviter le vol de quota.
const MAPBOX_PUBLIC_TOKEN = 'TON_TOKEN_MAPBOX_PUBLIC'; 
mapboxgl.accessToken = MAPBOX_PUBLIC_TOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11', // Fond sombre pour faire ressortir les émotions
    center: [2.3522, 48.8566], // Centré sur Paris par défaut
    zoom: 2,
    minZoom: 1.5,
    projection: 'globe' // Mode Globe 3D natif
});

// Configuration de l'atmosphère du globe (Effet espace profond)
map.on('style.load', () => {
    map.setFog({
        'color': 'rgb(10, 10, 10)', // Ciel presque noir
        'high-color': 'rgb(30, 20, 30)', // Légère lueur pourpre à l'horizon
        'space-color': 'rgb(0, 0, 0)', // Espace profond
        'star-intensity': 0.3 // Étoiles discrètes
    });
    
    // Une fois le style chargé, on initialise nos couches de données éthiques
    initHumanWeatherLayers();
});

// ---------------------------------------------------------------------------
// 2. LA MÉTÉO HUMAINE (Agrégation & Rendu GeoJSON)
// ---------------------------------------------------------------------------

// Palette de couleurs officielle de hu. (Légère transparence pour l'effet de halo)
const EMOTION_COLORS = {
    'amour': '#FF69B4',
    'joie': '#FFD700',
    'sos': '#FF4444',
    'tristesse': '#4682B4',
    'surprise': '#FF8C00',
    'peur': '#9370DB',
    'degout': '#556B2F',
    'colere': '#B22222'
};

function initHumanWeatherLayers() {
    // Source de données alimentée par ton API mapRoutes.js
    map.addSource('human-weather', {
        type: 'geojson',
        data: '/api/map/emotions', // Ton endpoint existant
        cluster: true, // Active le clustering natif de Mapbox pour fusionner les émotions proches
        clusterMaxZoom: 8,
        clusterRadius: 50 // Rayon de regroupement en pixels
    });

    // COUCHE 1 : Les clusters (Cercles magmatiques représentant l'intensité globale d'une zone)
    map.addLayer({
        id: 'weather-clusters',
        type: 'circle',
        source: 'human-weather',
        filter: ['has', 'point_count'],
        paint: {
            // Le cercle grandit et change de couleur selon le nombre d'émotions regroupées
            'circle-color': [
                'step', ['get', 'point_count'],
                'rgba(255, 255, 255, 0.15)', 10,  // Calme
                'rgba(255, 215, 0, 0.25)', 50,    // Intensité moyenne
                'rgba(255, 68, 68, 0.4)'          // Forte effervescence ou SOS
            ],
            'circle-radius': [
                'step', ['get', 'point_count'],
                20, 10, 30, 50, 45
            ],
            'circle-blur': 0.6 // Flou éthique pour ne pas marquer de frontière nette
        }
    });

    // COUCHE 2 : Le texte du compteur sur les clusters
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'human-weather',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff'
        }
    });

    // COUCHE 3 : Les points individuels (Quand on zoom assez pour détacher les émotions)
    map.addLayer({
        id: 'unclustered-emotions',
        type: 'circle',
        source: 'human-weather',
        filter: ['!', ['has', 'point_count']],
        paint: {
            // La couleur s'adapte dynamiquement selon la propriété "emotion" du GeoJSON
            'circle-color': [
                'match', ['get', 'emotion'],
                'amour', EMOTION_COLORS['amour'],
                'joie', EMOTION_COLORS['joie'],
                'sos', EMOTION_COLORS['sos'],
                'tristesse', EMOTION_COLORS['tristesse'],
                'surprise', EMOTION_COLORS['surprise'],
                'peur', EMOTION_COLORS['peur'],
                'degout', EMOTION_COLORS['degout'],
                'colere', EMOTION_COLORS['colere'],
                '#FFFFFF' // Par défaut
            ],
            'circle-radius': 8,
            'circle-blur': 0.2
        }
    });

    // Rafraîchissement cyclique de la météo (toutes les 30 secondes)
    setInterval(() => {
        const source = map.getSource('human-weather');
        if (source) source.setData('/api/map/emotions');
    }, 30000);
}

// ---------------------------------------------------------------------------
// 3. FLUX TEMPS RÉEL (Le canal Socket.io pour les pulsations en direct)
// ---------------------------------------------------------------------------

const userToken = localStorage.getItem('hu_token');
const socket = io({ auth: { token: userToken } });

socket.on('connect_error', (err) => {
    console.warn("Mode Spectateur (Lecture seule) :", err.message);
    document.getElementById('map').classList.add('world-blur');
    document.getElementById('ritual-banner').classList.remove('hidden');
});

socket.on('world-pulse', (emotionData) => {
    // Création d'une pulsation HTML/CSS éphémère
    const el = document.createElement('div');
    el.className = 'emotion-pulse-ring';
    
    const color = EMOTION_COLORS[emotionData.type] || '#FFFFFF';
    el.style.borderColor = color;
    el.style.boxShadow = `0 0 20px ${color}, inset 0 0 20px ${color}`;

    // Injection du marqueur temporaire sur le Globe
    const marker = new mapboxgl.Marker(el)
        .setLngLat([emotionData.lng, emotionData.lat])
        .addTo(map);

    // Disparition douce et suppression physique du DOM après 4 secondes
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => marker.remove(), 1000);
    }, 3000);
});

// ---------------------------------------------------------------------------
// 4. LOGIQUE D'INTERACTION & FLUX D'HUMANITÉ
// ---------------------------------------------------------------------------

function toggleHumanFlow() {
    const btn = document.getElementById('btn-human-flow');
    const isFlowActive = document.body.classList.toggle('flow-mode-active');

    if (isFlowActive) {
        btn.innerHTML = '🌍 Retour au Globe';
        // Effet Cinématique : Plongée vers un point chaud (Exemple Paris) avec inclinaison de caméra
        map.flyTo({
            center: [2.3522, 48.8566],
            zoom: 12,
            pitch: 55, // Effet 3D incliné
            bearing: -10, // Légère rotation de boussole
            duration: 4000, // Voyage fluide de 4 secondes
            essential: true
        });
    } else {
        btn.innerHTML = '🎬 Flux d\'Humanité';
        // Dézoom et retour à la sérénité du globe spatial
        map.flyTo({
            center: [2.3522, 48.8566],
            zoom: 2,
            pitch: 0,
            bearing: 0,
            duration: 3000,
            essential: true
        });
    }
}
