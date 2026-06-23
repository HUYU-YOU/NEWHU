// 
const jwt = require('jsonwebtoken');

// Clé secrète de signature (à garder absolument dans le .env)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_uniquement_en_dev';

// 1. Vérification de base (Est-ce que l'utilisateur est connecté ?)
const verifyToken = (req, res, next) => {
    // On attend le token dans l'en-tête : "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Pièce d'identité numérique manquante." });
    }

    try {
        // Le jwt.verify vérifie mathématiquement que le token n'a pas été altéré
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // On attache les infos (id, is_human) à la requête
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token invalide ou expiré. Veuillez vous reconnecter." });
    }
};

// 2. Vérification d'Humanité (Le Garde-Fou du Globe)
// Ce middleware s'assure que seuls les "Cartes Blanches" peuvent influencer la météo.
const checkHumanity = (req, res, next) => {
    if (!req.user || req.user.is_human !== true) {
        return res.status(403).json({ 
            error: "Preuve d'Humanité requise.", 
            message: "Votre compte est en lecture seule. Passez le Rite d'Empathie pour interagir avec le globe." 
        });
    }
    next();
};

module.exports = { verifyToken, checkHumanity };
