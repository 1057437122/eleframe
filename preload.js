// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer, remote } = require('electron')

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
  getPrinterList(callback)
}
window.printData = (args, callback) => {
  printData(args, callback)
}
function getPrinterList(callback) {
  ipcRenderer.send('getPrinterList');
  ipcRenderer.on('recvPrinterList', (event, data) => {
    //data就是打印机列表
    callback && callback(data)
  });
}
function printData(args, callback) {
  /**
   * @param str string information to printer
   * @param deviceName printer name
   */
  ipcRenderer.send('print-in-html', { data: args.str, deviceName: args.deviceName, unique: args.unique })
  ipcRenderer.on('print-return-' + args.unique, (event, data) => {
    callback && callback(data + '-' + args.unique)
  })
}
