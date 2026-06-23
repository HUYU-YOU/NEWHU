JavaScript
const cron = require('node-cron');
const { Op } = require('sequelize');
const Post = require('../models/Post');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({ keyFilename: process.env.GCP_KEY_FILE });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

cron.schedule('0 * * * *', async () => {
    console.log("[Éthique] Démarrage du cycle de nettoyage (24h)...");
    try {
        const expiredPosts = await Post.findAll({
            where: {
                createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                emotion_tag: { [Op.ne]: 'sos' },
                // NOUVEAU : On ne supprime que ce qui n'est PAS éternel
                is_eternal: false 
            }
        });

        for (let post of expiredPosts) {
            if (post.video_url) {
                const fileName = post.video_url.split('/').pop();
                await bucket.file(fileName).delete().catch(() => {});
            }
            await post.destroy();
        }
        console.log(`[Éthique] ${expiredPosts.length} moments ont été rendus à l'oubli.`);
    } catch (error) {
        console.error("Erreur lors du nettoyage :", error);
    }
});
