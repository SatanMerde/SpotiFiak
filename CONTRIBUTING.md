# 🤝 Contribuer à SpotiFiak

Merci de votre intérêt pour **SpotiFiak** ! Voici comment contribuer au projet ou soumettre vos propres addons communautaires.

---

## 🎨 Créer et Proposer un Addon

Les addons SpotiFiak sont répertoriés dans [`addons/registry.json`](addons/registry.json).

### 1. Structure d'un Thème (CSS)

Créez un fichier dans `addons/local/themes/mon-theme.css` :

```css
/* mon-theme.css */
:root {
  --spice-main: #121212;
  --spice-sidebar: #000000;
  --spice-player: #181818;
  --spice-accent: #1db954;
  --spice-text: #ffffff;
}

/* Vos règles personnalisées pour le Spotify Web Player */
.Root__nav-bar {
  background: var(--spice-sidebar) !important;
}
```

### 2. Structure d'une Extension (JavaScript)

Créez un fichier dans `addons/local/extensions/mon-extension.js` :

```javascript
// mon-extension.js
(function() {
  'use strict';
  console.log('[SpotiFiak] Mon extension chargée');

  if (window.SpotiFiak) {
    window.SpotiFiak.registerExtension({
      id: 'ext-mon-extension',
      name: 'Mon Extension',
      version: '1.0.0',
      onEnable() {
        window.SpotiFiak.showNotification('Activé', 'Mon extension fonctionne !', 'success');
      },
      onDisable() {
        console.log('Désactivé');
      }
    });
  }
})();
```

### 3. Enregistrer l'Addon dans `registry.json`

Ajoutez votre entrée dans `addons/registry.json` :

```json
{
  "id": "theme-mon-theme",
  "name": "Mon Thème",
  "description": "Description claire de votre thème",
  "type": "theme",
  "author": "VotrePseudo",
  "version": "1.0.0",
  "file": "themes/mon-theme.css",
  "source": "local",
  "tags": ["dark", "minimal"],
  "downloads": 0,
  "rating": 5.0,
  "spicetify_compatible": false
}
```

Puis ouvrez une **Pull Request** sur GitHub !

---

## 🛠️ Compiler l'APK en Local

### Prérequis
- Java JDK 17
- Android SDK (API 34)

### Commandes
```bash
# Cloner le repo
git clone https://github.com/SatanMerde/SpotiFiak.git
cd SpotiFiak

# Compilation Debug
./gradlew assembleDebug

# L'APK sera généré dans :
# app/build/outputs/apk/debug/app-debug.apk
```
