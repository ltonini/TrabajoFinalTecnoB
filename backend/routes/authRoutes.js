/**
*    Project     : Sample Vault
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Marzo 2026


const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para el registro: POST /api/auth/register
router.post('/register', authController.register);

// Ruta para el login: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
*/

/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
* Date        : Marzo 2026
*/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const rateLimit = require('express-rate-limit'); // 1. Importación de la librería

// 2. Configuración de la regla de mitigación de Fuerza Bruta (esto es lo que se agrega el codigo)
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Ventana de tiempo: 1 minuto
    max: 10, // Límite estricto: 10 intentos máximos por IP (seleccionamos 10 para realizar los test ya que estos utilizan logins individuales)
    message: { message: "Demasiados intentos fallidos. Por seguridad, intente nuevamente en 1 minuto." },
    standardHeaders: true, // Retorna la info del límite en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita los headers obsoletos `X-RateLimit-*`
});

// Ruta para el registro: POST /api/auth/register (No le aplicamos el límite estricto)
router.post('/register', authController.register);

// Ruta para el login: POST /api/auth/login (Aplicamos el escudo ANTES del controlador)
router.post('/login', loginLimiter, authController.login);

module.exports = router;