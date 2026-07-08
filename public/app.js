// public/app.js

mapboxgl.accessToken = 'pk.eyJ1IjoiaHV0dWUiLCJhIjoiY21lMzJweGNjMDJoYzJpc2N4NmtsaHc3MSJ9.Vi0caQlHvHpWRlp8LOM6fw';

// Nos styles prédéfinis
const MAP_STYLES = {
    mystic: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9'
};

let currentStyle = 'mystic';

const map = new mapboxgl.Map({
    container: 'map',
    style: MAP_STYLES[currentStyle],
    center: [2.3522, 48.8566],
    zoom: 2,
    minZoom: 1.5,
    projection: 'globe'
});

// Cette fonction configure l'environnement à chaque fois qu'un style est chargé
map.on('style.load', () => {
    setupEnvironment();
    // On remet nos couches d'émotions après le changement de style
    if (typeof initHumanWeatherLayers === 'function') {
        initHumanWeatherLayers();
    }
});

function setupEnvironment() {
    if (currentStyle === 'mystic') {
        // --- 1. MODE COSMOS (Sans frontières, nuit mystique) ---
        map.setFog({
            'color': 'rgba(5, 10, 20, 0.9)',
            'high-color': 'rgba(40, 50, 70, 0.5)',
            'space-color': '#000000',
            'star-intensity': 0.8
        });

        // Suppression éthique des frontières et des textes
        const layers = map.getStyle().layers;
        for (const layer of layers) {
            if (layer.type === 'symbol' || layer.id.includes('boundary') || layer.id.includes('road')) {
                map.removeLayer(layer.id);
            }
        }
    } else if (currentStyle === 'satellite') {
        // --- 2. MODE RÉALITÉ & TEMPS RÉEL (Satellite + Cycle Jour/Nuit de Mapbox) ---
        // Mapbox calcule automatiquement la position du soleil en fonction de l'heure locale de la zone !
        map.setFog({
            'color': 'rgba(255, 255, 255, 0)', // Transparend pour laisser passer la lumière du soleil
            'high-color': 'rgba(255, 255, 255, 0)',
            'space-color': '#000000',
            'star-intensity': 0.5
        });
        
        // Activation de la lumière dynamique (Jour/Nuit réel)
        map.setConfigProperty('basemap', 'lightPreset', 'dawn'); // Optionnel si tu utilises les nouveaux styles standard v3, sinon Mapbox gère l'ombre satellite de base sur le globe.
    }

    // Activation du relief 3D pour tous les modes (magnifique en satellite)
    if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
    }
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
}

// Fonction appelée par les boutons HTML pour basculer
function switchMapStyle(styleKey) {
    if (styleKey === currentStyle) return;
    
    currentStyle = styleKey;
    
    // Mise à jour visuelle des boutons
    document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
    if (styleKey === 'mystic') document.getElementById('btn-mystic').classList.add('active');
    if (styleKey === 'satellite') document.getElementById('id-satellite').classList.add('active');

    // Changement effectif du style
    map.setStyle(MAP_STYLES[styleKey]);
}
