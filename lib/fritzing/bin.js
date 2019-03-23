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

/**
 * @constructor
 * @class
 * @classdesc A collection of {@link Part}s
 * @param {{fileName: string, part: Part}} [parts = {}] A collection of {@link Part}s referenced by file name
 */
var PartBin = function (parts) {
  this.parts = parts || {}
}

/**
 * Returns the {@link Part} with the given file name
 * @param {string} fileName The file name of the {@link Part}
 * @return {Part} The {@link Part} with the given file name
 */
PartBin.prototype.getPart = function (fileName) {
  return this.parts[fileName]
}

/**
 * Adds a {@link Part} to this PartBin on the condition that another {@link Part} with the same file name does not already exist
 * @param {string} fileName The file name of the {@link Part} to be added
 * @param {Part} part The {@link Part} to be added
 */
PartBin.prototype.setPart = function (fileName, part) {
  this.parts[fileName] = part
}

/**
 * Returns whether this PartBin has a {@link Part} with the given file name
 * @param {string} fileName The given file name to search for
 * @return {boolean} Whether this PartBin has a {@link Part} with the given file name
 */
PartBin.prototype.hasPart = function (fileName) {
  return this.parts.hasOwnProperty(fileName)
}

/**
 * Removes the {@link Part} with the given file name
 * @param {string} fileName The file name of the {@link Part}
 */
PartBin.prototype.removePart = function (fileName) {
  delete this.parts[fileName]
}

/**
 * Returns this PartBin as a zip file buffer
 * @return {Buffer} This PartBin as a zip file buffer
 */
PartBin.prototype.toFZB = function () {
  var parts = this.parts
  var partNames = Object.keys(parts)
  var fzb = new ADMZip()
  for (var i = 0; i < partNames.length; i++) {
    var partName = partNames[i]
    fzb.addFile(partName + '.fzp', Buffer.from(parts[partName].toFZP()))
  }
  return fzb.toBuffer()
}

/**
 * @static
 * Returns the given PartBin as a zip file buffer
 * @param {PartBin} bin The given PartBin
 * @return {Buffer} The given PartBin as a zip file buffer
 */
PartBin.toFZB = function (bin) {
  return bin.toFZB()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link PartBin} object converted from the given zip file buffer
 * @param {Buffer} fzb A FZB zip file buffer
 * @return {Promise} A Promise that resolves with a {@link PartBin} object converted from the given zip file buffer
 */
PartBin.fromFZB = function (fzb) {
  return new Promise(function (resolve, reject) {
    var unzipped = new ADMZip(fzb)
    var entries = unzipped.getEntries()
    var parts = {}
    var promises = []
    for (var i = 0; i < entries.length; i++) {
      promises.push(new Promise(function (resolve, reject) {
        var entry = entries[i]
        var entryName = entry.entryName
        unzipped.readAsTextAsync(entry, function (data) {
          if (data !== '') {
            parts[entryName.split('.')[0]] = Part.fromFZP(data)
            resolve()
          } else {
            reject(new Error('There was an error while reading "' + entryName + '" from the FZB file.'))
          }
        })
      }))
    }
    Promise.all(promises)
      .then(function () {
        resolve(new PartBin(parts))
      })
      .catch(function (err) {
        reject(err)
      })
  })
}

module.exports = {
  PartBin: PartBin
}
