/**
 * Project     : Sample Vault
 * Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
 * License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
 * Date        : Marzo 2026
 */

const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');

// Configuración de Multer para subir archivos de audio:
const uploadMiddleware = require('../config/multerConfig');

const { verifyToken } = require('../middleware/authMiddleware');

// Importamos la instancia de Multer que ya tiene nuestra defensa contra Spoofing
const upload = require('../config/multerConfig');

// Subir un nuevo audio: POST /api/samples/upload
// Interceptamos la ejecución de Multer para manejar el límite de peso y formatos
router.post('/upload', (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            // Validación del Test: El archivo supera los 5 MB
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ 
                    error: "El archivo supera el límite de tamaño permitido" 
                });
            }
            
            // Validación extra: Formato de audio no permitido (definido en fileFilter)
            if (err.code === 'LIMIT_INVALID_TYPE') {
                return res.status(400).json({ 
                    error: err.message 
                });
            }

            // Cualquier otro error inesperado de Multer o del sistema
            return res.status(500).json({ 
                error: "Error interno al procesar el archivo" 
            });
        }
        
        // Si no hubo ningún error, pasamos al controlador para guardar el sample
        next();
    });
}, sampleController.uploadSample);
// Barrera de seguridad: Todas las rutas requieren que el usuario tenga un token válido
router.use(verifyToken);

// --- RUTAS LIMPIAS ---

// 1. Subir un nuevo audio: POST /api/samples/upload
// Le pasamos upload.single('audioFile') directamente. 
// Si salta nuestra alerta de virus, Express la enviará automáticamente al server.js

router.post('/upload', verifyToken, (req, res, next) => {
    upload.single('audioFile')(req, res, (err) => {
        if (err) {
            // Si es nuestro error de MIME
            if (err.code === 'INVALID_MIME_TYPE') {
                return res.status(415).json({ message: err.message });
            }
            // Si es cualquier otro error de Multer (ej: límite de peso)
            return res.status(400).json({ message: err.message });
        }
        // Si no hay error, pasamos al controlador
        next();
    });
}, sampleController.uploadSample);


// 2. Listar mis samples: GET /api/samples/my-samples
router.get('/my-samples', sampleController.getMySamples);

// 3. Eliminar un sample: DELETE /api/samples/:id
router.delete('/:id', sampleController.deleteSample);

// El export SIEMPRE va al final absoluto del archivo
module.exports = router;