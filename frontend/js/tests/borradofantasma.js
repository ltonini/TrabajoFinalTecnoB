 async function okLogin()
 {
    // 1. Login como productor (pepe) para obtener un token válido
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: 'pepe', password: '12345' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token', data.token);
 
}

testUtils.createTestButton("Test Eliminacion - Borrado Fantasma", async (btn) => {
    // 1. Asegurar sesión
    await okLogin();
    const token = localStorage.getItem('test_token');

    // 2. Definir el ID falso
    const fakeId = 99999;
    testUtils.log(`Se intentará borrar un ID inexistente: ${fakeId}`);

    // 3. Ejecutar petición DELETE
    const response = await fetch(`/api/samples/${fakeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    // 4. Leer respuesta
    const data = await response.json();
    testUtils.log(data);

    // 5. Validar que el servidor bloquee la acción con un 404
    if (response.status === 404) {
        testUtils.setSuccess(btn); 
        testUtils.log(`El registro no existe o ya fue eliminado`)
    }
});