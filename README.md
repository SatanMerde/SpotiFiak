# 🎵 SpotiFiak — Spicetify for Mobile

<p align="center">
  <img src="public/favicon.svg" width="120" alt="SpotiFiak Logo">
</p>

<p align="center">
  <strong>Personnalisez Spotify Web Player avec des thèmes, extensions et addons communautaires — directement depuis votre téléphone.</strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#marketplace">Marketplace</a> •
  <a href="#créer-un-addon">Créer un Addon</a> •
  <a href="#compatibilité-spicetify">Compatibilité Spicetify</a>
</p>

---

## ✨ Fonctionnalités

- 🎧 **Lecteur Web Spotify** — Le Spotify Web Player intégré, optimisé pour mobile
- 🎨 **Thèmes** — Changez complètement l'apparence de Spotify (Midnight Wave, Aurora Borealis, Retro Synthwave...)
- 🧩 **Extensions** — Ajoutez des fonctionnalités (Lyrics+, Visualizer, Ad Skipper, Sleep Timer...)
- 📱 **Custom Apps** — Applications complètes intégrées (Stats Dashboard, Queue Manager+...)
- 🏪 **Marketplace** — Découvrez et installez des addons communautaires
- 🔗 **Compatibilité Spicetify** — Les extensions PC Spicetify peuvent tourner sur SpotiFiak
- 📦 **PWA** — Installable sur votre téléphone comme une vraie app

## 🚀 Installation

### Prérequis
- [Node.js](https://nodejs.org/) v18+

### Lancer en local

```bash
git clone https://github.com/SatanMerde/SpotiFiak.git
cd SpotiFiak
npm install
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

### Installer sur téléphone

1. Ouvrez SpotiFiak dans Chrome/Safari sur votre téléphone
2. Appuyez sur "Ajouter à l'écran d'accueil"
3. SpotiFiak est maintenant installé comme une app !

## 🏪 Marketplace

Le Marketplace propose 3 types d'addons :

| Type | Description | Exemple |
|------|-------------|---------|
| 🎨 **Thèmes** | Changent l'apparence de Spotify | Midnight Wave, Aurora Borealis |
| 🧩 **Extensions** | Ajoutent des fonctionnalités | Lyrics+, Audio Visualizer |
| 📱 **Apps** | Applications complètes | Stats Dashboard, Queue Manager+ |

### Installer un addon
1. Allez dans l'onglet **Marketplace**
2. Parcourez ou recherchez un addon
3. Cliquez sur **Installer**
4. L'addon est actif immédiatement !

## 🔧 Créer un Addon

### Thème (CSS)

```css
/* mon-theme.css */
:root {
  --sf-bg-primary: #1a1a2e;
  --sf-accent: #e94560;
}

body, .Root__top-container {
  background: var(--sf-bg-primary) !important;
}
```

### Extension (JavaScript)

```javascript
// mon-extension.js
(function MonExtension() {
  const SpotiFiak = window.SpotiFiak;
  if (!SpotiFiak) return;

  SpotiFiak.registerExtension({
    id: 'ext-mon-extension',
    name: 'Mon Extension',
    version: '1.0.0',

    onEnable() {
      console.log('Extension activée !');
      SpotiFiak.showNotification('Hello', 'Mon extension fonctionne !', 'success');
    },

    onDisable() {
      console.log('Extension désactivée');
    }
  });
})();
```

### Soumettre au Marketplace

1. Créez un repo GitHub avec votre addon
2. Ajoutez le fichier dans `addons/local/`
3. Mettez à jour `addons/registry.json`
4. Envoyez une Pull Request !

## 🔗 Compatibilité Spicetify

SpotiFiak émule l'API Spicetify pour permettre aux extensions PC de fonctionner :

| API Spicetify | Support |
|---------------|---------|
| `Spicetify.Player` | ✅ Émulé |
| `Spicetify.CosmosAsync` | ✅ Émulé |
| `Spicetify.LocalStorage` | ✅ Natif |
| `Spicetify.Topbar` | ✅ Émulé |
| `Spicetify.PopupModal` | ✅ Émulé |
| `Spicetify.ContextMenu` | ✅ Émulé |
| `Spicetify.Platform` | ⚡ Partiel |
| `Spicetify.URI` | ✅ Émulé |

## 📁 Structure du Projet

```
SpotiFiak/
├── server.js              # Serveur Express
├── package.json
├── public/
│   ├── index.html         # App principale (PWA)
│   ├── manifest.json      # Manifest PWA
│   ├── favicon.svg
│   ├── css/
│   │   └── index.css      # Design system
│   └── js/
│       ├── spotifiak-api.js   # API SpotiFiak + Spicetify compat
│       └── app.js             # Logique de l'application
├── addons/
│   ├── registry.json      # Registre des addons
│   └── local/
│       ├── themes/        # Thèmes CSS
│       ├── extensions/    # Extensions JS
│       └── apps/          # Custom Apps
```

## ⚠️ Avertissement

Ce projet n'est **pas affilié** à Spotify AB. Utilisez-le à vos propres risques. SpotiFiak est un projet éducatif et open-source.

## 📄 Licence

MIT © [SatanMerde](https://github.com/SatanMerde)
