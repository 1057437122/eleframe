const electron = require('electron')
const path = require('path');
const fs = require('fs');
const admZip = require('adm-zip');
class Tools {
  static removeAll() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    // 删除所有的日志文件
    fs.readdir(userDataPath, (err, files) => {
      if (err) {
        //
      }
      files.forEach((item) => {
        if (item.endsWith('.log')) {
          fs.unlink(path.join(userDataPath, item), (err) => {
            if (err) {
              //
            } else {
              return 'success'
            }
          })
        }
      })
    })
    return 'success'
  }
  static zipAllSystemLog() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    let zip = new admZip()
    const content = "this is zip file by system";
    zip.addFile("README.txt", Buffer.alloc(content.length, content), "this is zip file by system");
    const zipPath = path.join(userDataPath, 'systemLogZip-' + new Date().toISOString().slice(0, 10) + '.zip');
    fs.readdirSync(userDataPath, (err, files) => {
      if (err) {
        //
        return ''
      }
      files.forEach(item => {
        if (item.endsWith('.log')) {
          zip.addLocalFile(path.join(userDataPath, item))
        }
      })
      zip.writeZip(zipPath)
    })
    return zipPath
  }
}
module.exports = Tools