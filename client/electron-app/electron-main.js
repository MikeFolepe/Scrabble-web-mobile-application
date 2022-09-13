// main.js

// Modules de controle du cycle de vie de l'application et de création 
// de fenêtre native de navigateur
const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  // Création de la fenêtre de navigateur.
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  mainWindow.loadFile('../client/dist/index.html')

  mainWindow.on("closed", () => {
    mainWindow = null;
  })


}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // Sur macOS il est commun de re-créer une fenêtre  lors 
    // du click sur l'icone du dock et qu'il n'y a pas d'autre fenêtre ouverte.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


