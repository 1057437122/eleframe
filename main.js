// Modules to control application life and create native browser window
/**
 * 上线需要处理的问题
 * 1.目标地址
 * 2.关掉开发者工具
 * 3.删除没用的log等
 */
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Store = require('./utils/store.js')
const CronJob = require('cron').CronJob;
const Log = require('./utils/log.js')

let printQueue = []
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences'
});
const log = new Log({
  configName: 'system-log'
})

function printData(args) {
  log.add('Time to print ' + args.unique)
  printQueue.shift()
  winprints = new BrowserWindow({
    show: false,
    title: args.unique,
    webPreferences: {
      nodeIntegration: true
    }
  });
  var html = [
    "<html><head><title>",
    args.unique,
    "</title></head>",
    "<body>",
    args.data,
    "</body></html>",
  ].join("");
  winprints.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
  // winprints.webContents.openDevTools()
  winprints.webContents.on('did-finish-load', () => {
    log.add('sending print information to system printer:' + args.unique)
    winprints.webContents.print({ silent: true, printBackground: true, deviceName: args.deviceName }, (success) => {
      log.add('system printer return:' + args.unique + ':' + success)
    });
  });
}

function cronJob() {
  new CronJob('*/3 * * * * *', () => {
    if (printQueue.length) {
      printData(printQueue[0])
    }
  }, null, true, 'America/Los_Angeles');
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  let width = 800
  let height = 600
  if (store.get('windowBounds')) {
    width = JSON.parse(store.get('windowBounds')).width
    height = JSON.parse(store.get('windowBounds')).height
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width ? width : 800,
    height: height ? height : 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webviewTag: true
    }
  })
  mainWindow.on('resize', () => {
    log.add('window resized')
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', JSON.stringify({ width, height }));
  });
  mainWindow.setMenuBarVisibility(false)

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  // mainWindow.loadURL(`file://${__dirname}/caja/index.html`);
  // mainWindow.loadURL('http://127.0.0.1:1111/')
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    app.quit()
  })
  ipcMain.on('getPrinterList', (event) => {
    const list = mainWindow.webContents.getPrinters()
    mainWindow.webContents.send('recvPrinterList', list)
  })
  ipcMain.on('print-in-html', (event, args) => {
    printQueue.push(args)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  cronJob()
  log.add('now everything started')
})
app.setAppUserModelId(process.execPath)
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})
app.on('will-quit', (event) => {
  log.add('now app will quit in 1 second')
  console.log('app will quit')
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
