const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

// Clé secrète pour le chiffrement des données (doit faire 32 octets pour AES-256)
// À stocker absolument dans le fichier .env : ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
const IV_LENGTH = 16; // Pour AES, le vecteur d'initialisation fait toujours 16 octets

// Fonction utilitaire de chiffrement (AES-256-GCM)
function encryptData(text) {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

// Fonction utilitaire de déchiffrement
function decryptData(text) {
    if (!text) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const authTag = Buffer.from(textParts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const User = sequelize.define('User', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    pseudo: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,
        validate: {
            isAlphanumeric: true, // Prévention basique contre l'injection XSS dans les pseudos
            len: [3, 30]
        }
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true,
        // Chiffrement asymétrique de l'email dans la DB
        set(value) {
            this.setDataValue('email', encryptData(value));
        },
        get() {
            const rawValue = this.getDataValue('email');
            return decryptData(rawValue);
        }
    },
    password_hash: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    is_human: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    last_checkin: { 
        type: DataTypes.DATE 
    },
    radiation_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    hooks: {
        // Avant de sauvegarder un utilisateur, on hache son mot de passe
        beforeCreate: async (user) => {
            if (user.password_hash) {
                // Cost factor de 12 : Rend les attaques par force brute / dictionnaire extrêmement lentes
                const salt = await bcrypt.genSalt(12);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(12);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        }
    }
});

// Méthode pour vérifier le mot de passe lors de la connexion
User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
