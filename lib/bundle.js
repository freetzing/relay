/**
 * GNU GPLv3.0
 *
 *  This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Max Karpawich
 * Based on work by Paul Vollmer
 */

'use strict'

var ADMZip = require('adm-zip')
var { Part } = require('./part')
var { Sketch } = require('./sketch')
var { Bin } = require('./bin')

/**
 * @constructor
 * @class
 * @classdesc A collection of "primary" Fritzing data and "auxiliary" resource files
 * @param {{fileName: string, model: object}} [primary = {}] A collection of Fritzing data referenced by file name
 * @param {{fileName: string, fileContents: string}} [auxiliary = {}] A collection of resource files referenced by file name
 * @param {function} toFile Converts a Fritzing JavaScript model to its corresponding data file
 * @param {function} fromFile Converts a data file to its corresponding Fritzing JavaScript model, returning a Promise that will resolve to the generated model
 * @param {function} isPrimary Returns whether or not a given file is classified as Fritzing data using file extensions
 */
var Bundle = function (primary, auxiliary, toFile, fromFile, isPrimary) {
  this.primary = primary || {}
  this.auxiliary = auxiliary || {}
  this.toFile = toFile
  this.fromFile = fromFile
  this.isPrimary = isPrimary
}

/**
 * Returns the primary with the given file name
 * @param {string} fileName The file name of the primary
 * @return {object} The primary with the given file name
 */
Bundle.prototype.getPrimary = function (fileName) {
  return this.primary[fileName]
}

/**
 * Adds a primary to this Bundle on the condition that another primary with the same file name does not already exist
 * @param {string} fileName The file name of the primary to be added
 * @param {object} primary The primary to be added
 */
Bundle.prototype.setPrimary = function (fileName, primary) {
  this.primary[fileName] = primary
}

/**
 * Returns whether this Bundle has a primary with the given file name
 * @param {string} fileName The given file name to search for
 * @return {boolean} Whether this Bundle has a primary with the given file name
 */
Bundle.prototype.hasPrimary = function (fileName) {
  return this.primary.hasOwnProperty(fileName)
}

/**
 * Removes the primary with the given file name
 * @param {string} fileName The file name of the primary
 */
Bundle.prototype.removePrimary = function (fileName) {
  delete this.primary[fileName]
}

/**
 * Returns this Bundle as a zip file buffer
 * @return {Buffer} This Bundle as a zip file buffer
 */
Bundle.prototype.toZip = function () {
  var i
  var primary = this.primary
  var auxiliary = this.auxiliary
  var primaryFiles = Object.keys(primary)
  var auxiliaryFiles = Object.keys(auxiliary)
  var zip = new ADMZip()

  for (i = 0; i < primaryFiles.length; i++) {
    var primaryFile = primaryFiles[i]
    zip.addFile(primaryFile, Buffer.from(this.toFile(primary[primaryFile])))
  }

  for (i = 0; i < auxiliaryFiles.length; i++) {
    var auxiliaryFile = auxiliaryFiles[i]
    zip.addFile(auxiliaryFile, Buffer.from(auxiliary[auxiliaryFile]))
  }

  return zip.toBuffer()
}

/**
 * @static
 * Returns the given Bundle as a zip file buffer
 * @param {Bin} bundle The given Bundle
 * @return {Buffer} The given Bundle as a zip file buffer
 */
Bundle.toZip = function (bundle) {
  return bundle.toZip()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link Bundle} object converted from the given zip file buffer
 * @param {Buffer} zip A zip file buffer
 * @return {Promise} A Promise that resolves with a {@link Bundle} object converted from the given zip file buffer
 */
