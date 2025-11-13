// blacklist.js - Lista de instituciones bloqueadas

const BLACKLIST = [
  // Agregar aquí los nombres o IDs de instituciones que NO quieres procesar
  // Ejemplo:
  // 'MUNICIPALIDAD DE EJEMPLO',
  // 'SERVICIO EJEMPLO',
  
  // Puedes agregar palabras clave que bloqueen cualquier institución que las contenga
];

// Función para verificar si una institución está en blacklist
function estaEnBlacklist(nombreInstitucion) {
  if (!nombreInstitucion) return false;
  
  const nombreLower = nombreInstitucion.toLowerCase();
  
  return BLACKLIST.some(item => {
    const itemLower = item.toLowerCase();
    return nombreLower.includes(itemLower);
  });
}
