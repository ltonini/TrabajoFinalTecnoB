const timestamp = Date.now();
const usernameDinamico = `Tomas_${timestamp}`;

/*
Este test crea un nuevo usuario con un sample, para realiza un DELETE forzado con el id de un sample
de otro productor, se crea con un sample ya que no se puede intentar borrar un sample si es que el productor no
tiene ningun sample a borrar.
Luego se chequea el Token de este nuevo productor y se realiza la peticion para el Delete el cual devuelve el servidor
un error 404, ya que este al filtrar por id y userid no devulve ningun dato.
Resultando asi el mensaje pertinente y cumpliendose el objetivo del test. 
*/ 



/**
 * Función para asegurar independencia de los tests de samples 
 * y no depender de otro test para tener un token de sesión válido
 */
 async function okLogin2()
 {
    
     const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username: usernameDinamico, password: '123456789' }) // Usamos pepe hardcodeado
     });
     const data = await response.json();
     // Guardamos el token para tests de samples
     localStorage.setItem('test_token2', data.token);
     testUtils.log("el token:",data.token);
 }

/**
 * Test: GET /api/samples/my-samples
 */
 testUtils.createTestButton("Test eliminar Sample de otro pructor, con nuevo usuario", async (btn) => {
    const response1 = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameDinamico, password: '123456789' }) // Harcodeo los datos del formulario
    });
    // 1. Asegurar y guardar una sesión válida
    await okLogin2();
    const token = localStorage.getItem('test_token2');
    
    const data1 = await response1.json();
    testUtils.log(data1);
        // Creamos un FormData
    const formData = new FormData();
    formData.append('display_name', 'Test Loop Pedagogico');
    formData.append('category', 'Drums');
    formData.append('bpm', '120');

    // Simulamos un archivo WAV (binario vacío para la prueba)
    const blob = new Blob(["Simulated Audio Content"], { type: 'audio/wav' });
    formData.append('audioFile', blob, 'DRUM_LOOP_01.wav');

    const response3 = await fetch('/api/samples/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    //le creo un sample asi puede borrar

    
    // 2. Realizar la petición //
    const response = await fetch('/api/samples/my-samples', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    testUtils.log(data);
    const idAborrar = 3; // de el usuario PEPE que por defecto en la base tiene samples
    if (Array.isArray(data) && data.length > 0) {
        testUtils.log("hay samples para borrar");
        const userID = data[0].userid;    
        testUtils.log(idAborrar);
        const response2 = await fetch(`/api/samples/${idAborrar}`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`//mucho muy importante ya que cada peticion es stateless 
        }
     });
    if (response2.ok) {
        testUtils.log(`Muestra con ID ${idAborrar} borrada exitosamente.`);
    } else {
        if (idAborrar != userID )
            testUtils.log(`No tienes permisos para alterar este archivo. Status: ${response2.status}`);
            testUtils.setSuccess(btn);
        }
    }
     else {
        if (idAborrar != userID ){
            testUtils.log(`No tienes permisos para alterar este archivo.2 Status: ${response2.status}`);
            testUtils.setSuccess(btn);
        }
        else{
            testUtils.log("se debe subir un sample primero");
            }
}}); 