Bundle.fromZip = function (zip) {
  return new Promise(function (resolve, reject) {
    var unzipped = new ADMZip(zip)
    var entries = unzipped.getEntries()
    var primary = {}
    var auxiliary = {}
    var promises = []
    for (var i = 0; i < entries.length; i++) {
      promises.push(new Promise(function (resolve, reject) {
        var entry = entries[i]
        var entryName = entry.entryName
        if (this.isPrimary(entryName)) {
          var data = entry.getData()
          if (data.length > 0) {
            this.fromFile(data)
              .then(function (primaryObject) {
                primary[entryName] = primaryObject
                resolve()
              })
              .catch(function (err) {
                reject(err)
              })
          } else {
            reject(new Error('There was an error while reading "' + entryName + '" from the bundle file.'))
          }
        } else {
          unzipped.readAsTextAsync(entry, function (data) {
            if (data !== '') {
              auxiliary[entryName] = data
              resolve()
            } else {
              reject(new Error('There was an error while reading "' + entryName + '" from the bundle file.'))
            }
          })
        }
      }))
    }

    Promise.all(promises)
      .then(function () {
        resolve(new this(primary, auxiliary))
      })
      .catch(function (err) {
        reject(err)
      })
  })
}

/**
 * @constructor
 * @class
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link Sketch}es and their auxiliary files
 * @param {{fileName: string, model: Sketch}} primary A collection of {@link Sketch}es
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link Sketch}es
 */
var SketchBundle = function (primary, auxiliary) {
  Bundle.call(this, primary, auxiliary)

  this.toFile = function (sketch) {
    return sketch.toFZ()
  }
}

SketchBundle.prototype = Object.create(Bundle.prototype)
SketchBundle.prototype.constructor = SketchBundle

/**
 * Returns the {@link Sketch} with the given file name
 * @param {string} fileName The file name of the {@link Sketch}
 * @return {Sketch} The {@link Sketch} with the given file name
 */
SketchBundle.prototype.getSketch = function (fileName) {
  return this.getPrimary(fileName)
}

/**
 * Adds a {@link Sketch} to this SketchBundle on the condition that another {@link Sketch} with the same file name does not already exist
 * @param {string} fileName The file name of the {@link Sketch} to be added
 * @param {Sketch} sketch The {@link Sketch} to be added
 */
SketchBundle.prototype.setSketch = function (fileName, sketch) {
  this.setPrimary(fileName, sketch)
}

/**
 * Returns whether this SketchBundle has a {@link Sketch} with the given file name
 * @param {string} fileName The given file name to search for
 * @return {boolean} Whether this SketchBundle has a {@link Sketch} with the given file name
 */
SketchBundle.prototype.hasSketch = function (fileName) {
  return this.hasPrimary(fileName)
}

/**
 * Removes the {@link Sketch} with the given file name
 * @param {string} fileName The file name of the {@link Sketch}
 */
SketchBundle.prototype.removeSketch = function (fileName) {
  this.removePrimary(fileName)
}

SketchBundle.fromFile = function (data) {
  return Sketch.fromFZ(data.toString())
}

SketchBundle.isPrimary = function (entryName) {
  return entryName.endsWith('.fz')
}

/**
 * Returns this SketchBundle as a zip file buffer
 */
SketchBundle.prototype.toFZZ = function () {
  return this.toZip()
}

/**
 * @static
 * Returns the given SketchBundle as a zip file buffer
 * @param {SketchBundle} sketchBundle The given SketchBundle
 */
SketchBundle.toFZZ = function (sketchBundle) {
  return sketchBundle.toFZZ()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link SketchBundle} object converted from the given zip file buffer
 * @param {Buffer} fzz A FZZ zip file buffer
 */
SketchBundle.fromFZZ = function (fzz) {
  return Bundle.fromZip(fzz)
}

/**
 * @constructor
 * @class
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link Part}s and their auxiliary files
 * @param {{fileName: string, model: Part}} primary A collection of {@link Part}s
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link Part}s
 */
var PartBundle = function (primary, auxiliary) {
  Bundle.call(this, primary, auxiliary)

  this.toFile = function (part) {
    return part.toFZP()
  }
}

PartBundle.prototype = Object.create(Bundle.prototype)
PartBundle.prototype.constructor = PartBundle

/**
 * Returns the {@link Part} with the given file name
 * @param {string} fileName The file name of the {@link Part}
 * @return {Part} The {@link Part} with the given file name
 */
PartBundle.prototype.getPart = function (fileName) {
  return this.getPrimary(fileName)
}

/**
 * Adds a {@link Part} to this PartBundle on the condition that another {@link Part} with the same file name does not already exist
 * @param {string} fileName The file name of the {@link Part} to be added
 * @param {Part} part The {@link Part} to be added
 */
