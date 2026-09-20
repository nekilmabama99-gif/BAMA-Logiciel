const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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

// Export PDF natif : reçoit un document HTML complet (déjà assemblé côté renderer, avec ses
// styles) et le convertit en PDF via une fenêtre Chromium cachée — sans passer par la boîte de
// dialogue "Imprimer" du système, pour un export direct en un clic. Le document est chargé
// depuis un fichier temporaire plutôt qu'une URL "data:" : certains documents (bulletins avec
// beaucoup d'élèves, photos en base64) dépassent la limite de longueur d'une URL data:.
ipcMain.handle('exporter-pdf', async (event, documentHtmlComplet, nomFichierSuggere) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Enregistrer en PDF',
    defaultPath: (nomFichierSuggere || 'document') + '.pdf',
    filters: [{ name: 'Fichier PDF', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) return { annule: true };

  const cheminTemp = path.join(app.getPath('temp'), 'gestion-ecole-export-' + Date.now() + '.html');
  const fenetrePdf = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  try {
    fs.writeFileSync(cheminTemp, documentHtmlComplet, 'utf-8');
    await fenetrePdf.loadFile(cheminTemp);
    const pdfBuffer = await fenetrePdf.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { marginType: 'default' }
    });
    fs.writeFileSync(filePath, pdfBuffer);
    return { annule: false, chemin: filePath };
  } catch (e) {
    return { erreur: String(e && e.message || e) };
  } finally {
    fenetrePdf.destroy();
    fs.unlink(cheminTemp, () => {}); // best-effort, pas bloquant si l'effacement échoue
  }
});

if (verrouInstanceUnique) {
  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
