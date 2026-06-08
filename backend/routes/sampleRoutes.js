/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
* Date        : Marzo 2026
*/

const express = require('express');
const router = express.Router();
const sampleController = require('../controllers/sampleController');
const { verifyToken } = require('../middleware/authMiddleware');

// Importamos la instancia de Multer que ya tiene nuestra defensa contra Spoofing
const upload = require('../config/multerConfig');

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