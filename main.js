// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webviewTag: true
    }
  })
  global.econsole = function (item) {
    console.log(item)
  }

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  ipcMain.on('getPrinterList', (event) => {
    const list = mainWindow.webContents.getPrinters()
    mainWindow.webContents.send('recvPrinterList', list)
  })
  ipcMain.on('print-in-html', (event, args) => {
    winprints = new BrowserWindow({
      show: false, webPreferences: {
        nodeIntegration: true
      }
    });
    winprints.loadURL(`file://${__dirname}/assets/printTpl.html`);
    // winprints.webContents.openDevTools();
    winprints.webContents.on('did-finish-load', () => {
      winprints.webContents.send('set-html-data', args);
    });

    ipcMain.on('do-print', (event, args) => {
      winprints.webContents.print({ silent: true, printBackground: true, deviceName: args.deviceName }, (success) => {
        if (success) {
          // 应该使用主线程 ?
          mainWindow.webContents.send('print-return-' + args.unique, 'success')
          console.log('success')
        } else {
          console.log('error')
          mainWindow.webContents.send('print-return-' + args.unique, 'error')
        }
      });
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
