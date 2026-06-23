JavaScript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Post = sequelize.define('Post', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('video', 'live', 'checkin'),
        allowNull: false,
        defaultValue: 'video'
    },
    emotion_tag: { 
        type: DataTypes.ENUM('amour', 'joie', 'surprise', 'peur', 'tristesse', 'degout', 'colere', 'sos'),
        allowNull: false 
    },
    lat: { 
        type: DataTypes.DOUBLE, 
        allowNull: false 
    },
    lng: { 
        type: DataTypes.DOUBLE, 
        allowNull: false 
    },
    video_url: { 
        type: DataTypes.STRING, 
        allowNull: true,
        validate: { isUrl: true }
    },
    is_verified_by_ai: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // NOUVEAU : Le bouclier pour la Galerie de l'Empreinte
    is_eternal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    hooks: {
        beforeCreate: (post) => {
            const fuzzFactor = 0.01;
            post.lat = post.lat + (Math.random() * fuzzFactor - (fuzzFactor / 2));
            post.lng = post.lng + (Math.random() * fuzzFactor - (fuzzFactor / 2));
        }
    }
});

module.exports = Post;
