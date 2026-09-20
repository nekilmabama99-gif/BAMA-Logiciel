const { contextBridge, ipcRenderer } = require('electron');
const { machineIdSync } = require('node-machine-id');

// N'expose QUE cette seule fonction au renderer (contextIsolation reste actif,
// nodeIntegration reste désactivé) : aucune autre API Node n'est accessible
// depuis index.html. L'identifiant est haché (pas l'UUID matériel brut), stable
// tant que le système d'exploitation n'est pas réinstallé.
contextBridge.exposeInMainWorld('licenceAPI', {
  obtenirIdentifiantMachine: () => {
    try { return machineIdSync(); } catch (e) { return null; }
  }
});

// Export PDF natif (voir main.js, gestionnaire 'exporter-pdf') : seule cette fonction précise
// est exposée, pas ipcRenderer en entier — le renderer ne peut donc pas invoquer n'importe quel
// canal IPC, seulement demander un export PDF avec un document HTML qu'il fournit lui-même.
contextBridge.exposeInMainWorld('pdfAPI', {
  exporterPDF: (documentHtmlComplet, nomFichierSuggere) =>
    ipcRenderer.invoke('exporter-pdf', documentHtmlComplet, nomFichierSuggere)
});
