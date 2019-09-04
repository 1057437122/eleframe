const electron = require('electron')
const path = require('path');
const fs = require('fs');

class Store {
  constructor(opts) {
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    /**
     * opts:{configName:xxx,neecEncrypt:false}
     */
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + '.json');

    this.data = parseDataFile(this.path);
  }

  // This will just return the property on the `data` object
  get(key) {
    if (this.data[key]) {
      return myDecrypt(this.data[key]);
    }
    return ''
  }

  // ...and this will set it
  set(key, val) {
    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    try {
      this.data[key] = myEncrypt(val);
      fs.writeFileSync(this.path, JSON.stringify(this.data));
    } catch (err) {
      console.log(err)
    }
  }
}

function parseDataFile(filePath) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  if (fs.existsSync(filePath)) {
    //file exists
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
      console.error(err)
      return {};
    }
  }
  return {};
}

function myEncrypt(str) {
  console.log(str)
  const _base_str = Buffer.from(str);// new Buffer(str);
  const _base64ed_str = _base_str.toString('base64')
  return _base64ed_str
}
function myDecrypt(str) {
  const _base64ed_str = Buffer.from(str, 'base64')
  return _base64ed_str.toString();
}

// expose the class
module.exports = Store;