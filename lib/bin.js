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

var { Instance } = require('./global')

/**
 * @constructor
 * @class
 * @classdesc A collection of {@link Part}s
 * @param {Instance[]} [instances = []] An array of simple {@link Instance}s which represent each {@link Part}
 */
var Bin = function (instances) {
  this.instances = instances || []
}

/**
 * Returns this Bin as a string of FZB XML
 * @return {string} This Bin as a string of FZB XML
 */
Bin.prototype.toFZB = function () {
  // TODO
}

/**
 * @static
 * Returns the given Bin as a string of FZB XML
 * @param {Bin} bin The given Bin
 * @return {string} The given Bin as a string of FZB XML
 */
Bin.toFZB = function (bin) {
  return bin.toFZB()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link Bin} object converted from the given FZB XML
 * @param {string} fzb A string of FZB XML
 * @return {Promise} A Promise that resolves with a {@link Bin} object converted from the given FZB XML
 */
Bin.fromFZB = function (fzb) {
  return new Promise(function (resolve, reject) {
    // TODO
  })
}

module.exports = {
  Bin: Bin
}
