# Configuración: Google Sheets via Apps Script

Esta guía te permite guardar las confirmaciones de asistencia (RSVP) y los mensajes para Sarah directamente en una planilla de Google Sheets, **sin necesidad de un servidor ni hosting pago**.

---

## Paso 1 — Crear la planilla

1. Abrí [Google Sheets](https://sheets.google.com) y creá una planilla nueva.
2. Nombrarla, por ejemplo: **"Golden Hour — Despedida Sarah"**.
3. No hace falta crear hojas manualmente; el script las crea automáticamente.

---

## Paso 2 — Abrir Apps Script

1. En la planilla, hacé clic en **Extensiones → Apps Script**.
2. Se abre el editor de código.
3. Borrá todo el código que aparece por defecto (el que dice `function myFunction()`).

---

## Paso 3 — Pegar el código

Copiá y pegá el siguiente código completo:

```javascript
function doPost(e) {
  try {
    var ss     = SpreadsheetApp.getActiveSpreadsheet();
    var params = e.parameter;
    var type   = params.type;

    if (type === 'rsvp') {
      var sheet = ss.getSheetByName('RSVP');
      if (!sheet) {
        sheet = ss.insertSheet('RSVP');
        sheet.appendRow(['Fecha', 'Nombre', 'Cantidad de invitados', 'Asistirá']);
        sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      }
      sheet.appendRow([
        new Date().toLocaleString('es-AR'),
        params.name       || '(sin nombre)',
        params.guests     || '1',
        params.attendance === 'yes' ? 'Sí ✅' : 'No ❌'
      ]);

    } else if (type === 'nota') {
      var notesSheet = ss.getSheetByName('Notas');
      if (!notesSheet) {
        notesSheet = ss.insertSheet('Notas');
        notesSheet.appendRow(['Fecha', 'Nombre', 'Mensaje']);
        notesSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      }
      notesSheet.appendRow([
        new Date().toLocaleString('es-AR'),
        params.name    || '(sin nombre)',
        params.message || ''
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guardá con **Ctrl + S** (o el ícono de disquete). Poné cualquier nombre al proyecto, por ejemplo *"Golden Hour Script"*.

---

## Paso 4 — Desplegar como Web App

1. Hacé clic en **Implementar → Nueva implementación**.
2. En "Seleccionar tipo", elegí **Aplicación web**.
3. Completá los campos:
   - **Descripción**: `Golden Hour Farewell`
   - **Ejecutar como**: `Yo (tu cuenta de Google)`
   - **Quién tiene acceso**: `Cualquier usuario`
4. Hacé clic en **Implementar**.
5. Google te pedirá que **autorices los permisos** — aceptá todo (el script solo escribe en tu propia planilla).
6. Copiá la **URL de la aplicación web** que aparece. Es algo como:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Paso 5 — Conectar la URL al sitio web

1. Abrí el archivo `script.js`.
2. Al principio del archivo encontrás esta línea:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Reemplazá `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` con la URL que copiaste:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```
4. Guardá el archivo.

**¡Listo!** Desde ahora, cada RSVP y cada mensaje que dejen los invitados aparecerá automáticamente en tu planilla.

---

## Resultado esperado en Google Sheets

La planilla tendrá dos hojas:

**Hoja "RSVP"**
| Fecha | Nombre | Cantidad de invitados | Asistirá |
|---|---|---|---|
| 6/8/2026, 15:32 | María García | 2 | Sí ✅ |
| 6/8/2026, 16:10 | Juan López | 1 | No ❌ |

**Hoja "Notas"**
| Fecha | Nombre | Mensaje |
|---|---|---|
| 7/8/2026, 10:05 | Laura | Sarah, te vamos a extrañar muchísimo... |

---

## Notas importantes

- **Modo demo**: Si la URL no está configurada (queda como `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`), los formularios igual funcionan visualmente — simulan el envío durante ~1 segundo y muestran el mensaje de éxito. Ideal para probar el sitio antes de conectar Sheets.
- **Re-despliegue**: Si en el futuro modificás el código del script, tenés que crear una **nueva implementación** (no una actualización) para que los cambios sean efectivos con la misma URL.
- **Contacto de emergencia**: silvina.stani@gmail.com