PartBundle.prototype.setPart = function (fileName, part) {
  this.setPrimary(fileName, part)
}

/**
 * Returns whether this PartBundle has a {@link Part} with the given file name
 * @param {string} fileName The given file name to search for
 * @return {boolean} Whether this PartBundle has a {@link Part} with the given file name
 */
PartBundle.prototype.hasPart = function (fileName) {
  return this.hasPrimary(fileName)
}

/**
 * Removes the {@link Part} with the given file name
 * @param {string} fileName The file name of the {@link Part}
 */
PartBundle.prototype.removePart = function (fileName) {
  this.removePrimary(fileName)
}

PartBundle.fromFile = function (data) {
  return Part.fromFZP(data.toString())
}

PartBundle.isPrimary = function (entryName) {
  return entryName.endsWith('.fzp')
}

/**
 * Returns this PartBundle as a zip file buffer
 */
PartBundle.prototype.toFZPZ = function () {
  return this.toZip()
}

/**
 * @static
 * Returns the given PartBundle as a zip file buffer
 * @param {PartBundle} partBundle The given PartBundle
 */
PartBundle.toFZPZ = function (partBundle) {
  return partBundle.toFZPZ()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link PartBundle} object converted from the given zip file buffer
 * @param {Buffer} fzpz A FZP zip file buffer
 */
PartBundle.fromFZPZ = function (fzpz) {
  return Bundle.fromZip(fzpz)
}

/**
 * @constructor
 * @class
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link Bin}s and their auxiliary files
 * @param {{fileName: string, model: BinBundle}} primary A collection of {@link Bin}s
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link Bin}s
 */
var BinBundle = function (primary, auxiliary) {
  Bundle.call(this, primary, auxiliary)

  this.toFile = function (bin) {
    return bin.toFZB()
  }
}

BinBundle.prototype = Object.create(Bundle.prototype)
BinBundle.prototype.constructor = BinBundle

/**
 * Returns the {@link Bin} with the given file name
 * @param {string} fileName The file name of the {@link Bin}
 * @return {Bin} The {@link Bin} with the given file name
 */
BinBundle.prototype.getBin = function (fileName) {
  return this.getPrimary(fileName)
}

/**
 * Adds a {@link Bin} to this BinBundle on the condition that another {@link Bin} with the same file name does not already exist
 * @param {string} fileName The file name of the {@link Bin} to be added
 * @param {Bin} bin The {@link Bin} to be added
 */
BinBundle.prototype.setBin = function (fileName, bin) {
  this.setPrimary(fileName, bin)
}

/**
 * Returns whether this BinBundle has a {@link Bin} with the given file name
 * @param {string} fileName The given file name to search for
 * @return {boolean} Whether this BinBundle has a {@link Bin} with the given file name
 */
BinBundle.prototype.hasBin = function (fileName) {
  return this.hasPrimary(fileName)
}

/**
 * Removes the {@link Bin} with the given file name
 * @param {string} fileName The file name of the {@link Bin}
 */
BinBundle.prototype.removeBin = function (fileName) {
  this.removePrimary(fileName)
}

BinBundle.fromFile = function (data) {
  return Bin.fromFZB(data.toString())
}

BinBundle.isPrimary = function (entryName) {
  return entryName.endsWith('.fzb')
}

/**
 * Returns this BinBundle as a zip file buffer
 */
BinBundle.prototype.toFZBZ = function () {
  return this.toZip()
}

/**
 * @static
 * Returns the given BinBundle as a zip file buffer
 * @param {BinBundle} binBundle The given BinBundle
 */
BinBundle.toFZBZ = function (binBundle) {
  return binBundle.toFZBZ()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link BinBundle} object converted from the given zip file buffer
 * @param {Buffer} fzbz A FZBZ zip file buffer
 */
BinBundle.fromFZBZ = function (fzbz) {
  return Bundle.fromZip(fzbz)
}

module.exports = {
  Bundle: Bundle,
  SketchBundle: SketchBundle,
  PartBundle: PartBundle,
  BinBundle: BinBundle
}
