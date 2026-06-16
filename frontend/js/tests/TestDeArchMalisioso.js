// Aseguramos que la suite de utilidades esté cargada
if (typeof testUtils !== 'undefined') {

    testUtils.createTestButton("Test Seguridad - MIME Spoofing (Debe fallar HTTP 415)", async (btn) => {
        
        // Creamos contenido de texto malicioso (un script) en memoria.
        const contenidoMalicioso = "<script>alert('Servidor Comprometido');</script>";
        
        // 2. EXPLICACIÓN DEL CAMUFLAJE (Spoofing):
        // Usamos la API 'File' de JavaScript. Le pasamos el texto, pero 
        // le ponemos extensión '.mp3' para intentar engañar al backend.
        // Sin embargo, declaramos su tipo MIME real como 'text/javascript'.
        const archivoCamuflado = new File([contenidoMalicioso], 'virus_camuflado.mp3', { 
            type: 'text/javascript' 
        });

        const formData = new FormData();
        formData.append('display_name', 'Audio Hack');
        formData.append('category', 'FX');
        formData.append('bpm', '120');
        formData.append('audioFile', archivoCamuflado); // Inyectamos el archivo falso

        const token = localStorage.getItem('test_token'); // Obtener sesión válida

        try {
            // 3. Ejecutamos la petición HTTP
            const response = await fetch('/api/samples/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                // NO ponemos 'Content-Type', el navegador lo calcula automático por el FormData
                body: formData
            });

            const data = await response.json();
            testUtils.log(data); // Para ver el resultado en la consola negra

            // 4. EXPLICACIÓN DE LA ASERCIÓN:
            // Es un test de seguridad. Queremos que la petición fracase.
            // Si el servidor interceptó el script y devolvió 415, el sistema es seguro (Test Verde).
            if (response.status === 415) {
                testUtils.setSuccess(btn); 
            } else {
                // Si devolvió 200 (lo guardó) o 500 (crasheó), el sistema es vulnerable.
                throw new Error(`Fallo de seguridad. El servidor respondió con status ${response.status}`);
            }

        } catch (error) {
            throw new Error(error.message);
        }
    });
}