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

/**
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

'use strict'

var { Sketch } = require('./fritzing/sketch')
var { Part } = require('./fritzing/part')
var { PartBin } = require('./fritzing/bin')
var { SketchBundle, PartBundle, PartBinBundle } = require('./fritzing/bundle')

/**
 * @constructor
 * @class
 * @classdesc Builds a data conversion configuration that returns a {@link Promise} once {@link Builder#build} is called
 */
var Builder = function () {}

/**
 * Saves the data format in the {@link Builder} configuration of the data that will be converted once {@link Builder#build} is called
 * @param {string} format The data format of the data that will be converted once {@link Builder#build} is called
 * @return {Builder} The {@link Builder} instance that is being put together
 */
Builder.prototype.from = function (format) {
  this.from = format
  return this
}

/**
 * Saves the desired data format in the {@link Builder} configuration of the target data that will be produced once {@link Builder#build} is called
 * @param {string} format The desired data format of the data that will be produced once {@link Builder#build} is called
 * @return {Builder} The {@link Builder} instance that is being put together
 */
Builder.prototype.to = function (format) {
  this.to = format
  return this
}

/**
 * Saves the data type in the {@link Builder} configuration of the data that will be converted once {@link Builder#build} is called
 * @param {string} type The data type of the data that will be converted once {@link Builder#build} is called
 * @return {Builder} The {@link Builder} instance that is being put together
 */
Builder.prototype.type = function (type) {
  this.type = type
}

/**
 * Saves the raw data in the {@link Builder} that will be converted once {@link Builder#build} is called
 * @param {object} data The raw data that will be converted once {@link Builder#build} is called
 * @return {Builder} The {@link Builder} instance that is being put together
 */
Builder.prototype.data = function (data) {
  this.data = data
  return this
}

/**
 * Returns a {@link Promise} that resolves with the data produced using the conversion configuration stored in the {@link Builder}
 * @return {Promise} A {@link Promise} that resolves with the data produced using the conversion configuration stored in the {@link Builder}
 */
Builder.prototype.build = function () {
  var _this = this
  return new Promise((resolve, reject) => {
    var fromPromise
    switch (_this.from) {
      case 'fritzing':
        switch (_this.type) {
          case 'fz':
            fromPromise = Sketch.fromFZ(_this.data)
            break
          case 'fzp':
            fromPromise = Part.fromFZP(_this.data)
            break
          case 'fzb':
            fromPromise = PartBin.fromFZB(_this.data)
            break
          case 'fzz':
            fromPromise = SketchBundle.fromFZZ(_this.data)
            break
          case 'fzpz':
            fromPromise = PartBundle.fromFZPZ(_this.data)
            break
          case 'fzbz':
            fromPromise = PartBinBundle.fromFZBZ(_this.data)
            break
        }
        break
      case 'freetzing':
        // TODO
        break
      case 'eagle':
        // TODO
        break
    }

    fromPromise
      .then((intermediate) => {
        // TODO intermediate representation
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = {
  Builder: Builder
}
