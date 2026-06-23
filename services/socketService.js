const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Stockage en mémoire pour limiter le spam par WebSocket (Rate Limiting maison)
const rateLimits = new Map();

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // MIDDLEWARE DE CONNEXION WEBSOCKET (Le Handshake)
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Accès refusé. Connexion anonyme interdite sur le canal temps réel."));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // On sait exactement qui est au bout du fil
            next();
        } catch (err) {
            return next(new Error("Token invalide."));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Sécurité] Gardien connecté via tunnel sécurisé : ${socket.user.id}`);

        socket.on('send-emotion', (data) => {
            // ANTI-SPAM : Limite à 1 émotion toutes les 10 secondes max
            const now = Date.now();
            const lastEmission = rateLimits.get(socket.user.id) || 0;

            if (now - lastEmission < 10000) {
                return socket.emit('error', { message: "Veuillez respirer. Vous envoyez des ondes trop rapidement." });
            }
            
            rateLimits.set(socket.user.id, now);

            // Validation stricte des données entrantes (Sanitization)
            if (!data.lat || !data.lng || !data.type) {
                return socket.emit('error', { message: "Données corrompues." });
            }

            // On diffuse l'émotion de manière anonyme au reste du monde
            // Personne ne saura que c'est "socket.user.id" qui a envoyé ça.
            socket.broadcast.emit('world-pulse', {
                type: data.type,
                lat: data.lat, // En prod, ces coordonnées doivent déjà avoir subi le Fuzzing (obfuscation)
                lng: data.lng
            });
        });

        socket.on('disconnect', () => {
            rateLimits.delete(socket.user.id); // Nettoyage de la mémoire
        });
    });
};

const broadcastEmotion = (data) => {
    if (io) {
        io.emit('world-pulse', data);
    }
};

module.exports = { initSocket, broadcastEmotion };
