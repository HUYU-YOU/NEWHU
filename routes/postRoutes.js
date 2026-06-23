JavaScript
const express = require('express');
const router = express.Router(); // Correction : express.Router() et non express.express.Router()
const uploadSecurity = require('../middlewares/uploadSecurity');
const { uploadAndScanVideo } = require('../services/aiGatekeeper');
const Post = require('../models/Post');
const { verifyToken, checkHumanity } = require('../middlewares/auth');

// Route d'upload
router.post('/upload', verifyToken, checkHumanity, uploadSecurity.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni." });

        const { emotion_tag, lat, lng } = req.body;
        const safeVideoUrl = await uploadAndScanVideo(req.file.buffer);

        const newPost = await Post.create({
            user_id: req.user.id,
            type: 'video',
            emotion_tag,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            video_url: safeVideoUrl,
            is_verified_by_ai: true
        });

        res.status(201).json({ success: true, postId: newPost.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NOUVEAU : Route pour ancrer un moment dans la Galerie
router.put('/:id/anchor', verifyToken, async (req, res) => {
    try {
        const post = await Post.findOne({ 
            where: { id: req.params.id, user_id: req.user.id } 
        });

        if (!post) return res.status(404).json({ error: "Moment non trouvé." });

        // On bascule l'état éternel (vrai/faux)
        post.is_eternal = req.body.is_eternal;
        await post.save();

        res.json({ success: true, is_eternal: post.is_eternal });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'ancrage." });
    }
});

module.exports = router;
