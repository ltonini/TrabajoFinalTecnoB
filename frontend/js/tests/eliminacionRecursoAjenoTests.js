
/*
Este test crea un nuevo usuario con un sample, para realiza un DELETE forzado con el id de un sample
de otro productor, se crea con un sample ya que no se puede intentar borrar un sample si es que el productor no
tiene ningun sample a borrar.
Luego se chequea el Token de este nuevo productor y se realiza la peticion para el Delete el cual devuelve el servidor
un error 404, ya que este al filtrar por id y userid no devulve ningun dato.
Resultando asi el mensaje pertinente y cumpliendose el objetivo del test. 
*/ 

const timestamp = Date.now();
const usernameDinamico = 'Tomas_' + timestamp;

async function okLogin2() {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameDinamico, password: '123456789' })
    });
    const data = await response.json();
    localStorage.setItem('test_token2', data.token);
}

testUtils.createTestButton('Test seguridad: Eliminar Sample Ajeno (403/404)', async (btn) => {
    
    // 1. Registrar nuevo productor (Usuario Atacante)
    const responseRegister = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameDinamico, password: '123456789' })
    });
    
    if (!responseRegister.ok) {
        testUtils.log('Error al registrar el usuario de pruebas.');
        return;
    }

    // 2. Autenticar al usuario atacante
    await okLogin2();
    const token = localStorage.getItem('test_token2');

    // ID ajeno hardcodeado para la prueba de vulnerabilidad IDOR
    const idAjeno = 1; 

    // 3. Forzar el DELETE utilizando concatenación tradicional
    const responseDelete = await fetch('/api/samples/' + idAjeno, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        }
    });

    // 4. Validaciones estrictas basadas en el protocolo de red HTTP
    if (responseDelete.ok) {
        testUtils.log('Fallo de Seguridad: Se permitio borrar el archivo ajeno con ID ' + idAjeno);
    } else if (responseDelete.status === 403 || responseDelete.status === 404) {
        testUtils.log('No tienes permisos para alterar este archivo. Status: ' + responseDelete.status);
        testUtils.setSuccess(btn);
    } else {
        testUtils.log('Error inesperado del servidor. Status: ' + responseDelete.status);
    }
});