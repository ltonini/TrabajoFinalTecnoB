/**
 * Test: POST /api/samples/upload (Validar límite de tamaño > 5MB)
 */
testUtils.createTestButton("Test Multer: Enviar archivo pesado (> 5MB)", async (btn) => {
    // 1. Hacemos login con tus credenciales reales para obtener el token
    const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CAMBIADO AQUÍ: Ahora usa el usuario 'pepe'
        body: JSON.stringify({ username: 'pepe', password: '12345' }) 
    });
    
    const { token } = await loginRes.json();

    // Validamos rápido si obtuvimos el token antes de seguir
    if (!token) {
        testUtils.log("Error: No se pudo iniciar sesión con el usuario 'pepe'. Revisa la base de datos.");
        return;
    }

    // 2. Creamos dinámicamente el archivo de 6 MB (supera los 5MB permitidos)
    const tamanoExcedido = 6 * 1024 * 1024; 
    const archivoPesado = new Blob([new Uint8Array(tamanoExcedido)], { type: 'audio/mpeg' });

    // 3. Preparamos el FormData con el nombre de campo correcto ('audioFile')
    const formData = new FormData();
    formData.append('audioFile', archivoPesado, 'audio_sobrepeso.mp3');

    // 4. Realizamos la petición POST a la ruta de subida pasándole el token de pepe
    const response = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();
    testUtils.log("Respuesta del servidor:");
    testUtils.log(data);

    // 5. Evaluamos: el test es exitoso si el servidor responde con el estado 413
    if (response.status === 413) {
        testUtils.log("Éxito: El middleware Multer bloqueó el archivo pesados correctamente.");
        testUtils.setSuccess(btn);
    } else {
        testUtils.log(`Fallo: Se esperaba estado 413 pero se recibió ${response.status}`);
    }
});