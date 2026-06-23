JavaScript
// seed.js
require('dotenv').config();
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
const Resonance = require('./models/Resonance');

async function seed() {
    try {
        // Force la synchronisation (Attention: supprime les données existantes)
        await sequelize.sync({ force: true });
        console.log("Base de données réinitialisée.");

        // 1. Création d'un utilisateur "Carte Blanche" (L'email sera chiffré automatiquement par le Model)
        const user = await User.create({
            pseudo: "Romain_Gardien",
            email: "contact@hu.org",
            password_hash: "MotDePasseTresSecurise123!", // Sera haché par le hook beforeCreate
            is_human: true,
            radiation_score: 150
        });

        console.log(`Utilisateur Gardien créé avec succès (ID: ${user.id}). Email chiffré en base.`);

        // 2. Coordonnées de base (Le fuzzing va les décaler légèrement de manière aléatoire)
        const emotions = ['joie', 'amour', 'sos', 'tristesse', 'surprise'];
        const baseLocations = [
            { city: "Paris", lat: 48.8566, lng: 2.3522 },
            { city: "Tokyo", lat: 35.6895, lng: 139.6917 },
            { city: "Rome", lat: 41.9028, lng: 12.4964 },
            { city: "Dakar", lat: 14.7167, lng: -17.4677 },
            { city: "Lisbonne", lat: 38.7223, lng: -9.1393 }
        ];

        // 3. Injection des données
        console.log("Génération de la Météo Humaine en cours...");
        let createdPosts = [];

        for (let i = 0; i < 50; i++) {
            const loc = baseLocations[Math.floor(Math.random() * baseLocations.length)];
            const emotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            const post = await Post.create({
                user_id: user.id,
                type: 'video',
                emotion_tag: emotion,
                lat: loc.lat, 
                lng: loc.lng,
                video_url: "https://storage.googleapis.com/ton_bucket_name/demo.mp4",
                is_verified_by_ai: true
            });
            createdPosts.push(post);
        }

        // 4. Création de quelques résonances pour tester le Profil
        await Resonance.create({
            user_id: user.id,
            post_id: createdPosts[0].id,
            emotion_tag: 'amour'
        });

        console.log("✅ Le monde est peuplé d'émotions et sécurisé.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Erreur lors du peuplement :", error);
        process.exit(1);
    }
}

seed();
