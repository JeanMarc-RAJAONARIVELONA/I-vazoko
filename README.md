# I-Vazoko - Lecteur de Musique Mobile 🎵

Une application mobile de lecture de musique élégante construite avec Expo et React Native.

## Fonctionnalités

- 📚 Bibliothèque musicale complète

  - Gestion des playlists
  - Navigation par titres, artistes et albums
  - Section "Titres Aimés"
  - Historique d'écoute récente

- 🎵 Contrôles de lecture avancés

  - Lecture/Pause
  - Navigation entre les pistes
  - Gestion des files d'attente

- 📱 Interface utilisateur intuitive en français
  - Navigation fluide avec expo-router
  - Design moderne et réactif

## Installation

1. Cloner le projet

```bash
git clone [url-du-projet]
cd i-vazoko
```

2. Installer les dépendances

```bash
npm install
```

3. Lancer l'application

```bash
npx expo start
```

## Structure du Projet

- `/app` - Routes et navigation (expo-router)

  - `/(tabs)` - Navigation principale
  - `/playlist` - Gestion des playlists
  - `/select-tracks` - Sélection de titres

- `/component` - Composants réutilisables
- `/store` - Gestion de l'état (audio, playlists)
- `/services` - Services et logique métier
- `/assets` - Ressources (audio, images, polices)

## Technologies

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [expo-router](https://docs.expo.dev/router/introduction)
- [expo-av](https://docs.expo.dev/versions/latest/sdk/av/) pour la lecture audio
