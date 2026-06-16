/**
* Suite de Pruebas: Sanitización y Reglas de Seguridad
* Módulo: Registro de Usuarios
*/

// Aseguramos que la suite solo corra si las utilidades globales están disponibles
if (typeof testUtils !== 'undefined') {

    // Tu lógica aquí: Inyectá el botón para el test de contraseña corta
  testUtils.createTestButton("Test Registro - Contraseña Corta (Debe fallar con 400)", async (btn) => {
    
        // Generamos un usuario dinámico para que no falle por "usuario duplicado"
        const usernameDinamico = `testuser_${Date.now()}`; 

        // Enviamos una contraseña deliberadamente corta (3 caracteres)
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: usernameDinamico, 
                password: '123' 
            })
        });
        
        const data = await response.json();
        testUtils.log(data); // Imprimimos la respuesta en la consola negra

        // Validamos el contrato REST: ¿Es un 400 y tiene el mensaje exacto?
        if (response.status === 400 && data.message === "La contraseña es demasiado corta") {
            testUtils.setSuccess(btn); // Test VERDE, la defensa funcionó.
        } else {
            throw new Error(`Fallo de Seguridad: El servidor respondió con status ${response.status} en lugar de 400.`);
        }
    });
} else {
    console.error("No se pudo inicializar la suite de seguridad: testUtils no está definido.");
}