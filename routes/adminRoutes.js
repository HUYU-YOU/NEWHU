
JavaScript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

// Middleware interne pour s'assurer que SEUL toi (admin) accèdes à cette route
const isAdmin = (req, res, next) => {
    // Dans hu., l'admin a un rôle spécifique ou un ID fixe
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Accès réservé au Poste de Commande." });
    }
};

// Route pour recevoir les résultats de l'IA Video Intelligence
router.post('/ia-report', async (req, res) => {
    const { videoId, score, location, video_url, aiContext } = req.body;

    // Si le score de risque est élevé, on pousse l'alerte en temps réel via Socket.io
    const io = req.app.get('io');
    
    if (score > 50) {
        io.emit('mod-priority-alert', {
            id: videoId,
            score: score,
            location: location,
            video_url: video_url,
            aiContext: aiContext,
            timestamp: new Date()
        });
    }

    res.status(200).json({ status: "Rapport traité" });
});

module.exports = router;
