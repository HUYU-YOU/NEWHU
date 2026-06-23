const { Storage } = require('@google-cloud/storage');
const video = require('@google-cloud/video-intelligence');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Initialisation des clients Google avec la clé sécurisée
const storage = new Storage({ keyFilename: process.env.GCP_KEY_FILE });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
const videoClient = new video.VideoIntelligenceServiceClient({ keyFilename: process.env.GCP_KEY_FILE });

async function uploadAndScanVideo(fileBuffer) {
    // 1. Anonymisation totale : Le nom d'origine du fichier est détruit.
    // Cela empêche les attaques par "Directory Traversal" (ex: nom de fichier "../../../etc/passwd")
    const safeFilename = `${uuidv4()}.mp4`;
    const blob = bucket.file(safeFilename);
    const gcsUri = `gs://${process.env.GCS_BUCKET_NAME}/${safeFilename}`;

    try {
        // 2. Upload sécurisé via un stream en mémoire
        await new Promise((resolve, reject) => {
            const blobStream = blob.createWriteStream({
                resumable: false, // Désactivé pour les petits fichiers (< 50Mo)
                contentType: 'video/mp4'
            });
            blobStream.on('error', err => reject(err));
            blobStream.on('finish', () => resolve());
            blobStream.end(fileBuffer);
        });

        // 3. Scan IA (Google Video Intelligence)
        const [operation] = await videoClient.annotateVideo({
            inputUri: gcsUri,
            features: ['EXPLICIT_CONTENT_DETECTION']
        });

        console.log(`Scan IA en cours pour ${safeFilename}...`);
        const [result] = await operation.promise();
        const explicitContent = result.annotationResults[0].explicitAnnotation;

        // 4. Analyse des frames pour bloquer la violence ou la pornographie
        let isUnsafe = false;
        if (explicitContent && explicitContent.frames) {
            isUnsafe = explicitContent.frames.some(frame => 
                // Niveaux Google : UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
                // On bloque tout ce qui est POSSIBLE (3) ou supérieur
                frame.pornographyLikelihood >= 3 || frame.violenceLikelihood >= 3
            );
        }

        // 5. La sentence
        if (isUnsafe) {
            console.warn(`[ALERTE SÉCURITÉ] Contenu malveillant détecté. Destruction du fichier ${safeFilename}.`);
            await blob.delete(); // Destruction physique immédiate
            throw new Error("CONTENU_BLOQUÉ_PAR_IA");
        }

        // Si tout est sain, on renvoie l'URL publique ou l'URI
        return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${safeFilename}`;

    } catch (error) {
        // En cas de crash réseau, on tente de nettoyer le fichier orphelin
        blob.delete().catch(() => {}); 
        throw error;
    }
}

module.exports = { uploadAndScanVideo };
