# 🔒 Politique de Confidentialité — SpotiFiak

> **Date d'effet :** 27 septembre 2026  
> **Dernière mise à jour :** 27 septembre 2026

---

## Introduction

SpotiFiak (ci-après « l'Application ») est un projet logiciel open-source gratuit. Cette politique de confidentialité explique comment l'Application traite les informations des utilisateurs.

**En résumé : SpotiFiak ne collecte, ne stocke et ne transmet aucune donnée personnelle.**

---

## 1. Données que nous NE collectons PAS

SpotiFiak **ne collecte aucune** des données suivantes :

| Catégorie | Collecté ? |
|:---|:---:|
| Nom, email, numéro de téléphone | ❌ Non |
| Identifiants de compte Spotify | ❌ Non |
| Historique d'écoute | ❌ Non |
| Position géographique | ❌ Non |
| Identifiant publicitaire (GAID/IDFA) | ❌ Non |
| Informations sur l'appareil | ❌ Non |
| Statistiques d'utilisation / Analytics | ❌ Non |
| Crash reports | ❌ Non |

---

## 2. Stockage Local

L'Application stocke certaines préférences **uniquement en local** sur votre appareil :

- **Thème actif** : l'identifiant du thème de couleur sélectionné
- **Extensions activées** : la liste des extensions que vous avez activées
- **CSS personnalisé** : tout code CSS que vous avez saisi manuellement
- **Préférences d'interface** : paramètres de l'overlay SpotiFiak

Ces données :
- Sont stockées via `localStorage` dans la WebView de l'application
- Ne quittent **jamais** votre appareil
- Sont supprimées si vous désinstallez l'Application
- Peuvent être effacées en vidant les données de l'Application dans les paramètres Android

---

## 3. Interaction avec Spotify

Lorsque vous utilisez SpotiFiak, vous accédez au service web de Spotify (`open.spotify.com`). Cette interaction est soumise à la [Politique de Confidentialité de Spotify](https://www.spotify.com/legal/privacy-policy/).

SpotiFiak :
- **N'intercepte pas** les communications entre vous et Spotify
- **Ne modifie pas** les données envoyées ou reçues par Spotify
- **N'accède pas** à vos identifiants de connexion Spotify
- **Ne stocke pas** de tokens d'authentification sur des serveurs externes

---

## 4. Permissions Android

SpotiFiak demande les permissions suivantes :

| Permission | Raison |
|:---|:---|
| `INTERNET` | Accéder au lecteur web Spotify |
| `FOREGROUND_SERVICE` | Maintenir la lecture audio en arrière-plan |
| `WAKE_LOCK` | Empêcher la mise en veille pendant la lecture |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Service de lecture de médias |
| `POST_NOTIFICATIONS` | Afficher les contrôles de lecture dans la barre de notifications |

Aucune permission sensible (contacts, caméra, microphone, stockage externe, localisation) n'est demandée.

---

## 5. Services Tiers

SpotiFiak **n'intègre aucun** service tiers de tracking ou d'analyse :

- ❌ Pas de Google Analytics, Firebase Analytics, ou équivalent
- ❌ Pas de SDK publicitaire (AdMob, Facebook Ads, etc.)
- ❌ Pas de service de crash reporting (Crashlytics, Sentry, etc.)
- ❌ Pas de réseau social SDK

---

## 6. Sécurité

- Toutes les communications avec Spotify transitent par HTTPS (chiffrement TLS)
- L'Application ne stocke aucune information sensible
- Le code source est entièrement ouvert et auditable sur [GitHub](https://github.com/SatanMerde/SpotiFiak)

---

## 7. Droits de l'Utilisateur

Puisque SpotiFiak ne collecte aucune donnée personnelle :
- Il n'y a aucune donnée à consulter, modifier ou supprimer
- Les préférences locales peuvent être supprimées en vidant les données de l'Application dans les paramètres Android

---

## 8. Modifications de cette Politique

Cette politique peut être mise à jour occasionnellement. Les modifications seront publiées sur le dépôt GitHub du projet. Nous vous encourageons à consulter cette page régulièrement.

---

## 9. Contact

Pour toute question relative à cette politique de confidentialité, veuillez ouvrir une issue sur le [dépôt GitHub](https://github.com/SatanMerde/SpotiFiak/issues).

---

<div align="center">
  <sub>SpotiFiak — Zéro donnée collectée, respect total de votre vie privée • 2026</sub>
</div>
