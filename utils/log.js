const electron = require('electron')
const path = require('path');
const fs = require('fs');

class Log {
  constructor(opts) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.path = path.join(userDataPath, (typeof (opts.configName) !== 'undefined' ? opts.configName : 'system_log') + '-' + new Date().toISOString().slice(0, 10) + '.log');
  }
  add(str) {
    // add log to file
    if (typeof (str) === 'object') {
      str = JSON.stringify(str)
    }
    if (typeof (str) !== 'string') {
      return
    }
    str = new Date().toISOString().slice(11, 25) + ':' + str + "\r\n"
    try {
      fs.appendFile(this.path, str, function (err) {
        if (err) throw err;
      });
    } catch (err) {
    }
  }

}
// expose the class
module.exports = Log