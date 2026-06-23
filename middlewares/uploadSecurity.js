const multer = require('multer');

// Stockage en mémoire : Le fichier n'est jamais écrit sur le disque local du serveur.
// Cela empêche l'exécution de scripts malveillants locaux (Local File Inclusion).
const storage = multer.memoryStorage();

// Filtre strict sur le type MIME
const fileFilter = (req, file, cb) => {
    // Liste blanche militaire : Uniquement du MP4 ou WebM
    const allowedMimeTypes = ['video/mp4', 'video/webm'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non autorisé. Seuls MP4 et WebM sont acceptés pour la sécurité du réseau."), false);
    }
};

const uploadConfig = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // Limite stricte à 50 Mo pour prévenir les attaques DoS par saturation de RAM
        files: 1 // 1 seul fichier par requête
    },
    fileFilter: fileFilter
});

module.exports = uploadConfig;
