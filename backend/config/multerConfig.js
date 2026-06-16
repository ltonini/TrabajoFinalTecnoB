/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
* Date        : Marzo 2026
*/

const multer = require('multer');

// Configuración de almacenamiento físico
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Defensa 1: Filtro anti MIME-Spoofing (Tu código)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Tipo de archivo no soportado. Riesgo de Spoofing detectado.');
        error.code = 'INVALID_MIME_TYPE';
        cb(error, false);
    }
};

// Instanciación unificada de Multer
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    // Defensa 2: Límite de Peso (Código de tu compañero)
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB de límite
    }
});

// Exportamos el objeto completo para usarlo dinámicamente en las rutas
module.exports = upload;