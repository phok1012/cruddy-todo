const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird')

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, counter) => {
    let newpath = path.join(exports.dataDir, counter + '.txt')
    fs.writeFile(newpath, text, (err) => {
      err ? console.log(err) : callback(err, {'id': counter,'text': text})
    })
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {

    return new Promise ((resolve, reject) => {
      const readOneAsync = Promise.promisify(exports.readOne)
      let arrayOfPromises = files.map(text => {
        return readOneAsync(text.slice(0, -4))
      })
      resolve(arrayOfPromises)
    })
    .then((arrayOfPromises) => {
        return Promise.all(arrayOfPromises)
      .then((arrayOftext) => {
        callback(null, arrayOftext)
      })
    })
  })
};

exports.readOne = (id, callback) => {
  let newPath = path.join(exports.dataDir, id + '.txt');
  fs.readFile(newPath, (err, data) => {
  if (err) {
    callback(err);
  } else {
    callback(null, {'id': id, 'text':data.toString()});
  }
  })
};

exports.update = (id, text, callback) => {
  let newPath = path.join(exports.dataDir, id + '.txt');
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      files.forEach((file) => {
        if (file.slice(0, -4) === id) {
          fs.writeFile(newPath, text, (err) => {
            if(err) {
              callback(err)
            } else {
              callback(null, {'id': id, 'text':text})
            }
          })
        } else {
          callback(true)
        }
      })
    }
  })

};

exports.delete = (id, callback) => {
  let newPath = path.join(exports.dataDir, id + '.txt');
  fs.rm(newPath, (err) => {
    if (err) {
      callback(err);
    }
    else {
      callback(null);
    }
  })
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
