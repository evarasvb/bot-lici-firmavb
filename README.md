# 🤖 Bot Lici FirmaVB - Extensión de Chrome

## 📝 Descripción

Extensión de Chrome para automatizar el procesamiento de ofertas en lici.cl (Mercado Público Chile).

## 🔗 CÓDIGO FUENTE COMPLETO

**TODO el código de la extensión está disponible en:**

https://docs.google.com/document/d/1DcmnbVMDsYC4KenM2P310Z6dEUARvTrSffCjsGHn7KE/edit

## ✅ Funcionalidades

- Filtrado de 200+ instituciones en blacklist
- Ajuste automático de precios al 95% del presupuesto  
- Procesamiento por orden de prioridad de empresas
- Match mínimo del 70%
- Modo DRY_RUN para pruebas seguras

## 🚀 Instalación RÁPIDA

1. Abre el [Google Docs con el código completo](https://docs.google.com/document/d/1DcmnbVMDsYC4KenM2P310Z6dEUARvTrSffCjsGHn7KE/edit)
2. Crea una carpeta `bot-lici-firmavb` en tu computador
3. Copia los 8 archivos del Google Docs a sus respectivos archivos:
   - manifest.json
   - config.js
   - blacklist.js
   - content.js
   - popup.html
   - popup.js
   - background.js
   - styles.css
4. Abre Chrome y ve a `chrome://extensions/`
5. Activa "Modo de desarrollador"
6. Haz clic en "Cargar extensión sin empaquetar"
7. Selecciona la carpeta `bot-lici-firmavb`

## 🎯 Uso

1. Inicia sesión en lici.cl
2. Ve a https://lici.cl/auto_bids  
3. Haz clic en el icono de la extensión
4. Verifica que "Modo DRY RUN" esté activado
5. Haz clic en "Procesar Ofertas Ahora"

## 📊 Sistema de Colores

- 🔴 Rojo = Bloqueada (blacklist)
- 🟠 Naranja = Match bajo (<70%)
- 🔵 Azul = Ajustada al 95%
- 🟢 Verde = OK sin ajuste

## 📝 Licencia

Creado para: Enrique - FirmaVB
Fecha: 12 Noviembre 2025
Versión: 1.0
