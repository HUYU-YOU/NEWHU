JavaScript
const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

router.get('/emotions', async (req, res) => {
    try {
        const [results] = await sequelize.query(`
            SELECT emotion_tag, ROUND(lat::numeric, 2) as clustered_lat, ROUND(lng::numeric, 2) as clustered_lng, COUNT(*) as intensity
            FROM "Posts" WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
            GROUP BY emotion_tag, clustered_lat, clustered_lng
        `);

        const geojson = {
            type: "FeatureCollection",
            features: results.map(row => ({
                type: "Feature",
                properties: { emotion: row.emotion_tag, intensity: parseInt(row.intensity) },
                geometry: { type: "Point", coordinates: [parseFloat(row.clustered_lng), parseFloat(row.clustered_lat)] }
            }))
        };
        res.json(geojson);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération de la météo." });
    }
});

module.exports = router;
