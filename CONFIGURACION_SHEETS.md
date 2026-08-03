# Configuración: Google Sheets via Apps Script

Esta guía te permite guardar las confirmaciones de asistencia (RSVP) y los mensajes para Sarah directamente en una planilla de Google Sheets, **sin necesidad de un servidor ni hosting pago**.

---

## Paso 1 — Crear la planilla

1. Abrí [Google Sheets](https://sheets.google.com) y creá una planilla nueva.
2. Nombrarla, por ejemplo: **"Buen Viaje! — Despedida Lucia y Luciano"**.
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
   - **Descripción**: `Buen Viaje Lucia y Luciano!`
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

## 📌 ANTES DEL DOMINGO 6 DE SEPTIEMBRE: Mostrar mensajes en vivo en la página

**Objetivo**: Crear una nueva sección que consuma los mensajes del Google Sheet y los muestre dinámicamente en la página.

### Paso 1: Actualizar el Google Apps Script (agregar endpoint GET)

En el editor de Apps Script, **reemplazá TODO el código anterior** con este (incluye `doPost` + nuevo `doGet`):

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

// ⭐ NUEVO: Endpoint para LEER mensajes (GET)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var notesSheet = ss.getSheetByName('Notas');
    
    if (!notesSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ messages: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = notesSheet.getDataRange().getValues();
    var messages = [];
    
    // Saltá la fila de encabezado (fila 1)
    for (var i = 1; i < data.length; i++) {
      messages.push({
        fecha: data[i][0],
        nombre: data[i][1],
        mensaje: data[i][2]
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ messages: messages }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ messages: [], error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

1. Guardá con **Ctrl + S**
2. Hacé clic en **Implementar → Nueva implementación**
3. Seleccioná **Aplicación web** (IMPORTANTE: es una nueva implementación, no una actualización)
4. Copiá la **nueva URL** que aparece

### Paso 2: En el archivo `index.html`, agregar nueva sección

Después de la sección `<!-- DEJÁ TU MENSAJE -->` (y ANTES del `<!-- FOOTER -->`), insertá:

```html
  <!-- MURO DE MENSAJES -->
  <section class="messages-wall" id="mensajes">
    <div class="container">
      <header class="section-header" data-animate>
        <p class="section-eyebrow">en vivo</p>
        <h2 class="section-title">Lo que están diciendo</h2>
        <p class="section-subtitle">Mensajes de cariño y recuerdos que van llegando</p>
      </header>
      <div class="messages-container" id="messages-container">
        <p class="messages-loading">Cargando mensajes...</p>
      </div>
    </div>
  </section>
```

### Paso 3: En `script.js`, agregar esta función

Dentro de la función `initForms()` (después de la sección de Notas), agregá:

```javascript
  // ⭐ CARGAR Y REFRESCAR MENSAJES DEL SHEET
  loadMessages();
  setInterval(loadMessages, 10000); // Refrescar cada 10 segundos
}

async function loadMessages() {
  if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    return; // No cargar en modo demo
  }
  
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    const container = document.getElementById('messages-container');
    
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = '<p class="messages-empty">Aún no hay mensajes... ¡Sé el primero! 💛</p>';
      return;
    }
    
    container.innerHTML = data.messages.map(msg => `
      <div class="message-card" data-animate>
        <p class="message-text">"${msg.mensaje}"</p>
        <p class="message-author">— ${msg.nombre}</p>
        <p class="message-date">${msg.fecha}</p>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Error cargando mensajes:', err);
  }
}
```

### Paso 4: En `style.css`, agregar estilos

Al final del archivo, agregá:

```css
/* ─── Muro de Mensajes ─────────────────────────────────────────────────────── */
.messages-wall {
  padding: 80px 0;
  background: linear-gradient(135deg, #fef9f3 0%, #fdfcfa 100%);
}

.messages-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.message-card {
  background: white;
  padding: 28px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #d4a574;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: slideInUp 0.6s ease;
}

.message-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.message-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c2c2c;
  margin-bottom: 16px;
  font-style: italic;
}

.message-author {
  font-weight: 600;
  color: #d4a574;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.message-date {
  font-size: 0.8rem;
  color: #999;
}

.messages-loading {
  text-align: center;
  color: #999;
  padding: 40px;
}

.messages-empty {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Resumen para el lunes
- ✅ Actualizar Google Apps Script con `doGet`
- ✅ Agregar nueva sección HTML
- ✅ Agregar función `loadMessages()` en JavaScript
- ✅ Agregar CSS para tarjetas de mensajes
- ✅ La página se actualizará cada 10 segundos automáticamente

---

## Notas importantes

- **Modo demo**: Si la URL no está configurada (queda como `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`), los formularios igual funcionan visualmente — simulan el envío durante ~1 segundo y muestran el mensaje de éxito. Ideal para probar el sitio antes de conectar Sheets.
- **Re-despliegue**: Si en el futuro modificás el código del script, tenés que crear una **nueva implementación** (no una actualización) para que los cambios sean efectivos con la misma URL.
- **Contacto de emergencia**: silvina.stani@gmail.com
