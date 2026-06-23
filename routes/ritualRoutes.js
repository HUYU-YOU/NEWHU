JavaScript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { verifyToken, checkHumanity } = require('../middlewares/auth');

router.post('/checkin', verifyToken, checkHumanity, async (req, res) => {
    try {
        const { emotion_tag, lat, lng } = req.body;
        await Post.create({ user_id: req.user.id, type: 'checkin', emotion_tag, lat, lng });
        await User.update({ last_checkin: new Date() }, { where: { id: req.user.id } });
        
        req.app.get('io').emit('world-pulse', { type: emotion_tag, lat, lng });
        res.json({ success: true, message: "Rituel accompli." });
    } catch (err) {
        res.status(500).json({ error: "Échec du rituel." });
    }
});

module.exports = router;
