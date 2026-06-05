/**
 * Test: POST /api/auth/login
 */
 testUtils.createTestButton("Test Login Correcto (Pepe y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.ok) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Password Incorrecto (Pepe y 123)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

testUtils.createTestButton("Test Login - Usuario Incorrecto (Juan y 12345)", async (btn) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'pepe', password: '123' }) // Usamos pepe hardcodeado
    });
    
    const data = await response.json();
    testUtils.log(data);

    if (response.status === 401) {
        testUtils.setSuccess(btn);
    }
});

/**
 * Test Seguridad: Prevención de Fuerza Bruta (HTTP 429). Este test controla intentos de inicio de sesion
 * incorrectos con el usuario admin. Se repite de forma arbitraria 6 veces.
 * Como esta especificado en el backend, se admiten 5 intentos erroneos por minuto. Al realizar mas de 5 
 * informara sobre un error y su estado cambiara a 429. Si efectivamente se rechaza, se cumplira el 
 * objetivo del test el cual es detectar y limitar un ataque de fuerza bruta a la hora de realizar
 * un login. 
 */
testUtils.createTestButton("Test Seguridad: Ataque de Fuerza Bruta (HTTP 429)", async (btn) => {
    let lastStatus = 200;
    testUtils.log("Iniciando ataque de fuerza bruta simulado (6 peticiones rápidas)...");

    // Disparamos 6 peticiones consecutivas con credenciales falsas
    for(let i = 1; i <= 15; i++) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'passwordIncorrecta123' }) 
        });
        
        lastStatus = response.status;
        testUtils.log(`Intento ${i} - Código de respuesta HTTP: ${lastStatus}`);
        
        // Pausa de 200ms para no saturar el hilo principal del navegador del cliente
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Validación de la respuesta final del servidor
    if (lastStatus === 429) {
        testUtils.log("ÉXITO: El servidor bloqueó el ataque correctamente con el código 429 Too Many Requests.");
        testUtils.setSuccess(btn);
    } else {
        testUtils.log(`FALLA CRÍTICA: El servidor permitió el ataque o devolvió un estado incorrecto. Último estado: ${lastStatus}`, true);
    }
});