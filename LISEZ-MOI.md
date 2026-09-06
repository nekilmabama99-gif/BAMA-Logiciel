# Gestion Établissement — version installeur (100% hors-ligne)

## Ce que fait ce dossier

Il transforme ton application (le fichier `app/index.html`) en un vrai logiciel
de bureau Windows : icône sur le Bureau, menu Démarrer, désinstallation propre
via le Panneau de configuration — sans jamais passer par un navigateur ni
avoir besoin d'internet côté école.

**Important : internet n'est nécessaire qu'une seule fois, sur TON ordinateur,
pour fabriquer l'installeur.** Une fois l'installeur (`.exe`) créé, tu peux le
copier sur une clé USB et l'installer sur n'importe quel poste, même sans
aucune connexion.

## Étape 1 — Une seule fois, sur un ordinateur connecté à internet

1. Installer [Node.js](https://nodejs.org) (version LTS) si ce n'est pas déjà fait.
2. Ouvrir un terminal dans ce dossier (`electron-app/`).
3. Lancer :
   ```
   npm install
   ```
   (télécharge Electron et l'outil de construction — nécessite internet, une seule fois)
4. Lancer :
   ```
   npm run dist
   ```
5. Récupérer le fichier installeur dans le dossier `dist/` qui vient d'être
   créé, quelque chose comme `Gestion Etablissement Setup 1.0.0.exe`.

## Étape 2 — Distribution aux écoles (aucune connexion nécessaire)

- Copier ce fichier `.exe` sur une clé USB.
- Sur le poste de l'école : double-cliquer sur l'installeur, suivre les
  étapes (choix du dossier d'installation possible), c'est tout.
- Une icône apparaît sur le Bureau et dans le menu Démarrer. Aucune
  connexion requise à aucun moment de cette étape.

## Tester sans construire d'installeur

Pour vérifier que tout fonctionne avant de construire l'installeur final :
```
npm start
```
Cela ouvre l'application dans sa propre fenêtre (comme un vrai logiciel),
sans passer par `npm run dist`.

## Mettre à jour l'application plus tard

Quand tu ajoutes une fonctionnalité à `index.html` (le fichier principal de
l'app) :
1. Remplace `app/index.html` par la nouvelle version.
2. Relance `npm run dist`.
3. Redistribue le nouvel installeur (l'ancien peut être réinstallé par-dessus
   sans perte de données, car les données restent dans le profil Windows de
   chaque poste, pas dans le dossier d'installation).

## Mac / Linux

Le projet est maintenant configuré pour les trois systèmes : Windows (`.exe`
via nsis), Linux (`.AppImage`) et Mac (`.dmg`).

```
npm run dist:win     → installeur Windows
npm run dist:linux   → AppImage Linux
npm run dist:mac     → .dmg Mac
```

**Attention, une limite technique importante à connaître** : Apple interdit
de construire un `.dmg` Mac depuis Windows ou Linux. `npm run dist:mac` ne
fonctionnera donc que si tu le lances **sur un vrai Mac**. Windows et Linux
n'ont pas cette restriction : tu peux construire `dist:win` et `dist:linux`
depuis n'importe quel système (y compris depuis un Mac, ou l'inverse).

### Si tu n'as pas de Mac sous la main

Le dossier `.github/workflows/build.yml` fourni avec ce projet règle ce
problème : en le poussant sur un dépôt GitHub (gratuit), GitHub construit
automatiquement les trois installeurs (Windows + Mac + Linux) sur ses propres
machines — y compris un vrai Mac dans le cloud — et te les met à
disposition en téléchargement, sans que tu aies besoin de posséder un Mac
toi-même. Étapes :
1. Créer un dépôt GitHub (public ou privé) et y pousser ce dossier.
2. GitHub construit automatiquement à chaque `git push` (voir l'onglet
   "Actions" du dépôt).
3. Une fois le build terminé, télécharger les 3 installeurs depuis les
   "Artifacts" du build.

## Licence du logiciel

Ce projet embarque la version de `index.html` qui utilise déjà le nouveau
système de licence par clé publique/privée, désormais **verrouillée à un
ordinateur précis** (impossible de réutiliser la même clé sur plusieurs
postes). Procédure :

1. L'école lance l'application : l'écran d'activation affiche un
   "identifiant machine" propre à son ordinateur, avec un bouton "Copier".
2. L'école te transmet cet identifiant, avec le nom exact de l'établissement.
3. Dans `generateur-licences.html` (fourni séparément, à garder chez toi),
   renseigne le nom, colle l'identifiant machine reçu, et génère la clé.
4. Transmets la clé à l'école : elle ne fonctionnera que sur l'ordinateur
   dont l'identifiant a été utilisé à l'étape 3.

Laisser le champ "Identifiant machine" vide dans le générateur produit une
licence non verrouillée (utilisable sur n'importe quel poste) — à réserver
aux cas particuliers (démonstration, test).
