const { contextBridge } = require('electron');
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
