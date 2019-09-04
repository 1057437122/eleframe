// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require('electron')
const { dialog, app, shell } = require('electron').remote
const Store = require('./utils/store.js')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
window.getPrinterList = (callback) => {
  ipcRenderer.send('getPrinterList');
  ipcRenderer.on('recvPrinterList', (event, data) => {
    //data就是打印机列表
    callback && callback(data)
  });
}
window.printData = (args, callback) => {
  /**
   * @param str string information to printer
   * @param deviceName printer name
   */
  ipcRenderer.send('print-in-html', { data: args.str, deviceName: args.deviceName, unique: args.unique })
  ipcRenderer.on('print-return-' + args.unique, (event, data) => {
    callback && callback(data + '-' + args.unique)
  })
}
/**
 * args:{key:}
 */
window.getData = (key) => {
  const store = new Store({
    configName: 'userData'
  });
  return store.get(key)
}
window.setData = (key, val) => {
  const store = new Store({
    configName: 'userData'
  });
  store.set(key, val)
}
/**
 * arts= {
    type: 'info',
    buttons: ['good', 'bad', 'cancel'],
    defaultId: 0,
    title: 'this is title',
    message: 'please update your client',
    detail: 'your client is expired plz update it now',
    cancelId: 2,
  }
 */
window.showDialog = (args) => {
  return dialog.showMessageBox(args)
}
window.clientInfo = () => {
  return {
    type: 'Desktop',
    appVersion: app.getVersion(),
    // systemVersion: process.getSystemVersion(),
    systemMemory: process.getSystemMemoryInfo(),
    // appVersion: process.version,
    // versions: process.versions,
    platform: process.platform,
  }
}
window.callSystemBrowser = (url) => {
  shell.openExternal(url);
}
/**
 * args={id:'unique',title:'this is title',body:'this is body'}
 */
window.showNotification = (args, callback) => {
  let myNotification = new Notification(args.title, {
    body: args.body
  })

  myNotification.onclick = () => {
    callback && callback(args.id)
  }
}
