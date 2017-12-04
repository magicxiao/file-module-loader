const fs = require('fs');
const path = require('path');
const debug = require('debug')('file-module-loader');
const exclusiveDirs = ['node_modules', '.git']

const loadFiles = function (dir, files) {
  if (files == null) { files = []; }

  const dirname = path.basename(dir);

  if (!exclusiveDirs.includes(dirname)) {
    fs.readdirSync(dir).forEach(function (file) {
      const fpath = path.join(dir, file);

      if (fs.statSync(fpath).isDirectory()) {
        return loadFiles(fpath, files);
      } else {
        return files.push(fpath);
      }
    });
  }

  return files;
};

const load = function (dirpath) {
  const obj = {};

  let dir = __dirname;

  if (typeof (dirpath) === 'string') {
    try {
      fs.statSync(dirpath)
      dir = dirpath
    } catch (err) {
      console.error(err)
    }
  }

  debug("loading dir path is: %s", dir);

  const files = loadFiles(dir);

  files.forEach(function (file) {
    debug("loading file path is: %s", file);

    const ext = path.extname(file);
    const name = path.basename(file, ext);

    if (['index', 'helper', 'example', 'package-lock', 'package'].includes(name)) { return; }

    const mod = require(file);

    if (mod) { return obj[name] = mod; }
  });

  return obj;
};

module.exports = load;
