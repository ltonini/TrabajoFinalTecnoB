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

// Importamos la instancia configurada de Multer
const upload = require('../config/multerConfig');

// Barrera de seguridad: Todas las rutas requieren sesión
router.use(verifyToken);

// Endpoint unificado para subidas de audio
router.post('/upload', (req, res, next) => {
    // Invocamos el middleware dinámicamente indicando el campo 'audioFile'
    upload.single('audioFile')(req, res, function (err) {
        if (err) {
            // Intercepción 1: Límite de peso superado (HTTP 413)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ 
                    message: "El archivo supera el límite de tamaño permitido de 5MB." 
                });
            }
            
            // Intercepción 2: Formato inválido o Spoofing (HTTP 415)
            if (err.code === 'INVALID_MIME_TYPE') {
                return res.status(415).json({ 
                    message: err.message 
                });
            }

            // Fallback: Cualquier otro error interno de Multer (HTTP 400/500)
            return res.status(400).json({ 
                message: err.message || "Error interno al procesar el archivo." 
            });
        }
        
        // Si sobrevivió a todos los filtros, pasamos al controlador principal
        next();
    });
}, sampleController.uploadSample);

// Listar mis samples: GET /api/samples/my-samples
router.get('/my-samples', sampleController.getMySamples);

// Eliminar un sample: DELETE /api/samples/:id
router.delete('/:id', sampleController.deleteSample);

module.exports = router;