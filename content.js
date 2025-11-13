// content.js - Script principal para procesar ofertas automáticas en lici.cl

console.log('🤖 Bot Lici FirmaVB cargado');

// Estadísticas globales
let estadisticas = {
  total: 0,
  bloqueadas: 0,
  ajustadas: 0,
  sinAjuste: 0,
  matchBajo: 0
};

// Función principal para procesar todas las ofertas
async function procesarOfertas() {
  console.log('🔄 Iniciando procesamiento de ofertas...');
  
  // Resetear estadísticas
  estadisticas = {
    total: 0,
    bloqueadas: 0,
    ajustadas: 0,
    sinAjuste: 0,
    matchBajo: 0
  };
  
  // Obtener modo DRY_RUN desde storage
  const { dryRun } = await chrome.storage.local.get(['dryRun']);
  const isDryRun = dryRun !== false; // Por defecto true
  
  console.log(`Modo: ${isDryRun ? '🧪 DRY RUN (simulación)' : '⚡ PRODUCCIÓN'}`);
  
  // Buscar todas las filas de ofertas en la tabla
  const filas = document.querySelectorAll('table tbody tr');
  estadisticas.total = filas.length;
  
  console.log(`📊 Total de ofertas encontradas: ${filas.length}`);
  
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    await procesarFila(fila, i + 1, isDryRun);
  }
  
  // Mostrar resumen
  mostrarResumen();
  
  // Guardar estadísticas
  chrome.runtime.sendMessage({
    action: 'actualizarEstadisticas',
    data: estadisticas
  });
}

// Procesar una fila individual
async function procesarFila(fila, numero, isDryRun) {
  try {
    // Extraer datos de la fila
    const celdas = fila.querySelectorAll('td');
    if (celdas.length < 5) return;
    
    const institucion = celdas[0]?.textContent.trim();
    const matchText = celdas[2]?.textContent.trim();
    const matchPorcentaje = parseInt(matchText) || 0;
    const precioActual = parseFloat(celdas[3]?.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    const precioCompetencia = parseFloat(celdas[4]?.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    
    console.log(`\n--- Oferta #${numero} ---`);
    console.log(`Institución: ${institucion}`);
    console.log(`Match: ${matchPorcentaje}%`);
    console.log(`Precio actual: $${precioActual}`);
    console.log(`Precio competencia: $${precioCompetencia}`);
    
    // 1. Verificar blacklist
    if (estaEnBlacklist(institucion)) {
      console.log('🔴 BLOQUEADA - En blacklist');
      fila.style.backgroundColor = '#ffebee';
      estadisticas.bloqueadas++;
      return;
    }
    
    // 2. Verificar match mínimo
    if (matchPorcentaje < CONFIG.MIN_MATCH_PERCENTAGE) {
      console.log(`🟠 MATCH BAJO - ${matchPorcentaje}% < ${CONFIG.MIN_MATCH_PERCENTAGE}%`);
      fila.style.backgroundColor = '#fff3e0';
      estadisticas.matchBajo++;
      return;
    }
    
    // 3. Calcular si necesita ajuste de precio
    if (precioCompetencia > 0) {
      const ratio = precioActual / precioCompetencia;
      const precioTarget = precioCompetencia * CONFIG.PORCENTAJE_TARGET;
      
      console.log(`Ratio actual: ${(ratio * 100).toFixed(2)}%`);
      console.log(`Precio target (95%): $${precioTarget.toFixed(0)}`);
      
      // Verificar si está dentro del umbral (no ajustar)
      if (ratio >= CONFIG.UMBRAL_INFERIOR && ratio <= CONFIG.UMBRAL_SUPERIOR) {
        console.log('🟢 OK - Dentro del umbral, no requiere ajuste');
        fila.style.backgroundColor = '#e8f5e9';
        estadisticas.sinAjuste++;
        return;
      }
      
      // Necesita ajuste al 95%
      if (!isDryRun) {
        await ajustarPrecio(fila, precioTarget);
      }
      
      console.log(`🔵 AJUSTADA - Nuevo precio: $${precioTarget.toFixed(0)}`);
      fila.style.backgroundColor = '#e3f2fd';
      estadisticas.ajustadas++;
      
    } else {
      console.log('🟢 OK - Sin competencia, mantener precio');
      fila.style.backgroundColor = '#e8f5e9';
      estadisticas.sinAjuste++;
    }
    
  } catch (error) {
    console.error(`Error procesando fila #${numero}:`, error);
  }
}

// Ajustar precio en la interfaz
async function ajustarPrecio(fila, nuevoPrecio) {
  try {
    // Buscar el input de precio en la fila
    const inputPrecio = fila.querySelector('input[type="number"], input[name*="price"], input[name*="precio"]');
    
    if (inputPrecio) {
      inputPrecio.value = Math.round(nuevoPrecio);
      inputPrecio.dispatchEvent(new Event('change', { bubbles: true }));
      inputPrecio.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Esperar un momento para que se procese
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar y hacer clic en el botón de guardar/actualizar
      const botonGuardar = fila.querySelector('button[type="submit"], button.btn-primary, button.save');
      if (botonGuardar) {
        botonGuardar.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error ajustando precio:', error);
  }
}

// Mostrar resumen en consola
function mostrarResumen() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PROCESAMIENTO');
  console.log('='.repeat(50));
  console.log(`Total procesadas: ${estadisticas.total}`);
  console.log(`🔴 Bloqueadas: ${estadisticas.bloqueadas}`);
  console.log(`🟠 Match bajo: ${estadisticas.matchBajo}`);
  console.log(`🔵 Ajustadas: ${estadisticas.ajustadas}`);
  console.log(`🟢 Sin ajuste: ${estadisticas.sinAjuste}`);
  console.log('='.repeat(50));
  
  // Mostrar notificación visual
  mostrarNotificacion(`Procesadas: ${estadisticas.total} | Ajustadas: ${estadisticas.ajustadas}`);
}

// Mostrar notificación en la página
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.transition = 'opacity 0.5s';
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 500);
  }, 5000);
}

// Escuchar mensajes desde el popup o background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'procesarOfertas') {
    procesarOfertas();
    sendResponse({ success: true });
  }
});

// Auto-ejecutar si está en la página correcta y se activa el modo auto
if (window.location.href.includes('lici.cl/auto_bids')) {
  console.log('✅ Página de ofertas automáticas detectada');
  console.log('💡 Usa el popup de la extensión para procesar ofertas');
}
