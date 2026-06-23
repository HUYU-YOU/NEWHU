JavaScript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ValidationLog = require('../models/ValidationLog');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;
        const user = await User.create({ pseudo, email, password_hash: password });
        res.status(201).json({ message: "Compte créé. Prêt pour le Rite d'Empathie.", userId: user.id });
    } catch (err) {
        res.status(400).json({ error: "Erreur lors de l'inscription." });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { pseudo, password } = req.body;
        const user = await User.findOne({ where: { pseudo } });
        if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ error: "Identifiants invalides." });
        }
        const token = jwt.sign({ id: user.id, is_human: user.is_human }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, is_human: user.is_human });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur." });
    }
});

router.post('/verify-humanity', verifyToken, async (req, res) => {
    const { score } = req.body;
    const passed = score >= 4;
    await ValidationLog.create({ user_id: req.user.id, score, passed, ip_address: req.ip });
    
    if (passed) {
        await User.update({ is_human: true }, { where: { id: req.user.id } });
        res.json({ success: true, message: "Bienvenue sur le globe. Vous avez Carte Blanche." });
    } else {
        res.status(403).json({ success: false, message: "Sensibilité non alignée. Réessayez plus tard." });
    }
});

module.exports = router;
