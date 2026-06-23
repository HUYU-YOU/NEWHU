const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration sécurisée de la base de données
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Désactive les logs SQL en prod pour éviter les fuites de données
    dialectOptions: {
        // Force le SSL en production pour éviter les attaques "Man-in-the-Middle" (MitM)
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false // À ajuster selon le certificat de ton hébergeur (ex: Heroku nécessite souvent false)
        } : false
    },
    pool: {
        max: 10, // Limite le nombre de connexions simultanées pour éviter les surcharges
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = { sequelize };
