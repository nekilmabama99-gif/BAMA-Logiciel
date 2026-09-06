const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Empêche l'ouverture de plusieurs instances de l'application en même temps :
// sans ça, deux fenêtres pourraient écrire en parallèle dans le même stockage
// local (double clic accidentel sur le Bureau + le menu Démarrer, par exemple)
// et se marcher dessus sur les mêmes données.
const verrouInstanceUnique = app.requestSingleInstanceLock();

if (!verrouInstanceUnique) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

function createWindow() {
  Menu.setApplicationMenu(null); // pas de barre de menu (Fichier/Édition...), inutile pour cette app

  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    show: false,
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Désactivé pour le logiciel livré aux clients : sans ça, n'importe qui peut ouvrir la
      // console (Ctrl+Maj+I, actif par défaut) et manipuler l'application depuis JavaScript
      // (contourner l'activation, modifier des données...). Pour déboguer pendant le
      // développement, mettre temporairement "true" puis remettre "false" avant de livrer.
      devTools: false
    }
  });

  win.maximize();
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => win.show());
}

if (verrouInstanceUnique) {
  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
