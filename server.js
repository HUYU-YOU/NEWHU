
require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Importation de la configuration de la base de données
const { sequelize } = require('./config/database');

// Importation des services (Temps réel et Tâches de fond)
const { initSocket } = require('./services/socketService');
require('./services/cleanupService'); // Initialise le Cron Job de l'oubli éthique (24h)

// Initialisation de l'application
const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// MIDDLEWARES DE SÉCURITÉ
// ---------------------------------------------------------------------------

// Helmet : Protège l'application de certaines vulnérabilités web bien connues en configurant les en-têtes HTTP de manière appropriée.
app.use(helmet());

// CORS : Restreint l'accès à l'API uniquement au domaine autorisé (ex: ton frontend).
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Parsing JSON : Limite stricte de la taille du payload à 1 Mo pour éviter les saturations mémoire.
app.use(express.json({ limit: '1mb' }));

// Rate Limiting : Limite le nombre de requêtes pour prévenir les attaques par force brute ou le spam.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: { error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard pour préserver la sérénité du réseau." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Appliquer la limite sur toutes les routes API
app.use('/api/', apiLimiter);

// ---------------------------------------------------------------------------
// INITIALISATION DES WEBSOCKETS (TEMPS RÉEL)
// ---------------------------------------------------------------------------
initSocket(server);

// ---------------------------------------------------------------------------
// MONTAGE DES ROUTES (À créer dans les prochaines étapes)
// ---------------------------------------------------------------------------
// const authRoutes = require('./routes/authRoutes');
// const mapRoutes = require('./routes/mapRoutes');
// const postRoutes = require('./routes/postRoutes');
// const ritualRoutes = require('./routes/ritualRoutes');
//
// app.use('/api/auth', authRoutes);
// app.use('/api/map', mapRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/ritual', ritualRoutes);

// ---------------------------------------------------------------------------
// GESTION GLOBALE DES ERREURS
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
    console.error(`[Erreur] ${err.message}`);
    res.status(err.status || 500).json({
        error: "Une erreur interne est survenue.",
        // Ne jamais renvoyer la stack trace complète en production par sécurité
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ---------------------------------------------------------------------------
// DÉMARRAGE DU SERVEUR
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Vérification de la connexion à la base de données
        await sequelize.authenticate();
        console.log('Connexion à la base de données sécurisée établie.');
        
        // Synchronisation des modèles (À remplacer par un système de migrations en production finale)
        await sequelize.sync(); 
        
        server.listen(PORT, () => {
            console.log(`Serveur hu. opérationnel sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de se connecter à la base de données. Arrêt de sécurité:', error);
        process.exit(1); // Arrêt propre en cas d'échec critique
    }
}

startServer();
