const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Post = require('./Post');

const Resonance = sequelize.define('Resonance', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Post, key: 'id' }
    },
    emotion_tag: { 
        type: DataTypes.ENUM('amour', 'joie', 'surprise', 'peur', 'tristesse', 'degout', 'colere', 'sos'),
        allowNull: false 
    }
}, {
    indexes: [
        // Indexation pour optimiser les requêtes du Profil Utilisateur
        { fields: ['user_id', 'created_at'] }
    ]
});

module.exports = Resonance;
