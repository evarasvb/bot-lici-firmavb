// popup.js - Controla la UI del popup de la extensión

// Elementos del DOM
const procesarBtn = document.getElementById('procesar-btn');
const verConfigBtn = document.getElementById('ver-config-btn');
const dryRunToggle = document.getElementById('dry-run-toggle');

// Elementos de estadísticas
const totalProcesadasEl = document.getElementById('total-procesadas');
const bloqueadasEl = document.getElementById('bloqueadas');
const ajustadasEl = document.getElementById('ajustadas');
const sinAjusteEl = document.getElementById('sin-ajuste');
const matchBajoEl = document.getElementById('match-bajo');
const empresaActualEl = document.getElementById('empresa-actual');

// Cargar estado guardado al abrir popup
document.addEventListener('DOMContentLoaded', () => {
  cargarEstadoGuardado();
  cargarEstadisticas();
});

// Botón de procesar ofertas
procesarBtn.addEventListener('click', async () => {
  procesarBtn.disabled = true;
  procesarBtn.textContent = '⏳ Procesando...';
  
  try {
    // Obtener tab activa
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('lici.cl')) {
      alert('⚠️ Debes estar en lici.cl/auto_bids para procesar ofertas');
      return;
    }
    
    // Enviar mensaje al content script para procesar
    chrome.tabs.sendMessage(tab.id, { action: 'procesar_ofertas' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        alert('❌ Error al comunicarse con la página. Recarga lici.cl e intenta de nuevo.');
        return;
      }
      
      if (response && response.success) {
        console.log('✅ Procesamiento completado:', response);
        // Actualizar estadísticas
        cargarEstadisticas();
      }
    });
  } catch (error) {
    console.error('Error al procesar:', error);
    alert('❌ Error al procesar ofertas: ' + error.message);
  } finally {
    setTimeout(() => {
      procesarBtn.disabled = false;
      procesarBtn.textContent = '▶️ Procesar Ofertas Ahora';
    }, 2000);
  }
});

// Botón de ver configuración
verConfigBtn.addEventListener('click', () => {
  const mensaje = `
🤖 BOT LICI FIRMAVB - CONFIGURACIÓN

📋 Orden de Empresas:
1. FirmaVB Aseo
2. FirmaVB Mobiliario ⭐
3. FirmaVB Ferretería
4. FirmaVB Desechable
5. FirmaVB Ergonomía
6. FirmaVB Alimento

📊 Criterios de Match:
• Mínimo: 70%
• Prioridad 1: 100% match
• Prioridad 2: 94-99% match
• Prioridad 3: 70-93% match

💰 Ajuste de Precios:
• Target: 95% del presupuesto
• Rango aceptable: 95%-115%
• Si < 95% → Ajustar a 95%
• Si > 115% → Ajustar a 95%

🚫 Blacklist: ${BLACKLIST_INSTITUCIONES.length} instituciones bloqueadas
  `;
  alert(mensaje);
});

// Toggle DRY_RUN mode
dryRunToggle.addEventListener('change', () => {
  const dryRunEnabled = dryRunToggle.checked;
  
  // Guardar estado
  chrome.storage.local.set({ dryRunEnabled }, () => {
    console.log('DRY_RUN mode:', dryRunEnabled);
    
    // Notificar al content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'set_dry_run', 
          value: dryRunEnabled 
        });
      }
    });
  });
});

// Cargar estado guardado del DRY_RUN
function cargarEstadoGuardado() {
  chrome.storage.local.get(['dryRunEnabled'], (result) => {
    if (result.dryRunEnabled !== undefined) {
      dryRunToggle.checked = result.dryRunEnabled;
    }
  });
}

// Cargar estadísticas guardadas
function cargarEstadisticas() {
  chrome.storage.local.get(['estadisticas'], (result) => {
    if (result.estadisticas) {
      const stats = result.estadisticas;
      totalProcesadasEl.textContent = stats.total || 0;
      bloqueadasEl.textContent = stats.bloqueadas || 0;
      ajustadasEl.textContent = stats.ajustadas || 0;
      sinAjusteEl.textContent = stats.sinAjuste || 0;
      matchBajoEl.textContent = stats.matchBajo || 0;
    }
  });
  
  // Obtener empresa actual
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('lici.cl')) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'get_empresa_actual' }, (response) => {
        if (response && response.empresa) {
          empresaActualEl.textContent = response.empresa;
        }
      });
    }
  });
}



