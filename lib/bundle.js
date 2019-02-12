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
var { PartBin } = require('./bin')

/**
 * @constructor
 * @class
 * @classdesc A collection of "primary" Fritzing data and "auxiliary" resource files
 * @callback Bundle~toFileCallback
 * @callback Bundle~fromFileCallback
 * @callback Bundle~isPrimaryCallback
 * @param {{fileName: string, model: object}} [primary = {}] A collection of Fritzing data referenced by file name
 * @param {{fileName: string, fileContents: string}} [auxiliary = {}] A collection of resource files referenced by file name
 * @param {toFileCallback} toFile Converts a Fritzing JavaScript model to its corresponding data file
 * @param {fromFileCallback} fromFile Converts a data file to its corresponding Fritzing JavaScript model, returning a Promise that will resolve to the generated model
 * @param {isPrimaryCallback} isPrimary Returns whether or not a given file is classified as Fritzing data using file extensions
 */
var Bundle = function (primary, auxiliary, toFile, fromFile, isPrimary) {
  this.primary = primary || {}
  this.auxiliary = auxiliary || {}
  this.toFile = toFile
  this.fromFile = fromFile
  this.isPrimary = isPrimary
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
 * @param {PartBin} bundle The given Bundle
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
 * @param {{fileName: string, model: Sketch}} primaries A collection of {@link Sketch}es
 * @param {{fileName: string, fileContents: string}} auxiliaries A collection of auxiliary files for {@link Sketch}es
 */
var SketchBundle = function (primaries, auxiliaries) {
  Bundle.call(this, primaries, auxiliaries)

  this.toFile = function (sketch) {
    return sketch.toFZ()
  }
}

SketchBundle.prototype = Bundle.prototype
Object.defineProperty(SketchBundle.prototype, 'constructor', {
  value: SketchBundle,
  enumerable: false,
  writable: true
})

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
 * @param {{fileName: string, model: Part}} primaries A collection of {@link Part}s
 * @param {{fileName: string, fileContents: string}} auxiliaries A collection of auxiliary files for {@link Part}s
 */
var PartBundle = function (primaries, auxiliaries) {
  Bundle.call(this, primaries, auxiliaries)

  this.toFile = function (part) {
    return part.toFZP()
  }
}

PartBundle.prototype = Bundle.prototype
Object.defineProperty(PartBundle.prototype, 'constructor', {
  value: PartBundle,
  enumerable: false,
  writable: true
})

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
 * @classdesc A {@link Bundle} of {@link PartBin}s and their auxiliary files
 * @param {{fileName: string, model: PartBinBundle}} primaries A collection of {@link PartBin}s
 * @param {{fileName: string, fileContents: string}} auxiliaries A collection of auxiliary files for {@link PartBin}s
 */
var PartBinBundle = function (primaries, auxiliaries) {
  Bundle.call(this, primaries, auxiliaries)

  this.toFile = function (bin) {
    return bin.toFZB()
  }
}

PartBinBundle.prototype = Bundle.prototype
Object.defineProperty(PartBinBundle.prototype, 'constructor', {
  value: PartBinBundle,
  enumerable: false,
  writable: true
})

PartBinBundle.fromFile = function (data) {
  return PartBin.fromFZB(data.toString())
}

PartBinBundle.isPrimary = function (entryName) {
  return entryName.endsWith('.fzb')
}

/**
 * Returns this PartBinBundle as a zip file buffer
 */
PartBinBundle.prototype.toFZBZ = function () {
  return this.toZip()
}

/**
 * @static
 * Returns the given PartBinBundle as a zip file buffer
 * @param {PartBinBundle} partBinBundle The given PartBinBundle
 */
PartBinBundle.toFZBZ = function (partBinBundle) {
  return partBinBundle.toFZBZ()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link PartBinBundle} object converted from the given zip file buffer
 * @param {Buffer} fzbz A FZBZ zip file buffer
 */
PartBinBundle.fromFZBZ = function (fzbz) {
  return Bundle.fromZip(fzbz)
}

module.exports = {
  Bundle: Bundle,
  SketchBundle: SketchBundle,
  PartBundle: PartBundle,
  PartBinBundle: PartBinBundle
}
