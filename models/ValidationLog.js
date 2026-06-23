
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const ValidationLog = sequelize.define('ValidationLog', {
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
    score: { 
        type: DataTypes.INTEGER,
        allowNull: false
    },
    passed: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: true // Stocke l'IP (hachée idéalement en prod) pour bloquer les fermes de bots
    }
});

// Établissement des relations globales de la DB
User.hasMany(Post, { foreignKey: 'user_id' });
Post.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Resonance, { foreignKey: 'user_id' });
Resonance.belongsTo(User, { foreignKey: 'user_id' });
Post.hasMany(Resonance, { foreignKey: 'post_id' });
Resonance.belongsTo(Post, { foreignKey: 'post_id' });

User.hasMany(ValidationLog, { foreignKey: 'user_id' });
ValidationLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ValidationLog;
