// Service Worker para Bot Lici FirmaVB
// Maneja eventos en segundo plano

chrome.runtime.onInstalled.addListener(() => {
  console.log('🤖 Bot Lici FirmaVB v1.0 instalado');
  
  // Inicializar configuración por defecto
  chrome.storage.local.set({
    estadisticas: {
      total: 0,
      bloqueadas: 0,
      ajustadas: 0,
      sinAjuste: 0,
      matchBajo: 0
    },
    dryRun: true,  // Modo seguro por defecto
    ultimaEjecucion: null
  });
  
  // Crear menú contextual
  chrome.contextMenus.create({
    id: 'procesar-ofertas',
    title: 'Procesar Ofertas Automáticas',
    contexts: ['page'],
    documentUrlPatterns: ['https://lici.cl/*']
  });
});

// Manejar clic en menú contextual
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'procesar-ofertas') {
    chrome.tabs.sendMessage(tab.id, { action: 'procesarOfertas' });
  }
});

// Manejar mensajes desde content script o popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'actualizarEstadisticas') {
    chrome.storage.local.set({ estadisticas: request.data });
    sendResponse({ success: true });
  }
  
  if (request.action === 'obtenerEstadisticas') {
    chrome.storage.local.get(['estadisticas'], (result) => {
      sendResponse(result.estadisticas || {});
    });
    return true;  // Mantener canal abierto para respuesta async
  }
});
