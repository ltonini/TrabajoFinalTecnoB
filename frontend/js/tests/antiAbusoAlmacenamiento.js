/**
 * Test Seguridad: Límite de Cuota de Almacenamiento (HTTP 403)
 * Se creara un nuevo usuario con la intencion de subir una gran cantidad de archivos (correctos) con el 
 * fin malicioso de ocupar recursos al servidor, el servidor debera de detectar que el usuario tiene 10 samples
 * y como se quiere agregar uno mas debe de rechazar este upload
 */
testUtils.createTestButton("Test Anti-Abuso: Límite de Cuota (Max 10 Archivos)", async (btn) => {
    testUtils.log("Preparando entorno: Creando usuario Spammer...");
    const usernameDinamico = `Spammer_${Date.now()}`; 
    
    // 1. Registro del usuario atacante
    await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameDinamico, password: 'SecurePassword123' })
    });

    // 2. Login para obtener el Token
    const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameDinamico, password: 'SecurePassword123' })
    });
    const { token } = await loginRes.json();

    let lastStatus = 200;
    let lastMessage = "";

    testUtils.log("Iniciando subida masiva de 11 archivos...");

    // 3. Bucle de ataque: Intentamos subir 11 archivos
    for (let i = 1; i <= 11; i++) {
        const formData = new FormData();
        formData.append('display_name', `Spam Audio ${i}`);
        formData.append('category', 'FX');
        formData.append('bpm', '120');

        // Generamos un archivo falso ligero (Blob)
        const dummyBlob = new Blob(["dummy content"], { type: 'audio/wav' });
        formData.append('audioFile', dummyBlob, `spam_${i}.wav`);

        const response = await fetch('/api/samples/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        lastStatus = response.status;
        lastMessage = data.message;

        testUtils.log(`Subida ${i}: Status ${lastStatus}`);
        
        // Si el servidor activa el bloqueo (403), salimos del bucle para ahorrar tiempo
        if (lastStatus === 403) break; 
    }

    // 4. Validación de la arquitectura
    if (lastStatus === 403 && lastMessage.includes("límite máximo de 10 sonidos")) {
        testUtils.log("ÉXITO: El servidor bloqueó la subida número 11 por exceso de cuota. El disco está protegido.");
        testUtils.setSuccess(btn);
    } else {
        testUtils.log(`FALLA CRÍTICA: El servidor no aplicó la restricción de cuota. Último status: ${lastStatus}`, true);
    }
});